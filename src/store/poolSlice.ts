import * as Pool from '@blend-capital/blend-sdk/pool';
import { Address, Server, xdr } from 'soroban-client';
import { StateCreator } from 'zustand';
import { getTokenBalance } from '../external/token';
import { DataStore, useStore } from './store';
export type ReserveBalance = {
  asset: bigint;
  collateral: bigint;
  liability: bigint;
};

export type PoolData = {
  reserves: Pool.Reserve[];
  poolPrices: Map<string, number>;
  lastUpdated: number;
};

export type PoolUserData = {
  reserveBalances: Map<string, ReserveBalance>;
  emissionsData: Map<number, Pool.UserEmissionData>;
  totalEmissions: bigint;
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
  pools: Map<string, Pool.PoolConfig>;
  poolData: Map<string, PoolData>;
  poolUserData: Map<string, PoolUserData>;

  refreshPoolData: (pool_id: string, latest_ledger_close: number) => Promise<void>;
  refreshUserData: (pool_id: string, user: string, latest_ledger_close: number) => Promise<void>;
}

export const createPoolSlice: StateCreator<DataStore, [], [], PoolSlice> = (set, get) => ({
  pools: new Map<string, Pool.PoolConfig>(),
  poolData: new Map<string, PoolData>(),
  poolUserData: new Map<string, PoolUserData>(),

  refreshPoolData: async (pool_id: string, latest_ledger_close: number) => {
    try {
      const rpc = get().rpcUrl;
      const passphrase = get().passphrase;
      const stellar = get().rpcServer();

      let pool = get().pools.get(pool_id);
      let set_pool = false;
      if (pool == undefined) {
        pool = await Pool.PoolConfig.load({ rpc, passphrase, opts: { allowHttp: true } }, pool_id);
        set_pool = true;
      }
      const prices = await loadOraclePrices(stellar, pool_id, pool);
      const pool_reserves: Pool.Reserve[] = [];
      for (const assetId of pool.reserveList) {
        pool_reserves.push(
          await Pool.Reserve.load({ rpc, passphrase, opts: { allowHttp: true } }, pool_id, assetId)
        );
      }
      console.log(pool_reserves, pool);
      if (set_pool) {
        useStore.setState((prev) => ({
          poolData: new Map(prev.poolData).set(pool_id, {
            poolPrices: prices,
            reserves: pool_reserves,
            lastUpdated: latest_ledger_close,
          }),
          pools: new Map(prev.pools).set(pool_id, pool as Pool.PoolConfig),
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
      console.error(`unable to refresh data for pool ${pool_id}`);
    }
  },

  refreshUserData: async (pool_id: string, user: string, latest_ledger_close: number) => {
    try {
      const rpc = get().rpcUrl;
      const passphrase = get().passphrase;
      const reserves = get().poolData.get(pool_id)?.reserves;
      const stellar = get().rpcServer();

      if (!reserves) {
        throw Error('unknown pool');
      }

      const user_reserve_positions = await Pool.UserPositions.load(
        { rpc, passphrase, opts: { allowHttp: true } },
        pool_id,
        user
      );
      const userReserveBalances = new Map<string, ReserveBalance>();
      for (const reserve of reserves) {
        let userAssetBalance = await getTokenBalance(
          stellar,
          passphrase,
          reserve.assetId,
          Address.fromString(user)
        );
        userReserveBalances.set(reserve.assetId, {
          asset: userAssetBalance,
          collateral: user_reserve_positions.collateral.get(reserve.config.index) ?? BigInt(0),
          liability: user_reserve_positions.liabilities.get(reserve.config.index) ?? BigInt(0),
        });
      }

      let total_user_emissions = BigInt(0);
      let userEmissions = await Pool.UserEmissions.load(
        { rpc, passphrase, opts: { allowHttp: true } },
        pool_id,
        user,
        reserves.map((reserve) => {
          return reserve.config.index;
        })
      );
      for (let entry of Array.from(userEmissions.emissions.entries())) {
        total_user_emissions += entry[1].accrued;
      }
      console.log(userReserveBalances, userEmissions, total_user_emissions);
      useStore.setState((prev) => ({
        poolUserData: new Map(prev.poolUserData).set(pool_id, {
          reserveBalances: userReserveBalances,
          emissionsData: userEmissions.emissions,
          totalEmissions: total_user_emissions,
          lastUpdated: latest_ledger_close,
        }),
      }));
    } catch (e) {
      console.error('unable to refresh user emission data', e);
    }
  },
});

async function loadOraclePrices(
  stellar: Server,
  poolId: string,
  pool: Pool.PoolConfig
): Promise<Map<string, number>> {
  let price_map = new Map<string, number>();
  let decimals = 7;
  let priceLedgerKeys = pool.reserveList.map((reserve) => {
    let price_datakey = xdr.ScVal.scvVec([
      xdr.ScVal.scvSymbol('Prices'),
      Address.fromString(reserve).toScVal(),
    ]);

    return xdr.LedgerKey.contractData(
      new xdr.LedgerKeyContractData({
        contract: Address.fromString(poolId).toScAddress(),
        key: price_datakey,
        durability: xdr.ContractDataDurability.persistent(),
      })
    );
  });

  let priceLedgerEntries = (await stellar.getLedgerEntries(...priceLedgerKeys)).entries ?? [];
  for (const entry of priceLedgerEntries) {
    const ledgerData = xdr.LedgerEntryData.fromXDR(entry.xdr, 'base64').contractData();
    console.log(ledgerData.key());
  }
  return price_map;
}
