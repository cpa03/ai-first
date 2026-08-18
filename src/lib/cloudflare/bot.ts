/**
 * Cloudflare bot detection utilities
 *
 * @see https://developers.cloudflare.com/bots/concepts/bot-score/
 */

import { CF_BOT_DETECTION } from '../config/cloudflare-config';
import { CLOUDFLARE_HEADERS } from './headers';
import type { BotDetectionResult } from './types';

/**
 * Detect bot and threat information from Cloudflare headers
 * Useful for rate limiting and security decisions
 *
 * @example
 * ```ts
 * const botInfo = detectBot(request);
 * if (botInfo.isBot || (botInfo.threatScore && botInfo.threatScore > 50)) {
 *   // Apply stricter rate limiting
 * }
 * ```
 */
export function detectBot(request: Request): BotDetectionResult {
  const headers = request.headers;

  const botScoreStr = headers.get(CLOUDFLARE_HEADERS.CF_BOT_SCORE);
  const threatScoreStr = headers.get(CLOUDFLARE_HEADERS.CF_THREAT_SCORE);
  const warpStatus = headers.get(CLOUDFLARE_HEADERS.CF_WARP);
  const tlsFingerprint = headers.get(CLOUDFLARE_HEADERS.CF_TLS_FINGERPRINT);

  const botScore = botScoreStr ? parseInt(botScoreStr, 10) : null;
  const threatScore = threatScoreStr ? parseInt(threatScoreStr, 10) : null;

  // Bot score < threshold is highly likely a bot; threat score > threshold is likely threatening
  // Thresholds are configurable via environment variables
  const isLikelyBot =
    botScore !== null
      ? botScore < CF_BOT_DETECTION.BOT_SCORE_THRESHOLD
      : threatScore !== null &&
        threatScore > CF_BOT_DETECTION.THREAT_SCORE_THRESHOLD;

  return {
    isBot: isLikelyBot,
    botScore: isNaN(botScore as number) ? null : botScore,
    threatScore: isNaN(threatScore as number) ? null : threatScore,
    isWarp: warpStatus === '1' || warpStatus === 'true',
    tlsFingerprint,
  };
}
