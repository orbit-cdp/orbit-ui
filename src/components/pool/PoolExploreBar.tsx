import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useTheme } from '@mui/material';
import { LinkBox } from '../common/LinkBox';
import { OpaqueButton } from '../common/OpaqueButton';
import { Row } from '../common/Row';
import { Section, SectionSize } from '../common/Section';
import { PoolMenu } from './PoolMenu';

export const PoolExploreBar = () => {
  const theme = useTheme();
  return (
    <Row>
      <Section width={SectionSize.LARGE}>
        <PoolMenu />
      </Section>
      <Section width={SectionSize.SMALL} sx={{ alignItems: 'center' }}>
        <LinkBox sx={{ width: '100%', height: '100%' }} to={{ pathname: '/' }}>
          <OpaqueButton
            palette={theme.palette.primary}
            sx={{ width: '100%', height: '100%', justifyContent: 'space-between' }}
          >
            Explore Pools
            <ArrowForwardIcon fontSize="inherit" />
          </OpaqueButton>
        </LinkBox>
      </Section>
    </Row>
  );
};
