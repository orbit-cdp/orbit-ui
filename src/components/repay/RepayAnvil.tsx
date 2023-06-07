import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import { Box, Typography, useTheme } from '@mui/material';
import { useState } from 'react';
import { Address, Contract } from 'soroban-client';
import { useWallet } from '../../contexts/wallet';
import { useStore } from '../../store/store';
import { toBalance, toPercentage } from '../../utils/formatter';
import { fromInputStringToScVal } from '../../utils/scval';
import { InputBar } from '../common/InputBar';
import { OpaqueButton } from '../common/OpaqueButton';
import { ReserveComponentProps } from '../common/ReserveComponentProps';
import { Row } from '../common/Row';
import { Section, SectionSize } from '../common/Section';
import { Value } from '../common/Value';
import { ValueChange } from '../common/ValueChange';

export const RepayAnvil: React.FC<ReserveComponentProps> = ({ poolId, assetId }) => {
  const theme = useTheme();
  const { connected, walletAddress, submitTransaction } = useWallet();

  const reserve = useStore((state) => state.reserves.get(poolId)?.get(assetId));
  const prices = useStore((state) => state.poolPrices.get(poolId));
  const user_est = useStore((state) => state.user_est.get(poolId));
  const user_bal_est = useStore((state) => state.user_bal_est.get(poolId)?.get(assetId));

  const symbol = reserve?.symbol ?? '';
  const liability_factor = Number(reserve?.config.c_factor) / 1e7;
  const assetToBase = prices?.get(assetId) ?? 1;

  const [toRepay, setToRepay] = useState<string | undefined>(undefined);
  const [newEffectiveLiabilities, setNewEffectiveLiabilities] = useState<number>(
    user_est?.e_liabilities_base ?? 0
  );

  const oldBorrowCap = user_est
    ? user_est.e_collateral_base - user_est.e_liabilities_base
    : undefined;
  const oldBorrowLimit = user_est
    ? user_est.e_liabilities_base / user_est.e_collateral_base
    : undefined;
  const borrowCap = user_est ? user_est.e_collateral_base - newEffectiveLiabilities : undefined;
  const borrowLimit = user_est ? newEffectiveLiabilities / user_est.e_collateral_base : undefined;

  const handleRepayAmountChange = (repayInput: string) => {
    if (/^[0-9]*\.?[0-9]{0,7}$/.test(repayInput) && user_est && user_bal_est) {
      let num_repay = Number(repayInput);
      let repay_base = (num_repay * assetToBase) / liability_factor;
      let tempNewLiabilities = user_est.e_liabilities_base - repay_base;
      if (num_repay <= user_bal_est.asset) {
        setToRepay(repayInput);
        setNewEffectiveLiabilities(tempNewLiabilities);
      }
    }
  };

  const handleRepayMax = () => {
    if (user_bal_est) {
      let maxRepay = Math.min(user_bal_est.asset, user_bal_est.borrowed);
      handleRepayAmountChange(maxRepay.toFixed(7));
    }
  };

  const handleSubmitTransaction = () => {
    // TODO: Revalidate?
    if (toRepay && connected) {
      let user_scval = new Address(walletAddress).toScVal();
      let repay_op = new Contract(poolId).call(
        'repay',
        user_scval,
        Address.contract(Buffer.from(assetId, 'hex')).toScVal(),
        fromInputStringToScVal(toRepay),
        user_scval
      );
      submitTransaction(repay_op);
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
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
          }}
        >
          <Typography variant="body2" sx={{ marginLeft: '12px', marginBottom: '12px' }}>
            Amount to repay
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
              value={toRepay}
              onValueChange={handleRepayAmountChange}
              onSetMax={handleRepayMax}
              palette={theme.palette.borrow}
              sx={{ width: '100%' }}
            />
            <OpaqueButton
              onClick={handleSubmitTransaction}
              palette={theme.palette.borrow}
              sx={{ minWidth: '108px', marginLeft: '12px', padding: '6px' }}
            >
              Repay
            </OpaqueButton>
          </Box>
          <Box sx={{ marginLeft: '12px' }}>
            <Typography variant="h5" sx={{ color: theme.palette.text.secondary }}>
              {`$${toBalance(Number(toRepay ?? 0) * assetToBase)}`}
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
            borderRadius: '5px',
          }}
        >
          <Typography
            variant="h5"
            sx={{ marginLeft: '24px', marginBottom: '12px', marginTop: '12px' }}
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
          <Value title="Amount to repay" value={`${toRepay ?? '0'} ${symbol}`} />
          <ValueChange
            title="Your total borrowed"
            curValue={`${toBalance(user_bal_est?.borrowed)} ${symbol}`}
            newValue={`${toBalance((user_bal_est?.borrowed ?? 0) - Number(toRepay))} ${symbol}`}
          />
          <ValueChange
            title="Borrow capacity"
            curValue={`$${toBalance(oldBorrowCap)}`}
            newValue={`$${toBalance(borrowCap)}`}
          />
          <ValueChange
            title="Borrow limit"
            curValue={toPercentage(Number.isFinite(oldBorrowLimit) ? oldBorrowLimit : 0)}
            newValue={toPercentage(Number.isFinite(borrowLimit) ? borrowLimit : 0)}
          />
        </Box>
      </Section>
    </Row>
  );
};
