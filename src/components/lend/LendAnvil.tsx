import { SubmitArgs } from '@blend-capital/blend-sdk';
import { Box, Typography, useTheme } from '@mui/material';
import { useMemo, useState } from 'react';
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
import { SubmitError, TxOverview } from '../common/TxOverview';
import { Value } from '../common/Value';
import { ValueChange } from '../common/ValueChange';

export const LendAnvil: React.FC<ReserveComponentProps> = ({ poolId, assetId }) => {
  const theme = useTheme();
  const { connected, walletAddress, poolSubmit } = useWallet();

  const account = useStore((state) => state.account);
  const poolData = useStore((state) => state.pools.get(poolId));
  const userPoolData = useStore((state) => state.userPoolData.get(poolId));
  const userBalance = useStore((state) => state.balances.get(assetId)) ?? BigInt(0);
  const reserve = poolData?.reserves.get(assetId);
  const assetPrice = reserve?.oraclePrice ?? 1;

  const [toLend, setToLend] = useState<string | undefined>(undefined);

  const decimals = reserve?.config.decimals ?? 7;
  const scalar = 10 ** decimals;
  const symbol = reserve?.tokenMetadata?.symbol ?? '';

  // calculate current wallet state
  let stellar_reserve_amount = getAssetReserve(account, reserve?.tokenMetadata?.asset);
  const freeUserBalanceScaled = Number(userBalance) / scalar - stellar_reserve_amount;
  const curSupplied = userPoolData?.estimates?.collateral?.get(assetId) ?? 0;
  const oldBorrowCap = userPoolData
    ? userPoolData.estimates.totalEffectiveCollateral -
      userPoolData.estimates.totalEffectiveLiabilities
    : undefined;
  const oldBorrowLimit = userPoolData
    ? userPoolData.estimates.totalEffectiveLiabilities /
      userPoolData.estimates.totalEffectiveCollateral
    : undefined;

  // calculate new wallet state
  let newEffectiveCollateral = 0;
  if (userPoolData && reserve && toLend) {
    let num_lend = Number(toLend);
    let lend_base = num_lend * assetPrice * reserve.getCollateralFactor();
    newEffectiveCollateral = userPoolData.estimates.totalEffectiveCollateral + lend_base;
  }
  const borrowCap = userPoolData
    ? newEffectiveCollateral - userPoolData.estimates.totalEffectiveLiabilities
    : undefined;
  const borrowLimit = userPoolData
    ? userPoolData.estimates.totalEffectiveLiabilities / newEffectiveCollateral
    : undefined;
  // verify that the user can act
  const { isSubmitDisabled, isMaxDisabled, reason, disabledType } = useMemo(() => {
    const errorProps: SubmitError = {
      isSubmitDisabled: false,
      isMaxDisabled: false,
      reason: undefined,
      disabledType: undefined,
    };
    if (freeUserBalanceScaled <= 0) {
      errorProps.isSubmitDisabled = true;
      errorProps.isMaxDisabled = true;
      errorProps.reason = 'You do not have any available balance to supply.';
      errorProps.disabledType = 'warning';
    } else if (!toLend) {
      errorProps.isSubmitDisabled = true;
      errorProps.isMaxDisabled = false;
      errorProps.reason = 'Please enter an amount to supply.';
      errorProps.disabledType = 'info';
    } else if (Number(toLend) > freeUserBalanceScaled) {
      errorProps.isSubmitDisabled = true;
      errorProps.isMaxDisabled = false;
      errorProps.reason = 'You do not have enough available balance to supply.';
      errorProps.disabledType = 'warning';
    } else if (toLend.split('.')[1]?.length > decimals) {
      errorProps.isSubmitDisabled = true;
      errorProps.isMaxDisabled = false;
      errorProps.reason = `You cannot supply more than ${decimals} decimal places.`;
      errorProps.disabledType = 'warning';
    } else {
      errorProps.isSubmitDisabled = false;
      errorProps.isMaxDisabled = false;
    }

    return errorProps;
  }, [freeUserBalanceScaled, toLend]);
  const handleLendMax = () => {
    if (userPoolData) {
      if (freeUserBalanceScaled > 0) {
        setToLend(freeUserBalanceScaled.toFixed(decimals));
      }
    }
  };

  const handleSubmitTransaction = async () => {
    if (toLend && connected && reserve) {
      let submitArgs: SubmitArgs = {
        from: walletAddress,
        spender: walletAddress,
        to: walletAddress,
        requests: [
          {
            amount: scaleInputToBigInt(toLend, reserve.config.decimals),
            request_type: 2,
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
            Amount to supply
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
              value={toLend}
              onValueChange={setToLend}
              onSetMax={handleLendMax}
              palette={theme.palette.lend}
              sx={{ width: '100%' }}
              isMaxDisabled={isMaxDisabled}
            />
            <OpaqueButton
              onClick={handleSubmitTransaction}
              palette={theme.palette.lend}
              sx={{ minWidth: '108px', marginLeft: '12px', padding: '6px' }}
              disabled={isSubmitDisabled}
            >
              Supply
            </OpaqueButton>
          </Box>
          <Box sx={{ marginLeft: '12px' }}>
            <Typography variant="h5" sx={{ color: theme.palette.text.secondary }}>
              {`$${toBalance(Number(toLend ?? 0) * assetPrice, decimals)}`}
            </Typography>
          </Box>
        </Box>
        <TxOverview isDisabled={isSubmitDisabled} disabledType={disabledType} reason={reason}>
          <Value title="Amount to supply" value={`${toLend ?? '0'} ${symbol}`} />
          <ValueChange
            title="Your total supplied"
            curValue={`${toBalance(curSupplied, decimals)} ${symbol}`}
            newValue={`${toBalance(curSupplied + Number(toLend ?? '0'), decimals)} ${symbol}`}
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
