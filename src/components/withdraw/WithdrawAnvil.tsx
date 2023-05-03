import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import { Box, Typography, useTheme } from '@mui/material';
import { useState } from 'react';
import { Address, Contract, xdr } from 'soroban-client';
import { useWallet } from '../../contexts/wallet';
import { useStore } from '../../store/store';
import { toBalance, toPercentage } from '../../utils/formatter';
import { fromInputStringToScVal } from '../../utils/scval';
import { InputBar } from '../common/InputBar';
import { OpaqueButton } from '../common/OpaqueButton';
import { ReserveComponentProps } from '../common/ReserveComponentProps';
import { Row } from '../common/Row';
import { Section, SectionSize } from '../common/Section';
import { ValueChange } from '../common/ValueChange';

export const WithdrawAnvil: React.FC<ReserveComponentProps> = ({ poolId, assetId }) => {
  const theme = useTheme();
  const { submitTransaction } = useWallet();

  const reserve = useStore((state) => state.reserves.get(poolId)?.get(assetId));
  const prices = useStore((state) => state.poolPrices.get(poolId));
  const user_est = useStore((state) => state.user_est.get(poolId));
  const user_bal_est = useStore((state) => state.user_bal_est.get(poolId)?.get(assetId));

  const assetToBase = prices?.get(assetId) ?? 1;

  const [toWithdraw, setToWithdraw] = useState<string | undefined>(undefined);
  const [newEffectiveCollateral, setNewEffectiveCollateral] = useState<number>(
    user_est?.e_collateral_base ?? 0
  );

  const oldBorrowCap = user_est
    ? user_est.e_collateral_base - user_est.e_liabilities_base
    : undefined;
  const oldBorrowLimit = user_est
    ? user_est.e_liabilities_base / user_est.e_collateral_base
    : undefined;
  const borrowCap = user_est ? newEffectiveCollateral - user_est.e_liabilities_base : undefined;
  const borrowLimit = user_est ? user_est.e_liabilities_base / newEffectiveCollateral : undefined;

  const handleWithdrawAmountChange = (withdrawInput: string) => {
    if (/^[0-9]*\.?[0-9]{0,7}$/.test(withdrawInput) && user_est && user_bal_est) {
      let num_withdraw = Number(withdrawInput);
      let withdraw_base = num_withdraw * assetToBase * (Number(reserve?.config.c_factor) / 1e7);
      let tempEffectiveCollateral = user_est.e_collateral_base - withdraw_base;
      if (
        tempEffectiveCollateral > user_est.e_liabilities_base * 1.02 &&
        num_withdraw <= user_bal_est.supplied
      ) {
        setToWithdraw(withdrawInput);
        setNewEffectiveCollateral(tempEffectiveCollateral);
      }
    }
  };

  const handleWithdrawMax = () => {
    if (user_est) {
      let to_bounded_hf = user_est.e_collateral_base - user_est.e_liabilities_base * 1.021;
      let to_wd = to_bounded_hf / (assetToBase * (Number(reserve?.config.c_factor) / 1e7));
      handleWithdrawAmountChange(to_wd.toFixed(7));
    }
  };

  const handleSubmitTransaction = () => {
    // TODO: Revalidate?
    if (toWithdraw) {
      let user_scval = new Address(
        'GA5XD47THVXOJFNSQTOYBIO42EVGY5NF62YUAZJNHOQFWZZ2EEITVI5K'
      ).toScVal();
      let withdraw_op = new Contract(poolId).call(
        'withdraw',
        user_scval,
        xdr.ScVal.scvBytes(Buffer.from(assetId, 'hex')),
        fromInputStringToScVal(toWithdraw),
        user_scval
      );
      console.log('withdraw op xdr: ', withdraw_op.toXDR().toString('base64'));
      submitTransaction();
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
              palette={theme.palette.lend}
              sx={{ width: '100%' }}
            />
            <OpaqueButton
              onClick={handleSubmitTransaction}
              palette={theme.palette.lend}
              sx={{ minWidth: '108px', marginLeft: '12px', padding: '6px' }}
            >
              Withdraw
            </OpaqueButton>
          </Box>
          <Box sx={{ marginLeft: '12px' }}>
            <Typography variant="h5" sx={{ color: theme.palette.text.secondary }}>
              {`$${toBalance(Number(toWithdraw ?? 0) * assetToBase)}`}
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
          curValue={`$${toBalance(oldBorrowCap)}`}
          newValue={`$${toBalance(borrowCap)}`}
        />
        <ValueChange
          title="Borrow limit"
          curValue={toPercentage(oldBorrowLimit)}
          newValue={toPercentage(borrowLimit)}
        />
      </Section>
    </Row>
  );
};
