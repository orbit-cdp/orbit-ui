import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import { Box, Typography, useTheme } from '@mui/material';
import { useState } from 'react';
import { xdr } from 'soroban-client';
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
  const { connected, walletAddress, submitTransaction } = useWallet();

  const backstopContract = useStore((state) => state.backstopContract);
  const backstopPoolBalance = useStore((state) => state.poolBackstopBalance.get(poolId));
  const backstopDeposit = useStore((state) => state.shares.get(poolId));
  const backstopWalletBalance = useStore((state) => state.backstopTokenBalance);
  const backstopTokenToBaseRaw = useStore((state) => state.backstopTokenPrice);
  const backstopTokenToBase = Number(backstopTokenToBaseRaw) / 1e7;
  const shareRate = backstopPoolBalance
    ? Number(backstopPoolBalance.tokens) / Number(backstopPoolBalance.shares)
    : 1;
  const depositBalance = (Number(backstopDeposit ?? 0) / 1e7) * shareRate;

  const [toDeposit, setToDeposit] = useState<string | undefined>(undefined);

  const handleDepositAmountChange = (depositInput: string) => {
    if (/^[0-9]*\.?[0-9]{0,7}$/.test(depositInput) && backstopDeposit != undefined) {
      let num_deposit = Number(depositInput);
      let num_wallet_balance = Number(backstopWalletBalance) / 1e7;
      if (num_deposit <= num_wallet_balance) {
        setToDeposit(depositInput);
      }
    }
  };

  const handleDepositMax = () => {
    if (backstopDeposit) {
      let walletBalance = Number(backstopWalletBalance) / 1e7;
      setToDeposit(walletBalance.toFixed(7));
    }
  };

  const handleSubmitTransaction = () => {
    // TODO: Revalidate?
    if (toDeposit && connected) {
      let deposit_op = xdr.Operation.fromXDR(backstopContract.deposit({from: walletAddress, pool_address: poolId, amount: scaleInputToBigInt(toDeposit)}), "base64");
      submitTransaction(deposit_op);
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
              onValueChange={handleDepositAmountChange}
              onSetMax={handleDepositMax}
              palette={theme.palette.backstop}
              sx={{ width: '100%' }}
            />
            <OpaqueButton
              onClick={handleSubmitTransaction}
              palette={theme.palette.backstop}
              sx={{ minWidth: '108px', marginLeft: '12px', padding: '6px' }}
            >
              Deposit
            </OpaqueButton>
          </Box>
          <Box sx={{ marginLeft: '12px' }}>
            <Typography variant="h5" sx={{ color: theme.palette.text.secondary }}>
              {`$${toBalance(Number(toDeposit ?? 0) * backstopTokenToBase)}`}
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
          <Typography
            variant="h5"
            sx={{ marginLeft: '12px', marginBottom: '12px', marginTop: '12px' }}
          >
            Transaction Overview
          </Typography>
          <Box
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
          </Box>
          <Value title="Amount to deposit" value={`${toDeposit ?? '0'} BLND-USDC LP`} />
          <ValueChange
            title="Your total deposit"
            curValue={`${toBalance(depositBalance)} BLND-USDC LP`}
            newValue={`${toBalance(depositBalance + Number(toDeposit ?? '0'))} BLND-USDC LP`}
          />
        </Box>
      </Section>
    </Row>
  );
};
