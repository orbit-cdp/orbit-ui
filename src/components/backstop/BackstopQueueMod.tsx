import { Q4W } from '@blend-capital/blend-sdk';
import { Box, Typography, useTheme } from '@mui/material';
import { useStore } from '../../store/store';
import { PoolComponentProps } from '../common/PoolComponentProps';
import { Row } from '../common/Row';
import { Section, SectionSize } from '../common/Section';
import { BackstopQueueItem } from './BackstopQueueItem';

export const BackstopQueueMod: React.FC<PoolComponentProps> = ({ poolId }) => {
  const theme = useTheme();

  const latestLedgerTimestamp = useStore((state) => state.latestLedgerTimestamp);
  const backstopUserData = useStore((state) => state.backstopUserData);
  const poolBackstopData = useStore((state) => state.backstop?.pools.get(poolId));
  const poolBackstopUserData = backstopUserData?.balances?.get(poolId);
  const poolBackstopUserEst = backstopUserData?.estimates?.get(poolId);

  if (
    !poolBackstopUserData ||
    !poolBackstopUserEst ||
    poolBackstopUserData.q4w == undefined ||
    poolBackstopUserData.q4w.length == 0
  ) {
    return <></>;
  }

  const toTokens = (amount: bigint) => {
    let sharesAsNumber = Number(amount) / 1e7;
    if (poolBackstopData == undefined) {
      return sharesAsNumber;
    } else {
      let rate =
        Number(poolBackstopData.poolBalance.tokens) / Number(poolBackstopData.poolBalance.shares);
      return sharesAsNumber * rate;
    }
  };

  let q4w_locked: Q4W[] = [];
  let q4w_unlocked: Q4W = {
    exp: BigInt(0),
    amount: BigInt(0),
  };
  const cur_time = Math.floor(Date.now() / 1000);
  for (const q4w of poolBackstopUserData.q4w) {
    if (Number(q4w.exp) > cur_time) {
      q4w_locked.push(q4w);
    } else {
      q4w_unlocked.amount += BigInt(q4w.amount);
    }
  }

  return (
    <Row>
      <Section width={SectionSize.FULL} sx={{ display: 'flex', flexDirection: 'column' }}>
        <Row>
          <Box
            sx={{
              margin: '6px',
              padding: '6px',
              width: '100%',
              alignItems: 'center',
              backgroundColor: theme.palette.background.default,
              borderRadius: '5px',
            }}
          >
            <Typography sx={{ padding: '6px' }}>Queued for withdrawal (Q4W)</Typography>
          </Box>
        </Row>
        {q4w_unlocked.amount != BigInt(0) && (
          <BackstopQueueItem
            key={0}
            poolId={poolId}
            q4w={q4w_unlocked}
            inTokens={toTokens(q4w_unlocked.amount)}
          />
        )}
        {q4w_locked
          .sort((a, b) => Number(a.exp) - Number(b.exp))
          .map((q4w) => (
            <BackstopQueueItem
              key={Number(q4w.exp)}
              poolId={poolId}
              q4w={q4w}
              inTokens={toTokens(q4w.amount)}
            />
          ))}
      </Section>
    </Row>
  );
};
