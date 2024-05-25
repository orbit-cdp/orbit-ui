import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box, Link, Typography, useTheme } from '@mui/material';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { BorrowAnvil } from '../components/borrow/BorrowAnvil';
import { FlameIcon } from '../components/common/FlameIcon';
import { GoBackHeader } from '../components/common/GoBackHeader';
import { ReserveDropdown } from '../components/common/ReserveDropdown';
import { Row } from '../components/common/Row';
import { Section, SectionSize } from '../components/common/Section';
import { StackedText } from '../components/common/StackedText';
import { useWallet } from '../contexts/wallet';
import { useStore } from '../store/store';
import { getEmissionTextFromValue, toBalance, toPercentage } from '../utils/formatter';
import { getEmissionsPerYearPerUnit, getTokenLinkFromReserve } from '../utils/token';

const Borrow: NextPage = () => {
  const theme = useTheme();
  const { connected, walletAddress } = useWallet();

  const router = useRouter();
  const { poolId, assetId } = router.query;
  const safePoolId = typeof poolId == 'string' && /^[0-9A-Z]{56}$/.test(poolId) ? poolId : '';
  const safeAssetId = typeof assetId == 'string' && /^[0-9A-Z]{56}$/.test(assetId) ? assetId : '';

  const poolData = useStore((state) => state.pools.get(safePoolId));

  const reserve = poolData?.reserves.get(safeAssetId);
  //totalEstLiabilities / totalEstSupply , you you can just do something like canBorrow = totalSupply * max_util - totalLiabilities
  const maxUtilFraction = (reserve?.config.max_util || 1) / 10 ** (reserve?.config.decimals || 7);
  const totalSupplied = reserve?.estimates.supplied || 0;
  const availableToBorrow = totalSupplied * maxUtilFraction - (reserve?.estimates.borrowed || 0);

  return (
    <>
      <Row>
        <GoBackHeader name={poolData?.config.name} />
      </Row>
      <Row>
        <Section width={SectionSize.FULL} sx={{ marginTop: '12px', marginBottom: '12px' }}>
          <ReserveDropdown action="borrow" poolId={safePoolId} activeReserveId={safeAssetId} />
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
                Available
              </Typography>
              <Typography variant="h4" sx={{ color: theme.palette.borrow.main }}>
                {toBalance(availableToBorrow, reserve?.config.decimals)}
              </Typography>
            </Box>
            <Box>
              <Link
                target="_blank"
                href={getTokenLinkFromReserve(reserve)}
                variant="h5"
                rel="noopener"
                sx={{
                  color: theme.palette.text.secondary,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  borderBottom: '.5px solid transparent',
                  '&:hover': {
                    borderBottom: `.5px solid ${theme.palette.text.secondary}`,
                  },
                }}
              >
                <Typography variant="h5" sx={{ color: theme.palette.text.secondary }}>
                  {reserve?.tokenMetadata?.symbol ?? ''}
                </Typography>
                <OpenInNewIcon fontSize="inherit" />
              </Link>
            </Box>
          </Box>
        </Section>
      </Row>
      <Row>
        <Section
          width={SectionSize.THIRD}
          style={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <StackedText
            title="Borrow APY"
            text={
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {toPercentage(reserve?.estimates.apy)}{' '}
                <FlameIcon
                  width={22}
                  height={22}
                  title={getEmissionTextFromValue(
                    getEmissionsPerYearPerUnit(
                      reserve?.borrowEmissions?.config.eps || BigInt(0),
                      reserve?.estimates.borrowed || 0,
                      reserve?.config.decimals
                    ),
                    reserve?.tokenMetadata?.symbol || 'token'
                  )}
                />
              </div>
            }
            sx={{ padding: '6px' }}
          ></StackedText>
        </Section>
        <Section width={SectionSize.THIRD}>
          <StackedText
            title="Liability factor"
            text={toPercentage(reserve?.getLiabilityFactor())}
            sx={{ width: '100%', padding: '6px' }}
          ></StackedText>
        </Section>
        <Section width={SectionSize.THIRD}>
          <StackedText
            title="Total borrowed"
            text={toBalance(reserve?.estimates.borrowed)}
            sx={{ width: '100%', padding: '6px' }}
          ></StackedText>
        </Section>
      </Row>
      <Row>
        <BorrowAnvil poolId={safePoolId} assetId={safeAssetId} />
      </Row>
    </>
  );
};

export default Borrow;
