import { RequestType, SubmitArgs } from '@blend-capital/blend-sdk';
import { Box, Typography, useTheme } from '@mui/material';
import { useMemo, useState } from 'react';
import { useWallet } from '../../contexts/wallet';
import { useStore } from '../../store/store';
import { toBalance, toPercentage } from '../../utils/formatter';
import { scaleInputToBigInt } from '../../utils/scval';
import { InputBar } from '../common/InputBar';
import { OpaqueButton } from '../common/OpaqueButton';
import { ReserveComponentProps } from '../common/ReserveComponentProps';
import { Row } from '../common/Row';
import { Section, SectionSize } from '../common/Section';
import { SubmitError, TxOverview } from '../common/TxOverview';
import { Value } from '../common/Value';
import { ValueChange } from '../common/ValueChange';

export const BorrowAnvil: React.FC<ReserveComponentProps> = ({ poolId, assetId }) => {
  const theme = useTheme();
  const { connected, walletAddress, poolSubmit } = useWallet();

  const poolData = useStore((state) => state.pools.get(poolId));
  const userPoolData = useStore((state) => state.userPoolData.get(poolId));
  const reserve = poolData?.reserves.get(assetId);
  const assetToBase = reserve?.oraclePrice ?? 1;
  const baseToAsset = 1 / assetToBase;

  const [toBorrow, setToBorrow] = useState<string>('');

  const decimals = reserve?.config.decimals ?? 7;
  const symbol = reserve?.tokenMetadata?.symbol ?? '';

  // calculate current wallet state
  const curBorrowed = userPoolData?.estimates?.liabilities?.get(assetId) ?? 0;
  const oldBorrowCap = userPoolData
    ? userPoolData.estimates.totalEffectiveCollateral -
      userPoolData.estimates.totalEffectiveLiabilities
    : undefined;
  const oldBorrowCapAsset =
    reserve && oldBorrowCap ? oldBorrowCap * baseToAsset * reserve.getLiabilityFactor() : undefined;
  const oldBorrowLimit = userPoolData
    ? userPoolData.estimates.totalEffectiveLiabilities /
      userPoolData.estimates.totalEffectiveCollateral
    : undefined;

  // calculate new wallet state
  let num_borrow = 0;
  let newEffectiveLiabilities = 0;
  if (toBorrow && userPoolData && reserve) {
    num_borrow = Number(toBorrow);
    let borrow_base = num_borrow * assetToBase * reserve.getLiabilityFactor();
    newEffectiveLiabilities = userPoolData.estimates.totalEffectiveLiabilities + borrow_base;
  }
  const borrowCap = userPoolData
    ? userPoolData.estimates.totalEffectiveCollateral - newEffectiveLiabilities
    : undefined;
  const borrowCapAsset =
    reserve && borrowCap ? borrowCap * baseToAsset * reserve.getLiabilityFactor() : undefined;
  const borrowLimit = userPoolData
    ? newEffectiveLiabilities / userPoolData.estimates.totalEffectiveCollateral
    : undefined;
  const newAssetUtil = reserve
    ? (reserve.estimates.borrowed + num_borrow) / reserve.estimates.supplied
    : 0;
  // verify that the user can act
  const { isSubmitDisabled, isMaxDisabled, reason, disabledType } = useMemo(() => {
    const errorProps: SubmitError = {
      isSubmitDisabled: false,
      isMaxDisabled: false,
      reason: undefined,
      disabledType: undefined,
    };
    if (
      userPoolData?.estimates.totalEffectiveCollateral == undefined ||
      userPoolData.estimates.totalEffectiveCollateral == 0
    ) {
      errorProps.isSubmitDisabled = true;
      errorProps.isMaxDisabled = true;
      errorProps.reason = 'You do not have any collateral to borrow against.';
      errorProps.disabledType = 'warning';
    } else if (!toBorrow) {
      errorProps.isSubmitDisabled = true;
      errorProps.isMaxDisabled = false;
      errorProps.reason = 'Please enter an amount to borrow.';
      errorProps.disabledType = 'info';
    } else if (borrowLimit == undefined || borrowLimit > 0.9805) {
      // @dev: a borrow limit of 98.05% ~= a health factor of 1.02
      errorProps.isSubmitDisabled = true;
      errorProps.isMaxDisabled = false;
      errorProps.reason =
        'Your borrow is too high and you have exceeded the max borrow limit of 98%. Current value: ' +
        toPercentage(borrowLimit);
      errorProps.disabledType = 'warning';
    } else if (newAssetUtil > (reserve?.config.max_util ?? 0) / 1e7) {
      errorProps.isSubmitDisabled = true;
      errorProps.isMaxDisabled = false;
      errorProps.reason = "You cannot borrow more than the pool's max utilization.";
      errorProps.disabledType = 'warning';
    } else if (toBorrow.split('.')[1]?.length > decimals) {
      errorProps.isSubmitDisabled = true;
      errorProps.isMaxDisabled = false;
      errorProps.reason = `You cannot supply more than ${decimals} decimal places.`;
      errorProps.disabledType = 'warning';
    } else {
      errorProps.isSubmitDisabled = false;
      errorProps.isMaxDisabled = false;
    }
    return errorProps;
  }, [
    toBorrow,
    borrowLimit,
    newAssetUtil,
    reserve?.config.max_util,
    userPoolData?.estimates?.totalEffectiveCollateral,
  ]);

  const handleBorrowMax = () => {
    if (oldBorrowCapAsset && reserve && userPoolData) {
      let to_bounded_hf =
        (userPoolData.estimates.totalEffectiveCollateral -
          userPoolData.estimates.totalEffectiveLiabilities * 1.02) /
        1.02;
      let to_borrow = Math.min(
        to_bounded_hf / (assetToBase * reserve.getLiabilityFactor()),
        reserve.estimates.supplied * (reserve.config.max_util / 1e7 - 0.01) -
          reserve.estimates.borrowed
      );
      setToBorrow(Math.max(to_borrow, 0).toFixed(7));
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
            request_type: RequestType.Borrow,
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
              onValueChange={setToBorrow}
              onSetMax={handleBorrowMax}
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
              Borrow
            </OpaqueButton>
          </Box>
          <Box sx={{ marginLeft: '12px' }}>
            <Typography variant="h5" sx={{ color: theme.palette.text.secondary }}>
              {`$${toBalance(Number(toBorrow ?? 0) * assetToBase, decimals)}`}
            </Typography>
          </Box>
        </Box>
        <TxOverview isDisabled={isSubmitDisabled} disabledType={disabledType} reason={reason}>
          <Value title="Amount to borrow" value={`${toBorrow ?? '0'} ${symbol}`} />
          <ValueChange
            title="Your total borrowed"
            curValue={`${toBalance(curBorrowed, decimals)} ${symbol}`}
            newValue={`${toBalance(curBorrowed + Number(toBorrow ?? 0), decimals)} ${symbol}`}
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
        </TxOverview>
      </Section>
    </Row>
  );
};
