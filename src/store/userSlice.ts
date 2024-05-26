import { BackstopUser, PoolUser } from '@blend-capital/blend-sdk';
import { Address, Horizon } from '@stellar/stellar-sdk';
import { StateCreator } from 'zustand';
import { getTokenBalance } from '../external/token';
import { BLND_ASSET, USDC_ASSET } from '../utils/token_display';
import { DataStore } from './store';

/**
 * Ledger state for the Blend protocol
 */
export interface UserSlice {
  account: Horizon.AccountResponse | undefined;
  isFunded: boolean | undefined;
  balances: Map<string, bigint>;
  backstopUserData: BackstopUser | undefined;
  userPoolData: Map<string, PoolUser>;
  loadUserData: (id: string) => Promise<void>;
  clearUserData: () => void;
}

export const createUserSlice: StateCreator<DataStore, [], [], UserSlice> = (set, get) => ({
  account: undefined,
  isFunded: undefined,
  balances: new Map<string, bigint>(),
  backstopUserData: undefined,
  userPoolData: new Map<string, PoolUser>(),

  loadUserData: async (id: string) => {
    try {
      const network = get().network;
      const rpc = get().rpcServer();
      const networkPassphrase = network.passphrase;

      if (get().latestLedgerTimestamp == 0) {
        await get().loadBlendData(true, "CCG4HM7SML3CUKWO2WOXDR2HCH5EMIIYVNPFB2EMQPWI6KURL46XB54H");
      }

      const backstop = get().backstop;
      const pools = get().pools;

      if (backstop == undefined || pools.size == 0) {
        throw new Error('Unable to fetch backstop or pool data');
      }

      // load horizon account
      let account: Horizon.AccountResponse;
      let horizonServer;
      try {
        horizonServer = get().horizonServer();
        account = await horizonServer.loadAccount(id);
      } catch (e) {
        console.error('Account does not exist.');
        set({ isFunded: false });
        throw e;
      }

      // load user data for backstop
      let backstop_user = await backstop.loadUser(network, id);

      // load pool data for user for each tracked pool
      // load token balances for each unique reserve or fetch from the account response
      let user_pool_data = new Map<string, PoolUser>();
      let user_balances = new Map<string, bigint>();

      /** load USDC and BLND balances manually **/
      const usdcContractId = USDC_ASSET.contractId(networkPassphrase);
      let usdcBalanceLine = account.balances.find((balance) => {
        return (
          // @ts-ignore
          balance.asset_code === USDC_ASSET.code &&
          // @ts-ignore
          balance.asset_issuer === USDC_ASSET.issuer
        );
      });
      let usdc_balance_string = usdcBalanceLine ? usdcBalanceLine.balance.replace('.', '') : '0';
      user_balances.set(usdcContractId, BigInt(usdc_balance_string));

      const blndContractId = BLND_ASSET.contractId(networkPassphrase);
      let blndBalanceLine = account.balances.find((balance) => {
        return (
          // @ts-ignore
          balance.asset_code === BLND_ASSET.code &&
          // @ts-ignore
          balance.asset_issuer === BLND_ASSET.issuer
        );
      });
      let blnd_balance_string = blndBalanceLine ? blndBalanceLine.balance.replace('.', '') : '0';
      user_balances.set(blndContractId, BigInt(blnd_balance_string));

      for (let [pool, pool_data] of Array.from(pools.entries())) {
        let pool_user = await pool_data.loadUser(network, id);
        user_pool_data.set(pool, pool_user);
        const poolReserves = Array.from(pool_data.reserves.values());
        for (let reserve of poolReserves) {
          if (user_balances.has(reserve.assetId)) {
            // duplicate reserve from another pool, skip
            continue;
          }
          if (reserve.tokenMetadata.asset != undefined) {
            // stellar asset, fetch balance from account response
            let balance_line = account.balances.find((balance) => {
              if (balance.asset_type == 'native') {
                // @ts-ignore
                return reserve.tokenMetadata.asset.isNative();
              }
              return (
                // @ts-ignore
                balance.asset_code === reserve.tokenMetadata.asset.getCode() &&
                // @ts-ignore
                balance.asset_issuer === reserve.tokenMetadata.asset.getIssuer()
              );
            });
            let balance_string = balance_line ? balance_line.balance.replace('.', '') : '0';
            user_balances.set(reserve.assetId, BigInt(balance_string));
          } else {
            let balance = await getTokenBalance(
              rpc,
              network.passphrase,
              reserve.assetId,
              new Address(id)
            );
            user_balances.set(reserve.assetId, balance);
          }
        }
      }
      set({
        account,
        isFunded: true,
        balances: user_balances,
        backstopUserData: backstop_user,
        userPoolData: user_pool_data,
      });
    } catch (e) {
      console.error('Unable to load user data');
      console.error(e);
    }
  },
  clearUserData: () => {
    set({
      account: undefined,
      balances: new Map<string, bigint>(),
      backstopUserData: undefined,
      userPoolData: new Map<string, PoolUser>(),
    });
  },
});
