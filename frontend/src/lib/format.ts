/**
 * Formato de moneda para Peru (PEN).
 * Usado en listados, detalle y graficos.
 */
export function formatCurrency(value: number): string {
  return `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const LOCALE_OPTS: Intl.NumberFormatOptions = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

/**
 * Formato de moneda para KPIs del dashboard.
 * - Cantidades >= 1 millon: forma compacta "S/ 1,23 M" para mejor lectura.
 * - Menores: formato completo con separador de miles (es-PE).
 * Siempre 2 decimales para consistencia.
 */
export function formatCurrencyKpi(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 1_000_000) {
    const millions = value / 1_000_000;
    const num = millions.toLocaleString('es-PE', {
      ...LOCALE_OPTS,
      maximumFractionDigits: 2,
    });
    return `${sign}S/ ${num} M`;
  }

  if (abs >= 1_000 && abs < 1_000_000) {
    return `${sign}S/ ${value.toLocaleString('es-PE', LOCALE_OPTS)}`;
  }

  return `${sign}S/ ${value.toLocaleString('es-PE', LOCALE_OPTS)}`;
}

/**
 * Prefijo S/ para valores ya formateados (usado en KPIs que reciben string).
 */
export function withSymbol(formatted: string): string {
  return formatted.startsWith('S/') ? formatted : `S/ ${formatted}`;
}
