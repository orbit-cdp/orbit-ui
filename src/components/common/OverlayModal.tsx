import { Box } from '@mui/material';
import { useRouter } from 'next/router';
import { TxStatus, useWallet } from '../../contexts/wallet';
import { OverlayModalFail } from './OverlayModalFail';
import { OverlayModalSign } from './OverlayModalSign';
import { OverlayModalSubmit } from './OverlayModalSubmit';
import { OverlayModalSuccess } from './OverlayModalSuccess';
import { PoolComponentProps } from './PoolComponentProps';

export interface OverlayModalProps extends PoolComponentProps {
  type: 'backstop' | 'dashboard';
}

export interface CloseableOverlayProps {
  handleCloseOverlay: () => void;
}

export const OverlayModal: React.FC<OverlayModalProps> = ({ poolId, type }) => {
  const router = useRouter();
  const { txStatus, setTxStatus } = useWallet();

  const display = txStatus !== TxStatus.NONE ? 'flex' : 'none';

  const pathname = type == 'backstop' ? '/backstop' : '/dashboard';

  const handleReturn = () => {
    setTxStatus(TxStatus.NONE);
    router.push({ pathname: pathname, query: { poolId: poolId } });
  };

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
      {txStatus === TxStatus.SUCCESS && <OverlayModalSuccess handleCloseOverlay={handleReturn} />}
      {txStatus === TxStatus.FAIL && <OverlayModalFail handleCloseOverlay={handleReturn} />}
    </Box>
  );
};
