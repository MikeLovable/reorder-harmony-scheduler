
import { ProductionScenario } from "../types";
import { PERIODS } from "../types";

/**
 * Mock function for order optimization - returns random order quantities
 * @param scenario A production scenario
 * @returns Array of order quantities
 */
export function lookAheadOptimizeMOCK(scenario: ProductionScenario): number[] {
  const orders = new Array(PERIODS + 1).fill(0);
  
  // Generate random order quantities that are multiples of 10
  for (let i = 0; i <= PERIODS; i++) {
    // 70% chance of having no order, 30% chance of having an order
    if (Math.random() > 0.7) {
      // Generate a random multiple of 10 between 0 and 400
      const randomMultiple = Math.floor(Math.random() * 41) * 10;
      orders[i] = randomMultiple;
    }
  }
  
  return orders;
}
