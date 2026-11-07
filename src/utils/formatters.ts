/**
 * Utilidades de formateo para el sistema de comercio en Pesos Colombianos (COP)
 */

/**
 * Formatea un monto numérico a Pesos Colombianos con símbolo de moneda y código COP
 * Ejemplo: 7499000 -> "$ 7.499.000 COP"
 */
export function formatCOP(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '$ 0 COP';
  }
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(rounded);

  return `${formatted} COP`;
}

/**
 * Formato compacto sin el sufijo 'COP'
 * Ejemplo: 7499000 -> "$ 7.499.000"
 */
export function formatCOPCompact(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '$ 0';
  }
  const rounded = Math.round(amount);
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(rounded);
}
