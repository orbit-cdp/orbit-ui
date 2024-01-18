import { PoolBackstopActionArgs } from '@blend-capital/blend-sdk';
import { Box, Typography, useTheme } from '@mui/material';
import { useMemo, useState } from 'react';
import { useWallet } from '../../contexts/wallet';
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

export const BackstopDepositAnvil: React.FC<PoolComponentProps> = ({ poolId }) => {
  const theme = useTheme();
  const { connected, walletAddress, backstopDeposit } = useWallet();

  const backstopData = useStore((state) => state.backstop);
  const backstopPoolData = useStore((state) => state.backstop?.pools?.get(poolId));
  const userBackstopData = useStore((state) => state.backstopUserData);
  const userPoolBackstopBalance = userBackstopData?.balances.get(poolId);

  const userBalance = Number(userBackstopData?.tokens ?? BigInt(0)) / 1e7;

  const curDeposit =
    userPoolBackstopBalance && backstopPoolData
      ? (Number(userPoolBackstopBalance.shares) / 1e7) *
        (Number(backstopPoolData.poolBalance.tokens) / Number(backstopPoolData.poolBalance.shares))
      : 0;

  const [toDeposit, setToDeposit] = useState<string | undefined>(undefined);
  // verify that the user can act
  const { isSubmitDisabled, isMaxDisabled, reason, disabledType } = useMemo(() => {
    const errorProps: SubmitError = {
      isSubmitDisabled: false,
      isMaxDisabled: false,
      reason: undefined,
      disabledType: undefined,
    };
    if (userBalance <= 0) {
      errorProps.isSubmitDisabled = true;
      errorProps.isMaxDisabled = true;
      errorProps.reason = 'You do not have any available balance to deposit.';
      errorProps.disabledType = 'warning';
    } else if (!toDeposit) {
      errorProps.isSubmitDisabled = true;
      errorProps.isMaxDisabled = false;
      errorProps.reason = 'Please enter an amount to deposit.';
      errorProps.disabledType = 'info';
    } else if (Number(toDeposit) > userBalance) {
      errorProps.isSubmitDisabled = true;
      errorProps.isMaxDisabled = false;
      errorProps.reason = 'You do not have enough available balance to deposit.';
      errorProps.disabledType = 'warning';
    } else {
      errorProps.isSubmitDisabled = false;
      errorProps.isMaxDisabled = false;
    }
    return errorProps;
  }, [toDeposit, userBalance]);

  const handleDepositMax = () => {
    if (userBackstopData) {
      setToDeposit(userBalance.toFixed(7));
    }
  };

  const handleSubmitTransaction = async () => {
    if (toDeposit && connected) {
      let depositArgs: PoolBackstopActionArgs = {
        from: walletAddress,
        pool_address: poolId,
        amount: scaleInputToBigInt(toDeposit, 7),
      };
      await backstopDeposit(depositArgs, false);
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
              flexDirection: 'row',
              marginBottom: '12px',
            }}
          >
            <InputBar
              symbol={'BLND-USDC LP'}
              value={toDeposit}
              onValueChange={setToDeposit}
              onSetMax={handleDepositMax}
              palette={theme.palette.backstop}
              sx={{ width: '100%' }}
              isMaxDisabled={isMaxDisabled}
            />
            <OpaqueButton
              onClick={handleSubmitTransaction}
              palette={theme.palette.backstop}
              sx={{ minWidth: '108px', marginLeft: '12px', padding: '6px' }}
              disabled={isSubmitDisabled}
            >
              Deposit
            </OpaqueButton>
          </Box>
          <Box sx={{ marginLeft: '12px' }}>
            <Typography variant="h5" sx={{ color: theme.palette.text.secondary }}>
              {`$${toBalance(Number(toDeposit ?? 0) * (backstopData?.lpTokenPrice ?? 1))}`}
            </Typography>
          </Box>
        </Box>
        <TxOverview isDisabled={isSubmitDisabled} disabledType={disabledType} reason={reason}>
          <Value title="Amount to deposit" value={`${toDeposit ?? '0'} BLND-USDC LP`} />
          <ValueChange
            title="Your total deposit"
            curValue={`${toBalance(curDeposit)} BLND-USDC LP`}
            newValue={`${toBalance(curDeposit + Number(toDeposit ?? '0'))} BLND-USDC LP`}
          />
        </TxOverview>
      </Section>
    </Row>
  );
};
