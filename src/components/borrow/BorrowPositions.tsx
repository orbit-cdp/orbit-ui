import { Typography, useTheme } from '@mui/material';
import Image from 'next/image';
import { useStore } from '../../store/store';
import { toBalance, toPercentage } from '../../utils/formatter';
import { PoolComponentProps } from '../common/PoolComponentProps';
import { Row } from '../common/Row';
import { Section, SectionSize } from '../common/Section';
import { StackedText } from '../common/StackedText';
import { BorrowPositionList } from './BorrowPositionList';

export const BorrowPositions: React.FC<PoolComponentProps> = ({ poolId }) => {
  const theme = useTheme();

  const userPoolData = useStore((state) => state.userPoolData.get(poolId));

  if (!userPoolData || userPoolData.estimates.totalBorrowed == 0) {
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
              text={`$${toBalance(userPoolData.estimates.totalBorrowed)}`}
              textColor={theme.palette.borrow.main}
              sx={{ width: '100%', padding: '6px' }}
            ></StackedText>
          </Section>
          <Section width={SectionSize.TILE} sx={{ background: theme.palette.borrow.opaque }}>
            <StackedText
              title="APY"
              titleColor={theme.palette.text.primary}
              text={toPercentage(userPoolData.estimates.borrowApy)}
              textColor={theme.palette.borrow.main}
              sx={{ width: '100%', padding: '6px' }}
            ></StackedText>
            <Image src="/icons/dashboard/flame.svg" height={24} width={24} alt="emmission" />
          </Section>
        </Row>
        <BorrowPositionList poolId={poolId} />
      </Section>
    </Row>
  );
};
