/**
 * Cloudflare Workers Environment Type Declarations
 *
 * This file provides TypeScript type declarations for Cloudflare Workers
 * environment bindings and runtime APIs. These types improve developer
 * experience and catch errors at compile time.
 *
 * @see https://developers.cloudflare.com/workers/runtime-apis/
 * @see https://github.com/cloudflare/workers-types
 */

/**
 * Cloudflare Workers environment bindings
 * Extend the Env interface to include all configured bindings
 */
declare global {
  interface CloudflareEnv {
    /** Cloudflare KV namespace for caching */
    CACHE_KV?: KVNamespace;
    /** R2 bucket for object storage */
    ASSETS?: R2Bucket;
    /** D1 database for edge SQL */
    DB?: D1Database;
    /** Queue for background job processing */
    QUEUE?: Queue<unknown>;
    /** Analytics Engine dataset */
    ANALYTICS?: AnalyticsEngineDataset;
    /** Service bindings to other workers */
    SERVICES?: Record<string, Fetcher>;
    /** Secrets (set via wrangler secret) */
    NEXT_PUBLIC_SUPABASE_URL?: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;
    OPENAI_API_KEY?: string;
    ANTHROPIC_API_KEY?: string;
    COST_LIMIT_DAILY?: string;
    NEXT_PUBLIC_APP_URL?: string;
    /** Environment indicator */
    ENVIRONMENT?: 'production' | 'staging' | 'preview' | 'development';
  }

  /**
   * Extended process.env with Cloudflare-specific variables
   * These are set by Cloudflare Workers runtime
   */
  namespace NodeJS {
    interface ProcessEnv extends CloudflareEnv {
      /** Set by Cloudflare Workers runtime */
      CF_WORKER?: string;
      /** Alternative Cloudflare environment indicator */
      CLOUDFLARE?: string;
      /** Cloudflare Workers request context */
      CLOUDFLARE_WORKERS?: string;
      /** Set when running in Cloudflare Pages environment */
      CF_PAGES?: string;
      /** Cloudflare Pages branch name */
      CF_PAGES_BRANCH?: string;
      /** Cloudflare Pages commit SHA */
      CF_PAGES_COMMIT_SHA?: string;
      /** Cloudflare Pages deployment URL */
      CF_PAGES_URL?: string;
      /** Cloudflare region hint */
      CF_REGION?: string;
    }
  }
}

/**
 * KV Namespace type extensions
 * @see https://developers.cloudflare.com/kv/
 */
declare global {
  /**
   * KV namespace key metadata
   */
  interface KVKey {
    name: string;
    expiration?: number;
    metadata?: unknown;
  }

  /**
   * KV namespace list result
   */
  interface KVListResult {
    keys: KVKey[];
    list_complete: boolean;
    cursor?: string;
  }

  /**
   * KV namespace get with metadata result
   */
  interface KVGetResult<T = unknown> {
    value: T | null;
    metadata: unknown | null;
  }

  /**
   * KV namespace options for put operations
   */
  interface KVNamespacePutOptions {
    /** Expiration time in seconds from now */
    expirationTtl?: number;
    /** Absolute expiration time as Unix timestamp */
    expiration?: number;
    /** Content type hint */
    contentType?: string;
    /** Custom metadata */
    metadata?: Record<string, unknown>;
  }

  /**
   * KV namespace interface
   * @see https://developers.cloudflare.com/kv/api/write-key-value-pairs/
   */
  interface KVNamespace {
    get(
      key: string,
      options?: { type?: 'text'; cacheTtl?: number }
    ): Promise<string | null>;
    get(key: string, type: 'text'): Promise<string | null>;
    get(key: string, type: 'json'): Promise<unknown | null>;
    get(key: string, type: 'arrayBuffer'): Promise<ArrayBuffer | null>;
    get(key: string, type: 'stream'): Promise<ReadableStream | null>;
    get(
      key: string,
      options?: {
        type?: 'text' | 'json' | 'arrayBuffer' | 'stream';
        cacheTtl?: number;
      }
    ): Promise<string | ArrayBuffer | ReadableStream | unknown | null>;
    getWithMetadata<T = unknown>(
      key: string,
      type?: 'text' | 'json' | 'arrayBuffer' | 'stream'
    ): Promise<KVGetResult<T>>;
    put(
      key: string,
      value: string | ReadableStream | ArrayBuffer,
      options?: KVNamespacePutOptions
    ): Promise<void>;
    delete(key: string): Promise<void>;
    list(options?: {
      prefix?: string;
      limit?: number;
      cursor?: string;
    }): Promise<KVListResult>;
  }
}

/**
 * D1 Database type extensions
 * @see https://developers.cloudflare.com/d1/
 */
