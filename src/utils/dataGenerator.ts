
import { PERIODS, SAMPLES, ProductionScenario } from "../types";

// Helper function to generate a random integer between min and max (inclusive)
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a random MPN string
function generateMPN(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "MPN_";
  for (let i = 0; i < 3; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return result;
}

// Generate a random production scenario
function generateProductionScenario(): ProductionScenario {
  // Generate core properties
  const invTgt = randomInt(10, 200);
  const sstok = Math.min(randomInt(0, 10), Math.floor(invTgt * 0.05));
  const moq = randomInt(2, 100);
  const pkQty = Math.min(randomInt(2, 20), Math.floor(moq / 5));
  
  // Generate weeks of data
  const rqt = Array(PERIODS + 1).fill(0).map(() => randomInt(0, 400));
  const rec = Array(PERIODS + 1).fill(0).map(() => randomInt(0, 200));
  
  // Generate inventory - starting with a reasonable value
  const inv = Array(PERIODS + 1).fill(0);
  inv[0] = randomInt(invTgt - sstok, invTgt + sstok); // Start with inventory near target
  
  // Calculate inventory for subsequent weeks based on requirements and receipts
  for (let i = 1; i <= PERIODS; i++) {
    inv[i] = Math.max(0, inv[i-1] + rec[i-1] - rqt[i-1]);
  }
  
  return {
    Sel: false,
    MPN: generateMPN(),
    InvTgt: invTgt,
    SStok: sstok,
    LdTm: randomInt(1, 5),
    MOQ: moq,
    PkQty: pkQty,
    Rqt: rqt,
    Rec: rec,
    Inv: inv
  };
}

// Generate a specified number of production scenarios
export function generateProductionScenarios(count: number = SAMPLES, dataSource: string = 'random'): ProductionScenario[] {
  const scenarios: ProductionScenario[] = [];
  for (let i = 0; i < count; i++) {
    scenarios.push(generateProductionScenario());
  }
  return scenarios;
}
