import { UserTier } from '../types';

export interface FinancialStats {
    totalRevenue: number;
    totalProfit: number;
    avgMargin: number;
    unitProfit: number;
}

/**
 * Calculates selling price based on cost and markup percentage
 * Jorge's logic: Price = Cost * (1 + Margin%)
 */
export const calculatePriceFromMarkup = (cost: number, markupPercent: number): number => {
    return cost * (1 + markupPercent / 100);
};

/**
 * Calculates profit per unit
 */
export const calculateUnitProfit = (salePrice: number, cost: number): number => {
    return salePrice - cost;
};

/**
 * Calculates the percentage margin over the sale price (Gross Margin)
 * Formula: (Profit / SalePrice) * 100
 */
export const calculateGrossMargin = (salePrice: number, cost: number): number => {
    if (salePrice === 0) return 0;
    return ((salePrice - cost) / salePrice) * 100;
};

/**
 * Simulates monthly impact of margin changes
 * @param currentMonthlyVolume Estimated items sold per month
 * @param cost Average cost per unit
 * @param oldMargin Previous markup %
 * @param newMargin New markup %
 */
export const simulateMarginImpact = (
    currentMonthlyVolume: number,
    avgCost: number,
    oldMarkup: number,
    newMarkup: number
) => {
    const oldPrice = calculatePriceFromMarkup(avgCost, oldMarkup);
    const newPrice = calculatePriceFromMarkup(avgCost, newMarkup);

    const oldMonthlyProfit = (oldPrice - avgCost) * currentMonthlyVolume;
    const newMonthlyProfit = (newPrice - avgCost) * currentMonthlyVolume;

    return {
        priceDiff: newPrice - oldPrice,
        profitDiff: newMonthlyProfit - oldMonthlyProfit,
        percentageIncrease: ((newMonthlyProfit - oldMonthlyProfit) / oldMonthlyProfit) * 100
    };
};
