import {
  BackstopClaimArgs,
  BackstopClient,
  ContractResult,
  PoolBackstopActionArgs,
  PoolClaimArgs,
  PoolClient,
  Positions,
  Q4W,
  Resources,
  SubmitArgs,
  TxOptions,
} from '@blend-capital/blend-sdk';
import { getPublicKey, signTransaction } from '@stellar/freighter-api';
import React, { useContext, useEffect, useState } from 'react';
import { SorobanRpc, Transaction, xdr } from 'stellar-sdk';
import { useLocalStorageState } from '../hooks';
import { BACKSTOP_ID } from '../store/blendSlice';
import { useStore } from '../store/store';
import { useSettings } from './settings';

export interface IWalletContext {
  connected: boolean;
  walletAddress: string;
  txStatus: TxStatus;
  lastTxHash: string | undefined;
  lastTxFailure: string | undefined;
  connect: () => void;
  disconnect: () => void;
  clearLastTx: () => void;
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
  faucet(): Promise<undefined>;
}

export enum TxStatus {
  NONE,
  BUILDING,
  SIGNING,
  SUBMITTING,
  SUCCESS,
  FAIL,
}

const WalletContext = React.createContext<IWalletContext | undefined>(undefined);

export const WalletProvider = ({ children = null as any }) => {
  const { lastPool } = useSettings();

  const network = useStore((state) => state.network);
  const rpc = useStore((state) => state.rpcServer());
  const loadBlendData = useStore((state) => state.loadBlendData);
  const loadUserData = useStore((state) => state.loadUserData);
  const clearUserData = useStore((state) => state.clearUserData);

  const [connected, setConnected] = useState<boolean>(false);
  const [autoConnect, setAutoConnect] = useLocalStorageState('autoConnectWallet', 'false');

  const [txStatus, setTxStatus] = useState<TxStatus>(TxStatus.NONE);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [txFailure, setTxFailure] = useState<string | undefined>(undefined);

  // wallet state
  const [walletAddress, setWalletAddress] = useState<string>('');

  function setFailureMessage(message: string | undefined) {
    if (message) {
      // some contract failures include diagnostic information. If so, try and remove it.
      let substrings = message.split('Event log (newest first):');
      if (substrings.length > 1) {
        setTxFailure(substrings[0].trimEnd());
      }
    }
  }

  useEffect(() => {
    if (!connected && autoConnect != 'false') {
      connect();
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
      setAutoConnect('freighter');
      await loadUserData(publicKey);
    } catch (e: any) {
      error = e?.message ?? 'Failed to connect wallet.';
    }
    if (error) {
      return error;
    }
    return publicKey;
  }

  function disconnect() {
    clearUserData();
    setWalletAddress('');
    setConnected(false);
    setAutoConnect('false');
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
      try {
        let result = await signTransaction(xdr, { networkPassphrase: network.passphrase });
        setTxStatus(TxStatus.SUBMITTING);
        return result;
      } catch (e: any) {
        if (e == 'User declined access') {
          setTxFailure('Transaction rejected by wallet.');
        } else if (typeof e == 'string') {
          setTxFailure(e);
        }

        setTxStatus(TxStatus.FAIL);
        throw e;
      }
    } else {
      throw new Error('Not connected to a wallet');
    }
  }

  async function submitTransaction<T>(
    submission: Promise<ContractResult<T>>,
    poolId?: string | undefined
  ): Promise<T | undefined> {
    try {
      // submission calls `sign` internally which handles setting TxStatus
      setFailureMessage(undefined);
      setTxStatus(TxStatus.BUILDING);
      let result = await submission;
      setTxHash(result.hash);
      if (result.ok) {
        console.log('Successfully submitted transaction: ', result.hash);
        setTxStatus(TxStatus.SUCCESS);
      } else {
        console.log('Failed submitted transaction: ', result.hash);
        setFailureMessage(result.error?.message);
        setTxStatus(TxStatus.FAIL);
      }

      // reload data after submission
      try {
        await loadBlendData(true, poolId, walletAddress);
      } catch {
        console.error('Failed reloading blend data for account: ', walletAddress);
      }

      return result.unwrap();
    } catch (e: any) {
      console.error('Failed submitting transaction: ', e);
      setFailureMessage(e?.message);
      setTxStatus(TxStatus.FAIL);
      return undefined;
    }
  }

  function clearLastTx() {
    setTxStatus(TxStatus.NONE);
    setTxHash(undefined);
    setTxFailure(undefined);
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
        timeout: 20000,
        builderOptions: {
          fee: '10000',
          timebounds: { minTime: 0, maxTime: Math.floor(Date.now() / 1000) + 5 * 60 * 1000 },
          networkPassphrase: network.passphrase,
        },
      };
      let pool = new PoolClient(poolId);
      let submission = pool.submit(walletAddress, sign, network, txOptions, submitArgs);
      return submitTransaction<Positions>(submission, poolId);
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
      return submitTransaction<bigint>(submission, poolId);
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
      let backstopClient = new BackstopClient(BACKSTOP_ID);
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
      let backstopClient = new BackstopClient(BACKSTOP_ID);
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
      let backstopClient = new BackstopClient(BACKSTOP_ID);
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
      let backstopClient = new BackstopClient(BACKSTOP_ID);
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
      let backstopClient = new BackstopClient(BACKSTOP_ID);
      let submission = backstopClient.claim(walletAddress, sign, network, txOptions, claimArgs);
      return submitTransaction<bigint>(submission);
    }
  }

  async function faucet(): Promise<undefined> {
    if (connected) {
      const url = `https://ewqw4hx7oa.execute-api.us-east-1.amazonaws.com/getAssets?userId=${walletAddress}`;
      try {
        setTxStatus(TxStatus.BUILDING);
        const resp = await fetch(url, { method: 'GET' });
        const txEnvelopeXDR = await resp.text();
        let transaction = new Transaction(
          xdr.TransactionEnvelope.fromXDR(txEnvelopeXDR, 'base64'),
          network.passphrase
        );

        let signedTx = new Transaction(await sign(transaction.toXDR()), network.passphrase);
        let response:
          | SorobanRpc.Api.SendTransactionResponse
          | SorobanRpc.Api.GetTransactionResponse = await rpc.sendTransaction(signedTx);
        let status: string = response.status;
        const resources = new Resources(0, 0, 0, 0, 0, 0, 0);
        const tx_hash = response.hash;
        setTxHash(tx_hash);

        // Poll this until the status is not "NOT_FOUND"
        const pollingStartTime = Date.now();
        while (status === 'PENDING' || status === 'NOT_FOUND') {
          if (pollingStartTime + 15000 < Date.now()) {
            console.error(`Transaction timed out with status ${status}`);
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
          // See if the transaction is complete
          response = await rpc.getTransaction(tx_hash);
          status = response.status;
        }
        // @ts-ignore
        const result = ContractResult.fromResponse(tx_hash, resources, response, () => undefined);
        try {
          if (result.ok) {
            console.log('Successfully submitted transaction: ', result.hash);
            setFailureMessage('');
            setTxStatus(TxStatus.SUCCESS);
          } else {
            console.log('Failed submitted transaction: ', result.hash);
            setFailureMessage(result.error?.message);
            setTxStatus(TxStatus.FAIL);
          }

          // reload Horizon account after submission
          try {
            await loadUserData(walletAddress);
          } catch {
            console.error('Failed loading account: ', walletAddress);
          }

          return result.unwrap();
        } catch (e: any) {
          console.error('Failed submitting transaction: ', e);
          setFailureMessage(e?.message);
          setTxStatus(TxStatus.FAIL);
          return undefined;
        }
      } catch (e) {
        setTxStatus(TxStatus.FAIL);
        console.error('Faucet Failed', e);
      }
    }
  }

  return (
    <WalletContext.Provider
      value={{
        connected,
        walletAddress,
        txStatus,
        lastTxHash: txHash,
        lastTxFailure: txFailure,
        connect,
        disconnect,
        clearLastTx,
        poolSubmit,
        poolClaim,
        backstopDeposit,
        backstopWithdraw,
        backstopQueueWithdrawal,
        backstopDequeueWithdrawal,
        backstopClaim,
        faucet,
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
