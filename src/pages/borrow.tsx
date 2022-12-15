import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Typography, useTheme } from '@mui/material';
import type { NextPage } from 'next';
import { BorrowAnvil } from '../components/borrow/BorrowAnvil';
import { BorrowDropdown } from '../components/borrow/BorrowDropdown';
import { CustomButton } from '../components/common/CustomButton';
import { Row } from '../components/common/Row';
import { Section, SectionSize } from '../components/common/Section';
import { StackedText } from '../components/common/StackedText';
import { WalletWarning } from '../components/common/WalletWarning';
import { PoolHeader } from '../components/pool/PoolHeader';

const Borrow: NextPage = () => {
  const theme = useTheme();
  return (
    <>
      <Row sx={{ padding: '6px' }}>
        <WalletWarning />
      </Row>
      <Row>
        <Section width={SectionSize.FULL} sx={{ padding: '12px' }}>
          <CustomButton
            id="go-back-button"
            sx={{
              marginRight: '12px',
              '&:hover': { backgroundColor: theme.palette.background.default },
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
              <ArrowBackIcon fontSize="inherit" />
              <Typography
                variant="h5"
                sx={{ paddingLeft: '6px', paddingRight: '6px', lineHeight: '100%' }}
              >
                Go back
              </Typography>
            </Box>
          </CustomButton>
          <PoolHeader name="Blend" />
        </Section>
      </Row>
      <Row>
        <Section width={SectionSize.FULL} sx={{ marginTop: '12px', marginBottom: '12px' }}>
          <BorrowDropdown />
        </Section>
      </Row>
      <Row>
        <Section width={SectionSize.FULL} sx={{ padding: '12px' }}>
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <Typography variant="h5" sx={{ marginRight: '6px' }}>
                Balance
              </Typography>
              <Typography variant="h4" sx={{ color: theme.palette.borrow.main }}>
                688.666k
              </Typography>
            </Box>
            <Box>
              <Typography variant="h5" sx={{ color: theme.palette.text.secondary }}>
                USDC
              </Typography>
            </Box>
          </Box>
        </Section>
      </Row>
      <Row>
        <Section width={SectionSize.THIRD}>
          <StackedText
            title="Borrow APR"
            text="28.888%"
            sx={{ width: '100%', padding: '6px' }}
          ></StackedText>
        </Section>
        <Section width={SectionSize.THIRD}>
          <StackedText
            title="Liability factor"
            text="28.888%"
            sx={{ width: '100%', padding: '6px' }}
          ></StackedText>
        </Section>
        <Section width={SectionSize.THIRD}>
          <StackedText
            title="Total borrowed"
            text="88.888M"
            sx={{ width: '100%', padding: '6px' }}
          ></StackedText>
        </Section>
      </Row>
      <Row>
        <BorrowAnvil />
      </Row>
    </>
  );
};

export default Borrow;
