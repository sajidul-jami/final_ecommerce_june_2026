'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);
  const [cartPulseKey, setCartPulseKey] = useState(0);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item, amount = 1) => {
    let message = 'Added to cart';
    let added = false;
    const productName = item.name || 'Product';

    setCart((prevCart) => {
      const itemExists = prevCart.find((cartItem) => Number(cartItem.id) === Number(item.id));
      const incomingStock = Number(item.stock_quantity ?? item.stock ?? item.available_quantity ?? item.quantity ?? 9999);

      if (itemExists) {
        return prevCart.map((cartItem) =>
          Number(cartItem.id) === Number(item.id) ? (() => {
            const stock = Number(cartItem.stock_quantity ?? incomingStock ?? 9999);
            const currentQuantity = Number(cartItem.quantity || 0);

            if (currentQuantity >= stock) {
              message = 'No more stock available';
              return { ...cartItem, stock_quantity: stock };
            }

            added = true;
            return {
              ...cartItem,
              stock_quantity: stock,
              quantity: Math.min(currentQuantity + amount, stock),
            };
          })() : cartItem
        );
      }

      if (incomingStock <= 0) {
        message = 'No more stock available';
        return prevCart;
      }

      added = true;
      return [...prevCart, { ...item, stock_quantity: incomingStock, quantity: Math.min(amount, incomingStock) }];
    });
    setToast({
      type: added ? 'success' : 'error',
      title: added ? 'Added to cart' : 'Cart update failed',
      message: added ? `${productName} has been added to your cart.` : message
    });
    if (added) {
      setCartPulseKey((key) => key + 1);
    }
  };

  const decreaseQuantity = (itemId) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          Number(item.id) === Number(itemId) ? { ...item, quantity: Math.max(item.quantity - 1, 0) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((cartItem) => Number(cartItem.id) !== Number(itemId)));
  };

  const clearCartItems = (itemIds) => {
    const ids = itemIds.map(Number);
    setCart((prevCart) => prevCart.filter((cartItem) => !ids.includes(Number(cartItem.id))));
  };

  const clearCart = () => setCart([]);

  const setCheckoutItems = (items) => {
    sessionStorage.setItem('checkoutItems', JSON.stringify(items));
  };

  const getCheckoutItems = () => {
    const storedItems = sessionStorage.getItem('checkoutItems');
    return storedItems ? JSON.parse(storedItems) : [];
  };

  const cartItemCount = cart.reduce((count, item) => count + Number(item.quantity || 0), 0);
  const cartTotal = cart.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0);

  useEffect(() => {
    if (!toast) return undefined;

    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItemCount,
        cartTotal,
        cartPulseKey,
        addToCart,
        decreaseQuantity,
        removeFromCart,
        clearCartItems,
        clearCart,
        setCheckoutItems,
        getCheckoutItems,
      }}
    >
      {children}
      {toast && (
        <div className="fixed right-3 top-24 z-[80] w-[calc(100vw-1.5rem)] max-w-sm overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-950 shadow-2xl sm:right-4">
          <div className={`h-1 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`} />
          <div className="flex gap-3 p-4">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black text-white ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
              {toast.type === 'success' ? '✓' : '!'}
            </div>
            <div className="min-w-0">
              <p className="font-bold">{toast.title}</p>
              <p className="mt-1 text-sm leading-5 text-slate-600">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-auto h-7 w-7 shrink-0 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
