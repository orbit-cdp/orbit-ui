import { Network } from '@blend-capital/blend-sdk';
import { SorobanRpc } from 'stellar-sdk';
import { StateCreator } from 'zustand';
import { DataStore } from './store';

export interface RPCSlice {
  network: Network;
  rpcServer: () => SorobanRpc.Server;
  setNetwork: (rpcUrl: string, newPassphrase: string, opts?: SorobanRpc.Server.Options) => void;
}

export const createRPCSlice: StateCreator<DataStore, [], [], RPCSlice> = (set, get) => ({
  network: {
    rpc: 'https://soroban-testnet.stellar.org',
    passphrase: 'Test SDF Network ; September 2015',
    opts: undefined,
  },
  rpcServer: () => {
    let network = get().network;
    return new SorobanRpc.Server(network.rpc, network.opts);
  },
  setNetwork: (newUrl, newPassphrase, newOpts) =>
    set({ network: { rpc: newUrl, passphrase: newPassphrase, opts: newOpts } }),
});
