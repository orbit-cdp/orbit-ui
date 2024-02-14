import { Box, Typography, useTheme } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { TxStatus, useWallet } from '../../contexts/wallet';
import { useDebouncedState } from '../../hooks/debounce';
import { useStore } from '../../store/store';
import { toBalance } from '../../utils/formatter';
import { scaleInputToBigInt } from '../../utils/scval';
import { InputBar } from '../common/InputBar';
import { OpaqueButton } from '../common/OpaqueButton';
import { PoolComponentProps } from '../common/PoolComponentProps';
import { Row } from '../common/Row';
import { Section, SectionSize } from '../common/Section';
import { SubmitError, TxOverview } from '../common/TxOverview';
import { Value } from '../common/Value';
import { ValueChange } from '../common/ValueChange';

export const BackstopMintAnvil: React.FC<PoolComponentProps> = ({ poolId }) => {
  const [toMint, setToMint] = useState<string>('');

  const [toSwap, setToSwap] = useState<string>('');
  useDebouncedState(toSwap, 500, handleSwapChange);
  const theme = useTheme();
  const { connected, walletAddress, txStatus, backstopMintByDepositTokenAmount } = useWallet();
  const backstopData = useStore((state) => state.backstop);

  const [currentDepositToken, setCurrentDepositToken] = useState<{
    address: string | undefined;
    symbol: string;
  }>({ address: backstopData?.config.usdcTkn, symbol: 'USDC' });
  const backstopPoolData = useStore((state) => state.backstop?.pools?.get(poolId));
  const userBackstopData = useStore((state) => state.backstopUserData);
  const userPoolBackstopBalance = userBackstopData?.balances.get(poolId);

  const userBalance = Number(userBackstopData?.tokens ?? BigInt(0)) / 1e7;
  const decimals = 7;
  const curmint =
    userPoolBackstopBalance && backstopPoolData
      ? (Number(userPoolBackstopBalance.shares) / 1e7) *
        (Number(backstopPoolData.poolBalance.tokens) / Number(backstopPoolData.poolBalance.shares))
      : 0;

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
    if (userBalance <= 0 && txStatus !== TxStatus.SUCCESS) {
      errorProps.isSubmitDisabled = true;
      errorProps.isMaxDisabled = true;
      errorProps.reason = 'You do not have any available balance to mint.';
      errorProps.disabledType = 'warning';
    } else if (!toMint) {
      errorProps.isSubmitDisabled = true;
      errorProps.isMaxDisabled = false;
      errorProps.reason = 'Please enter an amount to mint.';
      errorProps.disabledType = 'info';
    } else if (Number(toMint) > userBalance) {
      errorProps.isSubmitDisabled = true;
      errorProps.isMaxDisabled = false;
      errorProps.reason = 'You do not have enough available balance to mint.';
      errorProps.disabledType = 'warning';
    } else if (toMint.split('.')[1]?.length > decimals) {
      errorProps.isSubmitDisabled = true;
      errorProps.isMaxDisabled = false;
      errorProps.reason = `You cannot supply more than ${decimals} decimal places.`;
      errorProps.disabledType = 'warning';
    } else {
      errorProps.isSubmitDisabled = false;
      errorProps.isMaxDisabled = false;
    }
    return errorProps;
  }, [toMint, userBalance]);

  const handleMaxClick = () => {
    /** @todo get comet LP estimate based on user balance and set in inputs */
  };

  function handleSwapChange(value: string) {
    /**  get comet estimate LP token for the inputted swap token and set in mint input  */
    if (currentDepositToken.address) {
      backstopMintByDepositTokenAmount(
        {
          depositTokenAddress: currentDepositToken.address,
          depositTokenAmount: scaleInputToBigInt(value, 7),
          minLPTokenAmount: BigInt(0),
          user: walletAddress,
        },
        true
      ).then((val: bigint | undefined) => {
        if (val) {
          setToMint(toBalance(val, 7));
        }
      });
    }
  }

  function handleSubmitTransaction() {
    /** @todo handle comet provide liquidty */
    backstopMintByDepositTokenAmount(
      {
        depositTokenAddress: backstopData?.config.usdcTkn || '',
        depositTokenAmount: scaleInputToBigInt(toSwap, 7),
        minLPTokenAmount: BigInt(0),
        user: walletAddress,
      },
      false
    ).then((val) => {
      console.log({ val });
    });
  }

  function handleSwitchDepositToken() {
    console.log({ currentDepositToken });
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
    /**@todo load data from comet  */
  }, []);
  useEffect(() => {
    /**@todo load data from comet  */
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
                onValueChange={setToSwap}
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
                  {toMint || 0}
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
            curValue={`${toBalance(curmint)} BLND-USDC LP`}
            newValue={`${toBalance(curmint + Number(toMint ?? '0'))} BLND-USDC LP`}
          />
        </TxOverview>
      </Section>
    </Row>
  );
};
