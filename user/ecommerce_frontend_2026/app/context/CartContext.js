'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState('');

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
    let message = 'Cart added';
    let added = false;

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
    setToast(added ? 'Cart added' : message);
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

    const timer = setTimeout(() => setToast(''), 1800);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItemCount,
        cartTotal,
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
        <div className={`fixed right-4 top-20 z-50 rounded-md px-4 py-3 text-sm font-bold text-white shadow-lg ${toast === 'Cart added' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
          {toast}
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
