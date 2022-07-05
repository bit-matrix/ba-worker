export type TxVOutRPC = {
  value: number;
  asset?: string;
  commitmentnonce: string;
  n: number;
  scriptPubKey: {
    asm: string;
    hex: string;
    type: string;
  };
  surjectionproof?: string;
  valuecommitment?: string;
  assetcommitment: string;
  commitmentnonce_fully_valid?: boolean;
};
