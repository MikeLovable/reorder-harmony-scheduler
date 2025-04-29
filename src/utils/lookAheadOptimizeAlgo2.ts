
import { ProductionScenario } from "../types";
import { PERIODS } from "../types";

/**
 * Algorithm 2: Look ahead by lead time and calculate orders based on future requirements
 * @param scenario A production scenario
 * @returns Array of order quantities
 */
export function lookAheadOptimizeAlgo2(scenario: ProductionScenario): number[] {
  const { LdTm, MOQ, PkQty, Rqt, Rec } = scenario;
  
  // Initialize orders array
  const orders = new Array(PERIODS + 1).fill(0);
  
  // Iterate through weeks
  let week = 0;
  while (week <= PERIODS) {
    // Calculate the end of the look-ahead window, capped at PERIODS
    const lookAheadEnd = Math.min(week + LdTm, PERIODS);
    
    // Sum up requirements and scheduled receipts for the look-ahead window
    let totalRequirements = 0;
    let totalScheduledReceipts = 0;
    
    for (let i = week; i <= lookAheadEnd; i++) {
      totalRequirements += Rqt[i] || 0;
      totalScheduledReceipts += Rec[i] || 0;
    }
    
    // Calculate the needed quantity
    let neededQuantity = Math.max(0, totalRequirements - totalScheduledReceipts);
    
    // If we need to order something
    if (neededQuantity > 0) {
      // Round up to nearest MOQ
      let orderQuantity = Math.ceil(neededQuantity / MOQ) * MOQ;
      
      // Adjust to be a multiple of PkQty if needed
      if (orderQuantity % PkQty !== 0) {
        orderQuantity = Math.ceil(orderQuantity / PkQty) * PkQty;
      }
      
      // Place the order
      orders[week] = orderQuantity;
      
      // Skip ahead by lead time to avoid over-ordering
      week += LdTm;
    } else {
      // If no order needed, just move to next week
      week++;
    }
  }
  
  return orders;
}
