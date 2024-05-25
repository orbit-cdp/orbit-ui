import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { IconButton, Typography, useTheme } from '@mui/material';
import type { NextPage } from 'next';
import { BackstopExitAnvil } from '../components/backstop/BackstopExitAnvil';
import { BackstopJoinAnvil } from '../components/backstop/BackstopJoinAnvil';
import { Divider } from '../components/common/Divider';
import { GoBackButton } from '../components/common/GoBackButton';
import { Icon } from '../components/common/Icon';
import { Row } from '../components/common/Row';
import { Section, SectionSize } from '../components/common/Section';
import { StackedText } from '../components/common/StackedText';
import { ToggleButton } from '../components/common/ToggleButton';
import { ViewType, useSettings } from '../contexts';
import { useStore } from '../store/store';
import { toBalance } from '../utils/formatter';

const BackstopToken: NextPage = () => {
  const theme = useTheme();
  const { showJoinPool, setShowJoinPool, viewType } = useSettings();

  const backstopData = useStore((state) => state.backstop);
  const balancesByAddress = useStore((state) => state.balances);
  const userBackstopData = useStore((state) => state.backstopUserData);

  const blndBalance = balancesByAddress.get(backstopData?.config.blndTkn ?? '') ?? BigInt(0);
  const usdcBalance = balancesByAddress.get(backstopData?.config.usdcTkn ?? '') ?? BigInt(0);
  const lpBalance = userBackstopData?.tokens ?? BigInt(0);

  const handleJoinPoolClick = () => {
    if (!showJoinPool) {
      setShowJoinPool(true);
    }
  };

  const handleExitPoolClick = () => {
    if (showJoinPool) {
      setShowJoinPool(false);
    }
  };

  const title = viewType === ViewType.MOBILE ? 'BLND-USDC LP' : '80:20 BLND-USDC Liquidity Pool';

  return (
    <>
      <Row sx={{ margin: '12px', justifyContent: 'flex-start', alignItems: 'center' }}>
        <GoBackButton sx={{ backgroundColor: theme.palette.background.paper, margin: '12px' }} />
        <Icon
          src={'/icons/pageicons/blnd_usdc_pair.svg'}
          alt={`blndusdclp`}
          isCircle={false}
          sx={{ marginRight: '12px', height: '42px', width: '42px' }}
        />
        <Typography variant="h2">{title}</Typography>
        <IconButton
          onClick={() =>
            window.open(
              `${process.env.NEXT_PUBLIC_STELLAR_EXPERT_URL}/contract/${backstopData?.config?.backstopTkn}`,
              '_blank'
            )
          }
          size="small"
          sx={{
            marginLeft: '6px',
            color: theme.palette.text.secondary,
          }}
        >
          <OpenInNewIcon fontSize="inherit" />
        </IconButton>
      </Row>
      <Divider />
      <Row>
        <Section width={SectionSize.FULL} sx={{ padding: '0px' }}>
          <ToggleButton
            active={showJoinPool}
            palette={theme.palette.backstop}
            sx={{ width: '50%', padding: '12px' }}
            onClick={handleJoinPoolClick}
          >
            Join Pool
          </ToggleButton>
          <ToggleButton
            active={!showJoinPool}
            palette={theme.palette.backstop}
            sx={{ width: '50%', padding: '12px' }}
            onClick={handleExitPoolClick}
          >
            Exit Pool
          </ToggleButton>
        </Section>
      </Row>
      {viewType !== ViewType.REGULAR && (
        <Row>
          <Section
            width={SectionSize.FULL}
            sx={{ alignItems: 'center', justifyContent: 'flex-start', padding: '12px' }}
          >
            <Icon
              src={'/icons/tokens/blndusdclp.svg'}
              alt={`lp token icon`}
              sx={{ marginRight: '12px' }}
            />
            <StackedText
              title="Your LP Balance"
              titleColor="inherit"
              text={toBalance(lpBalance, 7)}
              textColor="inherit"
              type="large"
            />
          </Section>
        </Row>
      )}
      <Row>
        {viewType === ViewType.REGULAR && (
          <Section
            width={SectionSize.THIRD}
            sx={{ alignItems: 'center', justifyContent: 'flex-start', padding: '12px' }}
          >
            <Icon
              src={'/icons/tokens/blndusdclp.svg'}
              alt={`lp token icon`}
              sx={{ marginRight: '12px' }}
            />
            <StackedText
              title="Your LP Token Balance"
              titleColor="inherit"
              text={toBalance(lpBalance, 7)}
              textColor="inherit"
              type="large"
            />
          </Section>
        )}
        <Section
          width={viewType === ViewType.REGULAR ? SectionSize.THIRD : SectionSize.TILE}
          sx={{ alignItems: 'center', justifyContent: 'flex-start', padding: '12px' }}
        >
          <Icon src={'/icons/tokens/blnd.svg'} alt={`blnd icon`} sx={{ marginRight: '12px' }} />
          <StackedText
            title="Your BLND Balance"
            titleColor="inherit"
            text={toBalance(blndBalance, 7)}
            textColor="inherit"
            type="large"
          />
        </Section>
        <Section
          width={viewType === ViewType.REGULAR ? SectionSize.THIRD : SectionSize.TILE}
          sx={{ alignItems: 'center', justifyContent: 'flex-start', padding: '12px' }}
        >
          <Icon src={'/icons/tokens/usdc.svg'} alt={`usdc icon`} sx={{ marginRight: '12px' }} />
          <StackedText
            title="Your USDC Balance"
            titleColor="inherit"
            text={toBalance(usdcBalance, 7)}
            textColor="inherit"
            type="large"
          />
        </Section>
      </Row>

      {showJoinPool ? <BackstopJoinAnvil /> : <BackstopExitAnvil />}
    </>
  );
};

export default BackstopToken;
