import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Box, Typography, useTheme } from '@mui/material';
import { Q4W } from 'blend-sdk';
import { Address, Contract } from 'soroban-client';
import { useWallet } from '../../contexts/wallet';
import { useStore } from '../../store/store';
import { toBalance } from '../../utils/formatter';
import { fromBigIntToScVal } from '../../utils/scval';
import { OpaqueButton } from '../common/OpaqueButton';
import { PoolComponentProps } from '../common/PoolComponentProps';
import { Row } from '../common/Row';
import { Section, SectionSize } from '../common/Section';
import { TokenIcon } from '../common/TokenIcon';
import { BackstopQueueItem } from './BackstopQueueItem';

export const BackstopQueueMod: React.FC<PoolComponentProps> = ({ poolId }) => {
  const theme = useTheme();
  const { connected, walletAddress, submitTransaction } = useWallet();

  const backstopContract = useStore((state) => state.backstopContract);
  const backstopPoolBalance = useStore((state) => state.poolBackstopBalance.get(poolId));
  const backstopShares = useStore((state) => state.shares.get(poolId));
  const backstopQ4W = useStore((state) => state.q4w.get(poolId)) ?? [];
  const shareRate = backstopPoolBalance
    ? Number(backstopPoolBalance.tokens) / Number(backstopPoolBalance.shares)
    : 1;

  const NOW_SECONDS = Math.floor(Date.now() / 1000);

  let unlockedAmount = BigInt(0);
  let lockedList: Q4W[] = [];
  for (const q4w of backstopQ4W) {
    if (q4w.exp < NOW_SECONDS) {
      // unlocked, only display a single unlocked entry
      unlockedAmount += q4w.amount;
    } else {
      lockedList.push(q4w);
    }
  }

  if (unlockedAmount == BigInt(0) && lockedList.length == 0) {
    return <></>;
  }

  const handleClickUnqueue = (amount: bigint) => {
    if (connected) {
      let user_scval = new Address(walletAddress).toScVal();
      let dequeue_op = new Contract(backstopContract._contract.contractId("hex")).call(
        'dequeue_withdrawal',
        user_scval,
        Address.contract(Buffer.from(poolId, 'hex')).toScVal(),
        fromBigIntToScVal(amount)
      );
      submitTransaction(dequeue_op);
    }
  };

  const handleClickWithdrawal = (amount: bigint) => {
    if (connected) {
      let user_scval = new Address(walletAddress).toScVal();
      let withdraw_op = new Contract(backstopContract._contract.contractId("hex")).call(
        'withdraw',
        user_scval,
        Address.contract(Buffer.from(poolId, 'hex')).toScVal(),
        fromBigIntToScVal(amount)
      );
      submitTransaction(withdraw_op);
    }
  };

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
        {unlockedAmount != BigInt(0) && (
          <Row>
            <Box sx={{ margin: '6px', padding: '6px', display: 'flex', alignItems: 'center' }}>
              <CheckCircleOutlineIcon
                sx={{ color: theme.palette.primary.main, marginRight: '12px', fontSize: '35px' }}
              />
              <TokenIcon symbol="blndusdclp" sx={{ marginRight: '12px' }}></TokenIcon>
              <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                <Typography variant="h4" sx={{ marginRight: '6px' }}>
                  {toBalance((Number(unlockedAmount) / 1e7) * shareRate)}
                </Typography>
                <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                  BLND-USDC LP
                </Typography>
              </Box>
            </Box>
            <OpaqueButton
              onClick={() => handleClickWithdrawal(unlockedAmount)}
              palette={theme.palette.primary}
              sx={{ height: '35px', width: '108px', margin: '12px', padding: '6px' }}
            >
              Withdraw
            </OpaqueButton>
          </Row>
        )}
        {lockedList
          .sort((a, b) => Number(b.amount) - Number(a.amount))
          .map((q4w) => (
            <BackstopQueueItem
              key={q4w.exp}
              poolId={poolId}
              q4w={q4w}
              amount={(Number(q4w.amount) / 1e7) * shareRate}
              handleClickUnqueue={handleClickUnqueue}
            />
          ))}
      </Section>
    </Row>
  );
};
