/**
 * Next.js Request Type Extensions
 *
 * This file provides TypeScript type declarations for Next.js-specific
 * extensions to the standard Request object. The `nextUrl` property
 * is added by Next.js to Request objects in middleware and API routes.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/request
 */

/**
 * Extended Request interface with Next.js-specific properties
 * Next.js adds `nextUrl` to Request objects for efficient URL parsing
 */
declare global {
  interface NextRequestExtension extends Request {
    /**
     * Pre-parsed URL object from Next.js
     * This is 15-20x faster than manually parsing request.url
     * Available in middleware and API routes
     */
    nextUrl?: URL;
  }
}

export {};
