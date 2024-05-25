import { BackstopContract, parseResult, PoolBackstopActionArgs } from '@blend-capital/blend-sdk';
import { Box, Typography, useTheme } from '@mui/material';
import { SorobanRpc } from '@stellar/stellar-sdk';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useSettings, ViewType } from '../../contexts';
import { TxStatus, TxType, useWallet } from '../../contexts/wallet';
import { RPC_DEBOUNCE_DELAY, useDebouncedState } from '../../hooks/debounce';
import { useStore } from '../../store/store';
import { toBalance } from '../../utils/formatter';
import { scaleInputToBigInt } from '../../utils/scval';
import { getErrorFromSim } from '../../utils/txSim';
import { AnvilAlert } from '../common/AnvilAlert';
import { InputBar } from '../common/InputBar';
import { InputButton } from '../common/InputButton';
import { OpaqueButton } from '../common/OpaqueButton';
import { PoolComponentProps } from '../common/PoolComponentProps';
import { Row } from '../common/Row';
import { Section, SectionSize } from '../common/Section';
import { TxOverview } from '../common/TxOverview';
import { Value } from '../common/Value';
import { ValueChange } from '../common/ValueChange';

export const BackstopDepositAnvil: React.FC<PoolComponentProps> = ({ poolId }) => {
  const theme = useTheme();
  const { viewType } = useSettings();
  const { connected, walletAddress, backstopDeposit, txStatus, txType, isLoading } = useWallet();

  const backstopData = useStore((state) => state.backstop);
  const backstopPoolData = useStore((state) => state.backstop?.pools?.get(poolId));
  const userBackstopData = useStore((state) => state.backstopUserData);
  const userBackstopEst = userBackstopData?.estimates.get(poolId);
  const userBalance = Number(userBackstopData?.tokens ?? BigInt(0)) / 1e7;
  const decimals = 7;
  let sharesToTokens = backstopPoolData
    ? Number(backstopPoolData.poolBalance.tokens) /
      Number(backstopPoolData.poolBalance.shares) /
      1e7
    : 0;

  const [toDeposit, setToDeposit] = useState<string>('');
  const [simResponse, setSimResponse] = useState<SorobanRpc.Api.SimulateTransactionResponse>();
  const [parsedSimResult, setParsedSimResult] = useState<bigint>();
  const [loadingEstimate, setLoadingEstimate] = useState<boolean>(false);
  if (txStatus === TxStatus.SUCCESS && txType === TxType.CONTRACT && Number(toDeposit) != 0) {
    setToDeposit('');
  }
  const loading = isLoading || loadingEstimate;

  useDebouncedState(toDeposit, RPC_DEBOUNCE_DELAY, txType, async () => {
    setSimResponse(undefined);
    await handleSubmitTransaction(true);
    setLoadingEstimate(false);
  });

  const { isSubmitDisabled, isMaxDisabled, reason, disabledType, isError, extraContent } = useMemo(
    () => getErrorFromSim(toDeposit, decimals, loading, simResponse, undefined),
    [simResponse, toDeposit, userBalance, loading]
  );

  const handleDepositMax = () => {
    if (userBackstopData) {
      setToDeposit(userBalance.toFixed(7));
    }
  };

  const handleSubmitTransaction = async (sim: boolean) => {
    if (toDeposit && connected) {
      const depositArgs: PoolBackstopActionArgs = {
        from: walletAddress,
        pool_address: poolId,
        amount: scaleInputToBigInt(toDeposit, 7),
      };
      const response = await backstopDeposit(depositArgs, sim);
      if (response) {
        setSimResponse(response);
        if (SorobanRpc.Api.isSimulationSuccess(response)) {
          const result = parseResult(response, BackstopContract.parsers.deposit);
          setParsedSimResult(result);
        }
      }
    }
    setLoadingEstimate(false);
  };

  return (
    <Row>
      <Section
        width={SectionSize.FULL}
        sx={{ padding: '0px', display: 'flex', flexDirection: 'column' }}
      >
        <Box
          sx={{
            background: theme.palette.backstop.opaque,
            width: '100%',
            borderRadius: '5px',
            padding: '12px',
            marginBottom: '12px',
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
          }}
        >
          <Typography variant="body2" sx={{ marginLeft: '12px', marginBottom: '12px' }}>
            Amount to deposit
          </Typography>
          <Box
            sx={{
              width: '100%',
              height: '35px',
              display: 'flex',
              gap: '12px',
              flexDirection: viewType !== ViewType.MOBILE ? 'row' : 'column',
              marginBottom: '12px',
            }}
          >
            <InputBar
              symbol={'BLND-USDC LP'}
              value={toDeposit}
              onValueChange={(v) => {
                setToDeposit(v);
                setLoadingEstimate(true);
              }}
              palette={theme.palette.backstop}
              sx={{ width: '100%' }}
            >
              <InputButton
                palette={theme.palette.backstop}
                onClick={handleDepositMax}
                disabled={isMaxDisabled}
                text="MAX"
              />
            </InputBar>
            {viewType !== ViewType.MOBILE && (
              <OpaqueButton
                onClick={() => handleSubmitTransaction(false)}
                palette={theme.palette.backstop}
                sx={{ minWidth: '108px', padding: '6px' }}
                disabled={isSubmitDisabled}
              >
                Deposit
              </OpaqueButton>
            )}
          </Box>
          <Box sx={{ marginLeft: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Typography variant="h5" sx={{ color: theme.palette.text.secondary }}>
              {`$${toBalance(
                Number(toDeposit ?? 0) * (backstopData?.backstopToken.lpTokenPrice ?? 1)
              )}`}
            </Typography>
            {viewType === ViewType.MOBILE && (
              <OpaqueButton
                onClick={() => handleSubmitTransaction(false)}
                palette={theme.palette.backstop}
                sx={{ minWidth: '108px', padding: '6px', width: '100%' }}
                disabled={isSubmitDisabled}
              >
                Deposit
              </OpaqueButton>
            )}
          </Box>
        </Box>
        {!isError && (
          <TxOverview>
            <>
              <Value title="Amount to deposit" value={`${toDeposit ?? '0'} BLND-USDC LP`} />
              <Value
                title={
                  <>
                    <Image src="/icons/dashboard/gascan.svg" alt="blend" width={20} height={20} />{' '}
                    Gas
                  </>
                }
                value={`${toBalance(
                  BigInt((simResponse as any)?.minResourceFee ?? 0),
                  decimals
                )} XLM`}
              />
              <ValueChange
                title="Your total deposit"
                curValue={`${toBalance(userBackstopEst?.tokens)} BLND-USDC LP`}
                newValue={`${toBalance(
                  parsedSimResult && userBackstopEst
                    ? userBackstopEst.tokens + Number(parsedSimResult) * sharesToTokens
                    : 0
                )} BLND-USDC LP`}
              />
            </>
          </TxOverview>
        )}
        {isError && (
          <AnvilAlert severity={disabledType} message={reason} extraContent={extraContent} />
        )}
      </Section>
    </Row>
  );
};
