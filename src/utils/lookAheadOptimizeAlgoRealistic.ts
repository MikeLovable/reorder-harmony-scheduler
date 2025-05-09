
import { ProductionScenario } from "../types";
import { PERIODS } from "../types";

/**
 * Algorithm Realistic: An improved algorithm that prevents zero inventory
 * by looking ahead by lead time and ordering enough to cover future requirements
 * @param scenario A production scenario
 * @returns Array of order quantities
 */
export function lookAheadOptimizeAlgoRealistic(scenario: ProductionScenario): number[] {
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
    
    // Calculate total requirements and scheduled receipts for the lead time window
    // This ensures we're ordering enough to cover the entire lead time period
    let totalRequirements = 0;
    let totalScheduledReceipts = 0;
    let minProjectedInventory = Infinity;
    
    // Look ahead from the current week to the receive week + LdTm more weeks
    // This gives us a "double lead time" look-ahead horizon
    const lookAheadEnd = Math.min(receiveWeek + LdTm, PERIODS);
    
    for (let i = receiveWeek; i <= lookAheadEnd; i++) {
      totalRequirements += Rqt[i] || 0;
      totalScheduledReceipts += Rec[i] || 0;
      
      // Track the minimum projected inventory in the look-ahead period
      const projectedInv = simulatedInventory[i];
      if (projectedInv < minProjectedInventory) {
        minProjectedInventory = projectedInv;
      }
    }
    
    // If minimum projected inventory is below target + safety stock, place an order
    if (minProjectedInventory < targetLevel) {
      // Calculate how much we need to order to cover the requirements
      // Add a safety buffer to prevent inventory from reaching zero
      let neededQty = totalRequirements - totalScheduledReceipts;
      
      // Add additional quantity to reach target inventory level
      neededQty += targetLevel - minProjectedInventory;
      
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
      
      // After placing a significant order, skip ahead by half the lead time
      // to avoid placing too many orders close together
      if (neededQty >= MOQ * 2) {
        week += Math.max(1, Math.floor(LdTm / 2));
      }
    }
  }
  
  // Final pass: check for potential stock-outs and place emergency orders if needed
  for (let week = 0; week <= PERIODS - LdTm; week++) {
    const receiveWeek = week + LdTm;
    
    // If we're going to have zero inventory in any week within the lead time window 
    // after the receive week, place an emergency order
    let hasZeroInventory = false;
    for (let i = receiveWeek; i <= Math.min(receiveWeek + LdTm, PERIODS); i++) {
      if (simulatedInventory[i] <= 0) {
        hasZeroInventory = true;
        break;
      }
    }
    
    if (hasZeroInventory && orders[week] === 0) {
      // Place an emergency order that's larger than the usual order
      const emergencyQty = Math.max(MOQ, Math.ceil(InvTgt * 1.5 / PkQty) * PkQty);
      orders[week] = emergencyQty;
      
      // Update simulated inventory
      for (let futureWeek = receiveWeek; futureWeek <= PERIODS; futureWeek++) {
        simulatedInventory[futureWeek] += emergencyQty;
      }
    }
  }
  
  return orders;
}
