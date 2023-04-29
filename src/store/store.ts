import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { BackstopSlice, createBackstopSlice } from './backstopSlice';
import { createNetworkSlice, NetworkSlice } from './networkSlice';
import { createPoolSlice, PoolSlice } from './poolSlice';

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export type DataStore = NetworkSlice & BackstopSlice & PoolSlice;

export const useStore = create<DataStore>()(
  devtools((...args) => ({
    ...createNetworkSlice(...args),
    ...createBackstopSlice(...args),
    ...createPoolSlice(...args),
  }))
);
