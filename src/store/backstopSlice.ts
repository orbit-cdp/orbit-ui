import { BackstopContract, data_entry_converter, Q4W } from 'blend-sdk';
import { Address, Server, xdr } from 'soroban-client';
import { StateCreator } from 'zustand';
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
  backstopContract: BackstopContract;
  backstopToken: string;
  backstopTokenPrice: bigint;
  rewardZone: string[];
  poolBackstopBalance: Map<string, PoolBackstopBalance>;
  shares: Map<string, BigInt>;
  q4w: Map<string, Q4W[]>;
  refreshBackstopData: () => Promise<void>;
  refreshPoolBackstopData: (pool_id: string, user_id: string) => Promise<void>;
  refreshBackstopUserData: (user_id: string) => Promise<void>;
}

export const createBackstopSlice: StateCreator<DataStore, [], [], BackstopSlice> = (set, get) => ({
  backstopContract: new BackstopContract(
    '00a387e057e2542ce4fe2610c33e0ef7a41cd8d6a25b78fd8ae2517e81e5daa3'
  ),
  backstopToken: '0924da0b090d2fdbae614f17b2bbbf4f981624eff4e743ca390ab1fccaeb0efc',
  backstopTokenPrice: BigInt(0.05e7), // TODO: Calculate fair value from LP
  rewardZone: [],
  poolBackstopBalance: new Map<string, PoolBackstopBalance>(),
  shares: new Map<string, BigInt>(),
  q4w: new Map<string, Q4W[]>(),
  refreshBackstopData: async () => {
    try {
      const contract = get().backstopContract;
      const stellar = get().rpcServer();
      let rz_datakey = xdr.ScVal.fromXDR(
        contract.datakey_RewardZone().toXDR().toString('base64'),
        'base64'
      );
      let rz_dataEntry = await stellar.getContractData(contract._contract.contractId(), rz_datakey);
      const rz = data_entry_converter.toStringArray(rz_dataEntry.xdr, 'hex');
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
      let pool_backstop_data = await loadPoolBackstopBalance(stellar, contract, pool_id);
      let shares = await loadShares(stellar, contract, pool_id, user_id);
      let q4w = await loadQ4W(stellar, contract, pool_id, user_id);
      useStore.setState((prev) => ({
        poolBackstopBalance: new Map(prev.poolBackstopBalance).set(pool_id, pool_backstop_data),
        shares: new Map(prev.shares).set(pool_id, shares),
        q4w: new Map(prev.q4w).set(pool_id, q4w),
      }));
      console.log('refreshed pool backstop data for:', user_id);
    } catch (e) {
      console.error('unable to refresh backstop data:', e);
    }
  },
  refreshBackstopUserData: async (user_id: string) => {
    try {
      const contract = get().backstopContract;
      const stellar = get().rpcServer();
      const rz = get().rewardZone;
      const shares_map = new Map<string, BigInt>();
      const q4w_map = new Map<string, Q4W[]>();
      for (const rz_pool of rz) {
        shares_map.set(rz_pool, await loadShares(stellar, contract, rz_pool, user_id));
        q4w_map.set(rz_pool, await loadQ4W(stellar, contract, rz_pool, user_id));
      }
      set({ shares: shares_map, q4w: q4w_map });
      console.log('refreshed backstop user data for:', user_id);
    } catch (e) {
      console.error('unable to refresh backstop data:', e);
    }
  },
});

/********** Contract Data Helpers **********/

async function loadShares(
  stellar: Server,
  contract: BackstopContract,
  pool_id: string,
  user_id: string
): Promise<BigInt> {
  try {
    let user_addr = new Address(user_id);
    let shares_datakey = xdr.ScVal.scvVec([
      xdr.ScVal.scvSymbol('Shares'),
      xdr.ScVal.scvMap([
        new xdr.ScMapEntry({
          key: xdr.ScVal.scvSymbol('pool'),
          val: xdr.ScVal.scvBytes(Buffer.from(pool_id, 'hex')),
        }),
        new xdr.ScMapEntry({
          key: xdr.ScVal.scvSymbol('user'),
          val: user_addr.toScVal(),
        }),
      ]),
    ]);
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
  contract: BackstopContract,
  pool_id: string,
  user_id: string
): Promise<Q4W[]> {
  try {
    let user_addr = new Address(user_id);
    let q4w_datakey = xdr.ScVal.scvVec([
      xdr.ScVal.scvSymbol('Q4W'),
      xdr.ScVal.scvMap([
        new xdr.ScMapEntry({
          key: xdr.ScVal.scvSymbol('pool'),
          val: xdr.ScVal.scvBytes(Buffer.from(pool_id, 'hex')),
        }),
        new xdr.ScMapEntry({
          key: xdr.ScVal.scvSymbol('user'),
          val: user_addr.toScVal(),
        }),
      ]),
    ]);
    let q4w_dataEntry = await stellar.getContractData(contract._contract.contractId(), q4w_datakey);
    return Q4W.fromContractDataXDR(q4w_dataEntry.xdr);
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
  contract: BackstopContract,
  pool_id: string
): Promise<PoolBackstopBalance> {
  try {
    let scval_pool = xdr.ScVal.scvBytes(Buffer.from(pool_id, 'hex'));
    let tokens = BigInt(0);
    let shares = BigInt(0);
    let q4w = BigInt(0);
    let tokens_datakey = xdr.ScVal.scvVec([xdr.ScVal.scvSymbol('PoolTkn'), scval_pool]);
    tokens = await stellar
      .getContractData(contract._contract.contractId(), tokens_datakey)
      .then((response) => data_entry_converter.toBigInt(response.xdr))
      .catch(() => BigInt(0));

    let shares_datakey = xdr.ScVal.scvVec([xdr.ScVal.scvSymbol('PoolShares'), scval_pool]);
    shares = await stellar
      .getContractData(contract._contract.contractId(), shares_datakey)
      .then((response) => data_entry_converter.toBigInt(response.xdr))
      .catch(() => BigInt(0));

    let q4w_datakey = xdr.ScVal.scvVec([xdr.ScVal.scvSymbol('PoolQ4W'), scval_pool]);
    q4w = await stellar
      .getContractData(contract._contract.contractId(), q4w_datakey)
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
