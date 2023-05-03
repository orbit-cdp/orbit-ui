import { Box } from '@mui/material';
import { TxStatus, useWallet } from '../../contexts/wallet';
import { OverlayModalFail } from './OverlayModalFail';
import { OverlayModalSign } from './OverlayModalSign';
import { OverlayModalSubmit } from './OverlayModalSubmit';
import { OverlayModalSuccess } from './OverlayModalSuccess';
import { PoolComponentProps } from './PoolComponentProps';

export const OverlayModal: React.FC<PoolComponentProps> = ({ poolId }) => {
  const { txStatus } = useWallet();
  const display = txStatus !== TxStatus.NONE ? 'flex' : 'none';

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        top: '0',
        left: '0',
        display: display,
        position: 'fixed',
        justifyContent: 'top',
        alignItems: 'center',
        zIndex: '10',
        flexWrap: 'wrap',
        flexDirection: 'column',
        backgroundColor: 'rgba(25, 27, 31, 0.9)',
      }}
    >
      {txStatus === TxStatus.SIGNING && <OverlayModalSign />}
      {txStatus === TxStatus.SUBMITTING && <OverlayModalSubmit />}
      {txStatus === TxStatus.SUCCESS && <OverlayModalSuccess poolId={poolId} />}
      {txStatus === TxStatus.FAIL && <OverlayModalFail />}
    </Box>
  );
};
