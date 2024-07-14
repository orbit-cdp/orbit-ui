import { TokenType } from "./tokens";

export type CurrencyAmount = {
  currency: TokenType;
  value: string;
};
