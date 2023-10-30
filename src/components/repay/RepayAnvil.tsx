import { SubmitArgs } from '@blend-capital/blend-sdk';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import { Box, Typography, useTheme } from '@mui/material';
import { useState } from 'react';
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

export const RepayAnvil: React.FC<ReserveComponentProps> = ({ poolId, assetId }) => {
  const theme = useTheme();
  const { connected, walletAddress, poolSubmit } = useWallet();

  const reserve = useStore((state) =>
    state.poolData.get(poolId)?.reserves.find((reserve) => reserve.assetId == assetId)
  );
  const assetToBase = useStore((state) => state.poolData.get(poolId))?.poolPrices.get(assetId) ?? 1;
  const user_est = useStore((state) => state.pool_user_est.get(poolId));
  const user_bal_est = useStore((state) =>
    state.pool_user_est.get(poolId)?.reserve_estimates.get(assetId)
  );
  const loadPoolData = useStore((state) => state.loadPoolData);
  const reserve_est = useStore((state) =>
    state.pool_est.get(poolId)?.reserve_est?.find((res) => res.id === assetId)
  );
  const [toRepay, setToRepay] = useState<string | undefined>(undefined);

  const [newEffectiveLiabilities, setNewEffectiveLiabilities] = useState<number>(
    user_est?.e_liabilities_base ?? 0
  );

  const decimals = reserve?.config.decimals ?? 7;
  const symbol = reserve?.symbol ?? '';
  const oldBorrowCap = user_est
    ? user_est.e_collateral_base - user_est.e_liabilities_base
    : undefined;
  const oldBorrowLimit = user_est
    ? user_est.e_liabilities_base / user_est.e_collateral_base
    : undefined;
  const borrowCap = user_est ? user_est.e_collateral_base - newEffectiveLiabilities : undefined;
  const borrowLimit = user_est ? newEffectiveLiabilities / user_est.e_collateral_base : undefined;

  const handleRepayAmountChange = (repayInput: string) => {
    let regex = new RegExp(`^[0-9]*\.?[0-9]{0,${decimals}}$`);
    if (regex.test(repayInput) && user_est && user_bal_est) {
      let num_repay = Number(repayInput);
      //TODO: check if setting 0 in the case that reserve_est is undefined is ok
      let repay_base = reserve_est ? (num_repay * assetToBase) / reserve_est.l_factor : 0;
      let tempNewLiabilities = user_est.e_liabilities_base - repay_base;
      if (num_repay <= user_bal_est.asset * 1.1) {
        setToRepay(repayInput);
        setNewEffectiveLiabilities(tempNewLiabilities);
      }
    }
  };

  const handleRepayMax = () => {
    if (user_bal_est) {
      let maxRepay =
        user_bal_est.asset < user_bal_est.borrowed
          ? user_bal_est.asset
          : user_bal_est.borrowed * 1.0001;
      handleRepayAmountChange(maxRepay.toFixed(decimals));
    }
  };

  const handleSubmitTransaction = async () => {
    if (toRepay && connected && reserve) {
      let submitArgs: SubmitArgs = {
        from: walletAddress,
        to: walletAddress,
        spender: walletAddress,
        requests: [
          {
            amount: scaleInputToBigInt(toRepay, decimals),
            request_type: 5,
            address: reserve.assetId,
          },
        ],
      };
      await poolSubmit(poolId, submitArgs, false);
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
              {`$${toBalance(Number(toRepay ?? 0) * assetToBase, decimals)}`}
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
            curValue={`${toBalance(user_bal_est?.borrowed, decimals)} ${symbol}`}
            newValue={`${toBalance(
              (user_bal_est?.borrowed ?? 0) - Number(toRepay),
              decimals
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
