import { SimulatedOrder, CartItem } from '../types';
import { INITIAL_ORDERS, INITIAL_PRODUCTS } from '../data/mockData';

const ORDERS_STORAGE_KEY = 'softtech_market_orders_cop_v2';
const CART_STORAGE_KEY = 'softtech_market_cart_cop_v2';

/**
 * Loads orders from localStorage or falls back to INITIAL_ORDERS in COP.
 */
export function loadStoredOrders(): SimulatedOrder[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Si tienen precios viejos en USD (< 50,000 COP para órdenes completas), regenerar con INITIAL_ORDERS en COP
        const hasOutdatedUsdTotals = parsed.some((ord: SimulatedOrder) => ord.total > 0 && ord.total < 50000);
        if (!hasOutdatedUsdTotals) {
          const normalized = parsed.map((ord: SimulatedOrder) => {
            let updatedStatus = ord.status;
            if ((updatedStatus as string) === 'en_camino') updatedStatus = 'enviado';
            if ((updatedStatus as string) === 'confirmado') updatedStatus = 'pendiente';

            let userId = ord.userId;
            let userEmail = ord.userEmail;
            if (!userId && ord.recipientName === 'Elena Gómez Morales') {
              userId = 'usr-001';
              userEmail = 'elena.gomez@visualaccess.com';
            } else if (!userId && ord.recipientName === 'Carlos Soto Villagrán') {
              userId = 'usr-002';
              userEmail = 'carlos.soto@tecnologiasorda.org';
            }

            return {
              ...ord,
              status: updatedStatus,
              userId,
              userEmail
            };
          });
          return normalized;
        }
      }
    }
  } catch (err) {
    console.warn('Error reading stored orders:', err);
  }
  // Initialize with mock orders if not present
  saveStoredOrders(INITIAL_ORDERS);
  return INITIAL_ORDERS;
}

/**
 * Saves orders array to localStorage.
 */
export function saveStoredOrders(orders: SimulatedOrder[]): void {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (err) {
    console.warn('Error saving orders to localStorage:', err);
  }
}

/**
 * Adds a new order to the beginning of the list and persists it.
 */
export function addStoredOrder(newOrder: SimulatedOrder): SimulatedOrder[] {
  const current = loadStoredOrders();
  const updated = [newOrder, ...current.filter((o) => o.orderId !== newOrder.orderId)];
  saveStoredOrders(updated);
  return updated;
}

/**
 * Loads cart items from localStorage.
 */
export function loadStoredCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Asegurar que los productos del carrito tengan precio actualizado a COP
        const normalized = parsed.map((item: CartItem) => {
          if (item.product && item.product.price < 10000) {
            const freshProd = INITIAL_PRODUCTS.find((p) => p.id === item.product.id);
            if (freshProd) {
              return {
                ...item,
                product: freshProd
              };
            }
          }
          return item;
        });
        return normalized;
      }
    }
  } catch (err) {
    console.warn('Error loading cart from storage:', err);
  }
  return [];
}

/**
 * Saves cart items to localStorage.
 */
export function saveStoredCart(cart: CartItem[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (err) {
    console.warn('Error saving cart to storage:', err);
  }
}

/**
 * Generates a unique simulated order code.
 * Example: #STK-72941-VISUAL
 */
export function generateSimulatedOrderCode(): string {
  const randomCode = Math.floor(10000 + Math.random() * 90000);
  return `#STK-${randomCode}-VISUAL`;
}
