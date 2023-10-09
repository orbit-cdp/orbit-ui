import { Typography, useTheme } from '@mui/material';
import { useStore } from '../../store/store';
import { toBalance, toPercentage } from '../../utils/formatter';
import { PoolComponentProps } from '../common/PoolComponentProps';
import { Row } from '../common/Row';
import { Section, SectionSize } from '../common/Section';
import { StackedText } from '../common/StackedText';
import { BorrowPositionList } from './BorrowPositionList';

export const BorrowPositions: React.FC<PoolComponentProps> = ({ poolId }) => {
  const theme = useTheme();
  const poolUserEstimate = useStore((state) => state.pool_user_est.get(poolId));

  const hasPositions = poolUserEstimate ? poolUserEstimate.total_borrowed_base != 0 : false;

  if (!hasPositions) {
    return <></>;
  }

  return (
    <Row>
      <Section width={SectionSize.FULL} sx={{ flexDirection: 'column', paddingTop: '12px' }}>
        <Typography variant="body2" sx={{ margin: '6px' }}>
          Your borrowed positions
        </Typography>
        <Row>
          <Section width={SectionSize.TILE} sx={{ background: theme.palette.borrow.opaque }}>
            <StackedText
              title="Balance"
              titleColor={theme.palette.text.primary}
              text={`$${toBalance(poolUserEstimate?.total_borrowed_base ?? 0)}`}
              textColor={theme.palette.borrow.main}
              sx={{ width: '100%', padding: '6px' }}
            ></StackedText>
          </Section>
          <Section width={SectionSize.TILE} sx={{ background: theme.palette.borrow.opaque }}>
            <StackedText
              title="APY"
              titleColor={theme.palette.text.primary}
              text={toPercentage(poolUserEstimate?.borrow_apy ?? 0)}
              textColor={theme.palette.borrow.main}
              sx={{ width: '100%', padding: '6px' }}
            ></StackedText>
          </Section>
        </Row>
        <BorrowPositionList poolId={poolId} />
      </Section>
    </Row>
  );
};
