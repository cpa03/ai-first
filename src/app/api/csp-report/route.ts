import { NextResponse } from 'next/server';
import { createLogger } from '@/lib/logger';

const logger = createLogger('CSPReport');

/**
 * CSP Violation Report Interface
 * Based on the CSP Level 3 specification
 * @see https://w3c.github.io/webappsec-csp/#deprecated-report-uri
 */
interface CSPReportBody {
  'csp-report': {
    'document-uri'?: string;
    referrer?: string;
    'violated-directive'?: string;
    'effective-directive'?: string;
    'original-policy'?: string;
    'blocked-uri'?: string;
    'status-code'?: number;
    'script-sample'?: string;
    'source-file'?: string;
    'line-number'?: number;
    'column-number'?: number;
  };
}

/**
 * CSP Violation Report Endpoint
 *
 * Receives Content Security Policy violation reports from browsers.
 * Logs violations for security monitoring and incident response.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/report-uri
 * @see Issue #891 - CSP reporting capability
 */
export async function POST(request: Request): Promise<Response> {
  try {
    // CSP reports are sent as JSON but browsers may not set proper content-type
    const contentType = request.headers.get('content-type') || '';
    let reportData: CSPReportBody | null = null;

    try {
      if (
        contentType.includes('application/json') ||
        contentType.includes('application/csp-report')
      ) {
        reportData = await request.json();
      } else {
        // Some browsers send CSP reports without proper content-type
        const text = await request.text();
        if (text) {
          reportData = JSON.parse(text) as CSPReportBody;
        }
      }
    } catch (parseError) {
      logger.warn('Failed to parse CSP report', {
        error:
          parseError instanceof Error ? parseError.message : 'Unknown error',
        contentType,
      });
      // Return 204 anyway - don't block browser reporting
      return new NextResponse(null, { status: 204 });
    }

    if (!reportData?.['csp-report']) {
      logger.warn('CSP report missing csp-report field', { reportData });
      return new NextResponse(null, { status: 204 });
    }

    // Extract violation details from report
    const cspReport = reportData['csp-report'];
    const documentUri = cspReport['document-uri'] || 'unknown';
    const blockedUri = cspReport['blocked-uri'] || 'unknown';
    const violatedDirective = cspReport['violated-directive'] || 'unknown';
    const effectiveDirective =
      cspReport['effective-directive'] || violatedDirective;
    const originalPolicy = cspReport['original-policy'] || '';
    const referrer = cspReport['referrer'] || '';
    const sourceFile = cspReport['source-file'] || '';
    const lineNumber = cspReport['line-number'];
    const columnNumber = cspReport['column-number'];
    const scriptSample = cspReport['script-sample'] || '';

    // Determine severity based on violation type
    let severity: 'error' | 'warn' | 'info' = 'warn';
    if (
      violatedDirective.includes('script-src') &&
      blockedUri !== 'inline' &&
      blockedUri !== 'eval'
    ) {
      severity = 'error'; // Potential XSS attempt from external source
    } else if (violatedDirective.includes('default-src')) {
      severity = 'warn';
    } else {
      severity = 'info';
    }

    // Construct log metadata
    const logMetadata: Record<string, unknown> = {
      documentUri,
      blockedUri,
      violatedDirective,
      effectiveDirective,
      referrer: referrer || undefined,
      userAgent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
    };

    // Add source location if available
    if (sourceFile) {
      logMetadata.sourceFile = sourceFile;
      if (lineNumber !== undefined) logMetadata.lineNumber = lineNumber;
      if (columnNumber !== undefined) logMetadata.columnNumber = columnNumber;
    }

    // Truncate long values to prevent log flooding
    if (originalPolicy) {
      logMetadata.originalPolicy = `${originalPolicy.substring(0, 200)}...`;
    }
    if (scriptSample) {
      logMetadata.scriptSample = `${scriptSample.substring(0, 100)}...`;
    }

    // Log the violation with appropriate severity
    if (severity === 'error') {
      logger.error('CSP Violation - Potential XSS Detected', logMetadata);
    } else if (severity === 'warn') {
      logger.warn('CSP Violation Report', logMetadata);
    } else {
      logger.info('CSP Violation Report', logMetadata);
    }

    // Return 204 No Content - browsers don't need a response
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    logger.error('Error processing CSP report', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    // Still return 204 to avoid blocking browser reporting
    return new NextResponse(null, { status: 204 });
  }
}

/**
 * OPTIONS handler for CORS preflight
 * Browsers may send preflight requests before CSP reports
 */
export async function OPTIONS(): Promise<Response> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
