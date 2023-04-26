import { create } from 'zustand';
import { BackstopSlice, createBackstopSlice } from './backstopSlice';
import { createNetworkSlice, NetworkSlice } from './networkSlice';

export type DataStore = NetworkSlice & BackstopSlice;

export const useStore = create<DataStore>()((...args) => ({
  ...createNetworkSlice(...args),
  ...createBackstopSlice(...args),
}));
