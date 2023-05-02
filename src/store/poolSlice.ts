import { data_entry_converter, PoolConfig, Reserve, ReserveConfig, ReserveData } from 'blend-sdk';
import { Address, Server, xdr } from 'soroban-client';
import { StateCreator } from 'zustand';
import { getTokenBalance } from '../utils/stellar_rpc';
import { DataStore, useStore } from './store';

export type ReserveBalance = {
  asset: BigInt;
  b_token: BigInt;
  d_token: BigInt;
};

export type Pool = {
  id: string;
  name: string;
  admin: string;
  config: PoolConfig;
  reserves: string[];
};

/**
 * Ledger state for a set of pools
 */
export interface PoolSlice {
  pools: Map<string, Pool>;
  reserves: Map<string, Map<string, Reserve>>;
  resUserBalances: Map<string, Map<string, ReserveBalance>>;
  poolPrices: Map<string, Map<string, number>>;
  refreshPoolData: (pool_id: string) => Promise<void>;
  refreshPoolReserveData: (pool_id: string) => Promise<void>;
  refreshPoolUserData: (pool_id: string, user: string) => Promise<void>;
  refreshPrices: (pool_id: string) => Promise<void>;
  refreshPoolReserveAll: (pool_id: string, user?: string | undefined) => Promise<void>;
}

export const createPoolSlice: StateCreator<DataStore, [], [], PoolSlice> = (set, get) => ({
  pools: new Map<string, Pool>(),
  reserves: new Map<string, Map<string, Reserve>>(),
  resUserBalances: new Map<string, Map<string, ReserveBalance>>(),
  poolPrices: new Map<string, Map<string, number>>(),
  refreshPoolData: async (pool_id: string) => {
    try {
      const stellar = get().rpcServer();
      let pool = await loadPool(stellar, pool_id);
      useStore.setState((prev) => ({
        pools: new Map(prev.pools).set(pool_id, pool),
      }));
      console.log('refreshed pool data for:', pool_id);
    } catch (e) {
      console.error('unable to refresh pool data:', e);
    }
  },
  refreshPoolReserveData: async (pool_id: string) => {
    try {
      const stellar = get().rpcServer();
      const network = get().passphrase;
      const pool = get().pools.get(pool_id);
      if (pool == undefined) {
        throw Error('unknown pool');
      }
      const pool_reserves = await loadReservesForPool(stellar, network, pool);
      useStore.setState((prev) => ({
        reserves: new Map(prev.reserves).set(pool_id, pool_reserves),
      }));
      console.log('refreshed pool reserve data for:', pool_id);
    } catch (e) {
      console.error(`unable to refresh pool reserve data for ${pool_id}:`, e);
    }
  },
  refreshPoolUserData: async (pool_id: string, user: string) => {
    try {
      const stellar = get().rpcServer();
      const network = get().passphrase;
      const reserve_map = get().reserves.get(pool_id);
      if (reserve_map == undefined) {
        throw Error('unknown pool');
      }
      const user_reserve_balanaces = await loadUserForPool(
        stellar,
        pool_id,
        network,
        reserve_map,
        user
      );
      useStore.setState((prev) => ({
        resUserBalances: new Map(prev.resUserBalances).set(pool_id, user_reserve_balanaces),
      }));
      console.log('refreshed pool user data for:', user);
    } catch (e) {
      console.error('unable to refresh backstop data:', e);
    }
  },
  refreshPrices: async (pool_id: string) => {
    try {
      const stellar = get().rpcServer();
      const pool = get().pools.get(pool_id);
      if (pool == undefined) {
        throw Error('unknown pool');
      }
      const prices = await loadOraclePrices(stellar, pool);
      useStore.setState((prev) => ({
        poolPrices: new Map(prev.poolPrices).set(pool_id, prices),
      }));
      console.log('refreshed prices for pool:', pool_id);
    } catch (e: any) {
      console.error('unable to refresh prices:', e);
    }
  },
  refreshPoolReserveAll: async (pool_id: string, user?: string | undefined) => {
    try {
      const stellar = get().rpcServer();
      const network = get().passphrase;
      let pool = get().pools.get(pool_id);
      let set_pool = false;
      if (pool == undefined) {
        pool = await loadPool(stellar, pool_id);
        set_pool = true;
      }
      const prices = await loadOraclePrices(stellar, pool);
      const pool_reserves = await loadReservesForPool(stellar, network, pool);

      if (set_pool) {
        useStore.setState((prev) => ({
          poolPrices: new Map(prev.poolPrices).set(pool_id, prices),
          pools: new Map(prev.pools).set(pool_id, pool as Pool),
          reserves: new Map(prev.reserves).set(pool_id, pool_reserves),
        }));
      } else {
        useStore.setState((prev) => ({
          poolPrices: new Map(prev.poolPrices).set(pool_id, prices),
          reserves: new Map(prev.reserves).set(pool_id, pool_reserves),
        }));
      }

      if (user) {
        const user_reserve_balances = await loadUserForPool(
          stellar,
          network,
          pool_id,
          pool_reserves,
          user
        );
        useStore.setState((prev) => ({
          resUserBalances: new Map(prev.resUserBalances).set(pool_id, user_reserve_balances),
        }));
      }

      console.log('refreshed data for:', pool_id);
    } catch (e) {
      console.error('unable to refresh data:', e);
    }
  },
});

/********** Contract Data Helpers **********/

