import React, { useContext } from 'react';
import { Server } from 'soroban-client';
import { useLocalStorageState } from '../hooks';

export interface INetworkContext {
  stellar: Server;
  passphrase: string;
  setNetwork: (rpcURL: string, passphrase: string) => void;
}

const NetworkContext = React.createContext<INetworkContext | undefined>(undefined);

export const NetworkProvider = ({ children = null as any }) => {
  const [rpcURL, setRpcURL] = useLocalStorageState('rpc', 'http://localhost:8000/soroban/rpc');
  const [passphrase, setPassphrase] = useLocalStorageState(
    'passphrase',
    'Standalone Network ; February 2017'
  );

  const setNetwork = function (rpcURL: string, passphrase: string) {
    setRpcURL(rpcURL);
    setPassphrase(passphrase);
  };

  return (
    <NetworkContext.Provider
      value={{ stellar: new Server(rpcURL, { allowHttp: true }), passphrase, setNetwork }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);

  if (!context) {
    throw new Error('Component rendered outside the provider tree');
  }

  return context;
};
