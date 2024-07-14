import {
  parseResult,
  PoolContract,
  PositionEstimates,
  RequestType,
  SubmitArgs,
  UserPositions,
} from '@blend-capital/blend-sdk';
import { Box, CircularProgress, Slider, TextField, Typography, useTheme } from '@mui/material';
import { SorobanRpc } from '@stellar/stellar-sdk';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useSettings, ViewType } from '../../contexts';
import { TxStatus, TxType, useWallet } from '../../contexts/wallet';
import { RPC_DEBOUNCE_DELAY, useDebouncedState } from '../../hooks/debounce';
import { useStore } from '../../store/store';
import { toBalance, toPercentage } from '../../utils/formatter';
import { requiresTrustline } from '../../utils/horizon';
import { scaleInputToBigInt } from '../../utils/scval';
import { getErrorFromSim, SubmitError } from '../../utils/txSim';
import { AnvilAlert } from '../common/AnvilAlert';
import { InputBar } from '../common/InputBar';
import { InputButton } from '../common/InputButton';
import { OpaqueButton } from '../common/OpaqueButton';
import { ReserveComponentProps } from '../common/ReserveComponentProps';
import { Row } from '../common/Row';
import { Section, SectionSize } from '../common/Section';
import { TxOverview } from '../common/TxOverview';
import { Value } from '../common/Value';
import { ValueChange } from '../common/ValueChange';

const XLM_ADDRESS = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';

const USDC_ADDRESS = 'CAQCFVLOBK5GIULPNZRGATJJMIZL5BSP7X5YJVMGCPTUEPFM4AVSRCJU';

