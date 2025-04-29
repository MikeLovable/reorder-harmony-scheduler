
// Constants for the application
export const PERIODS = 12;
export const SAMPLES = 20;

export type ProductionScenario = {
  Sel?: boolean;
  MPN: string;
  InvTgt: number;
  SStok: number;
  LdTm: number;
  MOQ: number;
  PkQty: number;
  Rqt: number[];
  Rec: number[];
  Inv?: number[];
};

export type OrderSchedule = {
  MPN: string;
  InvTgt: number;
  SStok: number;
  LdTm: number;
  MOQ: number;
  PkQty: number;
  Rqt: number[];
  InRec: number[];
  Ord: number[];
  Rec: number[];
  Inv: number[];
  Notes: string;
};

export type ProductionScenarioArray = ProductionScenario[];
export type OrderScheduleArray = OrderSchedule[];
