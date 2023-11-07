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
    rpc: 'https://rpc-futurenet.stellar.org',
    passphrase: 'Test SDF Future Network ; October 2022',
    opts: undefined,
  },
  rpcServer: () => {
    let network = get().network;
    return new Server(network.rpc, network.opts);
  },
  setNetwork: (newUrl, newPassphrase, newOpts) =>
    set({ network: { rpc: newUrl, passphrase: newPassphrase, opts: newOpts } }),
});
