export type Pool = {
  asset: string;
  quote: { ticker: string; name: string };
  token: { ticker: string; name: string };
  active: boolean;
};
