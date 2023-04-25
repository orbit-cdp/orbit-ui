import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, Typography, useTheme } from '@mui/material';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { BackstopEarnings } from '../components/backstop/BackstopEarnings';
import { BackstopQueue } from '../components/backstop/BackstopQueue';
import { CustomButton } from '../components/common/CustomButton';
import { Divider } from '../components/common/Divider';
import { LinkBox } from '../components/common/LinkBox';
import { Row } from '../components/common/Row';
import { Section, SectionSize } from '../components/common/Section';
import { SectionBase } from '../components/common/SectionBase';
import { StackedText } from '../components/common/StackedText';
import { ToggleButton } from '../components/common/ToggleButton';
import { TokenIcon } from '../components/common/TokenIcon';
import { WalletWarning } from '../components/common/WalletWarning';
import { PoolExploreBar } from '../components/pool/PoolExploreBar';
import { useSettings, ViewType } from '../contexts';
import { useStore } from '../store/store';

const Backstop: NextPage = () => {
  const router = useRouter();
  const { poolId } = router.query;

  const { refreshBackstopUserData } = useStore();

  const { viewType } = useSettings();

  const theme = useTheme();

  const [deposit, setDeposit] = useState<boolean>(true);

  const handleDepositClick = () => {
    if (!deposit) {
      setDeposit(true);
    }
  };

  const handleWithdrawClick = () => {
    if (deposit) {
      setDeposit(false);
    }
  };

  useEffect(() => {
    refreshBackstopUserData('GA5XD47THVXOJFNSQTOYBIO42EVGY5NF62YUAZJNHOQFWZZ2EEITVI5K');
  }, [refreshBackstopUserData]);

  return (
    <>
      <Row sx={{ padding: '6px' }}>
        <WalletWarning />
      </Row>
      <PoolExploreBar />
      <Row>
        <SectionBase type="alt" sx={{ margin: '6px', padding: '6px' }}>
          Backstop Manager
        </SectionBase>
      </Row>
      <Divider />
      <Row>
        <Section width={SectionSize.THIRD}>
          <StackedText
            title="Backstop APR"
            text="28.888%"
            sx={{ width: '100%', padding: '6px' }}
          ></StackedText>
        </Section>
        <Section width={SectionSize.THIRD}>
          <StackedText
            title="Q4W"
            text="28.888%"
            sx={{ width: '100%', padding: '6px' }}
          ></StackedText>
        </Section>
        <Section width={SectionSize.THIRD}>
          <StackedText
            title="Total deposited"
            text="88.888M"
            sx={{ width: '100%', padding: '6px' }}
          ></StackedText>
        </Section>
      </Row>
      <Row>
        <Section width={SectionSize.FULL} sx={{ padding: '0px' }}>
          <ToggleButton
            active={deposit}
            palette={theme.palette.backstop}
            sx={{
              width: '50%',
              padding: '12px',
              '&:hover': {
                background: '#E16BFF15',
              },
            }}
            onClick={handleDepositClick}
          >
            Deposit
          </ToggleButton>
          <ToggleButton
            active={!deposit}
            palette={theme.palette.backstop}
            sx={{
              width: '50%',
              padding: '12px',
              '&:hover': {
                background: '#E16BFF15',
              },
            }}
            onClick={handleWithdrawClick}
          >
            Withdraw
          </ToggleButton>
        </Section>
      </Row>
      <Row>
        <Section width={SectionSize.FULL} sx={{ flexDirection: 'column', paddingTop: '12px' }}>
          <Typography variant="body2" sx={{ margin: '6px' }}>{`Available to ${
            deposit ? 'deposit' : 'withdraw'
          }`}</Typography>
          <Row>
            <LinkBox
              sx={{ width: '100%', marginRight: '12px' }}
              to={{ pathname: '/backstop-deposit', query: { poolId: 'poolId' } }}
            >
              <CustomButton
                sx={{
                  width: '100%',
                  margin: '6px',
                  padding: '12px',
                  color: theme.palette.text.primary,
                  backgroundColor: theme.palette.background.default,
                  '&:hover': {
                    color: theme.palette.backstop.main,
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                  <TokenIcon symbol="blnd" sx={{ marginRight: '12px' }}></TokenIcon>
                  <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    <Typography variant="h4" sx={{ marginRight: '6px' }}>
                      688.666k
                    </Typography>
                    <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                      BLND
                    </Typography>
                  </Box>
                </Box>
                <ArrowForwardIcon fontSize="inherit" />
              </CustomButton>
            </LinkBox>
          </Row>
          <Row>
            <LinkBox
              sx={{ width: '100%', marginRight: '12px' }}
              to={{ pathname: '/backstop-deposit', query: { poolId: 'poolId' } }}
            >
              <CustomButton
                sx={{
                  width: '100%',
                  margin: '6px',
                  padding: '12px',
                  color: theme.palette.text.primary,
                  backgroundColor: theme.palette.background.default,
                  '&:hover': {
                    color: theme.palette.backstop.main,
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                  <TokenIcon symbol="blndusdclp" sx={{ marginRight: '12px' }}></TokenIcon>
                  <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    <Typography variant="h4" sx={{ marginRight: '6px' }}>
                      668.886k
                    </Typography>
                    <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                      BLND-USDC LP
                    </Typography>
                  </Box>
                </Box>
                <ArrowForwardIcon fontSize="inherit" />
              </CustomButton>
            </LinkBox>
          </Row>
        </Section>
      </Row>
      {viewType === ViewType.REGULAR && (
        <Row sx={{ marginBottom: '12px' }}>
          <BackstopEarnings />
          <BackstopQueue />
        </Row>
      )}
      {viewType !== ViewType.REGULAR && (
        <Row sx={{ marginBottom: '12px', flexWrap: 'wrap' }}>
          <BackstopEarnings />
          <BackstopQueue />
        </Row>
      )}
    </>
  );
};

export default Backstop;
