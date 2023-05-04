import { Reserve } from 'blend-sdk';
import { StateCreator } from 'zustand';
import { Pool, ReserveBalance } from './poolSlice';
import { DataStore, useStore } from './store';

export type PoolEstimates = {
  total_backstop_take_base: number;
  total_supply_base: number;
  total_liabilities_base: number;
  latest_ledger: number;
};

export type ReserveEstimates = {
  id: string;
  supplied: number;
  borrowed: number;
  available: number;
  apy: number;
  supply_apy: number;
  util: number;
  b_rate: number;
  d_rate: number;
  c_factor: number; // @dev - Duplicate data allows market components to avoid reading from the poolSlice
  l_factor: number;
};

export type UserEstimates = {
  net_apy: number;
  supply_apy: number;
  borrow_apy: number;
  total_supplied_base: number;
  total_borrowed_base: number;
  e_collateral_base: number;
  e_liabilities_base: number;
};

export type UserReserveEstimates = {
  asset: number;
  supplied: number;
  borrowed: number;
};

/**
 * Estimate ledger data to a given ledger number, while producing human readable values
 */
export interface EstimationSlice {
  pool_est: Map<string, PoolEstimates>;
  reserve_est: Map<string, ReserveEstimates[]>;
  user_est: Map<string, UserEstimates>;
  user_bal_est: Map<string, Map<string, UserReserveEstimates>>;
  estimateToLatestLedger: (pool_id: string, user_id?: string | undefined) => Promise<void>;
}

