import { SubmitArgs } from '@blend-capital/blend-sdk';
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

export const BorrowAnvil: React.FC<ReserveComponentProps> = ({ poolId, assetId }) => {
  const theme = useTheme();
  const { connected, walletAddress, poolSubmit } = useWallet();

  const reserve = useStore((state) =>
    state.poolData.get(poolId)?.reserves.find((reserve) => reserve.assetId == assetId)
  );
  const assetToBase = useStore((state) => state.poolData.get(poolId)?.poolPrices.get(assetId) ?? 1);
  const user_est = useStore((state) => state.pool_user_est.get(poolId));
  const user_bal_est = useStore((state) =>
    state.pool_user_est.get(poolId)?.reserve_estimates.get(assetId)
  );
  const reserveEstimate = useStore((state) =>
    state.pool_est.get(poolId)?.reserve_est?.find((res) => res.id === assetId)
  );
  const loadPoolData = useStore((state) => state.loadPoolData);

  const [toBorrow, setToBorrow] = useState<string | undefined>(undefined);
  const [newEffectiveLiabilities, setNewEffectiveLiabilities] = useState<number>(
    user_est?.e_liabilities_base ?? 0
  );

  const decimals = reserve?.config.decimals ?? 7;
  const symbol = reserve?.tokenMetadata?.symbol ?? '';
  const baseToAsset = 1 / assetToBase;
  const oldBorrowCapAsset =
    user_est && reserveEstimate
      ? (user_est.e_collateral_base - user_est.e_liabilities_base) *
        baseToAsset *
        reserveEstimate.l_factor
      : undefined;
  const oldBorrowLimit = user_est
    ? user_est.e_liabilities_base / user_est.e_collateral_base
    : undefined;
  const borrowCapAsset =
    user_est && reserveEstimate
      ? (user_est.e_collateral_base - newEffectiveLiabilities) *
        baseToAsset *
        reserveEstimate.l_factor
      : undefined;
  const borrowLimit = user_est ? newEffectiveLiabilities / user_est.e_collateral_base : undefined;

  const handleBorrowAmountChange = (borrowInput: string) => {
    let regex = new RegExp(`^[0-9]*\.?[0-9]{0,${decimals}}$`);
    if (regex.test(borrowInput) && user_est && reserveEstimate) {
      let num_borrow = Number(borrowInput);
      let borrow_base = (num_borrow * assetToBase) / reserveEstimate.l_factor;
      console.log('borrow_base: ', borrow_base);
      let tempNewLiabilities = user_est.e_liabilities_base + borrow_base;
      console.log('temp_new: ', tempNewLiabilities * 1.02);
      console.log('collat: ', user_est.e_collateral_base);
      if (tempNewLiabilities * 1.019 < user_est.e_collateral_base) {
        setToBorrow(borrowInput);
        setNewEffectiveLiabilities(tempNewLiabilities);
      }
    }
  };

  const handleBorrowMax = () => {
    if (oldBorrowCapAsset && user_est && reserveEstimate && reserve) {
      let to_bounded_hf = (user_est.e_collateral_base - user_est.e_liabilities_base * 1.02) / 1.02;
      let to_borrow = Math.min(
        to_bounded_hf / (assetToBase / reserveEstimate.l_factor),
        reserveEstimate.supplied * (reserve.config.max_util / 1e7) - reserveEstimate.borrowed
      );
      handleBorrowAmountChange(to_borrow.toFixed(7));
    }
  };

  const handleSubmitTransaction = async () => {
    if (toBorrow && connected && reserve) {
      let submitArgs: SubmitArgs = {
        from: walletAddress,
        to: walletAddress,
        spender: walletAddress,
        requests: [
          {
            amount: scaleInputToBigInt(toBorrow, reserve.config.decimals),
            address: reserve.assetId,
            request_type: 4,
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
            Amount to borrow
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
              value={toBorrow}
              onValueChange={handleBorrowAmountChange}
              onSetMax={handleBorrowMax}
              palette={theme.palette.borrow}
              sx={{ width: '100%' }}
            />
            <OpaqueButton
              onClick={handleSubmitTransaction}
              palette={theme.palette.borrow}
              sx={{ minWidth: '108px', marginLeft: '12px', padding: '6px' }}
            >
              Borrow
            </OpaqueButton>
          </Box>
          <Box sx={{ marginLeft: '12px' }}>
            <Typography variant="h5" sx={{ color: theme.palette.text.secondary }}>
              {`$${toBalance(Number(toBorrow ?? 0) * assetToBase, decimals)}`}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            borderRadius: '5px',
            flexDirection: 'column',
            backgroundColor: theme.palette.background.paper,
            zIndex: 12,
          }}
        >
          <Typography
            variant="h5"
            sx={{ marginLeft: '24px', marginBottom: '12px', marginTop: '12px' }}
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
          <Value title="Amount to borrow" value={`${toBorrow ?? '0'} ${symbol}`} />
          <ValueChange
            title="Your total borrowed"
            curValue={`${toBalance(user_bal_est?.borrowed, decimals)} ${symbol}`}
            newValue={`${toBalance(
              (user_bal_est?.borrowed ?? 0) + Number(toBorrow ?? 0),
              decimals
            )} ${symbol}`}
          />
          <ValueChange
            title="Borrow capacity"
            curValue={`${toBalance(oldBorrowCapAsset)} ${symbol}`}
            newValue={`${toBalance(borrowCapAsset)} ${symbol}`}
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
