import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { BlendSlice, createBlendSlice } from './blendSlice';
import { HorizonSlice, createHorizonSlice } from './horizonSlice';
import { RPCSlice, createRPCSlice } from './rpcSlice';
import { UserSlice, createUserSlice } from './userSlice';

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export type DataStore = RPCSlice & HorizonSlice & BlendSlice & UserSlice;

export const useStore = create<DataStore>()(
  devtools((...args) => ({
    ...createRPCSlice(...args),
    ...createHorizonSlice(...args),
    ...createBlendSlice(...args),
    ...createUserSlice(...args),
  }))
);
