import { Server } from 'soroban-client';
import { StateCreator } from 'zustand';
import { DataStore } from './store';

export interface NetworkSlice {
  rpcUrl: string;
  passphrase: string;
  rpcServer: () => Server;
  setNetwork: (rpcUrl: string, newPassphrase: string) => void;
}

export const createNetworkSlice: StateCreator<DataStore, [], [], NetworkSlice> = (set, get) => ({
  rpcUrl: 'http://ec2-3-89-215-1.compute-1.amazonaws.com:80/soroban/rpc',
  passphrase: 'Standalone Network ; February 2017',
  rpcServer: () => {
    return new Server(get().rpcUrl, { allowHttp: true });
  },
  setNetwork: (newUrl, newPassphrase) => set({ rpcUrl: newUrl, passphrase: newPassphrase }),
});
