import { scval_converter } from 'blend-sdk';
import { xdr } from 'soroban-client';

export function fromInputStringToScVal(input: string): xdr.ScVal {
  let scaled_input;
  if (input.includes('.')) {
    let [base, decimal] = input.split('.');
    scaled_input = `${base}${decimal}${'0'.repeat(7 - decimal.length)}`;
  } else {
    scaled_input = `${input}${'0000000'}`;
  }
  return xdr.ScVal.fromXDR(scval_converter.bigintToI128(BigInt(scaled_input)).toXDR());
}
