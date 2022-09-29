import theme from '../../theme';
import { Row } from './Row';

export const Divider: React.FC<DividerProps> = ({ children, sx, ...props }) => {
  return (
    <Row
      sx={{
        background: theme.palette.background.paper,
        height: '2px',
        width: 'calc(100% - 24px)',
        margin: '12px',
      }}
    ></Row>
  );
};