declare global {
  /**
   * D1 prepared statement result
   */
  interface D1Result<T = unknown> {
    results: T[];
    success: boolean;
    meta: {
      duration: number;
      changes: number;
      last_row_id: number;
      rows_read: number;
      rows_written: number;
    };
  }

  /**
   * D1 prepared statement
   */
  interface D1PreparedStatement {
    bind(...values: unknown[]): D1PreparedStatement;
    first<T = unknown>(colName?: string): Promise<T | null>;
    run(): Promise<D1Result>;
    all<T = unknown>(): Promise<D1Result<T>>;
    raw<T = unknown>(): Promise<T[]>;
  }

  /**
   * D1 database interface
   */
  interface D1Database {
    prepare(query: string): D1PreparedStatement;
    dump(): Promise<ArrayBuffer>;
    batch<T = unknown>(
      statements: D1PreparedStatement[]
    ): Promise<D1Result<T>[]>;
    exec(query: string): Promise<D1Result>;
  }
}

/**
 * R2 Bucket type extensions
 * @see https://developers.cloudflare.com/r2/
 */
declare global {
  /**
   * R2 object metadata
   */
  interface R2ObjectMetadata {
    [key: string]: string;
  }

  /**
   * R2 object body
   */
  interface R2ObjectBody {
    body: ReadableStream;
    bodyUsed: boolean;
    arrayBuffer(): Promise<ArrayBuffer>;
    text(): Promise<string>;
    json<T>(): Promise<T>;
    blob(): Promise<Blob>;
  }

  /**
   * R2 object
   */
  interface R2Object extends R2ObjectBody {
    key: string;
    size: number;
    etag: string;
    httpEtag: string;
    checksums: {
      md5: ArrayBuffer;
      sha1: ArrayBuffer;
      sha256: ArrayBuffer;
    };
    uploaded: Date;
    httpMetadata?: {
      contentType?: string;
      contentLanguage?: string;
      contentDisposition?: string;
      contentEncoding?: string;
      cacheControl?: string;
      cacheExpiry?: Date;
    };
    customMetadata?: R2ObjectMetadata;
    range?: {
      offset?: number;
      length?: number;
    };
  }

  /**
   * R2 bucket interface
   */
  interface R2Bucket {
    head(key: string): Promise<R2Object | null>;
    get(
      key: string,
      options?: {
        onlyIf?: {
          etagMatches?: string;
          etagDoesNotMatch?: string;
          uploadedBefore?: Date;
          uploadedAfter?: Date;
        };
        range?: {
          offset: number;
          length?: number;
          suffix?: number;
        };
      }
    ): Promise<R2ObjectBody | null>;
    put(
      key: string,
      value: ReadableStream | ArrayBuffer | string | Blob,
      options?: {
        httpMetadata?:
          | {
              contentType?: string;
              contentLanguage?: string;
              contentDisposition?: string;
              contentEncoding?: string;
              cacheControl?: string;
              cacheExpiry?: Date;
            }
          | Headers;
        customMetadata?: R2ObjectMetadata;
        md5?: ArrayBuffer | string;
        sha1?: ArrayBuffer | string;
        sha256?: ArrayBuffer | string;
        sha384?: ArrayBuffer | string;
        sha512?: ArrayBuffer | string;
      }
    ): Promise<R2Object>;
    delete(key: string): Promise<void>;
    list(options?: {
      prefix?: string;
      delimiter?: string;
      cursor?: string;
      limit?: number;
      startAfter?: string;
    }): Promise<{
      objects: R2Object[];
      delimitedPrefixes: string[];
      truncated: boolean;
      cursor?: string;
    }>;
  }
}

/**
 * Queue type extensions
 * @see https://developers.cloudflare.com/queues/
 */
declare global {
  /**
   * Queue message
   */
  interface QueueMessage<T = unknown> {
    id: string;
    timestamp: Date;
    body: T;
    attempts: number;
  }

  /**
   * Queue interface
   */
  interface Queue<T = unknown> {
    send(message: T, options?: { contentType?: string }): Promise<void>;
    sendBatch(messages: T[], options?: { contentType?: string }): Promise<void>;
  }
}

/**
 * Analytics Engine type extensions
 * @see https://developers.cloudflare.com/analytics/analytics-engine/
 */
declare global {
  /**
   * Analytics Engine dataset interface
   */
  interface AnalyticsEngineDataset {
    writeDataPoint(options: {
      blobs?: [
        string | ArrayBuffer,
        string | ArrayBuffer,
        string | ArrayBuffer,
      ];
      doubles?: [
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
      ];
      indexes?: [
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
      ];
    }): void;
  }
}

/**
 * Fetcher interface for service bindings
 */
declare global {
  interface Fetcher {
    fetch(request: Request): Promise<Response>;
    fetch(url: string, init?: RequestInit): Promise<Response>;
  }
}

export {};
