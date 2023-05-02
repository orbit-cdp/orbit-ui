import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import { Box, Typography, useTheme } from '@mui/material';
import { useState } from 'react';
import { useStore } from '../../store/store';
import { toBalance, toPercentage } from '../../utils/formatter';
import { InputBar } from '../common/InputBar';
import { OpaqueButton } from '../common/OpaqueButton';
import { ReserveComponentProps } from '../common/ReserveComponentProps';
import { Row } from '../common/Row';
import { Section, SectionSize } from '../common/Section';
import { ValueChange } from '../common/ValueChange';

export const WithdrawAnvil: React.FC<ReserveComponentProps> = ({ poolId, assetId }) => {
  const theme = useTheme();

  const reserve = useStore((state) => state.reserves.get(poolId)?.get(assetId));
  const prices = useStore((state) => state.poolPrices.get(poolId));
  const user_est = useStore((state) => state.user_est.get(poolId));
  const user_bal_est = useStore((state) => state.user_bal_est.get(poolId)?.get(assetId));

  const assetToBase = prices?.get(assetId) ?? 1;
  const curBorrowCap = user_est?.borrow_capacity_base ?? 0;
  const curBorrowLimit = user_est
    ? user_est.borrow_capacity_base / user_est.total_borrowed_base
    : 0;

  const [toWithdraw, setToWithdraw] = useState<string>('0');
  const [newBorrowCap, setNewBorrowCap] = useState<number>(curBorrowCap);
  const [newBorrowLimit, setNewBorrowLimit] = useState<number>(curBorrowLimit);

  const handleWithdrawAmountChange = (withdrawInput: string) => {
    if (/^[0-9]*\.?[0-9]{0,7}$/.test(withdrawInput)) {
      let num_withdraw = Number(withdrawInput);
      let withdraw_base = num_withdraw * assetToBase * (Number(reserve?.config.c_factor) / 1e7);
      let tempNewBorrowCap = curBorrowCap - withdraw_base;
      let tempNewBorrowLimit = user_est ? tempNewBorrowCap / user_est.total_borrowed_base : 0;
      if (tempNewBorrowCap > 0 && num_withdraw <= (user_bal_est?.supplied ?? 0)) {
        setToWithdraw(withdrawInput);
        setNewBorrowCap(tempNewBorrowCap);
        setNewBorrowLimit(tempNewBorrowLimit);
      }
    }
  };

  const handleWithdrawMax = () => {
    setToWithdraw('999999999');
  };

  return (
    <Row>
      <Section
        width={SectionSize.FULL}
        sx={{ padding: '0px', display: 'flex', flexDirection: 'column' }}
      >
        <Box
          sx={{
            background: theme.palette.lend.opaque,
            width: '100%',
            borderRadius: '5px',
            padding: '12px',
            marginBottom: '12px',
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
          }}
        >
          <Typography variant="body2" sx={{ marginLeft: '12px', marginBottom: '12px' }}>
            Amount to withdraw
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
              symbol={reserve?.symbol ?? ''}
              value={toWithdraw}
              onValueChange={handleWithdrawAmountChange}
              onSetMax={handleWithdrawMax}
              palette={theme.palette.borrow}
              sx={{ width: '100%' }}
            />
            <OpaqueButton
              palette={theme.palette.lend}
              sx={{ minWidth: '108px', marginLeft: '12px', padding: '6px' }}
            >
              Withdraw
            </OpaqueButton>
          </Box>
          <Box sx={{ marginLeft: '12px' }}>
            <Typography variant="h5" sx={{ color: theme.palette.text.secondary }}>
              $100.00
            </Typography>
          </Box>
        </Box>
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
          <Typography variant="h5" sx={{ color: theme.palette.text.secondary, marginRight: '6px' }}>
            $1.88
          </Typography>
          <HelpOutlineIcon fontSize="inherit" sx={{ color: theme.palette.text.secondary }} />
        </Box>
        <ValueChange
          title="Borrow capacity"
          curValue={`$${toBalance(curBorrowCap)}`}
          newValue={`$${toBalance(newBorrowCap)}`}
        />
        <ValueChange
          title="Borrow limit"
          curValue={toPercentage(curBorrowLimit)}
          newValue={toPercentage(newBorrowLimit)}
        />
      </Section>
    </Row>
  );
};
