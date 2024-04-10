import { ContractErrorType, parseError } from '@blend-capital/blend-sdk';
import { AlertColor } from '@mui/material';
import { SorobanRpc } from '@stellar/stellar-sdk';

export function getErrorFromSim(
  simulationResult: SorobanRpc.Api.SimulateTransactionResponse | undefined,
  extraValidations?: () => Partial<SubmitError>
): SubmitError {
  let errorProps: SubmitError = {
    isError: false,
    isSubmitDisabled: false,
    isMaxDisabled: false,
    reason: undefined,
    disabledType: undefined,
    requiresRestore: false,
  };
  if (simulationResult && SorobanRpc.Api.isSimulationRestore(simulationResult)) {
    errorProps.requiresRestore = true;
    errorProps.isError = false;
    errorProps.isSubmitDisabled = true;
    errorProps.isMaxDisabled = false;
    errorProps.disabledType = 'warning';
  } else if (simulationResult && SorobanRpc.Api.isSimulationError(simulationResult)) {
    const error = parseError(simulationResult);
    errorProps.isError = true;
    errorProps.isSubmitDisabled = true;
    errorProps.isMaxDisabled = false;
    errorProps.reason = error.message || ContractErrorType[error.type];
    errorProps.disabledType = 'error';
  }
  if (!!extraValidations) {
    errorProps = { ...errorProps, ...extraValidations() };
  }
  return errorProps;
}

export interface SubmitError {
  isError: boolean;
  isSubmitDisabled: boolean;
  isMaxDisabled: boolean;
  reason: string | undefined;
  disabledType: AlertColor | undefined;
  extraContent?: React.ReactNode;
  requiresRestore?: boolean;
}
