import { PoolBackstopActionArgs } from '@blend-capital/blend-sdk';
import { Alert, Box, Typography, useTheme } from '@mui/material';
import { useState } from 'react';
import { useWallet } from '../../contexts/wallet';
import { useStore } from '../../store/store';
import { toBalance } from '../../utils/formatter';
import { scaleInputToBigInt } from '../../utils/scval';
import { InputBar } from '../common/InputBar';
import { OpaqueButton } from '../common/OpaqueButton';
import { PoolComponentProps } from '../common/PoolComponentProps';
import { Row } from '../common/Row';
import { Section, SectionSize } from '../common/Section';
import { Value } from '../common/Value';
import { ValueChange } from '../common/ValueChange';

export const BackstopDepositAnvil: React.FC<PoolComponentProps> = ({ poolId }) => {
  const theme = useTheme();
  const { connected, walletAddress, backstopDeposit } = useWallet();

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

  const isDepositDisabled =
    !userBalance || !toDeposit || !(Number(toDeposit) > 0) || Number(toDeposit) > userBalance;
  const isMaxDisabled = !userBalance;
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
              disabled={isDepositDisabled}
            >
              Deposit
            </OpaqueButton>
          </Box>
          <Box sx={{ marginLeft: '12px' }}>
            <Typography variant="h5" sx={{ color: theme.palette.text.secondary }}>
              {/* TODO calculate lp price*/}
              {`$${toBalance((Number(toDeposit ?? 0) * Number(0.75e7)) / 1e7)}`}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: theme.palette.background.paper,
            zIndex: 12,
          }}
        >
          {!isDepositDisabled && (
            <>
              <Typography
                variant="h5"
                sx={{ marginLeft: '12px', marginBottom: '12px', marginTop: '12px' }}
              >
                Transaction Overview
              </Typography>
              {/* <Box
            sx={{
              marginLeft: '24px',
              marginBottom: '12px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <LocalGasStationIcon
              fontSize="inherit"
              sx={{ color: theme.palette.text.secondary, marginRight: '6px' }}
            />
            <Typography
              variant="h5"
              sx={{ color: theme.palette.text.secondary, marginRight: '6px' }}
            >
              $1.88
            </Typography>
            <HelpOutlineIcon fontSize="inherit" sx={{ color: theme.palette.text.secondary }} />
          </Box> */}
              <Value title="Amount to deposit" value={`${toDeposit ?? '0'} BLND-USDC LP`} />
              <ValueChange
                title="Your total deposit"
                curValue={`${toBalance(curDeposit)} BLND-USDC LP`}
                newValue={`${toBalance(curDeposit + Number(toDeposit ?? '0'))} BLND-USDC LP`}
              />
            </>
          )}
          {isDepositDisabled && (
            <>
              {Number(toDeposit) > userBalance && (
                <Alert severity="error">
                  <Typography variant="body2">Input larger than balance</Typography>
                </Alert>
              )}
            </>
          )}
        </Box>
      </Section>
    </Row>
  );
};
