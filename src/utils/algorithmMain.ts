
import { PERIODS } from '../types';
import { ProductionScenario, OrderSchedule, ProductionScenarioArray, OrderScheduleArray } from '../types';
import { lookAheadOptimizeMOCK } from './lookAheadOptimizeMOCK';
import { lookAheadOptimizeAlgo1 } from './lookAheadOptimizeAlgo1';
import { lookAheadOptimizeAlgo2 } from './lookAheadOptimizeAlgo2';
import { lookAheadOptimizeAlgo3 } from './lookAheadOptimizeAlgo3';

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
  const { MPN, InvTgt, SStok, LdTm, MOQ, PkQty, Rqt, Rec, Inv } = scenario;
  
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
  // Start with initial inventory (first week) from the input scenario
  orderSchedule.Inv[0] = scenario.Inv ? scenario.Inv[0] : InvTgt;  // Use scenario inventory or default to target
  
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
