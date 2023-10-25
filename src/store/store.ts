import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { BackstopSlice, BackstopUserData, createBackstopSlice } from './backstopSlice';
import {
  BackstopUserEstimates,
  EstimationSlice,
  PoolUserEstimates,
  createEstimationSlice,
} from './estimationSlice';
import { NetworkSlice, createNetworkSlice } from './networkSlice';
import { PoolSlice, PoolUserData, createPoolSlice } from './poolSlice';

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

interface BaseDataStoreSlice {
  removeUserData: () => void;
}

export type DataStore = NetworkSlice &
  BackstopSlice &
  PoolSlice &
  EstimationSlice &
  BaseDataStoreSlice;

export const useStore = create<DataStore>()(
  devtools((...args) => ({
    ...createNetworkSlice(...args),
    ...createBackstopSlice(...args),
    ...createPoolSlice(...args),
    ...createEstimationSlice(...args),
    removeUserData: () => {
      useStore.setState(() => ({
        poolUserData: new Map<string, PoolUserData>(),
        backstopUserData: new Map<string, BackstopUserData>(),
        pool_user_est: new Map<string, PoolUserEstimates>(),
        backstop_user_est: new Map<string, BackstopUserEstimates>(),
      }));
    },
  }))
);
