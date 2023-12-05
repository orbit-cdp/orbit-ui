import { Box } from '@mui/material';
import { useRouter } from 'next/router';
import { TxStatus, useWallet } from '../../contexts/wallet';
import { OverlayModalFail } from './OverlayModalFail';
import { OverlayModalSuccess } from './OverlayModalSuccess';
import { OverlayModalText } from './OverlayModalText';
import { PoolComponentProps } from './PoolComponentProps';

export interface OverlayModalProps extends PoolComponentProps {
  type: 'backstop' | 'dashboard' | 'market';
}

export interface CloseableOverlayProps {
  handleCloseOverlay: () => void;
}

export const OverlayModal: React.FC<OverlayModalProps> = ({ poolId, type }) => {
  const router = useRouter();
  const { txStatus, clearTxStatus } = useWallet();

  const display = txStatus !== TxStatus.NONE ? 'flex' : 'none';

  const handleReturn = () => {
    clearTxStatus();
    if (type == 'market') {
      router.push({ pathname: '/' });
    } else {
      router.push({ pathname: `/${type}`, query: { poolId: poolId } });
    }
  };

  if (txStatus === TxStatus.NONE) {
    return <></>;
  }

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
      {txStatus === TxStatus.BUILDING && (
        <OverlayModalText message="Preparing your transaction..." />
      )}
      {txStatus === TxStatus.SIGNING && (
        <OverlayModalText message="Please confirm the transaction in your wallet." />
      )}
      {txStatus === TxStatus.SUBMITTING && (
        <OverlayModalText message="Submitting your transaction..." />
      )}
      {txStatus === TxStatus.SUCCESS && <OverlayModalSuccess handleCloseOverlay={handleReturn} />}
      {txStatus === TxStatus.FAIL && <OverlayModalFail handleCloseOverlay={handleReturn} />}
    </Box>
  );
};