export const BorrowAnvil: React.FC<ReserveComponentProps> = ({ poolId, assetId }) => {
  const theme = useTheme();
  const { viewType } = useSettings();

  const { connected, walletAddress, poolSubmit, txStatus, txType, createTrustline, isLoading } =
    useWallet();

  const poolData = useStore((state) => state.pools.get(poolId));
  const userPoolData = useStore((state) => state.userPoolData.get(poolId));
  const userAccount = useStore((state) => state.account);

  const [toBorrow, setToBorrow] = useState<string>('');
  const [collateralRatio, setCollateralRatio] = useState<number>(110);
  const [collateralAmount, setCollateralAmount] = useState<string>('0');
  const [simResponse, setSimResponse] = useState<SorobanRpc.Api.SimulateTransactionResponse>();
  const [parsedSimResult, setParsedSimResult] = useState<UserPositions>();
  const [loadingEstimate, setLoadingEstimate] = useState<boolean>(false);
  const loading = isLoading || loadingEstimate;

  if (txStatus === TxStatus.SUCCESS && txType === TxType.CONTRACT && Number(toBorrow) != 0) {
    setToBorrow('');
  }

  useDebouncedState(toBorrow, RPC_DEBOUNCE_DELAY, txType, async () => {
    setSimResponse(undefined);
    setParsedSimResult(undefined);
    let response = await handleSubmitTransaction(true);
    if (response) {
      setSimResponse(response);
      if (SorobanRpc.Api.isSimulationSuccess(response)) {
        setParsedSimResult(parseResult(response, PoolContract.parsers.submit));
      }
    }
    setLoadingEstimate(false);
  });

  let newPositionEstimate =
    poolData && parsedSimResult ? PositionEstimates.build(poolData, parsedSimResult) : undefined;

  const reserve = poolData?.reserves.get(assetId);

  const assetToBase = reserve?.oraclePrice ?? 1;
  const decimals = reserve?.config.decimals ?? 7;
  const symbol = reserve?.tokenMetadata?.symbol ?? '';

  const assetToEffectiveLiability = reserve
    ? assetToBase * reserve.getLiabilityFactor()
    : undefined;
  const curBorrowCap =
    userPoolData && assetToEffectiveLiability
      ? userPoolData.positionEstimates.borrowCap / assetToEffectiveLiability
      : undefined;
  const nextBorrowCap =
    newPositionEstimate && assetToEffectiveLiability
      ? newPositionEstimate.borrowCap / assetToEffectiveLiability
      : undefined;
  const curBorrowLimit =
    userPoolData && Number.isFinite(userPoolData?.positionEstimates.borrowLimit)
      ? userPoolData?.positionEstimates?.borrowLimit
      : 0;
  const nextBorrowLimit =
    newPositionEstimate && Number.isFinite(newPositionEstimate?.borrowLimit)
      ? newPositionEstimate?.borrowLimit
      : 0;
  const AddTrustlineButton = (
    <OpaqueButton
      onClick={handleAddAssetTrustline}
      palette={theme.palette.warning}
      sx={{ padding: '6px 24px', margin: '12px auto' }}
    >
      Add {reserve?.tokenMetadata.asset?.code} Trustline
    </OpaqueButton>
  );

  const { isSubmitDisabled, isMaxDisabled, reason, disabledType, extraContent, isError } =
    useMemo(() => {
      const hasTokenTrustline = !requiresTrustline(userAccount, reserve?.tokenMetadata?.asset);
      if (!hasTokenTrustline) {
        let submitError: SubmitError = {
          isSubmitDisabled: true,
          isError: true,
          isMaxDisabled: true,
          reason: 'You need a trustline for this asset in order to borrow it.',
          disabledType: 'warning',
          extraContent: AddTrustlineButton,
        };
        return submitError;
      } else {
        return getErrorFromSim(toBorrow, decimals, loading, simResponse, undefined);
      }
    }, [toBorrow, simResponse, userPoolData?.positionEstimates]);

  const handleBorrowMax = () => {
    if (reserve && userPoolData) {
      let to_bounded_hf =
        (userPoolData.positionEstimates.totalEffectiveCollateral -
          userPoolData.positionEstimates.totalEffectiveLiabilities * 1.02) /
        1.02;
      let to_borrow = Math.min(
        to_bounded_hf / (assetToBase * reserve.getLiabilityFactor()),
        reserve.estimates.supplied * (reserve.config.max_util / 1e7 - 0.01) -
          reserve.estimates.borrowed
      );
      setToBorrow(Math.max(to_borrow, 0).toFixed(7));
      setLoadingEstimate(true);
    }
  };

  const handleSubmitTransaction = async (sim: boolean) => {
    if (toBorrow && connected && reserve) {
      let submitArgs: SubmitArgs = {
        from: walletAddress,
        to: walletAddress,
        spender: walletAddress,
        requests: [
          {
            amount: scaleInputToBigInt(toBorrow, reserve.config.decimals),
            address: reserve.assetId,
            request_type: RequestType.Borrow,
          },
          {
            amount: scaleInputToBigInt(toBorrow, reserve.config.decimals),
            request_type: RequestType.SupplyCollateral,
            address: reserve.assetId,
          },
        ],
      };
      return await poolSubmit(poolId, submitArgs, sim);
    }
  };

  async function handleAddAssetTrustline() {
    if (connected && reserve?.tokenMetadata?.asset) {
      const reserveAsset = reserve?.tokenMetadata?.asset;
      await createTrustline(reserveAsset);
    }
  }

  const handleCollateralChange = (event: any, value: number | number[]) => {
    if (typeof value === 'number') {
      const fixedValues = [110, 200, 300, 500];
      const closestFixedValue = fixedValues.reduce((prev, curr) =>
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
      );

      if (fixedValues.includes(value)) {
        setCollateralRatio(value);
      } else {
        setCollateralRatio(value);
      }

      const newCollateralAmount = ((Number(toBorrow) * value) / 100).toFixed(2);
      setCollateralAmount(newCollateralAmount);
    }
  };

  return (
    <Row>
      <Section
        width={SectionSize.FULL}
        sx={{ padding: '0px', display: 'flex', flexDirection: 'column' }}
      >
        <Box
          sx={{
            background: theme.palette.borrow.opaque,
            width: '100%',
            borderRadius: '5px',
            padding: '12px',
            marginBottom: '12px',
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography variant="body2" sx={{ marginLeft: '12px', marginBottom: '12px' }}>
            Amount to borrow
          </Typography>
          <Box
            sx={{
              width: '100%',
              height: '35px',
              display: 'flex',
              flexDirection: 'row',
              marginBottom: '12px',
            }}
          >
            <InputBar
              symbol={symbol}
              value={toBorrow}
              onValueChange={(v) => {
                setToBorrow(v);
                setLoadingEstimate(true);
              }}
              palette={theme.palette.borrow}
              sx={{ width: '100%', background: '#F1F3F4' }}
            >
              <InputButton
                palette={theme.palette.borrow}
                onClick={handleBorrowMax}
                disabled={isMaxDisabled}
                text="MAX"
              />
            </InputBar>
            {viewType !== ViewType.MOBILE && (
              <OpaqueButton
                onClick={() => handleSubmitTransaction(false)}
                palette={theme.palette.borrow}
                sx={{ minWidth: '108px', marginLeft: '12px', padding: '6px' }}
                disabled={isSubmitDisabled}
              >
                Borrow
              </OpaqueButton>
            )}
          </Box>
          <Box sx={{ marginLeft: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Typography variant="h5" sx={{ color: theme.palette.text.secondary }}>
              {`$${toBalance(Number(toBorrow ?? 0) * assetToBase, decimals)}`}
            </Typography>
            {viewType === ViewType.MOBILE && (
              <OpaqueButton
                onClick={() => handleSubmitTransaction(false)}
                palette={theme.palette.borrow}
                sx={{ minWidth: '108px', width: '100%', padding: '6px' }}
                disabled={isSubmitDisabled}
              >
                Borrow
              </OpaqueButton>
            )}
          </Box>
        </Box>
        <Box
          sx={{
            background: theme.palette.background.default,
            width: '100%',
            borderRadius: '5px',
            padding: '12px',
            marginBottom: '12px',
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography variant="body2" sx={{ marginLeft: '12px', marginBottom: '12px' }}>
            Collateral Ratio
          </Typography>
          <Box sx={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Slider
              value={collateralRatio}
              onChange={handleCollateralChange}
              aria-labelledby="discrete-slider"
              valueLabelDisplay="auto"
              step={1}
              marks={[
                { value: 110, label: '110%' },
                { value: 200, label: '200%' },
                { value: 300, label: '300%' },
                { value: 500, label: '500%' },
              ]}
              min={110}
              max={500}
              sx={{
                flexGrow: 1,
                marginRight: '12px',
                '& .MuiSlider-mark': {
                  height: '12px',
                  width: '12px',
                  borderRadius: '50%',
                  backgroundColor: theme.palette.primary.main,
                },
                '& .MuiSlider-markLabel': {
                  marginTop: '8px',
                },
              }}
            />
            <TextField
              label="CR%"
              value={`${collateralRatio}%`}
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
              sx={{ minWidth: '120px' }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            background: theme.palette.background.default,
            width: '100%',
            borderRadius: '5px',
            padding: '12px',
            marginBottom: '12px',
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography variant="body2" sx={{ marginLeft: '12px', marginBottom: '12px' }}>
            Info Fields
          </Typography>
          <Box sx={{ marginLeft: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Value title="Collateral Ratio" value={`${collateralRatio}%`} />
            <Value title="Debt" value={`${toBorrow} ${symbol}`} />
            <Value title="Liquidation Price" value={`$${(Number(toBorrow) / 0.8).toFixed(2)}`} />
            <Value title="Interest Rate" value="5%" />
            <Value title="Collateral Value" value={`$${collateralAmount}`} />
          </Box>
        </Box>
        {!isError && (
          <TxOverview>
            {!isLoading && (
              <>
                <Value title="Amount to borrow" value={`${toBorrow ?? '0'} ${symbol}`} />
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
                  title="Your total borrowed"
                  curValue={`${toBalance(
                    userPoolData?.positionEstimates?.liabilities?.get(assetId) ?? 0,
                    decimals
                  )} ${symbol}`}
                  newValue={`${toBalance(
                    newPositionEstimate?.liabilities.get(assetId) ?? 0,
                    decimals
                  )} ${symbol}`}
                />
                <ValueChange
                  title="Borrow capacity"
                  curValue={`${toBalance(curBorrowCap)} ${symbol}`}
                  newValue={`${toBalance(nextBorrowCap)} ${symbol}`}
                />
                <ValueChange
                  title="Borrow limit"
                  curValue={toPercentage(curBorrowLimit)}
                  newValue={toPercentage(nextBorrowLimit)}
                />
              </>
            )}
            {isLoading && (
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <CircularProgress color={'borrow' as any} />
              </Box>
            )}
          </TxOverview>
        )}
        {isError && (
          <AnvilAlert severity={disabledType} message={reason} extraContent={extraContent} />
        )}
      </Section>
    </Row>
  );
};
