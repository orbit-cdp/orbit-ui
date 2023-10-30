import { Network } from '@blend-capital/blend-sdk';
import { Server } from 'soroban-client';
import { StateCreator } from 'zustand';
import { DataStore } from './store';

export interface NetworkSlice {
  network: Network;
  rpcServer: () => Server;
  setNetwork: (rpcUrl: string, newPassphrase: string, opts?: Server.Options) => void;
}

export const createNetworkSlice: StateCreator<DataStore, [], [], NetworkSlice> = (set, get) => ({
  network: {
    rpc: 'http://localhost:8000/soroban/rpc',
    passphrase: 'Standalone Network ; February 2017',
    opts: { allowHttp: true },
  },
  rpcServer: () => {
    let network = get().network;
    return new Server(network.rpc, network.opts);
  },
  setNetwork: (newUrl, newPassphrase, newOpts) =>
    set({ network: { rpc: newUrl, passphrase: newPassphrase, opts: newOpts } }),
});
