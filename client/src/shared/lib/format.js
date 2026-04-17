/**
 * Locale que usamos para formatear números.
 * Se podría derivar de i18n en el futuro.
 */
const LOCALE = 'es-CO'

/**
 * Formatea un valor monetario con separadores de miles y decimales opcionales.
 * Ejemplo (COP): $ 1.234.567   Ejemplo (USD): $1,234.56
 *
 * @param {number|string} value
 * @param {string}        currency  – código ISO 4217, default 'COP'
 * @param {boolean}       showCents – mostrar decimales (default false para COP/MXN)
 */
export function fmtCurrency(value, currency = 'COP', showCents) {
  const n = Number(value)
  if (isNaN(n)) return '—'

  const decimals = showCents ?? (currency !== 'COP' && currency !== 'MXN')

  return new Intl.NumberFormat(LOCALE, {
    style:                 'currency',
    currency,
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  }).format(n)
}

/**
 * Formatea solo el número sin símbolo de moneda.
 * Ejemplo: 1.234.567
 */
export function fmtNumber(value, { decimals = 0 } = {}) {
  const n = Number(value)
  if (isNaN(n)) return '—'
  return new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n)
}

/**
 * Formatea con signo +/- y símbolo de moneda (para transacciones).
 * Ejemplo: +$ 1.234.567  o  -US$ 89.500
 */
export function fmtAmount(value, type, currency = 'COP') {
  const n = Math.abs(Number(value))
  if (isNaN(n)) return '—'

  const formatted = new Intl.NumberFormat(LOCALE, {
    style:                 'currency',
    currency,
    minimumFractionDigits: (currency !== 'COP' && currency !== 'MXN') ? 2 : 0,
    maximumFractionDigits: (currency !== 'COP' && currency !== 'MXN') ? 2 : 0,
  }).format(n)

  const sign = type === 'INCOME' ? '+' : '-'
  return `${sign}${formatted}`
}

/**
 * Símbolo corto de la moneda del usuario (p.ej. "$", "US$", "€").
 */
export function currencySymbol(currency = 'COP') {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
  }).formatToParts(0).find(p => p.type === 'currency')?.value ?? '$'
}
