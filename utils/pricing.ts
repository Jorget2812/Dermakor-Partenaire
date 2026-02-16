import { Product, UserTier, ProductPricing } from '../types';

import { PROFIT_RULES } from '../constants/financials';

/**
 * Calculates the final price for a specific user tier based on the product's pricing configuration.
 * New Logic: If retailPrice (PVC) is set, use it to derive pro price via multiplier.
 */
export const calculateUserPrice = (product: Product, tier: UserTier): number => {
  // 1. PVC Strategy: If retailPrice is explicitly set, derive Pro price dynamically
  if (product.retailPrice && product.retailPrice > 0) {
    const isPremium = tier.startsWith('PREMIUM');
    const divisor = isPremium ? PROFIT_RULES.MULTIPLIER_PREMIUM : PROFIT_RULES.MULTIPLIER_STANDARD;
    return parseFloat((product.retailPrice / divisor).toFixed(2));
  }

  // 2. Legacy / Manual Strategy
  if (!product.pricing) {
    return product.price;
  }

  const { basePrice, standard, premium } = product.pricing;
  const isPremium = tier.startsWith('PREMIUM');
  const config = isPremium ? premium : standard;

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
