
import { ProductionScenario, OrderSchedule } from "../types";
import * as algorithmMain from "./algorithmMain";

import { lookAheadOptimizeMOCK } from "./lookAheadOptimizeMOCK";
import { lookAheadOptimizeAlgo1 } from "./lookAheadOptimizeAlgo1";
import { lookAheadOptimizeAlgo2 } from "./lookAheadOptimizeAlgo2";
import { lookAheadOptimizeAlgo3 } from "./lookAheadOptimizeAlgo3";

// Re-export the functions
export const calculateOrderSchedule = algorithmMain.calculateOrderSchedule;
export const calculateOrderSchedules = algorithmMain.calculateOrderSchedules;
export { 
  lookAheadOptimizeMOCK,
  lookAheadOptimizeAlgo1,
  lookAheadOptimizeAlgo2,
  lookAheadOptimizeAlgo3
};
