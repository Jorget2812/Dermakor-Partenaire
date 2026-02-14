import { Product, UserTier, ProductPricing } from '../types';

/**
 * Calculates the final price for a specific user tier based on the product's pricing configuration.
 */
export const calculateUserPrice = (product: Product, tier: UserTier): number => {
  // Fallback to legacy price if no pricing object exists
  if (!product.pricing) {
    return product.price;
  }

  const { basePrice, standard, premium } = product.pricing;
  const config = tier === UserTier.PREMIUM ? premium : standard;

  if (config.type === 'FIXED') {
    return config.value;
  } else {
    // PERCENTAGE
    return basePrice * (1 - config.value / 100);
  }
};

/**
 * Calculates the savings amount for Premium users compared to Standard users.
 */
export const calculatePremiumSavings = (product: Product): number => {
  const stdPrice = calculateUserPrice(product, UserTier.STANDARD);
  const premPrice = calculateUserPrice(product, UserTier.PREMIUM);
  return Math.max(0, stdPrice - premPrice);
};

/**
 * Helper to get the default pricing object if none exists
 */
export const getDefaultPricing = (currentPrice: number): ProductPricing => ({
  basePrice: currentPrice,
  standard: { type: 'PERCENTAGE', value: 0 },
  premium: { type: 'PERCENTAGE', value: 0 } // Default 0% discount
});
