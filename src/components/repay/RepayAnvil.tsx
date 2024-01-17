import { SubmitArgs } from '@blend-capital/blend-sdk';
import { Alert, Box, Typography, useTheme } from '@mui/material';
import { useState } from 'react';
import { useWallet } from '../../contexts/wallet';
import { useStore } from '../../store/store';
import { toBalance, toPercentage } from '../../utils/formatter';
import { getAssetReserve } from '../../utils/horizon';
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

  const account = useStore((state) => state.account);
  const poolData = useStore((state) => state.pools.get(poolId));
  const userPoolData = useStore((state) => state.userPoolData.get(poolId));
  const userBalance = useStore((state) => state.balances.get(assetId)) ?? BigInt(0);
  const reserve = poolData?.reserves.get(assetId);
  const assetPrice = reserve?.oraclePrice ?? 1;

  const [toRepay, setToRepay] = useState<string | undefined>(undefined);
  const [newEffectiveLiabilities, setNewEffectiveLiabilities] = useState<number>(
    userPoolData?.estimates.totalEffectiveLiabilities ?? 0
  );

  const decimals = reserve?.config.decimals ?? 7;
  const scalar = 10 ** decimals;
  const symbol = reserve?.tokenMetadata?.symbol ?? '';

  const curBorrowed = userPoolData?.estimates?.liabilities?.get(assetId) ?? 0;

  const oldBorrowCap = userPoolData
    ? userPoolData.estimates.totalEffectiveCollateral -
      userPoolData.estimates.totalEffectiveLiabilities
    : undefined;
  const oldBorrowLimit = userPoolData
    ? userPoolData.estimates.totalEffectiveLiabilities /
      userPoolData.estimates.totalEffectiveCollateral
    : undefined;
  const borrowCap = userPoolData
    ? userPoolData.estimates.totalEffectiveCollateral - newEffectiveLiabilities
    : undefined;
  const borrowLimit = userPoolData
    ? newEffectiveLiabilities / userPoolData.estimates.totalEffectiveCollateral
    : undefined;

  // @ts-ignore
  let stellar_reserve_amount = getAssetReserve(account, reserve?.tokenMetadata?.asset);
  const freeUserBalanceScaled = Number(userBalance) / scalar - stellar_reserve_amount;
  const maxRepay =
    freeUserBalanceScaled < curBorrowed ? freeUserBalanceScaled : curBorrowed * 1.0001;

  const isRepayDisabled =
    !toRepay || !(Number(toRepay) > 0) || Number(toRepay) > maxRepay || maxRepay <= 0;
  const isMaxDisabled = freeUserBalanceScaled <= 0;
  const handleRepayAmountChange = (repayInput: string) => {
    setToRepay(repayInput);
    if (reserve && userPoolData) {
      let num_repay = Number(repayInput);
      let repay_base = num_repay * assetPrice * reserve.getLiabilityFactor();
      let tempNewLiabilities = userPoolData.estimates.totalEffectiveLiabilities - repay_base;
      if (num_repay <= freeUserBalanceScaled) {
        /**  @dev @TODO  how should this number behave in UI */
        setNewEffectiveLiabilities(tempNewLiabilities);
      }
    }
  };

  const handleRepayMax = () => {
    if (userPoolData) {
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
              isMaxDisabled={isMaxDisabled}
            />
            <OpaqueButton
              onClick={handleSubmitTransaction}
              palette={theme.palette.borrow}
              sx={{ minWidth: '108px', marginLeft: '12px', padding: '6px' }}
              disabled={isRepayDisabled}
            >
              Repay
            </OpaqueButton>
          </Box>
          <Box sx={{ marginLeft: '12px' }}>
            <Typography variant="h5" sx={{ color: theme.palette.text.secondary }}>
              {`$${toBalance(Number(toRepay ?? 0) * assetPrice, decimals)}`}
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
          {!isRepayDisabled && (
            <>
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
              <Value title="Amount to repay" value={`${toRepay ?? '0'} ${symbol}`} />
              <ValueChange
                title="Your total borrowed"
                curValue={`${toBalance(curBorrowed, decimals)} ${symbol}`}
                newValue={`${toBalance(
                  Math.max(curBorrowed - Number(toRepay ?? '0'), 0),
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
            </>
          )}
          {isRepayDisabled && (
            <>
              {Number(toRepay) > maxRepay && (
                <Alert severity="error">
                  <Typography variant="body2">Input larger than available value</Typography>
                </Alert>
              )}
              {maxRepay <= 0 && (
                <Alert severity="error">
                  <Typography variant="body2">No repay balance available</Typography>
                </Alert>
              )}
            </>
          )}
        </Box>
      </Section>
    </Row>
  );
};
