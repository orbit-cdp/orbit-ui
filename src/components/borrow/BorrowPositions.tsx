import { Typography, useTheme } from '@mui/material';
import { Row } from '../common/Row';
import { Section, SectionSize } from '../common/Section';
import { StackedText } from '../common/StackedText';
import { BorrowPositionList } from './BorrowPositionList';

export const BorrowPositions = () => {
  const theme = useTheme();

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
              text="888.668k"
              textColor={theme.palette.borrow.main}
              sx={{ width: '100%', padding: '6px' }}
            ></StackedText>
          </Section>
          <Section width={SectionSize.TILE} sx={{ background: theme.palette.borrow.opaque }}>
            <StackedText
              title="APR"
              titleColor={theme.palette.text.primary}
              text="28.888%"
              textColor={theme.palette.borrow.main}
              sx={{ width: '100%', padding: '6px' }}
            ></StackedText>
          </Section>
        </Row>
        <BorrowPositionList />
      </Section>
    </Row>
  );
};
