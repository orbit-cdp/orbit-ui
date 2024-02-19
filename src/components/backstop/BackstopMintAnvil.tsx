import { Box, Typography, useTheme } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { TxStatus, useWallet } from '../../contexts/wallet';
import { useDebouncedState } from '../../hooks/debounce';
import { useStore } from '../../store/store';
import { toBalance } from '../../utils/formatter';
import { scaleInputToBigInt } from '../../utils/scval';
import { InputBar } from '../common/InputBar';
import { OpaqueButton } from '../common/OpaqueButton';
import { Row } from '../common/Row';
import { Section, SectionSize } from '../common/Section';
import { SubmitError, TxOverview } from '../common/TxOverview';
import { Value } from '../common/Value';
import { ValueChange } from '../common/ValueChange';

export const BackstopMintAnvil: React.FC<{
  currentDepositToken: { address: string | undefined; symbol: string };
  setCurrentDepositToken: (token: { address: string | undefined; symbol: string }) => void;
}> = ({ currentDepositToken, setCurrentDepositToken }) => {
  const [toMint, setToMint] = useState<string>('');
  const [loadingEstimate, setLoadingEstimate] = useState<boolean>(false);
  const [toSwap, setToSwap] = useState<string>('');
  /** run function on each state change */
  useDebouncedState(toSwap, 500, handleSwapChange);
  const theme = useTheme();
  const { connected, walletAddress, txStatus, backstopMintByDepositTokenAmount } = useWallet();
  const backstopData = useStore((state) => state.backstop);
  const loadUserData = useStore((state) => state.loadUserData);

  const userBackstopData = useStore((state) => state.backstopUserData);
  const balancesByAddress = useStore((state) => state.balances);
  const userLPBalance = Number(userBackstopData?.tokens ?? BigInt(0)) / 1e7;
  const decimals = 7;
  if (txStatus === TxStatus.SUCCESS && Number(toMint) != 0) {
    setToMint('0');
  }
  // verify that the user can act
  const { isSubmitDisabled, isMaxDisabled, reason, disabledType } = useMemo(() => {
    const errorProps: SubmitError = {
      isSubmitDisabled: false,
      isMaxDisabled: false,
      reason: undefined,
      disabledType: undefined,
    };
    const currentDepositTokenBalance =
      balancesByAddress.get(currentDepositToken.address ?? '') || 0;
    if (currentDepositTokenBalance <= BigInt(0)) {
      errorProps.isSubmitDisabled = true;
      errorProps.isMaxDisabled = true;
      errorProps.reason = 'You do not have any available balance to mint.';
      errorProps.disabledType = 'warning';
    } else if (!toSwap) {
      errorProps.isSubmitDisabled = true;
      errorProps.isMaxDisabled = false;
      errorProps.reason = 'Please enter an amount to mint.';
      errorProps.disabledType = 'info';
    } else if (toSwap.split('.')[1]?.length > decimals) {
      errorProps.isSubmitDisabled = true;
      errorProps.isMaxDisabled = false;
      errorProps.reason = `You cannot supply more than ${decimals} decimal places.`;
      errorProps.disabledType = 'warning';
    } else if (scaleInputToBigInt(toSwap, decimals) > currentDepositTokenBalance) {
      errorProps.isSubmitDisabled = true;
      errorProps.isMaxDisabled = false;
      errorProps.reason = 'You do not have enough available balance to mint.';
      errorProps.disabledType = 'warning';
    } else if (!toMint || !!loadingEstimate) {
      errorProps.isSubmitDisabled = true;
      errorProps.isMaxDisabled = false;
      errorProps.reason = 'Loading estimate...';
      errorProps.disabledType = 'info';
    } else {
      errorProps.isSubmitDisabled = false;
      errorProps.isMaxDisabled = false;
    }
    return errorProps;
  }, [toSwap, currentDepositToken.address, balancesByAddress, loadingEstimate]);

  const handleMaxClick = () => {
    if (currentDepositToken.address) {
      const currentTokenBalance = balancesByAddress.get(currentDepositToken.address ?? '');
      if (currentTokenBalance) {
        const max = Number(currentTokenBalance) / 10 ** decimals;
        setToSwap(max.toString());
      }
    }
  };

  function handleSwapChange(value: string) {
    /**  get comet estimate LP token for the inputted swap token and set in mint input  */
    const isWrongDecimals = value.split('.')[1]?.length > decimals;
    if (currentDepositToken.address && !isWrongDecimals) {
      const bigintValue = scaleInputToBigInt(value, decimals);
      const currentDepositTokenBalance =
        balancesByAddress.get(currentDepositToken.address ?? '') || 0;
      if (bigintValue <= currentDepositTokenBalance) {
        backstopMintByDepositTokenAmount(
          {
            depositTokenAddress: currentDepositToken.address,
            depositTokenAmount: bigintValue,
            minLPTokenAmount: BigInt(0),
            user: walletAddress,
          },
          true,
          backstopData?.config.backstopTkn || ''
        ).then((val: bigint | undefined) => {
          setLoadingEstimate(false);
          setToMint(toBalance(val || 0, decimals));
        });
      }
    }
  }

  function handleSubmitTransaction() {
    backstopMintByDepositTokenAmount(
      {
        depositTokenAddress: currentDepositToken.address || '',
        depositTokenAmount: scaleInputToBigInt(toSwap, decimals),
        minLPTokenAmount: BigInt(0),
        user: walletAddress,
      },
      false,
      backstopData?.config.backstopTkn || ''
    );
  }

  function handleSwitchDepositToken() {
    if (currentDepositToken.symbol === 'USDC') {
      setCurrentDepositToken({
        address: backstopData?.config.blndTkn,
        symbol: 'BLND',
      });
    } else {
      setCurrentDepositToken({
        address: backstopData?.config.usdcTkn,
        symbol: 'USDC',
      });
    }
  }

  useEffect(() => {
    if (!balancesByAddress.get(backstopData?.config.usdcTkn ?? '')) {
      loadUserData(walletAddress);
    }
  }, []);
  useEffect(() => {
    handleSwapChange(toSwap);
  }, [currentDepositToken.address]);

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
            Mint pool tokens
          </Typography>
          <Box
            sx={{
              width: '100%',
              height: 'max-content',
              display: 'flex',
              flexDirection: 'row',
              marginBottom: '12px',
              alignItems: 'end',
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: 'max-content',
                display: 'flex',
                flexDirection: 'column',

                gap: '12px',
              }}
            >
              <InputBar
                symbol={currentDepositToken.symbol}
                value={toSwap}
                onValueChange={(v) => {
                  setToSwap(v);
                  setLoadingEstimate(true);
                }}
                onSetMax={handleMaxClick}
                palette={theme.palette.backstop}
                sx={{ width: '100%' }}
                isMaxDisabled={isMaxDisabled}
                showSwitch
                onSwitchClick={handleSwitchDepositToken}
              />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '2px',
                  borderRadius: '5px',
                  height: '38px',
                  backgroundColor: theme.palette.accent.main,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{ color: theme.palette.text.secondary, marginLeft: '12px' }}
                >
                  {loadingEstimate ? 'Loading...' : toMint || 0}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    width: '113px',
                    color: theme.palette.text.secondary,
                    textAlign: 'right',
                    marginRight: '12px',
                  }}
                >
                  BLND-USDC LP
                </Typography>
              </Box>
            </Box>
            <OpaqueButton
              onClick={handleSubmitTransaction}
              palette={theme.palette.backstop}
              sx={{ minWidth: '108px', marginLeft: '12px', padding: '6px', height: 'max-content' }}
              disabled={isSubmitDisabled}
            >
              Mint
            </OpaqueButton>
          </Box>
          <Box sx={{ marginLeft: '12px' }}>
            <Typography variant="h5" sx={{ color: theme.palette.text.secondary }}>
              {`$${toBalance(Number(toMint ?? 0) * (backstopData?.lpTokenPrice ?? 1))}`}
            </Typography>
          </Box>
        </Box>
        <TxOverview isDisabled={isSubmitDisabled} disabledType={disabledType} reason={reason}>
          <Value title="Amount to mint" value={`${toMint ?? '0'} BLND-USDC LP`} />
          <ValueChange
            title="Your total mint"
            curValue={`${toBalance(userLPBalance)} BLND-USDC LP`}
            newValue={`${toBalance(userLPBalance + Number(toMint ?? '0'))} BLND-USDC LP`}
          />
        </TxOverview>
      </Section>
    </Row>
  );
};
