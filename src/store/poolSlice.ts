import {
  PoolConfig,
  PoolUserEmissionData,
  PoolUserEmissions,
  Reserve,
  UserPositions,
} from '@blend-capital/blend-sdk';
import { Address, Server, nativeToScVal, scValToBigInt, scValToNative, xdr } from 'soroban-client';
import { StateCreator } from 'zustand';
import { getTokenBalance } from '../external/token';
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
      const rpc = get().rpcUrl;
      const passphrase = get().passphrase;
      const stellar = get().rpcServer();

      let pool = get().pools.get(pool_id);
      let set_pool = false;
      if (pool == undefined) {
        pool = await PoolConfig.load({ rpc, passphrase, opts: { allowHttp: true } }, pool_id);
        set_pool = true;
      }
      const prices = await loadOraclePrices(stellar, pool_id, pool);
      const pool_reserves: Reserve[] = [];
      for (const assetId of pool.reserveList) {
        pool_reserves.push(
          await Reserve.load({ rpc, passphrase, opts: { allowHttp: true } }, pool_id, assetId)
        );
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
    try {
      const rpc = get().rpcUrl;
      const passphrase = get().passphrase;
      const reserves = get().poolData.get(pool_id)?.reserves;
      const stellar = get().rpcServer();

      if (!reserves) {
        throw Error('unknown pool');
      }

      const user_reserve_positions = await UserPositions.load(
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
      let userEmissions = await PoolUserEmissions.load(
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
  pool: PoolConfig
): Promise<Map<string, number>> {
  let price_map = new Map<string, number>();
  let decimals: number;
  const oracleInstanceDataKey = xdr.LedgerKey.contractData(
    new xdr.LedgerKeyContractData({
      contract: Address.fromString(pool.oracle).toScAddress(),
      key: xdr.ScVal.scvLedgerKeyContractInstance(),
      durability: xdr.ContractDataDurability.persistent(),
    })
  );
  let oracleInstanceEntries = (await stellar.getLedgerEntries(oracleInstanceDataKey)).entries ?? [];

  let priceLedgerKeys: xdr.LedgerKey[] = [];
  let indexToAssetIdMapping: Map<number, string> = new Map();
  for (const entry of oracleInstanceEntries) {
    const ledgerData = xdr.LedgerEntryData.fromXDR(entry.xdr, 'base64').contractData();
    let key: string;
    switch (ledgerData.key().switch()) {
      // Key is a ScVec[ScvSym, ScVal]
      case xdr.ScValType.scvVec():
        key = ledgerData.key().vec()?.at(0)?.sym().toString() ?? 'Void';
        break;
      case xdr.ScValType.scvSymbol():
        key = ledgerData.key().sym().toString();
        break;
      case xdr.ScValType.scvLedgerKeyContractInstance():
        key = 'ContractInstance';
        break;
      case xdr.ScValType.scvAddress():
        key = Address.fromScVal(ledgerData.key()).toString();
        break;
      default:
        key = 'Void';
    }
    switch (key) {
      case 'ContractInstance':
        ledgerData
          .val()
          .instance()
          .storage()
          ?.map((entry) => {
            let instanceKey: string;
            switch (ledgerData.key().switch()) {
              // Key is a ScVec[ScvSym, ScVal]
              case xdr.ScValType.scvVec():
                instanceKey = entry.val().vec()?.at(0)?.sym().toString() ?? 'Void';
                break;
              case xdr.ScValType.scvSymbol():
                instanceKey = entry.val().sym().toString();
                break;
              case xdr.ScValType.scvAddress():
                instanceKey = Address.fromScVal(ledgerData.key()).toString();
                break;
              default:
                instanceKey = 'Void';
            }
            switch (instanceKey) {
              case 'assets':
                entry
                  .val()
                  .vec()
                  ?.forEach((vec, index) => {
                    let address = scValToNative(vec)[1];
                    if (address != undefined && pool.reserveList.includes(address)) {
                      indexToAssetIdMapping.set(index, address);
                      priceLedgerKeys.push(
                        xdr.LedgerKey.contractData(
                          new xdr.LedgerKeyContractData({
                            contract: Address.fromString(pool.oracle).toScAddress(),
                            key: nativeToScVal(index, { type: 'u128' }),
                            durability: xdr.ContractDataDurability.temporary(),
                          })
                        )
                      );
                    }
                  });
                break;
              case 'decimals':
                decimals = entry.val().u32();
            }
          });
        break;
    }
  }

  let priceLedgerEntries = (await stellar.getLedgerEntries(...priceLedgerKeys)).entries ?? [];
  for (const entry of priceLedgerEntries) {
    const ledgerData = xdr.LedgerEntryData.fromXDR(entry.xdr, 'base64').contractData();
    let index = scValToBigInt(ledgerData.key());
    let price = scValToBigInt(ledgerData.val());
    let assetId = indexToAssetIdMapping.get(Number(index)) ?? undefined;
    if (assetId != undefined) {
      price_map.set(assetId, Number(price) / 10 ** 7);
    }
  }
  console.log(price_map);
  return price_map;
}
