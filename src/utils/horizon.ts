//! Collection of utility functions to help with Horizon data

import { Reserve } from '@blend-capital/blend-sdk';
import { Asset, Horizon } from 'stellar-sdk';

export function requiresTrustlineReserve(
  account: Horizon.AccountResponse | undefined,
  reserve: Reserve | undefined
): boolean {
  let asset = reserve?.tokenMetadata?.asset;
  return requiresTrustline(account, asset);
}

export function requiresTrustline(
  account: Horizon.AccountResponse | undefined,
  asset: Asset | undefined
): boolean {
  // no trustline required for unloaded account or asset
  if (!account || !asset) return false;

  return !account.balances.some((balance) => {
    if (balance.asset_type == 'native') {
      return asset.isNative();
    }
    // @ts-ignore
    return balance.asset_code === asset.getCode() && balance.asset_issuer === asset.getIssuer();
  });
}
