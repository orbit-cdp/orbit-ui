import { Asset } from 'soroban-client';
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
  hasTrustline: (asset: Asset, account: AccountResponse) => boolean;
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
  hasTrustline: (asset, account) => {
    for (const balance of account.balances) {
      if (balance.asset_type == 'credit_alphanum12' || balance.asset_type == 'credit_alphanum4') {
        if (
          balance.asset_code == asset.code &&
          balance.asset_issuer == asset.issuer &&
          balance.asset_type == asset.getAssetType()
        ) {
          return true;
        }
      }
    }
    return false;
  },
});
