/**
 * Currency Utilities
 *
 * Helper functions untuk format dan parse nominal uang (Rupiah).
 * Mendukung formatting, parsing, dan validasi currency.
 */

/**
 * Format number ke format Rupiah
 *
 * @param amount - Nominal uang (number)
 * @param options - Formatting options
 * @returns Formatted string "Rp 1.234.567"
 *
 * @example
 * formatRupiah(1234567) // "Rp 1.234.567"
 * formatRupiah(1234567.89) // "Rp 1.234.567,89"
 * formatRupiah(1234567, { withPrefix: false }) // "1.234.567"
 * formatRupiah(1234567, { withDecimals: false }) // "Rp 1.234.567"
 */
export function formatRupiah(
  amount: number | string,
  options?: {
    withPrefix?: boolean; // Default: true
    withDecimals?: boolean; // Default: true jika ada desimal
    minimumFractionDigits?: number; // Default: 0
    maximumFractionDigits?: number; // Default: 2
  }
): string {
  const {
    withPrefix = true,
    withDecimals = true,
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  } = options || {};

  // Convert to number
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  // Handle invalid numbers
  if (isNaN(numAmount)) {
    return withPrefix ? "Rp 0" : "0";
  }

  // Format with Intl.NumberFormat
  const formatter = new Intl.NumberFormat("id-ID", {
    style: "decimal",
    minimumFractionDigits: withDecimals ? minimumFractionDigits : 0,
    maximumFractionDigits: withDecimals ? maximumFractionDigits : 0,
  });

  const formatted = formatter.format(numAmount);

  return withPrefix ? `Rp ${formatted}` : formatted;
}

/**
 * Format Rupiah dengan prefix "Rp" dan tanpa desimal
 * Shorthand untuk formatRupiah dengan default settings
 *
 * @param amount - Nominal uang
 * @returns "Rp 1.234.567"
 */
export function toRupiah(amount: number | string): string {
  return formatRupiah(amount, { withDecimals: false });
}

/**
 * Format Rupiah tanpa prefix "Rp"
 *
 * @param amount - Nominal uang
 * @returns "1.234.567"
 */
export function formatCurrency(amount: number | string): string {
  return formatRupiah(amount, { withPrefix: false, withDecimals: false });
}

/**
 * Parse string Rupiah ke number
 * Menghilangkan "Rp", titik (.), dan koma (,)
 *
 * @param rupiah - String rupiah "Rp 1.234.567,89" atau "1.234.567"
 * @returns Number 1234567.89
 *
 * @example
 * parseRupiah("Rp 1.234.567") // 1234567
 * parseRupiah("1.234.567,89") // 1234567.89
 * parseRupiah("Rp 5.000.000") // 5000000
 */
export function parseRupiah(rupiah: string): number {
  if (!rupiah || typeof rupiah !== "string") {
    return 0;
  }

  // Remove "Rp", spaces, and dots (thousand separator)
  let cleaned = rupiah
    .replace(/Rp/gi, "")
    .replace(/\s/g, "")
    .replace(/\./g, "");

  // Replace comma (decimal separator) with dot
  cleaned = cleaned.replace(/,/g, ".");

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format Rupiah untuk input field
 * Auto-format saat user mengetik
 *
 * @param value - Input value
 * @returns Formatted string
 *
 * @example
 * formatRupiahInput("1234567") // "1.234.567"
 * formatRupiahInput("1234567.5") // "1.234.567,50"
 */
export function formatRupiahInput(value: string): string {
  // Remove non-numeric characters except comma and dot
  const cleaned = value.replace(/[^\d,]/g, "");

  // Split by comma (decimal separator)
  const parts = cleaned.split(",");
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Format integer part with thousand separator
  const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  // Add decimal part if exists
  if (decimalPart !== undefined) {
    return `${formatted},${decimalPart.substring(0, 2)}`; // Max 2 decimal places
  }

  return formatted;
}

/**
 * Validate if string is valid Rupiah format
 *
 * @param rupiah - String to validate
 * @returns true if valid
 */
export function isValidRupiah(rupiah: string): boolean {
  if (!rupiah || typeof rupiah !== "string") {
    return false;
  }

  // Pattern: Optional "Rp", optional space, digits with dots and optional comma decimals
  const pattern = /^(Rp\s?)?[\d.]+([,]\d{1,2})?$/;
  return pattern.test(rupiah.trim());
}

/**
 * Format Rupiah untuk display dengan singkatan
 * Untuk tampilan compact (K, Jt, M, T)
 *
 * @param amount - Nominal uang
 * @returns "Rp 1,2 Jt" atau "Rp 500 Rb"
 *
 * @example
 * formatRupiahCompact(1234567) // "Rp 1,2 Jt"
 * formatRupiahCompact(500000) // "Rp 500 Rb"
 * formatRupiahCompact(5000000000) // "Rp 5 M"
 */
export function formatRupiahCompact(amount: number | string): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return "Rp 0";
  }

  const abs = Math.abs(numAmount);

  if (abs >= 1000000000000) {
    // Triliun
    return `Rp ${(numAmount / 1000000000000).toFixed(1).replace(".", ",")} T`;
  } else if (abs >= 1000000000) {
    // Miliar
    return `Rp ${(numAmount / 1000000000).toFixed(1).replace(".", ",")} M`;
  } else if (abs >= 1000000) {
    // Juta
    return `Rp ${(numAmount / 1000000).toFixed(1).replace(".", ",")} Jt`;
  } else if (abs >= 1000) {
    // Ribu
    return `Rp ${(numAmount / 1000).toFixed(0)} Rb`;
  } else {
    return `Rp ${numAmount}`;
  }
}

