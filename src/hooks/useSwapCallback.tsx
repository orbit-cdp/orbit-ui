import * as StellarSdk from '@stellar/stellar-sdk';
import BigNumber from 'bignumber.js';
import { useWallet } from '../contexts/wallet'; // Adjust the import path if necessary
import { getCurrentTimePlusOneHour } from '../functions/getCurrentTimePlusOneHour';
import { scValToJs } from '../helpers/convert';
import { bigNumberToI128, bigNumberToU64 } from '../helpers/utils';
import { InterfaceTrade, TradeType } from '../state/routing/types';
import { RouterMethod, useRouterCallback } from './useRouterCallback';

// Returns a function that will execute a swap, if the parameters are all valid
// and the user has approved the slippage adjusted input amount for the trade

interface GetSwapAmountsProps {
  tradeType: TradeType;
  inputAmount: string;
  outputAmount: string;
  allowedSlippage: number;
}

export const getSwapAmounts = ({
  tradeType,
  inputAmount,
  outputAmount,
  allowedSlippage = 0.5,
}: GetSwapAmountsProps) => {
  const routerMethod =
    tradeType == TradeType.EXACT_INPUT ? RouterMethod.SWAP_EXACT_IN : RouterMethod.SWAP_EXACT_OUT;

  const factorLess = BigNumber(100).minus(allowedSlippage).dividedBy(100);
  const factorMore = BigNumber(100).plus(allowedSlippage).dividedBy(100);

  //amount_in , amount_out
  const amount0 =
    routerMethod === RouterMethod.SWAP_EXACT_IN ? BigNumber(inputAmount) : BigNumber(outputAmount);

  //amount_out_min , amount_in_max
  const amount1 =
    routerMethod === RouterMethod.SWAP_EXACT_IN
      ? BigNumber(outputAmount).multipliedBy(factorLess).decimalPlaces(0)
      : BigNumber(inputAmount).multipliedBy(factorMore).decimalPlaces(0);

  return { amount0, amount1, routerMethod };
};

interface SuccessfulSwapResponse
  extends StellarSdk.SorobanRpc.Api.GetSuccessfulTransactionResponse {
  switchValues: string[];
}

export function useSwapCallback(
  trade: InterfaceTrade | undefined // trade to execute, required
) {
  const { connected, walletAddress } = useWallet(); // Use the wallet context
  const routerCallback = useRouterCallback();
  const allowedSlippage = 1;

  const doSwap = async (
    simulation?: boolean
  ): Promise<SuccessfulSwapResponse | StellarSdk.SorobanRpc.Api.GetTransactionResponse> => {
    if (!trade) throw new Error('missing trade');
    if (!connected || !walletAddress) throw new Error('wallet must be connected to swap');
    if (!trade.tradeType) throw new Error('tradeType must be defined');

    const { amount0, amount1, routerMethod } = getSwapAmounts({
      tradeType: trade.tradeType,
      inputAmount: trade.inputAmount?.value as string,
      outputAmount: trade.outputAmount?.value as string,
      allowedSlippage: allowedSlippage,
    });

    const amount0ScVal = bigNumberToI128(amount0);
    const amount1ScVal = bigNumberToI128(amount1);

    console.log('USING ROUTER');
    const path = trade.path?.map((address: string) => new StellarSdk.Address(address));

    const pathScVal = StellarSdk.nativeToScVal(path);

    const args = [
      amount0ScVal,
      amount1ScVal,
      pathScVal, // path
      new StellarSdk.Address(walletAddress).toScVal(),
      bigNumberToU64(BigNumber(getCurrentTimePlusOneHour())),
    ];

    try {
      const result = (await routerCallback(
        routerMethod,
        args,
        !simulation
      )) as StellarSdk.SorobanRpc.Api.GetTransactionResponse;

      //if it is a simulation should return the result
      if (simulation) return result;

      if (result.status !== StellarSdk.SorobanRpc.Api.GetTransactionStatus.SUCCESS) throw result;

      const switchValues: string[] = scValToJs(result.returnValue!);

      const currencyA = switchValues?.[0];
      const currencyB = switchValues?.[switchValues?.length - 1];

      return { ...result, switchValues };
    } catch (error) {
      throw error;
    }
  };

  return { doSwap, isLoading: trade?.isLoading };
}
