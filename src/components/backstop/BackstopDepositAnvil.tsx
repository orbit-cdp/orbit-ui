import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import { Box, Typography, useTheme } from '@mui/material';
import { InputBar } from '../common/InputBar';
import { OpaqueButton } from '../common/OpaqueButton';
import { Row } from '../common/Row';
import { Section, SectionSize } from '../common/Section';

export const BackstopDepositAnvil = () => {
  const theme = useTheme();

  return (
    <Row>
      <Section
        width={SectionSize.FULL}
        sx={{ padding: '0px', display: 'flex', flexDirection: 'column' }}
      >
        <Box
          sx={{
            background: theme.palette.backstop.opaque,
            width: '100%',
            borderRadius: '5px',
            padding: '12px',
            marginBottom: '12px',
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
          }}
        >
          <Typography variant="body2" sx={{ marginLeft: '12px', marginBottom: '12px' }}>
            Amount to deposit
          </Typography>
          <Box
            sx={{
              width: '100%',
              height: '35px',
              display: 'flex',
              flexDirection: 'row',
              marginBottom: '12px',
            }}
          >
            <InputBar palette={theme.palette.backstop} sx={{ width: '100%' }} />
            <OpaqueButton
              palette={theme.palette.backstop}
              sx={{ minWidth: '108px', marginLeft: '12px', padding: '6px' }}
            >
              Deposit
            </OpaqueButton>
          </Box>
          <Box sx={{ marginLeft: '12px' }}>
            <Typography variant="h5" sx={{ color: theme.palette.text.secondary }}>
              $100.00
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            marginLeft: '24px',
            marginBottom: '12px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <LocalGasStationIcon
            fontSize="inherit"
            sx={{ color: theme.palette.text.secondary, marginRight: '6px' }}
          />
          <Typography variant="h5" sx={{ color: theme.palette.text.secondary, marginRight: '6px' }}>
            $28.88
          </Typography>
          <HelpOutlineIcon fontSize="inherit" sx={{ color: theme.palette.text.secondary }} />
        </Box>
      </Section>
    </Row>
  );
};
