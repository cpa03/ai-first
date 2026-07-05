/**
 * Error fingerprint generation utility
 */

import { simpleHash } from '../security/crypto';
import { HASH_CONFIG } from '../config/modular-constants';
import { ErrorCode } from './codes';

const LONG_NUMBER_PATTERN = /\d{4,}/g;
const UUID_PATTERN =
  /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi;
const IP_ADDRESS_PATTERN = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;

export function generateErrorFingerprint(
  code: ErrorCode | string,
  message: string,
  stackFirstLine?: string
): string {
  const normalizedMessage = message
    .replace(UUID_PATTERN, 'UUID')
    .replace(IP_ADDRESS_PATTERN, 'IP')
    .replace(LONG_NUMBER_PATTERN, 'N')
    .toLowerCase()
    .trim();

  const fingerprintInput = stackFirstLine
    ? `${code}:${normalizedMessage}:${stackFirstLine}`
    : `${code}:${normalizedMessage}`;

  const hash = simpleHash(fingerprintInput).substring(
    0,
    HASH_CONFIG.FINGERPRINT_LENGTH
  );

  return `fp_${hash}`;
}
