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
import { useMemo, useState } from 'react';
import { useSettings, ViewType } from '../../contexts';
import { TxStatus, TxType, useWallet } from '../../contexts/wallet';
import { RPC_DEBOUNCE_DELAY, useDebouncedState } from '../../hooks/debounce';
import { useStore } from '../../store/store';
import { toBalance } from '../../utils/formatter';
import { requiresTrustline } from '../../utils/horizon';
import { scaleInputToBigInt } from '../../utils/scval';
import { getErrorFromSim, SubmitError } from '../../utils/txSim';
import { AnvilAlert } from '../common/AnvilAlert';
import { InputBar } from '../common/InputBar';
import { InputButton } from '../common/InputButton';
import { OpaqueButton } from '../common/OpaqueButton';
import { ReserveComponentProps } from '../common/ReserveComponentProps';
import { ReserveDropdown } from '../common/ReserveDropdown';
import { Row } from '../common/Row';
import { Section, SectionSize } from '../common/Section';
import { StackedText } from '../common/StackedText';
import { TxOverview } from '../common/TxOverview';

const XLM_ADDRESS = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';

const OUSD_ADDRESS = 'CBGO6D5Q3SIPG6QHN2MJ5LQQ6XH2SRPKEB6PLRPS3KWDDPLBMDETEZRK';

export const LendAnvil: React.FC<ReserveComponentProps> = ({ poolId, assetId }) => {
  const theme = useTheme();
  const { viewType } = useSettings();

  const { connected, walletAddress, poolSubmit, txStatus, txType, createTrustline, isLoading } =
    useWallet();

  const poolData = useStore((state) => state.pools.get(poolId));
  const userPoolData = useStore((state) => state.userPoolData.get(poolId));
  const userAccount = useStore((state) => state.account);

  const [toBorrow, setToBorrow] = useState<string>('');
  const [toSupply, setToSupply] = useState<string>('');
  const [collateralRatio, setCollateralRatio] = useState<number>(135);
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

  const reserve = poolData?.reserves.get(OUSD_ADDRESS);
  const reserve_xlm = poolData?.reserves.get(XLM_ADDRESS);
  const assetToXlm = reserve_xlm?.oraclePrice ?? 1;

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

  const handleChangeBorrow = (value: string) => {
    setToBorrow(value);
    // calculate price of usd to xlm and apply collateral ratio
    const supplyAmount = ((Number(value) / assetToXlm) * (collateralRatio / 100)).toFixed(7);
    setToSupply(supplyAmount);
    setLoadingEstimate(true);
  };

  const handleChangeSupply = (value: string) => {
    setToSupply(value);
    const borrowAmount = (
      (Number(toSupply) * assetToXlm) /
      assetToBase /
      (collateralRatio / 100)
    ).toFixed(7);
    setToBorrow(borrowAmount);
    setLoadingEstimate(true);
  };

  const handleSubmitTransaction = async (sim: boolean) => {
    console.log(poolData?.reserves);
    if (toBorrow && connected && reserve_xlm) {
      let submitArgs: SubmitArgs = {
        from: walletAddress,
        to: walletAddress,
        spender: walletAddress,

        requests: [
          {
            amount: scaleInputToBigInt(toSupply, reserve_xlm.config.decimals),
            request_type: RequestType.SupplyCollateral,
            address: XLM_ADDRESS,
          },
          {
            amount: scaleInputToBigInt(toBorrow, reserve_xlm.config.decimals),
            address: OUSD_ADDRESS,
            request_type: RequestType.Borrow,
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
      setCollateralRatio(value);

      setToSupply(((Number(toBorrow) / assetToXlm) * (value / 100)).toFixed(2));

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
              symbol={'oUSD'}
              value={toBorrow}
              onValueChange={(v) => {
                handleChangeBorrow(v);
                setLoadingEstimate(true);
              }}
              palette={theme.palette.borrow}
              sx={{ width: '100%', background: '#F1F3F4' }}
            ></InputBar>
          </Box>
          <Box sx={{ marginLeft: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Typography variant="h5" sx={{ color: theme.palette.text.secondary }}>
              {`$${toBalance(Number(toBorrow ?? 0), decimals)}`}
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
                { value: 135, label: '135%' },
                { value: 175, label: '175%' },
                { value: 225, label: '225%' },
                { value: 300, label: '300%' },
              ]}
              min={135}
              max={300}
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
              value={collateralRatio}
              onChange={(e) => {
                setCollateralAmount(((Number(toBorrow) * collateralRatio) / 100).toFixed(2));
                setCollateralRatio(Number(e.target.value));
              }}
              variant="outlined"
              sx={{ minWidth: '120px' }}
            />
          </Box>
        </Box>

        <Row>
          <Section width={SectionSize.FULL} sx={{ marginTop: '12px', marginBottom: '12px' }}>
            <ReserveDropdown action="supply" poolId={poolId} activeReserveId={assetId} />
          </Section>
        </Row>
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
              symbol={'XLM'}
              value={toSupply}
              onValueChange={(v) => {
                handleChangeSupply(v);
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
          </Box>
          <Box sx={{ marginLeft: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Typography variant="h5" sx={{ color: theme.palette.text.secondary }}>
              {`$${toBalance(Number(toSupply ?? 0) * assetToXlm, decimals)}`}
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

        {!isError && (
          <TxOverview sx={{ background: theme.palette.background.default }}>
            {!isLoading && (
              <>
                <Row>
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
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        gap: '20px',
                      }}
                    >
                      <Section width={SectionSize.THIRD}>
                        <StackedText
                          title="CR ratio"
                          text={`${collateralRatio}%`}
                          sx={{ width: '100%', padding: '6px' }}
                        ></StackedText>
                      </Section>
                      <Section width={SectionSize.THIRD}>
                        <StackedText
                          title="CR value (USD/XLM)"
                          text={`$${toBalance(Number(collateralAmount), decimals)} / ${(
                            Number(collateralAmount) / assetToXlm
                          ).toFixed(2)}`}
                          sx={{ width: '100%', padding: '6px' }}
                        ></StackedText>
                      </Section>
                      <Section width={SectionSize.THIRD}>
                        <StackedText
                          title="Debt (USD/oUSD)"
                          text={`$${toBorrow} ${symbol} / ${toBalance(
                            Number(toBorrow) * assetToBase,
                            decimals
                          )} oUSD`}
                          sx={{ width: '100%', padding: '6px' }}
                        ></StackedText>
                      </Section>
                    </Box>
                  </Box>
                </Row>
                <OpaqueButton
                  onClick={() => handleSubmitTransaction(false)}
                  palette={theme.palette.primary.dark}
                  sx={{ minWidth: '108px', padding: '10px' }}
                  disabled={isSubmitDisabled}
                >
                  Borrow
                </OpaqueButton>
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
