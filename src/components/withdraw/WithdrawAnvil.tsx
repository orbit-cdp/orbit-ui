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

export const WithdrawAnvil: React.FC<ReserveComponentProps> = ({ poolId, assetId }) => {
  const theme = useTheme();
  const { connected, walletAddress, poolSubmit } = useWallet();

  const account = useStore((state) => state.account);
  const poolData = useStore((state) => state.pools.get(poolId));
  const userPoolData = useStore((state) => state.userPoolData.get(poolId));
  const userBalance = useStore((state) => state.balances.get(assetId)) ?? BigInt(0);
  const reserve = poolData?.reserves.get(assetId);
  const assetPrice = reserve?.oraclePrice ?? 1;

  const [toWithdrawSubmit, setToWithdrawSubmit] = useState<string | undefined>(undefined);
  const [toWithdraw, setToWithdraw] = useState<string | undefined>(undefined);
  const [newEffectiveCollateral, setNewEffectiveCollateral] = useState<number>(
    userPoolData?.estimates.totalEffectiveCollateral ?? 0
  );

  const decimals = reserve?.config.decimals ?? 7;
  const symbol = reserve?.tokenMetadata?.symbol ?? '';

  const curSupplied = userPoolData?.estimates?.collateral?.get(assetId) ?? 0;

  const oldBorrowCap = userPoolData
    ? userPoolData.estimates.totalEffectiveCollateral -
      userPoolData.estimates.totalEffectiveLiabilities
    : undefined;
  const oldBorrowLimit = userPoolData
    ? userPoolData.estimates.totalEffectiveLiabilities /
      userPoolData.estimates.totalEffectiveCollateral
    : undefined;
  const borrowCap = userPoolData
    ? newEffectiveCollateral - userPoolData.estimates.totalEffectiveLiabilities
    : undefined;
  const borrowLimit = userPoolData
    ? userPoolData.estimates.totalEffectiveLiabilities / newEffectiveCollateral
    : undefined;

  const handleWithdrawAmountChange = (withdrawInput: string) => {
    if (reserve && userPoolData) {
      let realWithdraw = withdrawInput;
      let num_withdraw = Number(withdrawInput);
      if (num_withdraw > curSupplied) {
        // truncate to supplied, but store full amount to avoid dust
        // and allow contract to pull down to real supplied amount
        realWithdraw = curSupplied.toFixed(decimals);
        num_withdraw = Number(realWithdraw);
      }
      let withdraw_base = num_withdraw * assetPrice * reserve.getCollateralFactor();
      let tempEffectiveCollateral = userPoolData.estimates.totalEffectiveCollateral - withdraw_base;
      if (tempEffectiveCollateral >= userPoolData.estimates.totalEffectiveLiabilities * 1.019) {
        setToWithdraw(realWithdraw);
        setToWithdrawSubmit(withdrawInput);
        setNewEffectiveCollateral(tempEffectiveCollateral);
      }
    }
  };

  const handleWithdrawMax = () => {
    if (reserve && userPoolData) {
      if (userPoolData.estimates.totalEffectiveLiabilities == 0) {
        handleWithdrawAmountChange((curSupplied * 1.05).toFixed(decimals));
      } else {
        let to_bounded_hf =
          (userPoolData.estimates.totalEffectiveCollateral -
            userPoolData.estimates.totalEffectiveLiabilities * 1.02) /
          1.02;
        let to_wd = to_bounded_hf / (assetPrice * reserve.getCollateralFactor());
        let withdrawAmount = Math.min(to_wd, curSupplied) + 1 / 10 ** decimals;
        handleWithdrawAmountChange(withdrawAmount.toFixed(decimals));
      }
    }
  };

  const handleSubmitTransaction = async () => {
    if (toWithdrawSubmit && connected && reserve) {
      let submitArgs: SubmitArgs = {
        from: walletAddress,
        to: walletAddress,
        spender: walletAddress,
        requests: [
          {
            amount: scaleInputToBigInt(toWithdrawSubmit, decimals),
            request_type: 3,
            address: reserve.assetId,
          },
        ],
      };
      await poolSubmit(poolId, submitArgs, false);
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
              symbol={reserve?.tokenMetadata?.symbol ?? ''}
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
              disabled={!toWithdraw}
            >
              Withdraw
            </OpaqueButton>
          </Box>
          <Box sx={{ marginLeft: '12px' }}>
            <Typography variant="h5" sx={{ color: theme.palette.text.secondary }}>
              {`$${toBalance(Number(toWithdraw ?? 0) * assetPrice, decimals)}`}
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
          <Value title="Amount to withdraw" value={`${toWithdraw ?? '0'} ${symbol}`} />
          <ValueChange
            title="Your total supplied"
            curValue={`${toBalance(curSupplied, decimals)} ${symbol}`}
            newValue={`${toBalance(curSupplied - Number(toWithdraw ?? '0'), decimals)} ${symbol}`}
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