async function loadPool(stellar: Server, pool_id: string): Promise<Pool> {
  let config_datakey = xdr.ScVal.scvVec([xdr.ScVal.scvSymbol('PoolConfig')]);
  let config_entry = await stellar.getContractData(pool_id, config_datakey);
  let pool_config = PoolConfig.fromContractDataXDR(config_entry.xdr);

  let admin_datakey = xdr.ScVal.scvVec([xdr.ScVal.scvSymbol('Admin')]);
  let admin_entry = await stellar.getContractData(pool_id, admin_datakey);
  let admin = data_entry_converter.toString(admin_entry.xdr);

  let res_list_datakey = xdr.ScVal.scvVec([xdr.ScVal.scvSymbol('ResList')]);
  let res_list_entry = await stellar.getContractData(pool_id, res_list_datakey);
  let res_list = data_entry_converter.toStringArray(res_list_entry.xdr, 'hex');

  let name_datakey = xdr.ScVal.scvVec([xdr.ScVal.scvSymbol('Name')]);
  let name_entry = await stellar.getContractData(pool_id, name_datakey);
  let name = data_entry_converter.toString(name_entry.xdr, 'utf-8');

  return {
    id: pool_id,
    name,
    admin: admin,
    config: pool_config,
    reserves: res_list,
  };
}

async function loadReservesForPool(
  stellar: Server,
  network: string,
  pool: Pool
): Promise<Map<string, Reserve>> {
  let reserve_map = new Map<string, Reserve>();
  for (const asset_id of pool.reserves) {
    try {
      let asset_id_scval = xdr.ScVal.scvBytes(Buffer.from(asset_id, 'hex'));

      // load config
      let config_datakey = xdr.ScVal.scvVec([xdr.ScVal.scvSymbol('ResConfig'), asset_id_scval]);
      let config_entry = await stellar.getContractData(pool.id, config_datakey);
      let reserve_config = ReserveConfig.fromContractDataXDR(config_entry.xdr);

      // load data
      let data_datakey = xdr.ScVal.scvVec([xdr.ScVal.scvSymbol('ResData'), asset_id_scval]);
      let data_entry = await stellar.getContractData(pool.id, data_datakey);
      let reserve_data = ReserveData.fromContractDataXDR(data_entry.xdr);

      // load token information
      let pool_balance = await getTokenBalance(
        stellar,
        network,
        asset_id,
        Address.contract(Buffer.from(pool.id, 'hex'))
      );

      // TODO: Find a better way to do this...
      let symbol: string;
      if (asset_id === 'e87136999e4edffc8f00b3e1583892c9db49520bbfc5e1923c50fd1b4671c842') {
        symbol = 'XLM';
      } else {
        let name_datakey = xdr.ScVal.scvVec([xdr.ScVal.scvSymbol('Symbol')]);
        let name_entry = await stellar.getContractData(asset_id, name_datakey);
        symbol = data_entry_converter.toString(name_entry.xdr, 'utf-8');
      }

      // add reserve object to map
      reserve_map.set(
        asset_id,
        new Reserve(asset_id, symbol, pool_balance, reserve_config, reserve_data)
      );
    } catch (e) {
      console.error(`failed to update ${asset_id}: `, e);
    }
  }

  return reserve_map;
}

async function loadUserForPool(
  stellar: Server,
  network: string,
  pool_id: string,
  reserves: Map<string, Reserve>,
  user_id: string
): Promise<Map<string, ReserveBalance>> {
  let user_balance_map = new Map<string, ReserveBalance>();
  try {
    let user_address = new Address(user_id);
    let config_datakey = xdr.ScVal.scvVec([
      xdr.ScVal.scvSymbol('UserConfig'),
      user_address.toScVal(),
    ]);
    let user_config_entry = await stellar.getContractData(pool_id, config_datakey);
    let user_config = data_entry_converter.toBigInt(user_config_entry.xdr);

    for (const res_entry of Array.from(reserves.entries())) {
      try {
        let asset_id = res_entry[0];
        let reserve = res_entry[1];
        let config_index = BigInt(reserve.config.index * 3);

        let asset_balance = await getTokenBalance(stellar, network, asset_id, user_address);

        let d_token_balance = BigInt(0);
        let b_token_balance = BigInt(0);

        if (((user_config >> config_index) & BigInt(0b1)) != BigInt(0)) {
          d_token_balance = await getTokenBalance(
            stellar,
            network,
            reserve.config.d_token_id,
            user_address
          );
        }

        if (((user_config >> config_index) & BigInt(0b10)) != BigInt(0)) {
          b_token_balance = await getTokenBalance(
            stellar,
            network,
            reserve.config.b_token_id,
            user_address
          );
        }

        // add reserve object to map
        user_balance_map.set(asset_id, {
          asset: asset_balance,
          b_token: b_token_balance,
          d_token: d_token_balance,
        });
      } catch (e) {
        console.error(`failed to update user data for ${res_entry[0]}: `, e);
      }
    }
  } catch (e) {
    console.error('TODO: Write an error', e);
  }

  return user_balance_map;
}

async function loadOraclePrices(stellar: Server, pool: Pool): Promise<Map<string, number>> {
  let price_map = new Map<string, number>();
  let decimals = 7;
  for (const asset_id of pool.reserves) {
    try {
      let price_datakey = xdr.ScVal.scvVec([
        xdr.ScVal.scvSymbol('Prices'),
        xdr.ScVal.scvBytes(Buffer.from(asset_id, 'hex')),
      ]);
      let price_entry = await stellar.getContractData(pool.config.oracle, price_datakey);
      let price = data_entry_converter.toNumber(price_entry.xdr);
      price = price / 10 ** decimals;
      price_map.set(asset_id, price);
    } catch (e: any) {
      console.error(`unable to fetch a price for ${asset_id}:`, e);
    }
  }
  return price_map;
}
