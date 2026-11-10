/**
 * Typed errors with stable machine-readable codes. The HTTP layer maps these
 * to status codes; library users can switch on `code`.
 */
export type BinDaysErrorCode =
  | 'INVALID_INPUT'
  | 'ADDRESS_NOT_FOUND'
  | 'COUNCIL_NOT_SUPPORTED'
  | 'UPSTREAM_ERROR'
  | 'PARSE_ERROR';

export class BinDaysError extends Error {
  constructor(
    readonly code: BinDaysErrorCode,
    message: string,
    readonly details?: Record<string, unknown>,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'BinDaysError';
  }
}

export const invalidInput = (message: string, details?: Record<string, unknown>) =>
  new BinDaysError('INVALID_INPUT', message, details);

export const addressNotFound = (message: string, details?: Record<string, unknown>) =>
  new BinDaysError('ADDRESS_NOT_FOUND', message, details);

export const councilNotSupported = (message: string, details?: Record<string, unknown>) =>
  new BinDaysError('COUNCIL_NOT_SUPPORTED', message, details);

export const upstreamError = (
  message: string,
  details?: Record<string, unknown>,
  cause?: unknown,
) => new BinDaysError('UPSTREAM_ERROR', message, details, { cause });

export const parseError = (message: string, details?: Record<string, unknown>) =>
  new BinDaysError('PARSE_ERROR', message, details);
