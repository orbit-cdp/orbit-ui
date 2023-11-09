import { AccountResponse, Server as Horizon } from 'stellar-sdk';
import { StateCreator } from 'zustand';
import { DataStore } from './store';

export interface HorizonSlice {
  horizon: {
    url: string;
    opts?: Horizon.Options;
  };
  horizonServer: () => Horizon;
  setHorizon: (url: string, opts?: Horizon.Options) => void;
  account: AccountResponse | undefined;
  loadAccount: (id: string) => Promise<AccountResponse>;
}

export const createHorizonSlice: StateCreator<DataStore, [], [], HorizonSlice> = (set, get) => ({
  horizon: {
    url: 'https://horizon-futurenet.stellar.org',
    opts: undefined,
  },
  horizonServer: () => {
    let horizon = get().horizon;
    return new Horizon(horizon.url, horizon.opts);
  },
  setHorizon: (newUrl, newOpts) => {
    set({ horizon: { url: newUrl, opts: newOpts } });
  },
  account: undefined,
  loadAccount: async (id) => {
    let horizon = get().horizonServer();
    let account = await horizon.loadAccount(id);
    set({ account });
    return account;
  },
});
