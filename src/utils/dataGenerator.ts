
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
  // Generate core properties with new constraints
  // InvTgt is a whole integer multiple of 10
  const invTgt = randomInt(2, 20) * 10; // 20 to 200 in steps of 10
  
  // SStok is less than 20 percent of InvTgt
  const maxSStok = Math.floor(invTgt * 0.2);
  const sstok = randomInt(0, maxSStok);
  
  // MOQ is a whole integer multiple of 10
  const moq = randomInt(1, 10) * 10; // 10 to 100 in steps of 10
  
  // PkQty is a whole integer multiple of 5 and is less than MOQ
  const maxPkQtyMultiplier = Math.floor(moq / 5);
  const pkQty = maxPkQtyMultiplier > 0 ? randomInt(1, maxPkQtyMultiplier) * 5 : 5;
  
  // LdTm is a whole integer between 1 and 4 inclusive
  const ldTm = randomInt(1, 4);
  
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
    LdTm: ldTm,
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
