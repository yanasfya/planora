export const CURRENCIES = {
  USD: { code: "USD", symbol: "$", name: "US Dollar", rate: 1 },
  MYR: { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", rate: 4.5 },
  IDR: { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", rate: 15000 },
  THB: { code: "THB", symbol: "฿", name: "Thai Baht", rate: 35 },
  SGD: { code: "SGD", symbol: "S$", name: "Singapore Dollar", rate: 1.35 },
  JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen", rate: 150 },
  EUR: { code: "EUR", symbol: "€", name: "Euro", rate: 0.92 },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", rate: 0.79 },
  AUD: { code: "AUD", symbol: "A$", name: "Australian Dollar", rate: 1.53 },
  AED: { code: "AED", symbol: "د.إ", name: "UAE Dirham", rate: 3.67 },
};

export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  Indonesia: "IDR",
  Jakarta: "IDR",
  Bali: "IDR",
  Malaysia: "MYR",
  "Kuala Lumpur": "MYR",
  Thailand: "THB",
  Bangkok: "THB",
  Singapore: "SGD",
  Japan: "JPY",
  Tokyo: "JPY",
  France: "EUR",
  Paris: "EUR",
  Spain: "EUR",
  Barcelona: "EUR",
  Italy: "EUR",
  Rome: "EUR",
  Germany: "EUR",
  UK: "GBP",
  "United Kingdom": "GBP",
  England: "GBP",
  London: "GBP",
  UAE: "AED",
  Dubai: "AED",
  Australia: "AUD",
  Sydney: "AUD",
  USA: "USD",
  "United States": "USD",
  "New York": "USD",
};

export function detectCurrencyFromDestination(destination: string): string {
  const destLower = destination.toLowerCase();

  for (const [country, currency] of Object.entries(COUNTRY_CURRENCY_MAP)) {
    if (destLower.includes(country.toLowerCase())) {
      return currency;
    }
  }

  return "USD"; // default
}

export function convertPrice(usdPrice: number, toCurrency: string): number {
  const currency = CURRENCIES[toCurrency as keyof typeof CURRENCIES];
  if (!currency) return usdPrice;

  const converted = usdPrice * currency.rate;

  // Round appropriately based on currency
  if (toCurrency === "IDR" || toCurrency === "JPY") {
    return Math.round(converted / 100) * 100; // Round to nearest 100
  } else if (toCurrency === "MYR" || toCurrency === "SGD" || toCurrency === "THB") {
    return Math.round(converted);
  } else {
    return Math.round(converted * 100) / 100; // 2 decimal places
  }
}

export function formatPrice(price: number, currencyCode: string): string {
  const currency = CURRENCIES[currencyCode as keyof typeof CURRENCIES];
  if (!currency) return `$${price}`;

  // Format based on currency type
  if (currencyCode === "IDR" || currencyCode === "JPY") {
    return `${currency.symbol}${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  } else if (currencyCode === "MYR" || currencyCode === "SGD" || currencyCode === "THB") {
    return `${currency.symbol}${price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  } else {
    return `${currency.symbol}${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}
