
import { PERIODS } from '../types';
import { ProductionScenario, OrderSchedule, ProductionScenarioArray, OrderScheduleArray } from '../types';

/**
 * Calculates order schedules for an array of production scenarios
 * @param scenarios Array of production scenarios
 * @param algorithmType The selected algorithm type
 * @returns Array of order schedules
 */
export function calculateOrderSchedules(
  scenarios: ProductionScenarioArray,
  algorithmType: 'Mock' | 'Algo1' | 'Algo2' | 'Algo3' = 'Mock'
): OrderScheduleArray {
  return scenarios.map(scenario => calculateOrderSchedule(scenario, algorithmType));
}

/**
 * Calculates an order schedule for a single production scenario
 * @param scenario A production scenario
 * @param algorithmType The selected algorithm type
 * @returns An order schedule
 */
export function calculateOrderSchedule(
  scenario: ProductionScenario,
  algorithmType: 'Mock' | 'Algo1' | 'Algo2' | 'Algo3' = 'Mock'
): OrderSchedule {
  const { MPN, InvTgt, SStok, LdTm, MOQ, PkQty, Rqt, Rec } = scenario;
  
  // Initialize the output OrderSchedule
  const orderSchedule: OrderSchedule = {
    MPN,
    InvTgt,
    SStok, 
    LdTm,
    MOQ,
    PkQty,
    Rqt: [...Rqt],
    InRec: [...Rec],
    Ord: new Array(PERIODS + 1).fill(0),
    Rec: new Array(PERIODS + 1).fill(0),
    Inv: new Array(PERIODS + 1).fill(0),
    Notes: ""
  };

  // Generate orders using the selected algorithm
  switch(algorithmType) {
    case 'Algo1':
      orderSchedule.Ord = lookAheadOptimizeAlgo1(scenario);
      break;
    case 'Algo2':
      orderSchedule.Ord = lookAheadOptimizeAlgo2(scenario);
      break;
    case 'Algo3':
      orderSchedule.Ord = lookAheadOptimizeAlgo3(scenario);
      break;
    case 'Mock':
    default:
      orderSchedule.Ord = lookAheadOptimizeMOCK(scenario);
      break;
  }

  // Calculate future receiving based on orders and lead time
  for (let week = 0; week <= PERIODS; week++) {
    const orderAmount = orderSchedule.Ord[week];
    if (orderAmount > 0) {
      // Determine when this order will be received
      const receiveWeek = week + LdTm;
      
      if (receiveWeek <= PERIODS) {
        // Order is received within our planning horizon
        orderSchedule.Rec[receiveWeek] += orderAmount;
      } else {
        // Order would be received after our planning horizon, add to the last period
        orderSchedule.Rec[PERIODS] += orderAmount;
      }
    }
  }

  // Calculate inventory levels
  // Start with initial inventory (first week)
  orderSchedule.Inv[0] = scenario.Inv ? scenario.Inv[0] : InvTgt;  // Default to target if not provided
  
  // Calculate inventory for the rest of the weeks
  for (let week = 1; week <= PERIODS; week++) {
    const previousInv = orderSchedule.Inv[week - 1];
    const incomingRec = orderSchedule.Rec[week - 1];
    const outgoingRqt = orderSchedule.Rqt[week - 1];
    
    // Calculate new inventory: previous inventory + receiving - requirements
    const newInv = previousInv + incomingRec - outgoingRqt;
    orderSchedule.Inv[week] = Math.max(0, newInv);  // Inventory cannot be negative
  }

  // Add notes about inventory conditions
  let hasZeroInventory = false;
  let hasExcessiveInventory = false;
  let consecutiveExcessWeeks = 0;
  
  for (let week = 0; week <= PERIODS; week++) {
    const currentInv = orderSchedule.Inv[week];
    
    // Check for zero inventory
    if (currentInv <= 0) {
      hasZeroInventory = true;
    }
    
    // Check for excessive inventory
    if (currentInv > InvTgt * 3) {
      consecutiveExcessWeeks++;
      if (consecutiveExcessWeeks >= 2) {
        hasExcessiveInventory = true;
      }
    } else {
      consecutiveExcessWeeks = 0;
    }
  }
  
  // Compose the notes
  if (hasZeroInventory) {
    orderSchedule.Notes += "WARNING: Inventory reaches zero in some weeks. ";
  }
  
  if (hasExcessiveInventory) {
    orderSchedule.Notes += "CAUTION: Inventory exceeds 3x target for 2+ consecutive weeks. ";
  }
  
  if (!orderSchedule.Notes) {
    orderSchedule.Notes = "Schedule optimized successfully.";
  }

  return orderSchedule;
}

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

/**
 * Algorithm 2: Placeholder for a more advanced optimization algorithm (stub)
 * @param scenario A production scenario
 * @returns Array of order quantities
 */
export function lookAheadOptimizeAlgo2(scenario: ProductionScenario): number[] {
  // This is a stub implementation - would be replaced with an actual algorithm
  const orders = new Array(PERIODS + 1).fill(0);
  
  // For now, just return the same orders as the mock algorithm
  return lookAheadOptimizeMOCK(scenario);
}

/**
 * Algorithm 3: Placeholder for a more advanced optimization algorithm (stub)
 * @param scenario A production scenario
 * @returns Array of order quantities
 */
export function lookAheadOptimizeAlgo3(scenario: ProductionScenario): number[] {
  // This is a stub implementation - would be replaced with an actual algorithm
  const orders = new Array(PERIODS + 1).fill(0);
  
  // For now, just return the same orders as the mock algorithm
  return lookAheadOptimizeMOCK(scenario);
}
