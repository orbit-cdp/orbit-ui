import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { Box, useTheme } from '@mui/material';
import { useSettings, ViewType } from '../../contexts';
import { useStore } from '../../store/store';
import { toBalance, toPercentage } from '../../utils/formatter';
import { CustomButton } from '../common/CustomButton';
import { Icon } from '../common/Icon';
import { LinkBox } from '../common/LinkBox';
import { PoolComponentProps } from '../common/PoolComponentProps';
import { Row } from '../common/Row';
import { StackedText } from '../common/StackedText';
import { BorrowCapRing } from './BorrowCapRing';

export const PositionOverview: React.FC<PoolComponentProps> = ({ poolId }) => {
  const { viewType } = useSettings();
  const theme = useTheme();

  const poolUserEstimate = useStore((state) => state.pool_user_est.get(poolId));

  const borrow_capacity = poolUserEstimate
    ? poolUserEstimate.e_collateral_base - poolUserEstimate.e_liabilities_base
    : 0;
  const borrow_capacity_fill = poolUserEstimate
    ? (poolUserEstimate.e_liabilities_base / poolUserEstimate.e_collateral_base) * 100
    : 100;
  const net_apy = Number.isFinite(poolUserEstimate?.net_apy) ? poolUserEstimate?.net_apy : 0;

  return (
    <>
      {viewType === ViewType.REGULAR && (
        <Row>
          <Box
            sx={{
              margin: '12px',
              marginTop: '18px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              width: '50%',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <StackedText
                title="Net APY"
                titleColor="inherit"
                text={toPercentage(net_apy)}
                textColor="inherit"
                type="large"
              />
              <Icon
                src={'/icons/dashboard/net_apr.svg'}
                alt={`backstop size icon`}
                isCircle={false}
                sx={{ marginLeft: '18px' }}
              />
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginLeft: '48px',
              }}
            >
              <StackedText
                title="Borrow Capacity"
                titleColor="inherit"
                text={`$${toBalance(borrow_capacity)}`}
                textColor="inherit"
                type="large"
              />
              <BorrowCapRing status="Active" poolId={''} />
            </Box>
          </Box>
          <LinkBox
            sx={{ width: '45%', marginRight: '12px' }}
            to={{ pathname: '/backstop', query: { poolId: poolId } }}
          >
            <CustomButton
              sx={{
                margin: '6px',
                width: '100%',
                padding: '12px',
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.background.paper,
                '&:hover': {
                  color: theme.palette.primary.main,
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: theme.palette.primary.opaque,
                    color: theme.palette.primary.main,
                    borderRadius: '50%',
                    padding: '4px',
                    marginRight: '12px',
                  }}
                >
                  <LocalFireDepartmentIcon />
                </Box>
                <StackedText
                  title="Claim Pool Emissions"
                  titleColor="inherit"
                  text="100.888k"
                  textColor="inherit"
                  type="large"
                />
              </Box>
              <ArrowForwardIcon fontSize="inherit" />
            </CustomButton>
          </LinkBox>
        </Row>
      )}
      {viewType !== ViewType.REGULAR && (
        <Row sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box
            sx={{
              margin: '12px',
              marginTop: '18px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <StackedText
                title="Net APY"
                titleColor="inherit"
                text={toPercentage(net_apy)}
                textColor="inherit"
                type="large"
              />
              <Icon
                src={'/icons/dashboard/net_apr.svg'}
                alt={`backstop size icon`}
                isCircle={false}
                sx={{ marginLeft: '18px' }}
              />
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginLeft: '48px',
              }}
            >
              <StackedText
                title="Borrow Capacity"
                titleColor="inherit"
                text={`$${toBalance(borrow_capacity)}`}
                textColor="inherit"
                type="large"
              />
              <BorrowCapRing status="Active" poolId={''} />
            </Box>
          </Box>
          <LinkBox
            sx={{ width: '93%', margin: '12px' }}
            to={{ pathname: '/backstop', query: { poolId: poolId } }}
          >
            <CustomButton
              sx={{
                margin: '6px',
                width: '100%',
                padding: '12px',
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.background.paper,
                '&:hover': {
                  color: theme.palette.primary.main,
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: theme.palette.primary.opaque,
                    color: theme.palette.primary.main,
                    borderRadius: '50%',
                    padding: '4px',
                    marginRight: '12px',
                  }}
                >
                  <LocalFireDepartmentIcon />
                </Box>
                <StackedText
                  title="Claim Pool Emissions"
                  titleColor="inherit"
                  text="100.888k"
                  textColor="inherit"
                  type="large"
                />
              </Box>
              <ArrowForwardIcon fontSize="inherit" />
            </CustomButton>
          </LinkBox>
        </Row>
      )}
    </>
  );
};
