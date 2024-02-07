import { Typography, useTheme } from '@mui/material';
import { useStore } from '../../store/store';
import { toBalance, toPercentage } from '../../utils/formatter';
import { FlameIcon } from '../common/FlameIcon';
import { PoolComponentProps } from '../common/PoolComponentProps';
import { Row } from '../common/Row';
import { Section, SectionSize } from '../common/Section';
import { StackedText } from '../common/StackedText';
import { LendPositionList } from './LendPositionList';

export const LendPositions: React.FC<PoolComponentProps> = ({ poolId }) => {
  const theme = useTheme();

  const userPoolData = useStore((state) => state.userPoolData.get(poolId));

  if (!userPoolData || userPoolData.estimates.totalSupplied == 0) {
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
              text={`$${toBalance(userPoolData.estimates.totalSupplied ?? 0)}`}
              textColor={theme.palette.lend.main}
              sx={{ width: '100%', padding: '6px' }}
            ></StackedText>
          </Section>
          <Section width={SectionSize.TILE} sx={{ background: theme.palette.lend.opaque }}>
            <StackedText
              title="APY"
              titleColor={theme.palette.text.primary}
              text={toPercentage(userPoolData.estimates.supplyApy ?? 0)}
              textColor={theme.palette.lend.main}
              sx={{ width: '100%', padding: '6px' }}
            ></StackedText>
            {userPoolData.emissions.supplyEmissions && (
              <FlameIcon
                width={22}
                height={22}
                title={` This asset earns ${getEmissionsPerDayPerUnit(
                  reserve.supplyEmissions?.config.eps || BigInt(0),
                  reserve.estimates.supplied,
                  reserve.config.decimals
                ).toFixed(2)} BLND/day emissions`}
              />
            )}
          </Section>
        </Row>
        <LendPositionList poolId={poolId} />
      </Section>
    </Row>
  );
};
