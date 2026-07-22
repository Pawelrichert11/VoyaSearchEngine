export type NullablePrice = number | null;

export function normalizePriceRange(minPrice: NullablePrice, maxPrice: NullablePrice) {
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    return { minPrice: maxPrice, maxPrice: minPrice };
  }

  return { minPrice, maxPrice };
}
