import { Network } from '@blend-capital/blend-sdk';
import { Server } from 'soroban-client';
import { StateCreator } from 'zustand';
import { DataStore } from './store';

export interface RPCSlice {
  network: Network;
  rpcServer: () => Server;
  setNetwork: (rpcUrl: string, newPassphrase: string, opts?: Server.Options) => void;
}

export const createRPCSlice: StateCreator<DataStore, [], [], RPCSlice> = (set, get) => ({
  network: {
    rpc: 'https://soroban-testnet.stellar.org',
    passphrase: 'Test SDF Network ; September 2015',
    opts: undefined,
  },
  rpcServer: () => {
    let network = get().network;
    return new Server(network.rpc, network.opts);
  },
  setNetwork: (newUrl, newPassphrase, newOpts) =>
    set({ network: { rpc: newUrl, passphrase: newPassphrase, opts: newOpts } }),
});
