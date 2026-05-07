import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

interface CartItem {
  id: number | string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, quantity: number) => void;
  removeFromCart: (id: number | string) => void;
  updateQuantity: (id: number | string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("sellora_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("sellora_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: any, quantity: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        toast.success(`Updated ${product.name} quantity in cart!`);
        return prev.map((item) => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      toast.success(`${product.name} added to cart!`);
      return [...prev, {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.image,
        quantity
      }];
    });
  };

  const removeFromCart = (id: number | string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    toast.info("Item removed from cart");
  };

  const updateQuantity = (id: number | string, delta: number) => {
    setCart((prev) => prev.map((item) => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("sellora_cart");
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      cartTotal,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
