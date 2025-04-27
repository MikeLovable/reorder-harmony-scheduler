
import { ProductionScenario, OrderSchedule } from "../types";

export function calculateOrderSchedule(scenario: ProductionScenario): OrderSchedule {
  const { MPN, InvTgt, SStok, LdTm, MOQ, PkQty, Rqt, Rec, Inv } = scenario;
  
  // Initialize the output arrays with the same length as Rqt (13 weeks)
  const weekCount = Rqt.length;
  const calculatedOrd: number[] = new Array(weekCount).fill(0);
  const calculatedRec: number[] = [...Rec]; // Start with the existing receiving schedule
  const calculatedInv: number[] = [...Inv]; // Start with the existing inventory levels
  const notes: string[] = [];
  
  // Calculate orders for each week
  for (let week = 0; week < weekCount; week++) {
    // Calculate projected inventory and determine if an order is needed
    let projectedInv = week === 0 ? Inv[0] : calculatedInv[week - 1];
    
    // Add receiving for the current week
    projectedInv += calculatedRec[week];
    
    // Subtract requirements for the current week
    projectedInv -= Rqt[week];
    
    // Update inventory for current week
    calculatedInv[week] = Math.max(0, projectedInv);
    
    // Check if we need to place an order
    // Look ahead for LdTm weeks to see if inventory will drop below safety stock
    const targetInv = InvTgt + SStok;
    let shouldOrder = false;
    let criticalWeek = -1;
    let lowestProjectedInv = projectedInv;
    
    // Look ahead to determine if we need to order
    for (let ahead = 1; ahead <= Math.min(LdTm + 3, weekCount - week - 1); ahead++) {
      let futureInv = calculatedInv[week];
      
      // Add future receiving
      for (let i = week + 1; i <= week + ahead && i < weekCount; i++) {
        futureInv += calculatedRec[i];
      }
      
      // Subtract future requirements
      for (let i = week + 1; i <= week + ahead && i < weekCount; i++) {
        futureInv -= Rqt[i];
      }
      
      // Check if we're projected to go below safety stock
      if (futureInv < SStok) {
        shouldOrder = true;
        if (criticalWeek === -1 || futureInv < lowestProjectedInv) {
          criticalWeek = week + ahead;
          lowestProjectedInv = futureInv;
        }
      }
    }
    
    // Check if inventory is already excessive (over 3 times the target)
    const excessiveInv = calculatedInv[week] > InvTgt * 3;
    let nextWeekExcessive = false;
    
    if (week < weekCount - 1) {
      const nextWeekInv = calculatedInv[week] + calculatedRec[week + 1] - Rqt[week + 1];
      nextWeekExcessive = nextWeekInv > InvTgt * 3;
    }
    
    // Don't order if inventory is already excessive for this and next week
    if (excessiveInv && nextWeekExcessive) {
      shouldOrder = false;
    }
    
    // Calculate order quantity if needed
    if (shouldOrder) {
      // Calculate how much to order to reach target inventory by critical week
      let orderQty = targetInv - lowestProjectedInv;
      
      // Enforce minimum order quantity
      orderQty = Math.max(orderQty, MOQ);
      
      // Round up to nearest package quantity
      orderQty = Math.ceil(orderQty / PkQty) * PkQty;
      
      calculatedOrd[week] = orderQty;
      
      // Update future receiving based on lead time
      const receiveWeek = Math.min(week + LdTm, weekCount - 1);
      calculatedRec[receiveWeek] += orderQty;
      
      // Recalculate future inventory levels after this order
      for (let i = receiveWeek; i < weekCount; i++) {
        if (i === 0) {
          calculatedInv[i] = Inv[0] + calculatedRec[i] - Rqt[i];
        } else {
          calculatedInv[i] = Math.max(0, calculatedInv[i - 1] + calculatedRec[i] - Rqt[i]);
        }
      }
    }
  }
  
  // Check for critical conditions and add notes
  let hasZeroInventory = false;
  let hasExcessiveInventory = false;
  let consecutiveExcessWeeks = 0;
  
  for (let week = 0; week < weekCount; week++) {
    if (calculatedInv[week] <= 0) {
      hasZeroInventory = true;
    }
    
    if (calculatedInv[week] >= InvTgt * 3) {
      consecutiveExcessWeeks++;
      if (consecutiveExcessWeeks >= 2) {
        hasExcessiveInventory = true;
      }
    } else {
      consecutiveExcessWeeks = 0;
    }
  }
  
  let finalNotes = "";
  if (hasZeroInventory) {
    finalNotes += "WARNING: Inventory reaches zero or below in some weeks. ";
  }
  
  if (hasExcessiveInventory) {
    finalNotes += "CAUTION: Inventory exceeds 3x target for 2+ consecutive weeks. ";
  }
  
  if (!finalNotes) {
    finalNotes = "Schedule optimized successfully.";
  }
  
  return {
    MPN,
    Rqt,
    Ord: calculatedOrd,
    Rec: calculatedRec,
    Inv: calculatedInv,
    Notes: finalNotes.trim()
  };
}
