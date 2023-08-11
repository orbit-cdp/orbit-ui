import { Typography, useTheme } from '@mui/material';
import { useStore } from '../../store/store';
import { toBalance, toPercentage } from '../../utils/formatter';
import { PoolComponentProps } from '../common/PoolComponentProps';
import { Row } from '../common/Row';
import { Section, SectionSize } from '../common/Section';
import { StackedText } from '../common/StackedText';
import { LendPositionList } from './LendPositionList';

export const LendPositions: React.FC<PoolComponentProps> = ({ poolId }) => {
  const theme = useTheme();
  const poolUserEstimates = useStore((state) => state.pool_user_est.get(poolId));
  const hasPositions = poolUserEstimates ? poolUserEstimates.total_supplied_base != 0 : false;

  if (!hasPositions) {
    return <></>;
  }

  return (
    <Row>
      <Section width={SectionSize.FULL} sx={{ flexDirection: 'column', paddingTop: '12px' }}>
        <Typography variant="body2" sx={{ margin: '6px' }}>
          Your supplied positions
        </Typography>
        <Row>
          <Section width={SectionSize.TILE} sx={{ background: theme.palette.lend.opaque }}>
            <StackedText
              title="Balance"
              titleColor={theme.palette.text.primary}
              text={`$${toBalance(poolUserEstimates?.total_supplied_base ?? 0)}`}
              textColor={theme.palette.lend.main}
              sx={{ width: '100%', padding: '6px' }}
            ></StackedText>
          </Section>
          <Section width={SectionSize.TILE} sx={{ background: theme.palette.lend.opaque }}>
            <StackedText
              title="APY"
              titleColor={theme.palette.text.primary}
              text={toPercentage(poolUserEstimates?.supply_apy ?? 0)}
              textColor={theme.palette.lend.main}
              sx={{ width: '100%', padding: '6px' }}
            ></StackedText>
          </Section>
        </Row>
        <LendPositionList poolId={poolId} />
      </Section>
    </Row>
  );
};
