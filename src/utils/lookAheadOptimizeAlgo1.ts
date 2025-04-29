
import { ProductionScenario } from "../types";
import { PERIODS } from "../types";

/**
 * Algorithm 1: Optimize inventory based on target inventory levels, safety stock,
 * lead times, MOQ, and package quantities
 * @param scenario A production scenario
 * @returns Array of order quantities
 */
export function lookAheadOptimizeAlgo1(scenario: ProductionScenario): number[] {
  const { InvTgt, SStok, LdTm, MOQ, PkQty, Rqt, Rec } = scenario;
  const targetLevel = InvTgt + SStok;
  const orders = new Array(PERIODS + 1).fill(0);
  
  // Create a simulation of inventory levels based on requirements and scheduled receipts
  const simulatedInventory = new Array(PERIODS + 1).fill(0);
  // Initialize with the initial inventory (assumed to be at target level)
  simulatedInventory[0] = scenario.Inv ? scenario.Inv[0] : InvTgt;
  
  // First pass: simulate inventory without new orders to identify shortages
  for (let week = 1; week <= PERIODS; week++) {
    // Previous week's inventory + incoming receipts - requirements
    const previousWeekInv = simulatedInventory[week - 1];
    const incomingRec = Rec[week - 1] || 0;
    const outgoingRqt = Rqt[week - 1] || 0;
    
    simulatedInventory[week] = Math.max(0, previousWeekInv + incomingRec - outgoingRqt);
  }
  
  // Second pass: place orders to maintain inventory at target level
  for (let week = 0; week <= PERIODS - LdTm; week++) {
    // Look ahead to when this order would be received
    const receiveWeek = week + LdTm;
    
    // Calculate how much inventory is expected at the receive week without this order
    let projectedInv = simulatedInventory[receiveWeek];
    
    // If projected inventory is below target + safety stock, place an order
    if (projectedInv < targetLevel) {
      // Calculate how much we need to order to reach the target level
      let neededQty = targetLevel - projectedInv;
      
      // Round up to the nearest PkQty (package quantity)
      neededQty = Math.ceil(neededQty / PkQty) * PkQty;
      
      // Ensure we're ordering at least the minimum order quantity
      neededQty = Math.max(neededQty, MOQ);
      
      // Place the order for this week
      orders[week] = neededQty;
      
      // Update simulated inventory for all weeks after the receipt
      for (let futureWeek = receiveWeek; futureWeek <= PERIODS; futureWeek++) {
        simulatedInventory[futureWeek] += neededQty;
      }
    }
    
    // Check for excessive inventory and adjust
    // If we've already placed orders that will cause excessive inventory, try to reduce or delay orders
    for (let checkWeek = week + 1; checkWeek <= PERIODS - LdTm; checkWeek++) {
      const receiveCheckWeek = checkWeek + LdTm;
      
      // Look at 2 consecutive weeks to check for excessive inventory
      if (receiveCheckWeek + 1 <= PERIODS && 
          simulatedInventory[receiveCheckWeek] > InvTgt * 3 && 
          simulatedInventory[receiveCheckWeek + 1] > InvTgt * 3) {
        
        // Check if we have a planned order at checkWeek
        if (orders[checkWeek] > 0) {
          // Calculate how much we can reduce this order
          const excessQty = simulatedInventory[receiveCheckWeek] - targetLevel;
          const reductionQty = Math.floor(excessQty / PkQty) * PkQty;
          
          if (reductionQty > 0) {
            // Ensure we don't reduce below MOQ
            const newOrderQty = Math.max(orders[checkWeek] - reductionQty, orders[checkWeek] > 0 ? MOQ : 0);
            const actualReduction = orders[checkWeek] - newOrderQty;
            
            // Update the order
            orders[checkWeek] = newOrderQty;
            
            // Update simulated inventory
            for (let futureWeek = receiveCheckWeek; futureWeek <= PERIODS; futureWeek++) {
              simulatedInventory[futureWeek] -= actualReduction;
            }
          }
        }
      }
    }
  }
  
  return orders;
}
