import { Network, TxOptions, i128, invokeOperation } from '@blend-capital/blend-sdk';
import { Contract, nativeToScVal, scValToBigInt, xdr } from 'stellar-sdk';

export class CometClient {
  comet: Contract;

  constructor(address: string) {
    this.comet = new Contract(address);
  }
  /**
 * 
    token_in: Address,
    token_amount_in: i128,
    min_pool_amount_out: i128,
    user: Address,
 */
  public async depositTokenInGetLPOut(
    source: string,
    sign: (txXdr: string) => Promise<string>,
    network: Network,
    depositTokenAddress: string,
    depositTokenAmount: bigint,
    minLPTokenAmount: bigint,
    user: string,
    txOptions: TxOptions
  ) {
    const invokeArgs = {
      method: 'dep_tokn_amt_in_get_lp_tokns_out',
      args: [
        nativeToScVal(depositTokenAddress, { type: 'address' }),
        nativeToScVal(depositTokenAmount, { type: 'i128' }),
        nativeToScVal(minLPTokenAmount, { type: 'i128' }),
        nativeToScVal(user, { type: 'address' }),
      ],
    };
    const operation = this.comet.call(invokeArgs.method, ...invokeArgs.args);
    return await invokeOperation<i128>(
      source,
      sign,
      network,
      txOptions,
      (value: string | xdr.ScVal | undefined): i128 | undefined => {
        if (value == undefined) {
          return undefined;
        }
        console.log({ value });
        const scVal = scValToBigInt(xdr.ScVal.fromXDR(value as string, 'base64'));
        console.log({ scVal });
        return scVal;
      },
      operation
    );
  }
  /**
  // To get Y amount of LP tokens, how much of token will be required
        token_in: Address,
        pool_amount_out: i128,
        max_amount_in: i128,
        user: Address,
 */
  public async getTokenAmountInByLPAmount(
    source: string,
    sign: (txXdr: string) => Promise<string>,
    network: Network,
    depositTokenAddress: string,
    LPTokenAmount: bigint,
    maxDepositTokenAmount: bigint,
    user: string,
    txOptions: TxOptions
  ) {
    const invokeArgs = {
      method: 'dep_lp_tokn_amt_out_get_tokn_in',
      args: [
        nativeToScVal(depositTokenAddress, { type: 'address' }),
        nativeToScVal(LPTokenAmount, { type: 'i128' }),
        nativeToScVal(maxDepositTokenAmount, { type: 'i128' }),
        nativeToScVal(user, { type: 'address' }),
      ],
    };
    const operation = this.comet.call(invokeArgs.method, ...invokeArgs.args);
    return await invokeOperation<i128>(
      source,
      sign,
      network,
      txOptions,
      (value: string | xdr.ScVal | undefined): i128 | undefined => {
        if (value == undefined) {
          return undefined;
        }
        console.log({ value });
        const scVal = scValToBigInt(xdr.ScVal.fromXDR(value as string, 'base64'));
        console.log({ scVal });
        return scVal;
      },
      operation
    );
  }
}
export interface cometPoolDepositArgs {
  depositTokenAddress: string;
  depositTokenAmount: bigint;
  minLPTokenAmount: bigint;
  user: string;
}

export interface competPoolGetDepositAmountByLPArgs {
  depositTokenAddress: string;
  LPTokenAmount: bigint;
  maxDepositTokenAmount: bigint;
  user: string;
}
