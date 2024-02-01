import { RequestType, SubmitArgs } from '@blend-capital/blend-sdk';
import { Box, Typography, useTheme } from '@mui/material';
import { useMemo, useState } from 'react';
import { TxStatus, useWallet } from '../../contexts/wallet';
import { useStore } from '../../store/store';
import { toBalance, toPercentage } from '../../utils/formatter';
import { getAssetReserve } from '../../utils/horizon';
import { scaleInputToBigInt } from '../../utils/scval';
import { InputBar } from '../common/InputBar';
import { OpaqueButton } from '../common/OpaqueButton';
import { ReserveComponentProps } from '../common/ReserveComponentProps';
import { Row } from '../common/Row';
import { Section, SectionSize } from '../common/Section';
import { SubmitError, TxOverview } from '../common/TxOverview';
import { Value } from '../common/Value';
import { ValueChange } from '../common/ValueChange';

export const RepayAnvil: React.FC<ReserveComponentProps> = ({ poolId, assetId }) => {
  const theme = useTheme();
  const { connected, walletAddress, poolSubmit, txStatus } = useWallet();

  const account = useStore((state) => state.account);
  const poolData = useStore((state) => state.pools.get(poolId));
  const userPoolData = useStore((state) => state.userPoolData.get(poolId));
  const userBalance = useStore((state) => state.balances.get(assetId)) ?? BigInt(0);
  const reserve = poolData?.reserves.get(assetId);
  const assetPrice = reserve?.oraclePrice ?? 1;

  const [toRepay, setToRepay] = useState<string>('');

  const decimals = reserve?.config.decimals ?? 7;
  const scalar = 10 ** decimals;
  const symbol = reserve?.tokenMetadata?.symbol ?? '';

  // calculate current wallet state
  let stellar_reserve_amount = getAssetReserve(account, reserve?.tokenMetadata?.asset);
  const freeUserBalanceScaled = Number(userBalance) / scalar - stellar_reserve_amount;
  const curBorrowed = userPoolData?.estimates?.liabilities?.get(assetId) ?? 0;
  const oldBorrowCap = userPoolData
    ? userPoolData.estimates.totalEffectiveCollateral -
      userPoolData.estimates.totalEffectiveLiabilities
    : undefined;
  const oldBorrowLimit = userPoolData
    ? userPoolData.estimates.totalEffectiveLiabilities /
      userPoolData.estimates.totalEffectiveCollateral
    : undefined;

  // calculate new wallet state
  let newEffectiveLiabilities = userPoolData?.estimates.totalEffectiveCollateral ?? 0;
  let returnedTokens = 0;
  if (toRepay && userPoolData && reserve) {
    let num_repay = Number(toRepay);
    let repay_base = num_repay * assetPrice * reserve.getLiabilityFactor();
    newEffectiveLiabilities = userPoolData.estimates.totalEffectiveLiabilities - repay_base;
    returnedTokens = num_repay > curBorrowed ? num_repay - curBorrowed : 0;
  }
  const borrowCap = userPoolData
    ? userPoolData.estimates.totalEffectiveCollateral - newEffectiveLiabilities
    : undefined;
  const borrowLimit = userPoolData
    ? newEffectiveLiabilities / userPoolData.estimates.totalEffectiveCollateral
    : undefined;

  if (txStatus === TxStatus.SUCCESS && Number(toRepay) != 0) {
    setToRepay('0');
  }
  // verify that the user can act
  const { isSubmitDisabled, isMaxDisabled, reason, disabledType } = useMemo(() => {
    const errorProps: SubmitError = {
      isSubmitDisabled: false,
      isMaxDisabled: false,
      reason: undefined,
      disabledType: undefined,
    };
    if (freeUserBalanceScaled <= 0 && txStatus !== TxStatus.SUCCESS) {
      errorProps.isSubmitDisabled = true;
      errorProps.isMaxDisabled = true;
      errorProps.reason = 'You do not have any available balance to repay.';
      errorProps.disabledType = 'warning';
    } else if (!toRepay) {
      errorProps.isSubmitDisabled = true;
      errorProps.isMaxDisabled = false;
      errorProps.reason = 'Please enter an amount to repay.';
      errorProps.disabledType = 'info';
    } else if (Number(toRepay) > freeUserBalanceScaled) {
      errorProps.isSubmitDisabled = true;
      errorProps.isMaxDisabled = false;
      errorProps.reason = 'You do not have enough available balance to repay.';
      errorProps.disabledType = 'warning';
    } else if (toRepay.split('.')[1]?.length > decimals) {
      errorProps.isSubmitDisabled = true;
      errorProps.isMaxDisabled = false;
      errorProps.reason = `You cannot supply more than ${decimals} decimal places.`;
      errorProps.disabledType = 'warning';
    } else {
      errorProps.isSubmitDisabled = false;
      errorProps.isMaxDisabled = false;
    }

    return errorProps;
  }, [freeUserBalanceScaled, toRepay]);

  const handleRepayMax = () => {
    if (userPoolData) {
      let dustProofRepay = curBorrowed * 1.001;
      let maxRepay =
        freeUserBalanceScaled < dustProofRepay ? freeUserBalanceScaled : dustProofRepay;
      setToRepay(maxRepay.toFixed(decimals));
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
            request_type: RequestType.Repay,
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
              onValueChange={setToRepay}
              onSetMax={handleRepayMax}
              palette={theme.palette.borrow}
              sx={{ width: '100%' }}
              isMaxDisabled={isMaxDisabled}
            />
            <OpaqueButton
              onClick={handleSubmitTransaction}
              palette={theme.palette.borrow}
              sx={{ minWidth: '108px', marginLeft: '12px', padding: '6px' }}
              disabled={isSubmitDisabled}
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
        <TxOverview isDisabled={isSubmitDisabled} disabledType={disabledType} reason={reason}>
          <Value title="Amount to repay" value={`${toRepay ?? '0'} ${symbol}`} />
          {returnedTokens != 0 && (
            <Value title="Amount to return" value={`${toBalance(returnedTokens)} ${symbol}`} />
          )}
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
        </TxOverview>
      </Section>
    </Row>
  );
};
