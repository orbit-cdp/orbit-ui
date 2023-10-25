import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Box, Typography, useTheme } from '@mui/material';
import { Address } from 'soroban-client';
import { useWallet } from '../../contexts/wallet';
import { useStore } from '../../store/store';
import { toBalance } from '../../utils/formatter';
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
  const backstopUserEstimate = useStore((state) => state.backstop_user_est.get(poolId));
  const backstopPoolEstimate = useStore((state) => state.backstop_pool_est.get(poolId));
  const loadBackstopData = useStore((state) => state.loadBackstopData);

  if (backstopUserEstimate?.q4wUnlockedAmount == 0 && backstopUserEstimate.q4w.length == 0) {
    return <></>;
  }

  const handleClickUnqueue = async (amount: bigint) => {
    if (connected) {
      // let dequeue_op = xdr.Operation.fromXDR(
      //   backstopContract.dequeue_withdrawal({
      //     from: walletAddress,
      //     pool_address: poolId,
      //     amount: BigInt(amount),
      //   }),
      //   'base64'
      // );
      // await submitTransaction(dequeue_op);
      await loadBackstopData(poolId, walletAddress, true);
    }
  };

  const handleClickWithdrawal = async (amount: bigint) => {
    if (connected) {
      let user_scval = new Address(walletAddress).toScVal();
      // let withdraw_op = new Contract(backstopContract.address).call(
      //   'withdraw',
      //   user_scval,
      //   Address.fromString(poolId).toScVal(),
      //   nativeToScVal(amount, { type: 'i128' })
      // );
      // await submitTransaction(withdraw_op);
      await loadBackstopData(poolId, walletAddress, true);
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
        {backstopUserEstimate?.q4wUnlockedAmount != 0 && (
          <Row>
            <Box sx={{ margin: '6px', padding: '6px', display: 'flex', alignItems: 'center' }}>
              <CheckCircleOutlineIcon
                sx={{ color: theme.palette.primary.main, marginRight: '12px', fontSize: '35px' }}
              />
              <TokenIcon symbol="blndusdclp" sx={{ marginRight: '12px' }}></TokenIcon>
              <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                <Typography variant="h4" sx={{ marginRight: '6px' }}>
                  {toBalance(backstopUserEstimate?.q4wUnlockedAmount)}
                </Typography>
                <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                  BLND-USDC LP
                </Typography>
              </Box>
            </Box>
            <OpaqueButton
              onClick={() =>
                handleClickWithdrawal(
                  BigInt(
                    ((backstopUserEstimate?.q4wUnlockedAmount ?? 0) * 1e7) /
                      (backstopPoolEstimate?.shareRate ?? 1)
                  )
                )
              }
              palette={theme.palette.primary}
              sx={{ height: '35px', width: '108px', margin: '12px', padding: '6px' }}
            >
              Withdraw
            </OpaqueButton>
          </Row>
        )}
        {backstopUserEstimate?.q4w
          .sort((a, b) => Number(b.amount) - Number(a.amount))
          .map((q4w) => (
            <BackstopQueueItem
              key={Number(q4w.exp)}
              poolId={poolId}
              q4w={q4w}
              amount={(Number(q4w.amount) / 1e7) * (backstopPoolEstimate?.shareRate ?? 1)}
              handleClickUnqueue={handleClickUnqueue}
            />
          ))}
      </Section>
    </Row>
  );
};
