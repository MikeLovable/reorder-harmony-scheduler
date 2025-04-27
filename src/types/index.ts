
export type ProductionScenario = {
  MPN: string;
  InvTgt: number;
  SStok: number;
  LdTm: number;
  MOQ: number;
  PkQty: number;
  Rqt: number[];
  Rec: number[];
  Inv: number[];
};

export type OrderSchedule = {
  MPN: string;
  Rqt: number[];
  Ord: number[];
  Rec: number[];
  Inv: number[];
  Notes: string;
};
