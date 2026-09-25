import { ValidationError, ValidationResult } from './input-sanitizer';

/**
 * XSS (Cross-Site Scripting) sanitization utilities.
 * Advanced XSS prevention beyond basic HTML escaping.
 */

// Extended XSS patterns to detect
const XSS_PATTERNS = {
  // Script tags
  SCRIPT_TAG: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  // Event handlers
  EVENT_HANDLERS: /\son\w+\s*=\s*["'][^"']*["']/gi,
  // JavaScript protocol
  JAVASCRIPT_PROTOCOL: /javascript\s*:/gi,
  // Data URI with HTML
  DATA_URI_HTML: /data\s*:\s*text\/html/gi,
  // VBScript protocol
  VBSCRIPT_PROTOCOL: /vbscript\s*:/gi,
  // Expression (IE)
  EXPRESSION: /expression\s*\(/gi,
  // Style with behavior
  STYLE_BEHAVIOR: /behavior\s*:\s*url/gi,
  // Import in style
  STYLE_IMPORT: /@import/gi,
  // Meta refresh
  META_REFRESH: /<meta[^>]*http-equiv\s*=\s*["']refresh["'][^>]*>/gi,
  // Iframe
  IFRAME: /<iframe\b[^>]*>/gi,
  // Object/embed
  OBJECT_EMBED: /<(?:object|embed)\b[^>]*>/gi,
  // Form action hijacking
  FORM_ACTION: /<form[^>]*action\s*=/gi,
  // Input with formaction
  INPUT_FORMACTION: /<input[^>]*formaction\s*=/gi,
  // Base tag
  BASE_TAG: /<base[^>]*href\s*=/gi,
};

/**
 * XSS sanitization options
 */
export interface XSSSanitizeOptions {
  /** Allow basic formatting tags (b, i, u, em, strong, etc.) */
  allowBasicFormatting?: boolean;
  /** Allow links */
  allowLinks?: boolean;
  /** Allow images */
  allowImages?: boolean;
  /** Custom allowed tags */
  allowedTags?: string[];
  /** Custom allowed attributes */
  allowedAttributes?: string[];
}

/**
 * Default allowed tags for basic formatting
 */
const DEFAULT_ALLOWED_TAGS = [
  'b',
  'i',
  'u',
  'em',
  'strong',
  'p',
  'br',
  'ul',
  'ol',
  'li',
  'blockquote',
  'code',
  'pre',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
];

/**
 * Default allowed attributes
 */
const DEFAULT_ALLOWED_ATTRIBUTES = [
  'href',
  'src',
  'alt',
  'title',
  'class',
  'id',
];

/**
 * Sanitize HTML with configurable options
 */
export function sanitizeXSS(
  input: string,
  options: XSSSanitizeOptions = {}
): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  const {
    allowBasicFormatting = true,
    allowLinks = true,
    allowImages = false,
    allowedTags = [],
    allowedAttributes = [],
  } = options;

  let sanitized = input;

  // First pass: Remove dangerous patterns
  for (const pattern of Object.values(XSS_PATTERNS)) {
    sanitized = sanitized.replace(pattern, '');
  }

  // Second pass: Remove style attributes that could contain XSS
  sanitized = sanitized.replace(/\sstyle\s*=\s*["'][^"']*["']/gi, '');

  // Third pass: Handle allowed tags and attributes
  if (
    allowBasicFormatting ||
    allowLinks ||
    allowImages ||
    allowedTags.length > 0
  ) {
    const allAllowedTags = [
      ...(allowBasicFormatting ? DEFAULT_ALLOWED_TAGS : []),
      ...(allowLinks ? ['a'] : []),
      ...(allowImages ? ['img'] : []),
      ...allowedTags,
    ];

    const allAllowedAttributes = [
      ...DEFAULT_ALLOWED_ATTRIBUTES,
      ...allowedAttributes,
    ];

    // Remove disallowed tags but keep their content
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/gi;
    sanitized = sanitized.replace(tagRegex, (match, tagName) => {
      const isClosing = match.startsWith('</');
      const lowerTag = tagName.toLowerCase();

      if (allAllowedTags.includes(lowerTag)) {
        // For allowed tags, filter attributes
        if (!isClosing) {
          return filterAttributes(match, allAllowedAttributes);
        }
        return match;
      }
      // Disallowed tag: remove entirely (but keep content for non-void tags)
      return '';
    });
  } else {
    // No tags allowed - strip all tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  }

  // Final pass: Escape remaining HTML entities
  sanitized = escapeHtmlEntities(sanitized);

  return sanitized;
}

/**
 * Filter attributes on a tag, keeping only allowed ones
 */
function filterAttributes(tag: string, allowedAttributes: string[]): string {
  // Match tag with attributes
  const tagMatch = tag.match(/^<([a-zA-Z][a-zA-Z0-9]*)\s*([^>]*)>$/);
  if (!tagMatch) return tag;

  const [, tagName, attributesStr] = tagMatch;
  const isVoidTag = ['br', 'hr', 'img', 'input', 'meta', 'link'].includes(
    tagName.toLowerCase()
  );

  // Parse attributes
  const attrRegex = /([a-zA-Z_:][a-zA-Z0-9_:.-]*)\s*=\s*(["'])(.*?)\2/g;
  let filteredAttrs = '';
  let match;

  while ((match = attrRegex.exec(attributesStr)) !== null) {
    const [, attrName, , attrValue] = match;
    if (allowedAttributes.includes(attrName.toLowerCase())) {
      // Additional validation for href/src
      if (
        (attrName === 'href' || attrName === 'src') &&
        !isSafeUrl(attrValue)
      ) {
        continue; // Skip unsafe URLs
      }
      filteredAttrs += ` ${attrName}="${escapeHtmlEntities(attrValue)}"`;
    }
  }

  return `<${tagName}${filteredAttrs}${isVoidTag ? ' /' : ''}>`;
}

/**
 * Check if a URL is safe (no javascript:, data:, vbscript: protocols)
 */
function isSafeUrl(url: string): boolean {
  // Browsers strip ASCII tab/LF/CR from URLs before parsing the scheme, so
  // an obfuscated value like 'java\tscript:' executes as 'javascript:'.
  // Remove those characters before checking the scheme.
  const lowerUrl = url
    .toLowerCase()
    .replace(/[\t\n\r]/g, '')
    .trim();

  const dangerousProtocols = ['javascript:', 'vbscript:'];

  if (dangerousProtocols.some((proto) => lowerUrl.startsWith(proto))) {
    return false;
  }

  // Block all data: URLs except inert bitmap images. In particular this
  // blocks data:text/html, data:application/javascript, and
  // data:image/svg+xml (script-capable via embedded scripts/event handlers).
  if (lowerUrl.startsWith('data:')) {
    return /^data:image\/(png|jpe?g|gif|webp)[;,]/.test(lowerUrl);
  }

  return true;
}

/**
 * Escape HTML entities
 */
function escapeHtmlEntities(text: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
  };

  return text.replace(/[&<>"'`/]/g, (char) => escapeMap[char] || char);
}

/**
 * Strict XSS sanitization - removes all tags and escapes entities
 */
export function sanitizeXSSStrict(input: string): string {
  return sanitizeXSS(input, {
    allowBasicFormatting: false,
    allowLinks: false,
    allowImages: false,
  });
}

/**
 * Lenient XSS sanitization - allows basic formatting and links
 */
export function sanitizeXSSLenient(input: string): string {
  return sanitizeXSS(input, {
    allowBasicFormatting: true,
    allowLinks: true,
    allowImages: true,
  });
}

/**
 * Validate that input doesn't contain XSS patterns
 */
export function validateNoXSS(
  input: unknown,
  fieldName: string = 'input'
): ValidationResult {
  const errors: ValidationError[] = [];

  if (!input || typeof input !== 'string') {
    return { valid: true, errors: [] };
  }

  for (const [type, pattern] of Object.entries(XSS_PATTERNS)) {
    // Patterns carry the /g flag for use with .replace() in sanitizeXSS;
    // .test() on a /g regex is stateful via lastIndex, so reset it to get
    // a stable result on every call.
    pattern.lastIndex = 0;
    if (pattern.test(input)) {
      errors.push({
        field: fieldName,
        message: `Potential XSS detected (${type}) in ${fieldName}`,
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Sanitize object recursively for XSS
 */
export function sanitizeObjectXSS<T>(
  obj: T,
  options: XSSSanitizeOptions = {}
): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeXSS(obj, options) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObjectXSS(item, options)) as unknown as T;
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = sanitizeObjectXSS(value, options);
    }
    return result as T;
  }

  return obj;
}
