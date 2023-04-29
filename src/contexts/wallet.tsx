import { getPublicKey, signTransaction } from '@stellar/freighter-api';
import React, { useContext, useEffect, useState } from 'react';

export interface IWalletContext {
  connected: boolean;
  walletAddress: string;
  connect: () => void;
  disconnect: () => void;
  userSignTransaction: (xdr: string, network: string, signWith: string) => Promise<string>;
}

const WalletContext = React.createContext<IWalletContext | undefined>(undefined);

export const WalletProvider = ({ children = null as any }) => {
  const [connected, setConnected] = useState<boolean>(false);
  const [autoConnect, setAutoConnect] = useState(true);

  // wallet state
  const [walletAddress, setWalletAddress] = useState<string>('');

  useEffect(() => {
    if (autoConnect) {
      setAutoConnect(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnect]);

  /**
   * Connects a browser wallet by fetching the public key from the wallet.
   * returns The public key of the wallet
   */
  async function connect() {
    let publicKey = '';
    let error = '';
    try {
      publicKey = await getPublicKey();
      setWalletAddress(publicKey);
      setConnected(true);
    } catch (e: any) {
      error = e?.message ?? 'Failed to connect wallet.';
    }
    if (error) {
      return error;
    }
    return publicKey;
  }

  function disconnect() {
    setWalletAddress('');
    setConnected(false);
  }

  /**
   * Signs a transaction with a connected wallet.
   * param xdr = The xdr-encoded transaction envelope to sign.
   * returns The signed_xdr of the transaction
   */

  async function userSignTransaction(xdr: string, network: string, signWith: string) {
    let signedTransaction = '';
    let error = '';

    try {
      signedTransaction = await signTransaction(xdr, {
        network,
        accountToSign: signWith,
      });
    } catch (e: any) {
      error = e?.message ?? 'Failed to sign transaction.';
    }
    if (error) {
      return error;
    }
    return signedTransaction;
  }

  return (
    <WalletContext.Provider
      value={{
        connected,
        walletAddress,
        connect,
        disconnect,
        userSignTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error('Component rendered outside the provider tree');
  }

  return context;
};