/**
 * Format range Rupiah
 *
 * @param min - Minimum amount
 * @param max - Maximum amount
 * @returns "Rp 1.000.000 - Rp 5.000.000"
 */
export function formatRupiahRange(
  min: number | string,
  max: number | string
): string {
  return `${formatRupiah(min, { withDecimals: false })} - ${formatRupiah(max, {
    withDecimals: false,
  })}`;
}

/**
 * Calculate percentage from amount
 *
 * @param amount - Nominal
 * @param percentage - Percentage (0-100)
 * @returns Calculated amount
 *
 * @example
 * calculatePercentage(1000000, 10) // 100000
 * calculatePercentage(5000000, 5) // 250000
 */
export function calculatePercentage(
  amount: number | string,
  percentage: number
): number {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return (numAmount * percentage) / 100;
}

/**
 * Calculate percentage value and format as Rupiah
 *
 * @param amount - Base amount
 * @param percentage - Percentage (0-100)
 * @returns Formatted "Rp xxx"
 */
export function formatPercentageAmount(
  amount: number | string,
  percentage: number
): string {
  const calculated = calculatePercentage(amount, percentage);
  return formatRupiah(calculated, { withDecimals: false });
}

/**
 * Add two Rupiah values
 *
 * @param amount1 - First amount
 * @param amount2 - Second amount
 * @returns Sum
 */
export function addRupiah(
  amount1: number | string,
  amount2: number | string
): number {
  const num1 = typeof amount1 === "string" ? parseRupiah(amount1) : amount1;
  const num2 = typeof amount2 === "string" ? parseRupiah(amount2) : amount2;
  return num1 + num2;
}

/**
 * Subtract Rupiah values
 *
 * @param amount1 - First amount
 * @param amount2 - Second amount to subtract
 * @returns Difference
 */
export function subtractRupiah(
  amount1: number | string,
  amount2: number | string
): number {
  const num1 = typeof amount1 === "string" ? parseRupiah(amount1) : amount1;
  const num2 = typeof amount2 === "string" ? parseRupiah(amount2) : amount2;
  return num1 - num2;
}

/**
 * Format number input untuk Rupiah (untuk onChange event)
 * Returns both formatted string dan numeric value
 *
 * @param inputValue - Raw input value
 * @returns Object dengan formatted dan numeric value
 */
export function handleRupiahInput(inputValue: string): {
  formatted: string;
  numeric: number;
} {
  const numeric = parseRupiah(inputValue);
  const formatted = formatRupiahInput(inputValue);

  return { formatted, numeric };
}

/**
 * Get Rupiah symbol
 *
 * @returns "Rp"
 */
export function getRupiahSymbol(): string {
  return "Rp";
}

/**
 * Check if amount is positive
 *
 * @param amount - Amount to check
 * @returns true if positive
 */
export function isPositiveAmount(amount: number | string): boolean {
  const num = typeof amount === "string" ? parseRupiah(amount) : amount;
  return num > 0;
}

/**
 * Get absolute value of Rupiah amount
 *
 * @param amount - Amount
 * @returns Absolute value
 */
export function absoluteRupiah(amount: number | string): number {
  const num = typeof amount === "string" ? parseRupiah(amount) : amount;
  return Math.abs(num);
}

/**
 * Round Rupiah to nearest value
 *
 * @param amount - Amount to round
 * @param nearest - Round to nearest (e.g., 1000, 100, 10)
 * @returns Rounded amount
 *
 * @example
 * roundRupiah(1234567, 1000) // 1235000
 * roundRupiah(1234567, 100) // 1234600
 */
export function roundRupiah(
  amount: number | string,
  nearest: number = 1000
): number {
  const num = typeof amount === "string" ? parseRupiah(amount) : amount;
  return Math.round(num / nearest) * nearest;
}

/**
 * Format Rupiah dengan warna berdasarkan nilai
 * Untuk styling (positif = hijau, negatif = merah)
 *
 * @param amount - Amount
 * @returns Object dengan formatted string dan color class
 */
export function formatRupiahWithColor(amount: number | string): {
  formatted: string;
  colorClass: string;
  isPositive: boolean;
} {
  const num = typeof amount === "string" ? parseRupiah(amount) : amount;
  const formatted = formatRupiah(num, { withDecimals: false });

  return {
    formatted,
    colorClass:
      num > 0
        ? "text-green-600 dark:text-green-400"
        : num < 0
        ? "text-red-600 dark:text-red-400"
        : "text-gray-600 dark:text-gray-400",
    isPositive: num > 0,
  };
}
