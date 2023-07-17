import { Backstop, data_entry_converter } from 'blend-sdk';
import { Address, Server, xdr } from 'soroban-client';
import { StateCreator } from 'zustand';
import { getTokenBalance } from '../utils/stellar_rpc';
import { DataStore, useStore } from './store';
export type PoolBackstopBalance = {
  tokens: bigint;
  shares: bigint;
  q4w: bigint;
};

/**
 * Ledger state for the backstop
 */
export interface BackstopSlice {
  backstopContract: Backstop.BackstopOpBuilder;
  backstopToken: string;
  backstopTokenPrice: bigint;
  backstopTokenBalance: bigint;
  rewardZone: string[];
  poolBackstopBalance: Map<string, PoolBackstopBalance>;
  shares: Map<string, BigInt>;
  q4w: Map<string, Backstop.Q4W[]>;
  refreshBackstopData: () => Promise<void>;
  refreshPoolBackstopData: (pool_id: string, user_id: string) => Promise<void>;
}

export const createBackstopSlice: StateCreator<DataStore, [], [], BackstopSlice> = (set, get) => ({
  backstopContract: new Backstop.BackstopOpBuilder(
    'CACJ5U6SEPLXF2V42NUZLLBFQBUKWRU523HQJMS5XM7HAU5MSHJS5W7X'
  ),
  backstopToken: 'CBK5BVAAE6SSHAMNLRRSAPZAQIG3MYOQPKOM2TAD4HLODZ2DQVBDRL55',
  backstopTokenPrice: BigInt(0.05e7), // TODO: Calculate fair value from LP,
  backstopTokenBalance: BigInt(0),
  rewardZone: [],
  poolBackstopBalance: new Map<string, PoolBackstopBalance>(),
  shares: new Map<string, BigInt>(),
  q4w: new Map<string, Backstop.Q4W[]>(),
  refreshBackstopData: async () => {
    try {
      
      const contract = get().backstopContract;
      const stellar = get().rpcServer();
      let rz_datakey = Backstop.BackstopDataKeyToXDR({ tag: "RewardZone"});
      rz_datakey = xdr.ScVal.fromXDR(rz_datakey.toXDR());
      let rz_dataEntry = await stellar.getContractData(contract._contract.contractId('hex'), rz_datakey);
      let rz = data_entry_converter.toStringArray(rz_dataEntry.xdr, 'hex');
      const poolBackstopBalMap = new Map<string, PoolBackstopBalance>();
      for (const rz_pool of rz) {
        poolBackstopBalMap.set(rz_pool, await loadPoolBackstopBalance(stellar, contract, rz_pool));
      }
      set({ rewardZone: rz, poolBackstopBalance: poolBackstopBalMap });
    } catch (e) {
      console.error('unable to refresh backstop data:', e);
    }
  },
  refreshPoolBackstopData: async (pool_id: string, user_id: string) => {
    try {
      const contract = get().backstopContract;
      const stellar = get().rpcServer();
      const network = get().passphrase;
      const token_id = get().backstopToken;
      let pool_backstop_data = await loadPoolBackstopBalance(stellar, contract, pool_id);
      let shares = await loadShares(stellar, contract, pool_id, user_id);
      let q4w = await loadQ4W(stellar, contract, pool_id, user_id);
      let token_balance = await getTokenBalance(stellar, network, token_id,  Address.fromString(user_id));
      useStore.setState((prev) => ({
        poolBackstopBalance: new Map(prev.poolBackstopBalance).set(pool_id, pool_backstop_data),
        backstopTokenBalance: token_balance,
        shares: new Map(prev.shares).set(pool_id, shares),
        q4w: new Map(prev.q4w).set(pool_id, q4w),
      }));
      console.log('refreshed pool backstop data for:', user_id);
    } catch (e) {
      console.error('unable to refresh backstop data:', e);
    }
  },
});

/********** Contract Data Helpers **********/

async function loadShares(
  stellar: Server,
  contract: Backstop.BackstopOpBuilder,
  pool_id: string,
  user_id: string
): Promise<BigInt> {
  try {
    let shares_datakey = Backstop.BackstopDataKeyToXDR({tag: "Shares", values: [{pool: pool_id, user: user_id}]})
    shares_datakey = xdr.ScVal.fromXDR(shares_datakey.toXDR());
    let shares_dataEntry = await stellar.getContractData(
      contract._contract.contractId(),
      shares_datakey
    );
    return data_entry_converter.toBigInt(shares_dataEntry.xdr);
  } catch (e: any) {
    if (e?.message?.includes('not found') === false) {
      console.error('unable to fetch shares for: ', pool_id);
      console.error(e);
    }
    // user balance not found, can assume a deposit of zero
    return BigInt(0);
  }
}

async function loadQ4W(
  stellar: Server,
  contract: Backstop.BackstopOpBuilder,
  pool_id: string,
  user_id: string
): Promise<Backstop.Q4W[]> {
  try {
    let q4w_datakey = Backstop.BackstopDataKeyToXDR({tag: "Q4W", values: [{pool: pool_id, user: user_id}]});
    q4w_datakey = xdr.ScVal.fromXDR(q4w_datakey.toXDR());
    let q4w_dataEntry = await stellar.getContractData(contract._contract.contractId(), q4w_datakey);
    return Backstop.Q4W.fromContractDataXDR(q4w_dataEntry.xdr);
  } catch (e: any) {
    if (e?.message?.includes('not found') === false) {
      console.error('unable to fetch q4w for: ', pool_id);
      console.error(e);
    }
    // user Q4W not found, can assume no Q4W present
    return [];
  }
}

async function loadPoolBackstopBalance(
  stellar: Server,
  contract: Backstop.BackstopOpBuilder,
  pool_id: string
): Promise<PoolBackstopBalance> {
  try {
    let tokens = BigInt(0);
    let shares = BigInt(0);
    let q4w = BigInt(0);
    let tokens_datakey = Backstop.BackstopDataKeyToXDR({tag: "PoolTkn", values: [pool_id]});
    tokens_datakey = xdr.ScVal.fromXDR(tokens_datakey.toXDR());
    tokens = await stellar
      .getContractData(contract._contract.contractId("hex"), tokens_datakey)
      .then((response) => data_entry_converter.toBigInt(response.xdr))
      .catch(() => BigInt(0));

    let shares_datakey = Backstop.BackstopDataKeyToXDR({tag: "PoolShares", values: [pool_id]});
    shares_datakey = xdr.ScVal.fromXDR(shares_datakey.toXDR())
    shares = await stellar
      .getContractData(contract._contract.contractId("hex"), shares_datakey)
      .then((response) => data_entry_converter.toBigInt(response.xdr))
      .catch(() => BigInt(0));

    let q4w_datakey = Backstop.BackstopDataKeyToXDR({tag: "PoolQ4W", values: [pool_id]});
    q4w_datakey = xdr.ScVal.fromXDR(q4w_datakey.toXDR())
    q4w = await stellar
      .getContractData(contract._contract.contractId("hex"), q4w_datakey)
      .then((response) => data_entry_converter.toBigInt(response.xdr))
      .catch(() => BigInt(0));

    return {
      tokens,
      shares,
      q4w,
    };
  } catch (e: any) {
    console.error(`unable to pool backstop data for ${pool_id}:`, e);
    return {
      tokens: BigInt(0),
      shares: BigInt(0),
      q4w: BigInt(0),
    };
  }
}
