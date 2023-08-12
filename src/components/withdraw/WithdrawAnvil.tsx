import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import { Box, Typography, useTheme } from '@mui/material';
import { Pool } from 'blend-sdk';
import { useState } from 'react';
import { xdr } from 'soroban-client';
import { useWallet } from '../../contexts/wallet';
import { useStore } from '../../store/store';
import { toBalance, toPercentage } from '../../utils/formatter';
import { scaleInputToBigInt } from '../../utils/scval';
import { InputBar } from '../common/InputBar';
import { OpaqueButton } from '../common/OpaqueButton';
import { ReserveComponentProps } from '../common/ReserveComponentProps';
import { Row } from '../common/Row';
import { Section, SectionSize } from '../common/Section';
import { Value } from '../common/Value';
import { ValueChange } from '../common/ValueChange';

export const WithdrawAnvil: React.FC<ReserveComponentProps> = ({ poolId, assetId }) => {
  const theme = useTheme();
  const { connected, walletAddress, submitTransaction } = useWallet();

  const reserve = useStore((state) => state.poolData.get(poolId)?.reserves.get(assetId));
  const assetToBase = useStore((state) => state.poolData.get(poolId))?.poolPrices.get(assetId) ?? 1;
  const user_est = useStore((state) => state.pool_user_est.get(poolId));
  const user_bal_est = useStore((state) =>
    state.pool_user_est.get(poolId)?.reserve_estimates.get(assetId)
  );
  const loadPoolData = useStore((state) => state.loadPoolData);
  const [toWithdraw, setToWithdraw] = useState<string | undefined>(undefined);
  const [newEffectiveCollateral, setNewEffectiveCollateral] = useState<number>(
    user_est?.e_collateral_base ?? 0
  );

  const symbol = reserve?.symbol ?? '';
  const oldBorrowCap = user_est
    ? user_est.e_collateral_base - user_est.e_liabilities_base
    : undefined;
  const oldBorrowLimit = user_est
    ? user_est.e_liabilities_base / user_est.e_collateral_base
    : undefined;
  const borrowCap = user_est ? newEffectiveCollateral - user_est.e_liabilities_base : undefined;
  const borrowLimit = user_est ? user_est.e_liabilities_base / newEffectiveCollateral : undefined;

  const handleWithdrawAmountChange = (withdrawInput: string) => {
    if (/^[0-9]*\.?[0-9]{0,10}$/.test(withdrawInput) && user_est && user_bal_est) {
      let num_withdraw = Number(withdrawInput);
      let withdraw_base = num_withdraw * assetToBase * (Number(reserve?.config.c_factor) / 1e7);
      let tempEffectiveCollateral = user_est.e_collateral_base - withdraw_base;
      if (
        tempEffectiveCollateral >=
        user_est.e_liabilities_base * 1.02
        // num_withdraw <= user_bal_est.supplied
      ) {
        console.log(withdrawInput);
        setToWithdraw(withdrawInput);
        setNewEffectiveCollateral(tempEffectiveCollateral);
      }
    }
  };

  const handleWithdrawMax = () => {
    if (user_est && user_bal_est) {
      let to_bounded_hf = user_est.e_collateral_base - user_est.e_liabilities_base * 1.021;
      let to_wd = to_bounded_hf / (assetToBase * (Number(reserve?.config.c_factor) / 1e7));
      let withdrawAmount = Math.min(to_wd, user_bal_est.supplied) + 1;
      console.log(withdrawAmount);
      handleWithdrawAmountChange(withdrawAmount.toFixed(7));
    }
  };

  const handleSubmitTransaction = async () => {
    // TODO: Revalidate?
    if (toWithdraw && connected && reserve) {
      let pool = new Pool.PoolOpBuilder(poolId);
      let withdraw_op = xdr.Operation.fromXDR(
        pool.submit({
          from: walletAddress,
          spender: walletAddress,
          to: walletAddress,
          requests: [
            {
              amount: scaleInputToBigInt(toWithdraw, reserve.config.decimals),
              request_type: 3,
              address: reserve.asset_id,
            },
          ],
        }),
        'base64'
      );
      await submitTransaction(withdraw_op);
      await loadPoolData(poolId, walletAddress, true);
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
          <Value title="Amount to withdraw" value={`${toWithdraw ?? '0'} ${symbol}`} />
          <ValueChange
            title="Your total supplied"
            curValue={`${toBalance(user_bal_est?.supplied)} ${symbol}`}
            newValue={`${toBalance(
              (user_bal_est?.supplied ?? 0) - Number(toWithdraw ?? '0')
            )} ${symbol}`}
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
