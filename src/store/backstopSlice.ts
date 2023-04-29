import { BackstopContract, data_entry_converter, Q4W } from 'blend-sdk';
import { Address, Server, xdr } from 'soroban-client';
import { StateCreator } from 'zustand';
import { DataStore } from './store';

export interface BackstopSlice {
  backstopContract: BackstopContract;
  rewardZone: string[];
  shares: Map<string, BigInt>;
  q4w: Map<string, Q4W[]>;
  refreshBackstopData: () => Promise<void>;
  refreshBackstopUserData: (user: string) => Promise<void>;
}

export const createBackstopSlice: StateCreator<DataStore, [], [], BackstopSlice> = (set, get) => ({
  backstopContract: new BackstopContract(
    '00a387e057e2542ce4fe2610c33e0ef7a41cd8d6a25b78fd8ae2517e81e5daa3'
  ),
  rewardZone: [],
  shares: new Map<string, BigInt>(),
  q4w: new Map<string, Q4W[]>(),
  refreshBackstopData: async () => {
    try {
      const contract = get().backstopContract;
      const stellar = get().rpcServer();
      let rz_datakey = xdr.ScVal.fromXDR(
        contract.datakey_RewardZone().toXDR().toString('base64'),
        'base64'
      );
      let rz_dataEntry = await stellar.getContractData(contract._contract.contractId(), rz_datakey);
      set({ rewardZone: data_entry_converter.toStringArray(rz_dataEntry.xdr, 'hex') });
    } catch (e) {
      console.error('unable to refresh backstop data:', e);
    }
  },
  refreshBackstopUserData: async (user: string) => {
    try {
      const contract = get().backstopContract;
      const stellar = get().rpcServer();
      const rz = get().rewardZone;
      let shares = await loadShares(stellar, contract, rz, user);
      let q4w = await loadQ4W(stellar, contract, rz, user);
      set({ shares: shares, q4w: q4w });
      console.log('refreshed backstop user data for:', user);
    } catch (e) {
      console.error('unable to refresh backstop data:', e);
    }
  },
});

/********** Contract Data Helpers **********/

async function loadShares(
  stellar: Server,
  contract: BackstopContract,
  rewardZone: string[],
  userId: string
): Promise<Map<string, BigInt>> {
  let deposit_map = new Map<string, BigInt>();
  for (const rz_id of rewardZone) {
    try {
      let user_addr = new Address(userId);
      let shares_datakey = xdr.ScVal.scvVec([
        xdr.ScVal.scvSymbol('Shares'),
        xdr.ScVal.scvMap([
          new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol('pool'),
            val: xdr.ScVal.scvBytes(Buffer.from(rz_id, 'hex')),
          }),
          new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol('user'),
            val: user_addr.toScVal(),
          }),
        ]),
      ]);
      let shares_dataEntry = await stellar.getContractData(
        contract._contract.contractId(),
        shares_datakey
      );
      deposit_map.set(rz_id, data_entry_converter.toBigInt(shares_dataEntry.xdr));
    } catch (e: any) {
      if (e?.message?.includes('not found') === false) {
        console.error('unable to fetch shares for: ', rz_id);
        console.error(e);
      }
      // user balance not found, can assume a deposit of zero
    }
  }
  return deposit_map;
}

async function loadQ4W(
  stellar: Server,
  contract: BackstopContract,
  rewardZone: string[],
  userId: string
): Promise<Map<string, Q4W[]>> {
  let q4w_map = new Map<string, Q4W[]>();
  for (const rz_id of rewardZone) {
    try {
      let user_addr = new Address(userId);
      let q4w_datakey = xdr.ScVal.scvVec([
        xdr.ScVal.scvSymbol('Q4W'),
        xdr.ScVal.scvMap([
          new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol('pool'),
            val: xdr.ScVal.scvBytes(Buffer.from(rz_id, 'hex')),
          }),
          new xdr.ScMapEntry({
            key: xdr.ScVal.scvSymbol('user'),
            val: user_addr.toScVal(),
          }),
        ]),
      ]);
      let q4w_dataEntry = await stellar.getContractData(
        contract._contract.contractId(),
        q4w_datakey
      );
      q4w_map.set(rz_id, Q4W.fromContractDataXDR(q4w_dataEntry.xdr));
    } catch (e: any) {
      if (e?.message?.includes('not found') === false) {
        console.error('unable to fetch q4w for: ', rz_id);
        console.error(e);
      }
      // user Q4W not found, can assume no Q4W present
    }
  }
  return q4w_map;
}
