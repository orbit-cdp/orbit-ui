import {
  Network,
  PoolConfig,
  PoolUserEmissionData,
  PoolUserEmissions,
  Reserve,
  UserPositions,
} from '@blend-capital/blend-sdk';
import { Address, Server } from 'soroban-client';
import { StateCreator } from 'zustand';
import { getTokenBalance } from '../external/token';
import { getOraclePrice } from '../utils/stellar_rpc';
import { DataStore, useStore } from './store';

export type ReserveBalance = {
  asset: bigint;
  collateral: bigint;
  liability: bigint;
};

export type PoolData = {
  reserves: Reserve[];
  poolPrices: Map<string, number>;
  lastUpdated: number;
};

export type PoolUserData = {
  reserveBalances: Map<string, ReserveBalance>;
  emissionsData: Map<number, PoolUserEmissionData>;
  lastUpdated: number;
};

export type ReserveEmission = {
  eps: bigint;
  reserveIndex: bigint;
  lastTime: bigint;
  expiration: bigint;
};

export type UserReserveEmission = {
  userIndex: bigint;
  accrued: bigint;
};

/**
 * Ledger state for a set of pools
 */
export interface PoolSlice {
  pools: Map<string, PoolConfig>;
  poolData: Map<string, PoolData>;
  poolUserData: Map<string, PoolUserData>;

  refreshPoolData: (pool_id: string, latest_ledger_close: number) => Promise<void>;
  refreshUserData: (pool_id: string, user: string, latest_ledger_close: number) => Promise<void>;
}

export const createPoolSlice: StateCreator<DataStore, [], [], PoolSlice> = (set, get) => ({
  pools: new Map<string, PoolConfig>(),
  poolData: new Map<string, PoolData>(),
  poolUserData: new Map<string, PoolUserData>(),

  refreshPoolData: async (pool_id: string, latest_ledger_close: number) => {
    try {
      const network = get().network;
      const stellar = get().rpcServer();

      let pool = get().pools.get(pool_id);
      let set_pool = false;
      if (pool == undefined) {
        pool = await PoolConfig.load(network, pool_id);
        set_pool = true;
      }
      const prices = await loadOraclePrices(stellar, network, pool.reserveList, pool.oracle);
      const pool_reserves: Reserve[] = [];
      for (const assetId of pool.reserveList) {
        let reserve = await Reserve.load(network, pool_id, assetId);
        reserve.tokenMetadata.symbol =
          reserve.tokenMetadata.symbol == 'native' ? 'XLM' : reserve.tokenMetadata.symbol;
        pool_reserves.push(reserve);
      }
      if (set_pool) {
        useStore.setState((prev) => ({
          poolData: new Map(prev.poolData).set(pool_id, {
            poolPrices: prices,
            reserves: pool_reserves,
            lastUpdated: latest_ledger_close,
          }),
          pools: new Map(prev.pools).set(pool_id, pool as PoolConfig),
        }));
      } else {
        useStore.setState((prev) => ({
          poolData: new Map(prev.poolData).set(pool_id, {
            poolPrices: prices,
            reserves: pool_reserves,
            lastUpdated: latest_ledger_close,
          }),
        }));
      }
    } catch (e) {
      console.error(`unable to refresh data for pool ${pool_id}, ${e}`);
    }
  },

  refreshUserData: async (pool_id: string, user: string, latest_ledger_close: number) => {
    const network = get().network;
    const reserves = get().poolData.get(pool_id)?.reserves;
    const stellar = get().rpcServer();
    try {
      if (!reserves) {
        console.error('Unable to refresh data for user without pool data');
        return;
      }

      let user_reserve_positions = await UserPositions.load(network, pool_id, user);
      const userReserveBalances = new Map<string, ReserveBalance>();
      for (const reserve of reserves) {
        let userAssetBalance = await getTokenBalance(
          stellar,
          network.passphrase,
          reserve.assetId,
          Address.fromString(user)
        );
        userReserveBalances.set(reserve.assetId, {
          asset: userAssetBalance,
          collateral: user_reserve_positions.collateral.get(reserve.config.index) ?? BigInt(0),
          liability: user_reserve_positions.liabilities.get(reserve.config.index) ?? BigInt(0),
        });
      }

      let userEmissions = new PoolUserEmissions(new Map());
      try {
        userEmissions = await PoolUserEmissions.load(
          network,
          pool_id,
          user,
          reserves.map((reserve) => {
            return reserve.config.index;
          })
        );
      } catch (e) {
        console.error('Unable to refresh user emissions');
      }

      useStore.setState((prev) => ({
        poolUserData: new Map(prev.poolUserData).set(pool_id, {
          reserveBalances: userReserveBalances,
          emissionsData: userEmissions.emissions,
          lastUpdated: latest_ledger_close,
        }),
      }));
    } catch (e) {
      console.error('Unable to refresh user data', e);
    }
  },
});

async function loadOraclePrices(
  stellar: Server,
  network: Network,
  assets: string[],
  oracle_id: string
): Promise<Map<string, number>> {
  let price_map = new Map<string, number>();

  // TODO: add decimal support before switching to Reflector and package available
  let pricePromises = assets.map(async (assetId) => {
    let price = await getOraclePrice(stellar, network.passphrase, oracle_id, assetId, 7);
    price_map.set(assetId, price);
  });
  await Promise.all(pricePromises);

  return price_map;
}
