import { Box, CircularProgress, Typography } from '@mui/material';
import { Backstop } from 'blend-sdk';
import { useEffect, useState } from 'react';
import { useWallet } from '../../contexts/wallet';
import { useStore } from '../../store/store';
import theme from '../../theme';
import { toBalance, toTimeSpan } from '../../utils/formatter';
import { OpaqueButton } from '../common/OpaqueButton';
import { PoolComponentProps } from '../common/PoolComponentProps';
import { Row } from '../common/Row';
import { TokenIcon } from '../common/TokenIcon';

export interface BackstopQueueItemProps extends PoolComponentProps {
  q4w: Backstop.Q4W;
  amount: number;
  handleClickUnqueue: (amount: bigint) => void;
}

export const BackstopQueueItem: React.FC<BackstopQueueItemProps> = ({
  q4w,
  amount,
  handleClickUnqueue,
  poolId,
}) => {
  const { walletAddress } = useWallet();
  const refreshBackstopData = useStore((state) => state.refreshPoolBackstopData);

  const NOW_SECONDS = Math.floor(Date.now() / 1000);
  const THIRTY_DAYS_SECONDS = 30 * 24 * 60 * 60;

  const [timeLeft, setTimeLeft] = useState<number>(Math.max(0, q4w.exp - NOW_SECONDS));
  const timeWaitedPercentage = Math.min(1, 1 - timeLeft / THIRTY_DAYS_SECONDS);

  useEffect(() => {
    if (timeLeft > 0) {
      const timeInterval = timeLeft > 24 * 60 * 60 ? 60 * 1000 : 1000;
      const refreshInterval = setInterval(() => {
        setTimeLeft(Math.min(0, NOW_SECONDS - q4w.exp));
      }, timeInterval);
      return () => clearInterval(refreshInterval);
    } else if (timeLeft == 0) {
      // timeExpired - force an update
      refreshBackstopData(poolId, walletAddress);
    }
  }, [q4w, timeLeft, NOW_SECONDS, refreshBackstopData, walletAddress, poolId]);

  return (
    <Row key={q4w.exp}>
      <Box sx={{ margin: '6px', padding: '6px', display: 'flex', alignItems: 'center' }}>
        <CircularProgress
          sx={{
            color: theme.palette.backstop.main,
            marginLeft: '6px',
            marginRight: '12px',
          }}
          size="30px"
          thickness={4.5}
          variant="determinate"
          value={timeWaitedPercentage * 100}
        />
        <TokenIcon symbol="blndusdclp" sx={{ marginRight: '12px' }}></TokenIcon>
        <Box>
          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            <Typography variant="h4" sx={{ marginRight: '6px' }}>
              {toBalance(amount)}
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
              BLND-USDC LP
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ marginRight: '6px' }}>
            {toTimeSpan(timeLeft)}
          </Typography>
        </Box>
      </Box>
      <OpaqueButton
        onClick={() => handleClickUnqueue(q4w.amount)}
        palette={theme.palette.positive}
        sx={{ height: '35px', width: '108px', margin: '12px', padding: '6px' }}
      >
        Unqueue
      </OpaqueButton>
    </Row>
  );
};
