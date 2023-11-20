import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { BackstopSlice, BackstopUserData, createBackstopSlice } from './backstopSlice';
import {
  BackstopUserEstimates,
  createEstimationSlice,
  EstimationSlice,
  PoolUserEstimates,
} from './estimationSlice';
import { createHorizonSlice, HorizonSlice } from './horizonSlice';
import { createPoolSlice, PoolSlice, PoolUserData } from './poolSlice';
import { createRPCSlice, RPCSlice } from './rpcSlice';

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

interface BaseDataStoreSlice {
  removeUserData: () => void;
}

export type DataStore = RPCSlice &
  HorizonSlice &
  BackstopSlice &
  PoolSlice &
  EstimationSlice &
  BaseDataStoreSlice;

export const useStore = create<DataStore>()(
  devtools((...args) => ({
    ...createRPCSlice(...args),
    ...createHorizonSlice(...args),
    ...createBackstopSlice(...args),
    ...createPoolSlice(...args),
    ...createEstimationSlice(...args),
    removeUserData: () => {
      useStore.setState(() => ({
        poolUserData: new Map<string, PoolUserData>(),
        backstopUserData: new Map<string, BackstopUserData>(),
        pool_user_est: new Map<string, PoolUserEstimates>(),
        backstop_user_est: new Map<string, BackstopUserEstimates>(),
        account: undefined,
      }));
    },
  }))
);