export const createEstimationSlice: StateCreator<DataStore, [], [], EstimationSlice> = (
  set,
  get
) => ({
  pool_est: new Map<string, PoolEstimates>(),
  reserve_est: new Map<string, ReserveEstimates[]>(),
  user_est: new Map<string, UserEstimates>(),
  user_bal_est: new Map<string, Map<string, UserReserveEstimates>>(),
  estimateToLatestLedger: async (pool_id: string, user_id?: string | undefined): Promise<void> => {
    try {
      const stellar = get().rpcServer();
      let tx_response = await stellar.getTransaction(
        '0000000000000000000000000000000000000000000000000000000000000000'
      ); // TODO: File issue/pr to add getLatestLedger endpoint
      let latest_ledger = tx_response.latestLedger;

      const pool = get().pools.get(pool_id);
      const reserves = get().reserves.get(pool_id);
      const user_balances = get().resUserBalances.get(pool_id);
      const prices = get().poolPrices.get(pool_id);

      if (pool == undefined || reserves == undefined || prices == undefined) {
        console.error('unable to estimate to latest ledger without ledger data');
        return;
      }

      let backstop_take_rate = pool.config.bstop_rate / 1e9;
      let res_estimations: ReserveEstimates[] = [];
      let pool_est: PoolEstimates = {
        total_supply_base: 0,
        total_liabilities_base: 0,
        total_backstop_take_base: 0,
        latest_ledger: latest_ledger,
      };
      for (const res of Array.from(reserves.values())) {
        let reserve_est = buildReserveEstimate(pool, res, latest_ledger);
        let price = prices.get(res.asset_id) ?? 1;
        pool_est.total_supply_base += reserve_est.supplied * price;
        pool_est.total_liabilities_base += reserve_est.borrowed * price;
        pool_est.total_backstop_take_base +=
          reserve_est.supplied * price * reserve_est.supply_apy * backstop_take_rate;
        res_estimations.push(reserve_est);
      }

      if (user_id != undefined && user_balances != undefined) {
        let user_est: UserEstimates = {
          net_apy: 0,
          supply_apy: 0,
          borrow_apy: 0,
          total_supplied_base: 0,
          total_borrowed_base: 0,
          e_collateral_base: 0,
          e_liabilities_base: 0,
        };
        let user_bal_est = new Map<string, UserReserveEstimates>();
        for (const res_est of res_estimations) {
          let user_balance = user_balances.get(res_est.id);
          if (user_balance) {
            let user_res_est = buildUserReserveEstimates(res_est, user_balance);
            let price = prices.get(res_est.id) ?? 1;
            let res_supplied_base = user_res_est.supplied * price;
            let res_borrowed_base = user_res_est.borrowed * price;
            user_est.total_supplied_base += res_supplied_base;
            user_est.total_borrowed_base += res_borrowed_base;
            user_est.e_collateral_base += res_supplied_base * res_est.c_factor;
            user_est.e_liabilities_base += res_borrowed_base / res_est.l_factor;
            user_est.supply_apy += res_supplied_base * res_est.supply_apy;
            user_est.borrow_apy += res_borrowed_base * res_est.apy;
            user_est.net_apy +=
              res_supplied_base * res_est.supply_apy - res_borrowed_base * res_est.apy;
            user_bal_est.set(res_est.id, user_res_est);
          }
        }
        user_est.supply_apy = user_est.supply_apy / user_est.total_supplied_base;
        user_est.borrow_apy = user_est.borrow_apy / user_est.total_borrowed_base;
        user_est.net_apy =
          user_est.net_apy / (user_est.total_supplied_base + user_est.total_borrowed_base);

        // console.log('pool_est', JSON.stringify(pool_est));
        // console.log('reserve_est', JSON.stringify(res_estimations));
        // console.log('user_est', JSON.stringify(user_est));
        // console.log('user_res_bal_est', JSON.stringify(Array.from(user_bal_est.entries())));
        useStore.setState((prev) => ({
          pool_est: new Map(prev.pool_est).set(pool_id, pool_est),
          reserve_est: new Map(prev.reserve_est).set(pool_id, res_estimations),
          user_est: new Map(prev.user_est).set(pool_id, user_est),
          user_bal_est: new Map(prev.user_bal_est).set(pool_id, user_bal_est),
        }));
        console.log(`estimated pool and user data to ledger ${latest_ledger}`);
      } else {
        useStore.setState((prev) => ({
          pool_est: new Map(prev.pool_est).set(pool_id, pool_est),
          reserve_est: new Map(prev.reserve_est).set(pool_id, res_estimations),
        }));
        console.log(`estimated pool data to ledger ${latest_ledger}`);
      }
    } catch (e: any) {
      console.error(`unable to update estimation to latest ledger: `, e?.message);
    }
  },
});

function buildReserveEstimate(
  pool: Pool,
  reserve: Reserve,
  latest_ledger: number
): ReserveEstimates {
  let decimal_bstop_rate = pool.config.bstop_rate / 1e8; // TODO: Fix after pool redeploy updates bstop rate
  let est_res_data = reserve.estimateData(decimal_bstop_rate, latest_ledger);

  return {
    id: reserve.asset_id,
    supplied: est_res_data.total_supply * est_res_data.b_rate,
    borrowed: est_res_data.total_liabilities * est_res_data.d_rate,
    available: Number(reserve.pool_tokens) / 1e7,
    apy: est_res_data.cur_apy,
    supply_apy: est_res_data.cur_apy * est_res_data.cur_util * (1 - decimal_bstop_rate),
    util: est_res_data.cur_util,
    b_rate: est_res_data.b_rate,
    d_rate: est_res_data.d_rate,
    c_factor: reserve.config.c_factor / 1e7,
    l_factor: reserve.config.l_factor / 1e7,
  };
}

function buildUserReserveEstimates(
  reserve_est: ReserveEstimates,
  user_res_balance: ReserveBalance
): UserReserveEstimates {
  return {
    asset: Number(user_res_balance.asset) / 1e7,
    supplied: (Number(user_res_balance.b_token) / 1e7) * reserve_est.b_rate,
    borrowed: (Number(user_res_balance.d_token) / 1e7) * reserve_est.d_rate,
  };
}
