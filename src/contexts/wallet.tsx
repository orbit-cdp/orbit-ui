import { getPublicKey, signTransaction } from '@stellar/freighter-api';
import React, { useContext, useEffect, useState } from 'react';

export interface IWalletContext {
  connected: boolean;
  walletAddress: string;
  connect: () => void;
  disconnect: () => void;
  userSignTransaction: (xdr: string, network: string, signWith: string) => Promise<string>;
  submitTransaction: () => Promise<void>;
  txStatus: TxStatus;
}

export enum TxStatus {
  NONE,
  SIGNING,
  SUBMITTING,
  SUCCESS,
  FAIL,
}

const WalletContext = React.createContext<IWalletContext | undefined>(undefined);

export const WalletProvider = ({ children = null as any }) => {
  const [connected, setConnected] = useState<boolean>(false);
  const [autoConnect, setAutoConnect] = useState(true);
  const [txStatus, setTxStatus] = useState<TxStatus>(TxStatus.NONE);

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

  /**
   * Submits tx
   * Returns txStatus and hash
   */
  async function submitTransaction() {
    const delay = (ms: number | undefined) => new Promise((res) => setTimeout(res, ms));
    let hash = '132c440e984ab97d895f3477015080aafd6c4375f6a70a87327f7f95e13c4e31';
    let error = '';

    try {
      setTxStatus(TxStatus.SIGNING);
      await delay(3000);
      setTxStatus(TxStatus.SUBMITTING);
    } catch (e: any) {
      error = e?.message ?? 'Failed to submit transaction.';
    }
    if (error) {
      setTxStatus(TxStatus.FAIL);
    }
    await delay(2000);
    setTxStatus(TxStatus.SUCCESS);
  }

  return (
    <WalletContext.Provider
      value={{
        connected,
        walletAddress,
        connect,
        disconnect,
        userSignTransaction,
        submitTransaction,
        txStatus,
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
