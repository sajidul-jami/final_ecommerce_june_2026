const pool = require('../pool');

const getOrdersByUserId = async (userId) => {
  const [rows] = await pool.query(
    `SELECT
       o.id,
       o.customer_id,
       o.total_amount,
       o.payment_method,
       o.order_status,
       o.created_at,
       d.product_id,
       d.quantity,
       d.price,
       p.name AS product_name,
       p.photo AS product_photo,
       pay.payment_status
     FROM orders o
     LEFT JOIN details d ON d.sales_id = o.id
     LEFT JOIN products p ON p.id = d.product_id
     LEFT JOIN payments pay ON pay.order_id = o.id
     WHERE o.customer_id = ?
     ORDER BY o.created_at DESC, o.id DESC`,
    [userId]
  );

  const orderMap = new Map();

  rows.forEach((row) => {
    if (!orderMap.has(row.id)) {
      orderMap.set(row.id, {
        id: row.id,
        customer_id: row.customer_id,
        total_amount: Number(row.total_amount || 0),
        payment_method: row.payment_method,
        order_status: row.order_status || 'Pending',
        payment_status: row.payment_status || 'Unpaid',
        created_at: row.created_at,
        items: [],
      });
    }

    if (row.product_id) {
      orderMap.get(row.id).items.push({
        product_id: row.product_id,
        name: row.product_name,
        photo: row.product_photo || 'noimage.jpg',
        quantity: Number(row.quantity || 0),
        price: Number(row.price || 0),
      });
    }
  });

  return Array.from(orderMap.values());
};

const checkout = async (data) => {
  const connection = await pool.getConnection();

  try {
    const {
      user_id,
      products,
      payment_method = 'Cash On Delivery',
      delivery_address_id,
      delivery_name,
      delivery_phone,
      delivery_address,
      delivery_city,
    } = data;

    await connection.beginTransaction();

    const productIds = products.map((item) => Number(item.id || item.product_id)).filter(Boolean);
    const [dbProducts] = await connection.query(
      `SELECT id, name, price, quantity
       FROM products
       WHERE id IN (${productIds.map(() => '?').join(',')}) FOR UPDATE`,
      productIds
    );

    const productMap = new Map(dbProducts.map((item) => [Number(item.id), item]));
    let totalAmount = 0;
    const orderItems = [];

    for (const item of products) {
      const productId = Number(item.id || item.product_id);
      const requestedQty = Math.max(1, Number(item.quantity || 1));
      const product = productMap.get(productId);

      if (!product) {
        throw new Error(`Product ${productId} not found`);
      }

      if (Number(product.quantity) < requestedQty) {
        throw new Error(`${product.name} stock is only ${product.quantity}`);
      }

      const price = Number(product.price);
      totalAmount += price * requestedQty;
      orderItems.push({ productId, quantity: requestedQty, price });
    }

    const [orderResult] = await connection.query(
      'INSERT INTO orders (customer_id, total_amount, payment_method, order_status) VALUES (?, ?, ?, ?)',
      [user_id, totalAmount, payment_method, 'Pending']
    );

    const orderId = orderResult.insertId;

    try {
      await connection.query(
        `UPDATE orders
         SET delivery_address_id = ?, delivery_name = ?, delivery_phone = ?, delivery_address = ?, delivery_city = ?
         WHERE id = ?`,
        [
          delivery_address_id || null,
          delivery_name || null,
          delivery_phone || null,
          delivery_address || null,
          delivery_city || null,
          orderId,
        ]
      );
    } catch (error) {
      if (error?.code !== 'ER_BAD_FIELD_ERROR') throw error;
    }

    for (const item of orderItems) {
      await connection.query(
        'INSERT INTO details (sales_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.productId, item.quantity, item.price]
      );
      await connection.query('UPDATE products SET quantity = quantity - ? WHERE id = ?', [
        item.quantity,
        item.productId,
      ]);
    }

    await connection.query(
      'INSERT INTO payments (order_id, transaction_id, amount, payment_status) VALUES (?, ?, ?, ?)',
      [orderId, `COD-${orderId}`, totalAmount, payment_method === 'Cash On Delivery' ? 'Unpaid' : 'Paid']
    );

    await connection.query('DELETE FROM cart WHERE user_id = ?', [user_id]);
    await connection.commit();

    return { orderId, totalAmount };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = { getOrdersByUserId, checkout };
