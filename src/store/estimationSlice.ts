import { PoolConfig, Q4W, Reserve } from '@blend-capital/blend-sdk';
import { StateCreator } from 'zustand';
import { BackstopPoolData, BackstopUserData } from './backstopSlice';
import { PoolData, PoolUserData, ReserveBalance } from './poolSlice';
import { DataStore, useStore } from './store';

export type PoolEstimates = {
  total_backstop_take_base: number;
  total_supply_base: number;
  total_liabilities_base: number;
  reserve_est: ReserveEstimates[];
};

export type ReserveEstimates = {
  id: string;
  decimals: number;
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

export type PoolUserEstimates = {
  net_apy: number;
  supply_apy: number;
  borrow_apy: number;
  total_supplied_base: number;
  total_borrowed_base: number;
  e_collateral_base: number;
  e_liabilities_base: number;
  reserve_estimates: Map<string, UserReserveEstimates>;
  emission_balance: number;
};

export type UserReserveEstimates = {
  asset: number;
  supplied: number;
  borrowed: number;
};

export type BackstopPoolEstimates = {
  backstopSize: number;
  backstopApy: number;
  q4wRate: number;
  shareRate: number;
};

export type BackstopUserEstimates = {
  availableToQueue: number;
  depositBalance: number;
  walletBalance: number;
  q4wUnlockedAmount: number;
  q4w: Q4W[];
};
/**
 * Estimate ledger data to a given ledger number, while producing human readable values
 */
export interface EstimationSlice {
  pool_est: Map<string, PoolEstimates>;
  pool_user_est: Map<string, PoolUserEstimates>;
  backstop_user_est: Map<string, BackstopUserEstimates>;
  backstop_pool_est: Map<string, BackstopPoolEstimates>;
  loadPoolData: (
    pool_id: string,
    user_id?: string | undefined,
    force_reload?: boolean
  ) => Promise<void>;
  loadBackstopData: (
    pool_id: string,
    user_id?: string | undefined,
    force_reload?: boolean
  ) => Promise<void>;
}

export const createEstimationSlice: StateCreator<DataStore, [], [], EstimationSlice> = (
  set,
  get
) => ({
  pool_est: new Map<string, PoolEstimates>(),
  pool_user_est: new Map<string, PoolUserEstimates>(),
  backstop_pool_est: new Map<string, BackstopPoolEstimates>(),
  backstop_user_est: new Map<string, BackstopUserEstimates>(),

  loadPoolData: async (
    pool_id: string,
    user_id?: string | undefined,
    force_reload?: boolean
  ): Promise<void> => {
    try {
      const stellar = get().rpcServer();
      let tx_response = await stellar.getTransaction(
        '0000000000000000000000000000000000000000000000000000000000000000'
      ); // TODO: File issue/pr to add getLatestLedger endpoint
      let latest_ledger_close = tx_response.latestLedgerCloseTime;
      let poolData = get().poolData.get(pool_id);
      let pool = get().pools.get(pool_id);
      console.log(`Estimating pool data for ${pool_id} to ledger time: ${latest_ledger_close}`);

      if (
        !poolData ||
        Number(poolData.lastUpdated) + Number(60) < latest_ledger_close ||
        !pool ||
        force_reload
      ) {
        console.log(`Loading pool data for ${pool_id} from ledger time: ${latest_ledger_close}`);
        await get().refreshPoolData(pool_id, latest_ledger_close);
        poolData = get().poolData.get(pool_id);
        pool = get().pools.get(pool_id);
      }

      if (!pool || !poolData) {
        throw Error('Invalid Pool');
      }

      let backstop_take_rate = pool.backstopRate / 1e9;
      let pool_est: PoolEstimates = {
        total_supply_base: 0,
        total_liabilities_base: 0,
        total_backstop_take_base: 0,
        reserve_est: [],
      };
      for (const res of Array.from(poolData.reserves.values())) {
        let reserve_est = buildReserveEstimate(pool, res, latest_ledger_close);
        let price = poolData.poolPrices.get(res.assetId) ?? 1;
        pool_est.total_supply_base += reserve_est.supplied * price;
        pool_est.total_liabilities_base += reserve_est.borrowed * price;
        pool_est.total_backstop_take_base +=
          reserve_est.supplied * price * reserve_est.supply_apy * backstop_take_rate;
        pool_est.reserve_est.push(reserve_est);
      }

      if (user_id) {
        let userData = get().poolUserData.get(pool_id);
        if (
          !userData ||
          Number(userData.lastUpdated) + Number(60) < latest_ledger_close ||
          force_reload
        ) {
          console.log(
            `Loading pool position data for ${user_id} from ledger time: ${latest_ledger_close}`
          );
          await get().refreshUserData(pool_id, user_id, latest_ledger_close);
          userData = get().poolUserData.get(pool_id);
        }
        if (!userData) {
          throw Error('Unable to estimate pool user data');
        }
        let user_est = buildPoolUserEstimate(pool_est, userData, poolData);
        let userEmissionBal = estimatePoolUserEmissionBalance(
          userData,
          poolData,
          latest_ledger_close
        );
        user_est.emission_balance = userEmissionBal;
        useStore.setState((prev) => ({
          pool_est: new Map(prev.pool_est).set(pool_id, pool_est),
          pool_user_est: new Map(prev.pool_user_est).set(pool_id, user_est),
        }));
      } else {
        useStore.setState((prev) => ({
          pool_est: new Map(prev.pool_est).set(pool_id, pool_est),
        }));
      }
    } catch (e) {
      console.error('Unable to load pool data:', e);
    }
  },

  loadBackstopData: async (
    pool_id: string,
    user_id?: string | undefined,
    force_reload?: boolean
  ): Promise<void> => {
    try {
      const stellar = get().rpcServer();
      let tx_response = await stellar.getTransaction(
        '0000000000000000000000000000000000000000000000000000000000000000'
      ); // TODO: File issue/pr to add getLatestLedger endpoint
      let latest_ledger_close = tx_response.latestLedgerCloseTime;
      console.log(`Estimating backstop data for ${pool_id} to ledger time: ${latest_ledger_close}`);

      const poolEst = get().pool_est.get(pool_id);
      let backstopConfig = get().backstopConfig;
      let backstopPoolData = get().backstopPoolData.get(pool_id);

      if (
        !backstopConfig ||
        Number(backstopConfig.lastUpdated) + Number(60) < latest_ledger_close ||
        force_reload
      ) {
        console.log(`Loading backstop data from ledger time: ${latest_ledger_close}`);
        await get().refreshBackstopData(latest_ledger_close);
        backstopConfig = get().backstopConfig;
      }

      if (
        !backstopPoolData ||
        Number(backstopPoolData.lastUpdated) + Number(60) < latest_ledger_close ||
        force_reload
      ) {
        console.log(
          `Loading backstop data for ${pool_id} from ledger time: ${latest_ledger_close}`
        );
        await get().refreshBackstopPoolData(pool_id, undefined, latest_ledger_close);
        backstopPoolData = get().backstopPoolData.get(pool_id);
      }

      if (backstopPoolData && poolEst) {
        // TODO
        const tokenToBase = 0.75;
        const estBackstopSize = (Number(backstopPoolData.poolBalance.tokens) / 1e7) * tokenToBase;
        const estBackstopApy = poolEst.total_backstop_take_base / estBackstopSize;
        const estQ4WRate =
          Number(backstopPoolData.poolBalance.q4w) / Number(backstopPoolData.poolBalance.shares);
        const shareRate =
          Number(backstopPoolData.poolBalance.tokens) / Number(backstopPoolData.poolBalance.shares);

        if (user_id) {
          let backstopUserData = get().backstopUserData.get(pool_id);
          if (
            !backstopUserData ||
            Number(backstopUserData.lastUpdated) + Number(60) < latest_ledger_close ||
            force_reload
          ) {
            console.log(
              `Loading backstop position data for ${user_id} from ledger time: ${latest_ledger_close}`
            );
            await get().refreshBackstopPoolData(pool_id, user_id, latest_ledger_close);
            backstopUserData = get().backstopUserData.get(pool_id);
          }
          if (!backstopUserData) {
            throw Error('Unable to load backstop user data');
          }
          const backstopUserEst = buildBackstopUserEstimate(backstopUserData, backstopPoolData);
          useStore.setState((prev) => ({
            backstop_pool_est: new Map(prev.backstop_pool_est).set(pool_id, {
              backstopSize: estBackstopSize,
              backstopApy: estBackstopApy,
              q4wRate: estQ4WRate,
              shareRate: shareRate,
            }),
            backstop_user_est: new Map(prev.backstop_user_est).set(pool_id, backstopUserEst),
          }));
        } else {
          useStore.setState((prev) => ({
            backstop_pool_est: new Map(prev.backstop_pool_est).set(pool_id, {
              backstopSize: estBackstopSize,
              backstopApy: estBackstopApy,
              q4wRate: estQ4WRate,
              shareRate: shareRate,
            }),
          }));
        }
      }
    } catch (e) {
      console.error('Unable to load backstop data', e);
    }
  },
});

/********** Estimation Helpers **********/

function buildReserveEstimate(
  poolConfig: PoolConfig,
  reserve: Reserve,
  lastUpdated: number
): ReserveEstimates {
  let decimal_bstop_rate = poolConfig.backstopRate / 1e8; // TODO: Fix after pool redeploy updates bstop rate
  let est_res_data = reserve.estimateData(decimal_bstop_rate, lastUpdated);
  return {
    id: reserve.assetId,
    decimals: reserve.config.decimals,
    supplied: est_res_data.totalSupply * est_res_data.bRate,
    borrowed: est_res_data.totalLiabilities * est_res_data.dRate,
    available: Number(reserve.poolTokens) / 10 ** reserve.config.decimals,
    apy: est_res_data.currentApy,
    supply_apy: est_res_data.currentApy * est_res_data.currentUtil * (1 - decimal_bstop_rate),
    util: est_res_data.currentUtil,
    b_rate: est_res_data.bRate,
    d_rate: est_res_data.dRate,
    c_factor: reserve.config.c_factor / 1e7,
    l_factor: reserve.config.l_factor / 1e7,
  };
}

function buildUserReserveEstimates(
  reserve_est: ReserveEstimates,
  user_res_balance: ReserveBalance,
  decimals: number
): UserReserveEstimates {
  const scaler = 10 ** decimals;
  return {
    asset: Number(user_res_balance.asset) / scaler,
    supplied: (Number(user_res_balance.collateral) / scaler) * reserve_est.b_rate,
    borrowed: (Number(user_res_balance.liability) / scaler) * reserve_est.d_rate,
  };
}

function buildPoolUserEstimate(
  pool_est: PoolEstimates,
  userData: PoolUserData,
  poolData: PoolData
): PoolUserEstimates {
  let user_est: PoolUserEstimates = {
    net_apy: 0,
    supply_apy: 0,
    borrow_apy: 0,
    total_supplied_base: 0,
    total_borrowed_base: 0,
    e_collateral_base: 0,
    e_liabilities_base: 0,
    reserve_estimates: new Map(),
    emission_balance: 0,
  };
  for (const res_est of pool_est.reserve_est ?? []) {
    let user_balance = userData?.reserveBalances.get(res_est.id);

    if (user_balance) {
      let decimals = res_est.decimals;
      let user_res_est = buildUserReserveEstimates(res_est, user_balance, decimals);
      let price = poolData?.poolPrices.get(res_est.id) ?? 1;
      let res_supplied_base = user_res_est.supplied * price;
      let res_borrowed_base = user_res_est.borrowed * price;
      user_est.total_supplied_base += res_supplied_base;
      user_est.total_borrowed_base += res_borrowed_base;
      user_est.e_collateral_base += res_supplied_base * res_est.c_factor;
      user_est.e_liabilities_base += res_borrowed_base / res_est.l_factor;
      user_est.supply_apy += res_supplied_base * res_est.supply_apy;
      user_est.borrow_apy += res_borrowed_base * res_est.apy;
      user_est.net_apy += res_supplied_base * res_est.supply_apy - res_borrowed_base * res_est.apy;
      user_est.reserve_estimates.set(res_est.id, user_res_est);

      // calculate any emissions
    }
  }
  user_est.supply_apy = user_est.supply_apy / user_est.total_supplied_base;
  user_est.borrow_apy = user_est.borrow_apy / user_est.total_borrowed_base;
  user_est.net_apy =
    user_est.net_apy / (user_est.total_supplied_base + user_est.total_borrowed_base);
  return user_est;
}

function estimatePoolUserEmissionBalance(
  poolUserData: PoolUserData,
  poolData: PoolData,
  latestLedgerTime: number
): number {
  let totalEmissions = 0;
  for (const reserve of poolData.reserves) {
    const dTokenIndex = reserve.config.index * 2;
    const bTokenIndex = reserve.config.index * 2 + 1;

    // find estimated accrual for dTokens, if any
    const dTokenUserData = poolUserData.emissionsData.get(dTokenIndex);
    const dTokenBalance = poolUserData.reserveBalances.get(reserve.assetId)?.liability;
    if (dTokenUserData && reserve.borrowEmissions && dTokenBalance) {
      totalEmissions += dTokenUserData.estimateData(
        latestLedgerTime,
        reserve.borrowEmissions,
        reserve.data.dSupply,
        dTokenBalance
      );
    }

    // find estimated accrual for bTokens, if any
    const bTokenUserData = poolUserData.emissionsData.get(bTokenIndex);
    const bTokenBalance = poolUserData.reserveBalances.get(reserve.assetId)?.collateral;
    if (bTokenUserData && reserve.supplyEmissions && bTokenBalance) {
      totalEmissions += bTokenUserData.estimateData(
        latestLedgerTime,
        reserve.supplyEmissions,
        reserve.data.bSupply,
        bTokenBalance
      );
    }
  }
  return totalEmissions;
}

function buildBackstopUserEstimate(
  backstopUserData: BackstopUserData,
  backstopPoolData: BackstopPoolData
): BackstopUserEstimates {
  const backstopPoolBalance = backstopPoolData.poolBalance;
  const shareRate = Number(backstopPoolBalance.tokens) / Number(backstopPoolBalance.shares);

  let unlockedAmount = BigInt(0);
  let lockedList: Q4W[] = [];
  const NOW_SECONDS = Math.floor(Date.now() / 1000);
  let totalInQueue = BigInt(0);
  for (const q4w of backstopUserData.userBalance.q4w) {
    totalInQueue += q4w.amount;
    if (q4w.exp < NOW_SECONDS) {
      // unlocked, only display a single unlocked entry
      unlockedAmount += q4w.amount;
    } else {
      lockedList.push(q4w);
    }
  }
  const unqueuedBalance = (Number(backstopUserData.userBalance.shares) / 1e7) * shareRate;
  const queuedBalance = (Number(totalInQueue) / 1e7) * shareRate;
  return {
    availableToQueue: unqueuedBalance,
    depositBalance: unqueuedBalance + queuedBalance,
    walletBalance: Number(backstopUserData.walletBalance ?? 0) / 1e7,
    q4wUnlockedAmount: (Number(unlockedAmount) / 1e7) * shareRate,
    q4w: lockedList,
  };
}
