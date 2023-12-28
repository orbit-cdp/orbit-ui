import { PoolBackstopActionArgs, Q4W } from '@blend-capital/blend-sdk';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Box, CircularProgress, Typography } from '@mui/material';
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
  q4w: Q4W;
  inTokens: number;
}
export const BackstopQueueItem: React.FC<BackstopQueueItemProps> = ({ q4w, inTokens, poolId }) => {
  const { connected, walletAddress, backstopDequeueWithdrawal, backstopQueueWithdrawal } =
    useWallet();
  const loadUserData = useStore((state) => state.loadUserData);

  const NOW_SECONDS = Math.floor(Date.now() / 1000);
  const THIRTY_DAYS_SECONDS = 30 * 24 * 60 * 60;

  const [timeLeft, setTimeLeft] = useState<number>(Math.max(0, Number(q4w.exp) - NOW_SECONDS));
  const timeWaitedPercentage = Math.min(1, 1 - timeLeft / THIRTY_DAYS_SECONDS);

  useEffect(() => {
    if (timeLeft > 0) {
      const timeInterval = timeLeft > 24 * 60 * 60 ? 60 * 1000 : 1000;
      const refreshInterval = setInterval(() => {
        setTimeLeft(Math.min(0, NOW_SECONDS - Number(q4w.exp)));
      }, timeInterval);
      return () => clearInterval(refreshInterval);
    } else if (timeLeft == 0 && connected) {
      // q4w entry is unlocked, force an update
      loadUserData(walletAddress);
    }
  }, [q4w, timeLeft, NOW_SECONDS, loadUserData, walletAddress, connected]);

  const handleClick = async (amount: bigint) => {
    if (connected) {
      let actionArgs: PoolBackstopActionArgs = {
        from: walletAddress,
        pool_address: poolId,
        amount: BigInt(amount),
      };
      if (timeLeft > 0) {
        await backstopDequeueWithdrawal(actionArgs, false);
      } else {
        await backstopQueueWithdrawal(actionArgs, false);
      }
    }
  };

  return (
    <Row>
      <Box sx={{ margin: '6px', padding: '6px', display: 'flex', alignItems: 'center' }}>
        {timeLeft > 0 ? (
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
        ) : (
          <CheckCircleOutlineIcon
            sx={{ color: theme.palette.primary.main, marginRight: '12px', fontSize: '35px' }}
          />
        )}
        <TokenIcon symbol="blndusdclp" sx={{ marginRight: '12px' }}></TokenIcon>
        <Box>
          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            <Typography variant="h4" sx={{ marginRight: '6px' }}>
              {toBalance(inTokens)}
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
        onClick={() => handleClick(q4w.amount)}
        palette={theme.palette.positive}
        sx={{ height: '35px', width: '108px', margin: '12px', padding: '6px' }}
      >
        {timeLeft > 0 ? 'Unqueue' : 'Withdraw'}
      </OpaqueButton>
    </Row>
  );
};
