import { scval_converter } from 'blend-sdk';
import { Account, Address, Contract, Server, TransactionBuilder } from 'soroban-client';

export async function createTxBuilder(
  stellar_rpc: Server,
  network: string,
  source: string
): Promise<TransactionBuilder> {
  try {
    let account = await stellar_rpc.getAccount(source);
    return new TransactionBuilder(account, {
      fee: '1000',
      timebounds: { minTime: 0, maxTime: 0 },
      networkPassphrase: network,
    });
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function getTokenBalance(
  stellar_rpc: Server,
  network_passphrase: string,
  token_id: string,
  address: Address
): Promise<bigint> {
  try {
    // account does not get validated during simulateTx
    let account = new Account('GANXGJV2RNOFMOSQ2DTI3RKDBAVERXUVFC27KW3RLVQCLB3RYNO3AAI4', '123');
    let tx_builder = new TransactionBuilder(account, {
      fee: '1000',
      timebounds: { minTime: 0, maxTime: 0 },
      networkPassphrase: network_passphrase,
    });
    tx_builder.addOperation(new Contract(token_id).call('balance', address.toScVal()));
    let result = await stellar_rpc.simulateTransaction(tx_builder.build());
    let xdr_string = result?.results?.at(0)?.xdr;
    if (xdr_string == undefined) {
      console.error('unable to fetch balance for token: ', token_id);
      return BigInt(0);
    }
    let temp = scval_converter.scvalToBigInt(scval_converter.toScVal(xdr_string));
    return temp;
  } catch (e: any) {
    console.error('unable to fetch balance for token: ', token_id);
    return BigInt(0);
  }
}
