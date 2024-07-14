import { Typography, useTheme } from '@mui/material';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { FlameIcon } from '../components/common/FlameIcon';
import { ReserveDropdown } from '../components/common/ReserveDropdown';
import { Row } from '../components/common/Row';
import { Section, SectionSize } from '../components/common/Section';
import { StackedText } from '../components/common/StackedText';
import { LendAnvil } from '../components/lend/LendAnvil';
import { useWallet } from '../contexts/wallet';
import { useStore } from '../store/store';
import { getEmissionTextFromValue, toBalance, toPercentage } from '../utils/formatter';
import { getEmissionsPerYearPerUnit } from '../utils/token';

const Borrow: NextPage = () => {
  const theme = useTheme();
  const { connected, walletAddress } = useWallet();

  const router = useRouter();
  const { poolId, assetId } = router.query;
  const safePoolId = 'CBYCVLEHLOVGH6XYYOMXNXWC3AVSYSRUXK3MHWKVIQSDF7JQ2YNEF2FN';
  const safeAssetId = 'CBGO6D5Q3SIPG6QHN2MJ5LQQ6XH2SRPKEB6PLRPS3KWDDPLBMDETEZRK';
  const xlmAssetId = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';
  const usdcAssetId = 'CAQCFVLOBK5GIULPNZRGATJJMIZL5BSP7X5YJVMGCPTUEPFM4AVSRCJU';
  const poolData = useStore((state) => state.pools.get(safePoolId));

  const reserve = poolData?.reserves.get(safeAssetId);
  //totalEstLiabilities / totalEstSupply , you you can just do something like canBorrow = totalSupply * max_util - totalLiabilities
  const maxUtilFraction = (reserve?.config.max_util || 1) / 10 ** (reserve?.config.decimals || 7);
  const totalSupplied = reserve?.estimates.supplied || 0;
  const availableToBorrow = totalSupplied * maxUtilFraction - (reserve?.estimates.borrowed || 0);

  return poolData ? (
    <>
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
        <Section width={SectionSize.FULL} sx={{ marginTop: '12px', marginBottom: '12px' }}>
          <ReserveDropdown action="borrow" poolId={safePoolId} activeReserveId={safeAssetId} />
        </Section>
      </Row>

      <Row>
        <LendAnvil poolId={safePoolId} assetId={xlmAssetId} />
      </Row>
    </>
  ) : (
    <Typography variant="h3" sx={{ color: theme.palette.text.secondary }}>
      {connected ? 'Loading...' : 'Please connect your wallet'}
    </Typography>
  );
};

export default Borrow;
