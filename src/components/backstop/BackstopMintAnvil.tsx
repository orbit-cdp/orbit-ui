import { Box, Typography, useTheme } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { TxStatus, useWallet } from '../../contexts/wallet';
import { useStore } from '../../store/store';
import { toBalance } from '../../utils/formatter';
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
  const theme = useTheme();
  const { connected, walletAddress, backstopDeposit, txStatus } = useWallet();

  const backstopData = useStore((state) => state.backstop);
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

  const handlemintMax = () => {
    /** @todo get comet LP estimate based on user balance and set in inputs */
  };

  function handleMintChange(value: string) {
    /** @todo get comet estimate used swap token for the desired amount of LP token and set in swap input */
  }

  function handleSwapChange(value: string) {
    /** @todo get comet estimate LP token for the inputted swap token and set in mint input  */
  }

  const handleSubmitTransaction = async () => {
    /** @todo handle comet provide liquidty */
  };

  useEffect(() => {
    /**@todo load data from comet  */
  }, []);

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
                symbol={'BLND-USDC LP'}
                value={toMint}
                onValueChange={handleMintChange}
                onSetMax={handlemintMax}
                palette={theme.palette.backstop}
                sx={{ width: '100%' }}
                isMaxDisabled={isMaxDisabled}
              />
              <InputBar
                symbol={'USDC'}
                value={toSwap}
                onValueChange={handleSwapChange}
                onSetMax={handlemintMax}
                palette={theme.palette.backstop}
                sx={{ width: '100%' }}
                isMaxDisabled={isMaxDisabled}
              />
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
            curValue={`${toBalance(curmint)} BLND-USDC LP`}
            newValue={`${toBalance(curmint + Number(toMint ?? '0'))} BLND-USDC LP`}
          />
        </TxOverview>
      </Section>
    </Row>
  );
};
