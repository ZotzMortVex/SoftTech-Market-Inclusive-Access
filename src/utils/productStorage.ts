import { Product } from '../types';

const PRODUCTS_STORAGE_KEY = 'softtech_market_simulated_products_cop_v2';

/**
 * Guarda la lista de productos en localStorage
 */
export function saveStoredProducts(products: Product[]): void {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch (err) {
    console.warn('Error al guardar productos en localStorage:', err);
  }
}
