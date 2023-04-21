import { BackstopContract, data_entry_converter } from 'blend-sdk';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { xdr } from 'soroban-client';
import { useNetwork } from './network';

export interface IBackstopContext {
  rewardZone: string[];
}

const BackstopContext = React.createContext<IBackstopContext | undefined>(undefined);

const backstop = new BackstopContract(
  'aa59ebb5f5c5fa7e3ae3c70e4373541eec32cb093a7174fa0aa2efaf493595b0'
);

export const BackstopProvider = ({ children = null as any }) => {
  const { stellar } = useNetwork();
  const [rewardZone, setRewardZone] = useState<string[]>([]);

  const loadRewardZone = useCallback(async () => {
    try {
      let rz_datakey = backstop.datakey_RewardZone();
      // TODO: Figure out why ScVal reconstruction is needed
      let rz_datakey2 = xdr.ScVal.fromXDR(rz_datakey.toXDR().toString('base64'), 'base64');
      let rz_dataEntry = await stellar.getContractData(
        backstop._contract.contractId(),
        rz_datakey2
      );
      setRewardZone(data_entry_converter.toHexStringArray(rz_dataEntry.xdr));
    } catch (e) {
      console.error('unable to load backstop reward zone', e);
    }
  }, [stellar]);

  useEffect(() => {
    loadRewardZone();
  }, [loadRewardZone]);

  return <BackstopContext.Provider value={{ rewardZone }}>{children}</BackstopContext.Provider>;
};

export const useBackstop = () => {
  const context = useContext(BackstopContext);

  if (!context) {
    throw new Error('Component rendered outside the provider tree');
  }

  return context;
};
