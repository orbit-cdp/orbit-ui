import { Backstop, Pool, Reserve } from '@blend-capital/blend-sdk';
import { Asset } from '@stellar/stellar-sdk';
import { StateCreator } from 'zustand';
import { StellarTokenMetadata, getTokenMetadataFromTOML } from '../external/stellar-toml';
import { BLEND_TESTNET_ASSET, USDC_TESTNET_ASSET } from '../utils/token_display';
import { DataStore } from './store';

export const BACKSTOP_ID = 'CD66EGYOKJ4DPY4FADXZS5FNL3DEVANWRNPNVANF6RQIN44GDB3HKANF';
/**
 * Ledger state for the Blend protocol
 */
export interface BlendSlice {
  backstop: Backstop | undefined;
  pools: Map<string, Pool>;
  assetStellarMetadata: Map<string, StellarTokenMetadata>;
  latestLedger: number;
  latestLedgerTimestamp: number;

  loadBlendData: (force_update: boolean, pool_id?: string, user_id?: string) => Promise<void>;
}

export const createBlendSlice: StateCreator<DataStore, [], [], BlendSlice> = (set, get) => ({
  backstop: undefined,
  pools: new Map<string, Pool>(),
  assetStellarMetadata: new Map<string, StellarTokenMetadata>(),
  latestLedger: 0,
  latestLedgerTimestamp: 0,

  loadBlendData: async (force_update: boolean, pool_id?: string, user_id?: string) => {
    try {
      const network = get().network;
      // get latest ledger close time (TODO: File issue to include close time on getLatestLedger)
      const rpc = get().rpcServer();
      let tx_response = await rpc.getTransaction(
        '0000000000000000000000000000000000000000000000000000000000000000'
      );
      let latest_ledger = Number(tx_response.latestLedger);
      let latest_ledger_close = Number(tx_response.latestLedgerCloseTime);

      if (
        !force_update &&
        get().backstop !== undefined &&
        latest_ledger_close < get().latestLedgerTimestamp + 30
      ) {
        return;
      }

      let backstop = await Backstop.load(
        network,
        BACKSTOP_ID,
        pool_id ? [pool_id] : [],
        true,
        latest_ledger_close
      );

      // all pools in the reward zone + the request pools are loaded on the backstop
      let horizonServer = get().horizonServer();
      let pools = new Map<string, Pool>();
      let assetStellarMetadata = new Map<string, StellarTokenMetadata>();
      for (let pool of Array.from(backstop.pools.keys()).reverse()) {
        try {
          let pool_data = await Pool.load(network, pool, latest_ledger_close);
          for (let reserve of Array.from(pool_data.reserves.values())) {
            if (!assetStellarMetadata.has(reserve.assetId)) {
              let metadata = await getTokenMetadataFromTOML(horizonServer, reserve);
              assetStellarMetadata.set(reserve.assetId, metadata);
            }
          }
          pools.set(pool, pool_data);
        } catch (e) {
          console.error('Unable to load pool data for pool ' + pool);
          console.error(e);
        }
      }

      // fetch XLM, USDC, and BLND metadata if needed
      const USDC: Asset = new Asset(USDC_TESTNET_ASSET.asset_code, USDC_TESTNET_ASSET.asset_issuer);
      const usdcAssetId = USDC.contractId(network.passphrase);
      if (!assetStellarMetadata.has(usdcAssetId)) {
        let metadata = await getTokenMetadataFromTOML(horizonServer, {
          assetId: usdcAssetId,
          tokenMetadata: {
            asset: USDC,
            name: USDC.code,
            symbol: USDC.code,
            decimals: 7,
          },
        } as Reserve);
        assetStellarMetadata.set(usdcAssetId, metadata);
      }

      const BLND: Asset = new Asset(
        BLEND_TESTNET_ASSET.asset_code,
        BLEND_TESTNET_ASSET.asset_issuer
      );
      const blndAssetId = BLND.contractId(network.passphrase);
      if (!assetStellarMetadata.has(blndAssetId)) {
        let metadata = await getTokenMetadataFromTOML(horizonServer, {
          assetId: blndAssetId,
          tokenMetadata: {
            asset: BLND,
            name: BLND.code,
            symbol: BLND.code,
            decimals: 7,
          },
        } as Reserve);
        assetStellarMetadata.set(blndAssetId, metadata);
      }

      const XLM: Asset = Asset.native();
      const xlmAssetId = XLM.contractId(network.passphrase);
      if (!assetStellarMetadata.has(xlmAssetId)) {
        let metadata = await getTokenMetadataFromTOML(horizonServer, {
          assetId: xlmAssetId,
          tokenMetadata: {
            asset: XLM,
            name: XLM.code,
            symbol: XLM.code,
            decimals: 7,
          },
        } as Reserve);
        assetStellarMetadata.set(xlmAssetId, metadata);
      }

      set({
        backstop,
        pools,
        assetStellarMetadata,
        latestLedger: latest_ledger,
        latestLedgerTimestamp: latest_ledger_close,
      });

      // load data into user slice after an updated, if a user is specified
      if (user_id) {
        await get().loadUserData(user_id);
      }
    } catch (e) {
      console.error('Unable to load Blend data');
      console.error(e);
    }
  },
});
