import { PoolBackstopActionArgs } from '@blend-capital/blend-sdk';
import { Box, Typography, useTheme } from '@mui/material';
import { useState } from 'react';
import { useWallet } from '../../contexts/wallet';
import { useStore } from '../../store/store';
import { toBalance } from '../../utils/formatter';
import { scaleInputToBigInt } from '../../utils/scval';
import { InputBar } from '../common/InputBar';
import { OpaqueButton } from '../common/OpaqueButton';
import { PoolComponentProps } from '../common/PoolComponentProps';
import { Row } from '../common/Row';
import { Section, SectionSize } from '../common/Section';
import { Value } from '../common/Value';
import { ValueChange } from '../common/ValueChange';

export const BackstopQueueAnvil: React.FC<PoolComponentProps> = ({ poolId }) => {
  const theme = useTheme();
  const { connected, walletAddress, backstopQueueWithdrawal } = useWallet();

  const backstopContract = useStore((state) => state.backstopContract);
  const backstopUserEstimate = useStore((state) => state.backstop_user_est.get(poolId));
  // TODO
  const backstopTokenPrice = 0.75; //Number(
  //   useStore((state) => state.backstopData.backstopTokenPrice / BigInt(1e7))
  // );
  const loadBackstopData = useStore((state) => state.loadBackstopData);
  const [toQueue, setToQueue] = useState<string | undefined>(undefined);

  const queuedBalance =
    backstopUserEstimate?.q4w?.reduce((total, q4w) => total + Number(q4w.amount) / 1e7, 0) ??
    0 + (backstopUserEstimate?.q4wUnlockedAmount ?? 0);
  const availableToQueue = backstopUserEstimate?.availableToQueue ?? 0;

  const handleQueueAmountChange = (queueInput: string) => {
    if (/^[0-9]*\.?[0-9]{0,7}$/.test(queueInput) && availableToQueue > 0) {
      let num_queue = Number(queueInput);
      if (num_queue <= availableToQueue) {
        setToQueue(queueInput);
      }
    }
  };

  const handleQueueMax = () => {
    if (availableToQueue > 0) {
      setToQueue(availableToQueue.toFixed(7));
    }
  };

  const handleSubmitTransaction = async () => {
    if (toQueue && connected) {
      let depositArgs: PoolBackstopActionArgs = {
        from: walletAddress,
        pool_address: poolId,
        amount: scaleInputToBigInt(toQueue, 7),
      };
      await backstopQueueWithdrawal(depositArgs, false);
      await loadBackstopData(poolId, walletAddress, true);
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
            background: theme.palette.backstop.opaque,
            width: '100%',
            borderRadius: '5px',
            padding: '12px',
            marginBottom: '12px',
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
          }}
        >
          <Typography variant="body2" sx={{ marginLeft: '12px', marginBottom: '12px' }}>
            Amount to queue for withdrawal
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
              symbol={'BLND-USDC LP'}
              value={toQueue}
              onValueChange={handleQueueAmountChange}
              onSetMax={handleQueueMax}
              palette={theme.palette.backstop}
              sx={{ width: '100%' }}
            />
            <OpaqueButton
              onClick={handleSubmitTransaction}
              palette={theme.palette.backstop}
              sx={{ minWidth: '108px', marginLeft: '12px', padding: '6px' }}
            >
              Queue
            </OpaqueButton>
          </Box>
          <Box sx={{ marginLeft: '12px' }}>
            <Typography variant="h5" sx={{ color: theme.palette.text.secondary }}>
              {`$${toBalance(Number(toQueue ?? 0) * backstopTokenPrice)}`}
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
          }}
        >
          <Typography
            variant="h5"
            sx={{ marginLeft: '12px', marginBottom: '12px', marginTop: '12px' }}
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
          <Value title="Amount to queue" value={`${toQueue ?? '0'} BLND-USDC LP`} />
          <Value
            title="New queue expiration"
            value={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
          />
          <ValueChange
            title="Your total amount queued"
            curValue={`${toBalance(queuedBalance)} BLND-USDC LP`}
            newValue={`${toBalance(queuedBalance + Number(toQueue ?? '0'))} BLND-USDC LP`}
          />
        </Box>
      </Section>
    </Row>
  );
};
