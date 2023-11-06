import {
  BackstopClaimArgs,
  ContractResult,
  PoolBackstopActionArgs,
  PoolClaimArgs,
  PoolClient,
  Positions,
  Q4W,
  SubmitArgs,
  TxOptions,
} from '@blend-capital/blend-sdk';
import { getPublicKey, signTransaction } from '@stellar/freighter-api';
import React, { useContext, useEffect, useState } from 'react';
import { useStore } from '../store/store';

export interface IWalletContext {
  connected: boolean;
  walletAddress: string;
  txStatus: TxStatus;
  connect: () => void;
  disconnect: () => void;
  clearTxStatus: () => void;
  poolSubmit: (
    poolId: string,
    submitArgs: SubmitArgs,
    sim: boolean
  ) => Promise<Positions | undefined>;
  poolClaim: (
    poolId: string,
    claimArgs: PoolClaimArgs,
    sim: boolean
  ) => Promise<bigint | undefined>;
  backstopDeposit(args: PoolBackstopActionArgs, sim: boolean): Promise<bigint | undefined>;
  backstopWithdraw(args: PoolBackstopActionArgs, sim: boolean): Promise<bigint | undefined>;
  backstopQueueWithdrawal(args: PoolBackstopActionArgs, sim: boolean): Promise<Q4W | undefined>;
  backstopDequeueWithdrawal(args: PoolBackstopActionArgs, sim: boolean): Promise<undefined>;
  backstopClaim(args: BackstopClaimArgs, sim: boolean): Promise<bigint | undefined>;
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
  const network = useStore((state) => state.network);
  const backstopClient = useStore((state) => state.backstopContract);
  const removeUserState = useStore((state) => state.removeUserData);

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
    removeUserState();
    setWalletAddress('');
    setConnected(false);
  }

  /**
   * Sign an XDR string with the connected user's wallet
   * @param xdr - The XDR to sign
   * @param networkPassphrase - The network passphrase
   * @returns - The signed XDR as a base64 string
   */
  async function sign(xdr: string): Promise<string> {
    if (connected) {
      setTxStatus(TxStatus.SIGNING);
      let result = await signTransaction(xdr, { networkPassphrase: network.passphrase });
      setTxStatus(TxStatus.SUBMITTING);
      return result;
    } else {
      throw new Error('Not connected to a wallet');
    }
  }

  async function submitTransaction<T>(
    submission: Promise<ContractResult<T>>
  ): Promise<T | undefined> {
    try {
      // submission calls `sign` internally which handles setting TxStatus
      let result = await submission;
      if (result.ok) {
        console.log('Successfully submitted transaction: ', result.hash);
        setTxStatus(TxStatus.SUCCESS);
      } else {
        console.log('Failed submitted transaction: ', result.hash);
        setTxStatus(TxStatus.FAIL);
      }
      return result.unwrap();
    } catch (e) {
      console.error('Failed submitting transaction: ', e);
      setTxStatus(TxStatus.FAIL);
      return undefined;
    }
  }

  //********** Pool Functions ***********/

  /**
   * Submit a request to the pool
   * @param poolId - The contract address of the pool
   * @param submitArgs - The "submit" function args
   * @param sim - "true" if simulating the transaction, "false" if submitting
   * @returns The Positions, or undefined
   */
  async function poolSubmit(
    poolId: string,
    submitArgs: SubmitArgs,
    sim: boolean
  ): Promise<Positions | undefined> {
    if (connected) {
      let txOptions: TxOptions = {
        sim,
        pollingInterval: 1000,
        timeout: 15000,
        builderOptions: {
          fee: '10000',
          timebounds: { minTime: 0, maxTime: Math.floor(Date.now() / 1000) + 5 * 60 * 1000 },
          networkPassphrase: network.passphrase,
        },
      };
      let pool = new PoolClient(poolId);
      let submission = pool.submit(walletAddress, sign, network, txOptions, submitArgs);
      return submitTransaction<Positions>(submission);
    }
  }

  /**
   * Claim emissions from the pool
   * @param poolId - The contract address of the pool
   * @param claimArgs - The "claim" function args
   * @param sim - "true" if simulating the transaction, "false" if submitting
   * @returns The Positions, or undefined
   */
  async function poolClaim(
    poolId: string,
    claimArgs: PoolClaimArgs,
    sim: boolean
  ): Promise<bigint | undefined> {
    if (connected) {
      let txOptions: TxOptions = {
        sim,
        pollingInterval: 1000,
        timeout: 15000,
        builderOptions: {
          fee: '10000',
          timebounds: { minTime: 0, maxTime: Math.floor(Date.now() / 1000) + 5 * 60 * 1000 },
          networkPassphrase: network.passphrase,
        },
      };
      let pool = new PoolClient(poolId);
      let submission = pool.claim(walletAddress, sign, network, txOptions, claimArgs);
      return submitTransaction<bigint>(submission);
    }
  }

  //********** Backstop Functions ***********/

  /**
   * Execute an deposit against the backstop
   * @param args - The args of the deposit
   * @param sim - "true" if simulating the transaction, "false" if submitting
   * @returns The Positions, or undefined
   */
  async function backstopDeposit(
    args: PoolBackstopActionArgs,
    sim: boolean
  ): Promise<bigint | undefined> {
    if (connected) {
      let txOptions: TxOptions = {
        sim,
        pollingInterval: 1000,
        timeout: 15000,
        builderOptions: {
          fee: '10000',
          timebounds: { minTime: 0, maxTime: Math.floor(Date.now() / 1000) + 5 * 60 * 1000 },
          networkPassphrase: network.passphrase,
        },
      };
      let submission = backstopClient.deposit(walletAddress, sign, network, txOptions, args);
      return submitTransaction<bigint>(submission);
    }
  }

  /**
   * Execute an withdraw against the backstop
   * @param args - The args of the withdraw
   * @param sim - "true" if simulating the transaction, "false" if submitting
   * @returns The Positions, or undefined
   */
  async function backstopWithdraw(
    args: PoolBackstopActionArgs,
    sim: boolean
  ): Promise<bigint | undefined> {
    if (connected) {
      let txOptions: TxOptions = {
        sim,
        pollingInterval: 1000,
        timeout: 15000,
        builderOptions: {
          fee: '10000',
          timebounds: { minTime: 0, maxTime: Math.floor(Date.now() / 1000) + 5 * 60 * 1000 },
          networkPassphrase: network.passphrase,
        },
      };
      let submission = backstopClient.withdraw(walletAddress, sign, network, txOptions, args);
      return submitTransaction<bigint>(submission);
    }
  }

  /**
   * Execute an queue withdrawal against the backstop
   * @param args - The args of the queue withdrawal
   * @param sim - "true" if simulating the transaction, "false" if submitting
   * @returns The Positions, or undefined
   */
  async function backstopQueueWithdrawal(
    args: PoolBackstopActionArgs,
    sim: boolean
  ): Promise<Q4W | undefined> {
    if (connected) {
      let txOptions: TxOptions = {
        sim,
        pollingInterval: 1000,
        timeout: 15000,
        builderOptions: {
          fee: '10000',
          timebounds: { minTime: 0, maxTime: Math.floor(Date.now() / 1000) + 5 * 60 * 1000 },
          networkPassphrase: network.passphrase,
        },
      };
      let submission = backstopClient.queueWithdrawal(
        walletAddress,
        sign,
        network,
        txOptions,
        args
      );
      return submitTransaction<Q4W>(submission);
    }
  }

  /**
   * Execute an dequeue withdrawal against the backstop
   * @param args - The args of the queue withdrawal
   * @param sim - "true" if simulating the transaction, "false" if submitting
   * @returns The Positions, or undefined
   */
  async function backstopDequeueWithdrawal(
    args: PoolBackstopActionArgs,
    sim: boolean
  ): Promise<undefined> {
    if (connected) {
      let txOptions: TxOptions = {
        sim,
        pollingInterval: 1000,
        timeout: 15000,
        builderOptions: {
          fee: '10000',
          timebounds: { minTime: 0, maxTime: Math.floor(Date.now() / 1000) + 5 * 60 * 1000 },
          networkPassphrase: network.passphrase,
        },
      };
      let submission = backstopClient.dequeueWithdrawal(
        walletAddress,
        sign,
        network,
        txOptions,
        args
      );
      return submitTransaction<undefined>(submission);
    }
  }

  /**
   * Claim emissions from the backstop
   * @param claimArgs - The "claim" function args
   * @param sim - "true" if simulating the transaction, "false" if submitting
   * @returns The claimed amount
   */
  async function backstopClaim(
    claimArgs: BackstopClaimArgs,
    sim: boolean
  ): Promise<bigint | undefined> {
    if (connected) {
      let txOptions: TxOptions = {
        sim,
        pollingInterval: 1000,
        timeout: 15000,
        builderOptions: {
          fee: '10000',
          timebounds: { minTime: 0, maxTime: Math.floor(Date.now() / 1000) + 5 * 60 * 1000 },
          networkPassphrase: network.passphrase,
        },
      };
      let submission = backstopClient.claim(walletAddress, sign, network, txOptions, claimArgs);
      return submitTransaction<bigint>(submission);
    }
  }

  return (
    <WalletContext.Provider
      value={{
        connected,
        walletAddress,
        txStatus,
        connect,
        disconnect,
        clearTxStatus: () => setTxStatus(TxStatus.NONE),
        poolSubmit,
        poolClaim,
        backstopDeposit,
        backstopWithdraw,
        backstopQueueWithdrawal,
        backstopDequeueWithdrawal,
        backstopClaim,
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
