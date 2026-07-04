import { SuspiciousPatternCategory } from '@/types/security';

/**
 * Suspicious pattern definitions
 * Organized by category with severity levels
 *
 * Severity levels:
 * 1 = Low (could be false positive)
 * 2 = Medium (likely malicious intent)
 * 3 = High (clearly malicious)
 */
export const SUSPICIOUS_PATTERNS_CONFIG: Record<
  SuspiciousPatternCategory,
  Array<{ pattern: RegExp; severity: 1 | 2 | 3; description: string }>
> = {
  sql_injection: [
    {
      pattern:
        /(\b(union|select|insert|update|delete|drop|create|alter|truncate)\b.{1,100}\b(from|into|table|database|set|where)\b)/is,
      severity: 3,
      description: 'SQL keyword combination',
    },
    {
      pattern: /(--\s*$|;\s*--|\/\*.{1,100}\*\/)/s,
      severity: 3,
      description: 'SQL comment injection',
    },
    {
      pattern: /(\bor\b\s+['"]?([^'"]+)['"]?\s*=\s*['"]?\2['"]?)/is,
      severity: 3,
      description: 'SQL OR tautology',
    },
    {
      pattern: /(\band\b\s+['"]?([^'"]+)['"]?\s*=\s*['"]?\2['"]?)/is,
      severity: 2,
      description: 'SQL AND tautology',
    },
    {
      pattern: /\b(information_schema|pg_catalog|mysql|performance_schema)\b/is,
      severity: 3,
      description: 'SQL system schema access',
    },
    {
      pattern: /\b(extractvalue|updatexml|pg_sleep|sleep)\s*\(/is,
      severity: 3,
      description: 'SQL injection function (error/time-based)',
    },
    {
      pattern: /('\s*(or|and)\s+')/is,
      severity: 1,
      description: 'SQL string injection',
    },
    {
      pattern: /(exec\s*\(|execute\s+)/is,
      severity: 2,
      description: 'SQL execution attempt',
    },
    {
      pattern: /(waitfor\s+delay|benchmark\s*\()/is,
      severity: 2,
      description: 'SQL time-based injection',
    },
    {
      pattern: /(\b(select|union|insert|update|delete|drop)\b)/is,
      severity: 1,
      description: 'SQL keyword present',
    },
  ],

  xss: [
    {
      pattern: /<script[^>]*>[\s\S]*?<\/script>/gis,
      severity: 3,
      description: 'Script tag injection',
    },
    {
      pattern: /javascript\s*:/gi,
      severity: 3,
      description: 'JavaScript protocol',
    },
    {
      pattern:
        /on(load|error|click|mouse|focus|blur|key|submit|change|scroll)\s*=/gi,
      severity: 3,
      description: 'Event handler injection',
    },
    {
      pattern: /\bsrcdoc\s*=/gi,
      severity: 3,
      description: 'Iframe srcdoc injection',
    },
    {
      pattern: /\b(data|vbscript|javascript)\s*:/gi,
      severity: 3,
      description: 'Malicious protocol URI',
    },
    {
      pattern: /<iframe[^>]*>/gi,
      severity: 3,
      description: 'Iframe injection',
    },
    {
      pattern: /<object[^>]*>/gi,
      severity: 3,
      description: 'Object tag injection',
    },
    {
      pattern: /<embed[^>]*>/gi,
      severity: 3,
      description: 'Embed tag injection',
    },
    {
      pattern: /<img[^>]+onerror\s*=/gi,
      severity: 2,
      description: 'Image onerror injection',
    },
    {
      pattern: /<svg[^>]*onload\s*=/gi,
      severity: 2,
      description: 'SVG onload injection',
    },
    {
      pattern: /expression\s*\(/gi,
      severity: 2,
      description: 'CSS expression injection',
    },
    {
      pattern: /&#x?\d+;/gi,
      severity: 1,
      description: 'HTML entity encoding',
    },
  ],

  path_traversal: [
    {
      pattern: /(\.\.\/|\.\.\\){2,}/,
      severity: 3,
      description: 'Multiple path traversal sequences',
    },
    {
      pattern: /\/etc\/(passwd|shadow|hosts|group|issue|hostname)/i,
      severity: 3,
      description: 'Sensitive file access attempt',
    },
    {
      pattern: /\/(proc|sys|dev|root|usr\/local\/bin)\//i,
      severity: 3,
      description: 'System file access attempt',
    },
    {
      pattern:
        /C:\\(Windows|winnt|boot\.ini|inetpub|config\.sys|autoexec\.bat)/i,
      severity: 3,
      description: 'Windows sensitive file access attempt',
    },
    {
      pattern:
        /(?:\/|^)(\.env|\.git|\.ssh|\.aws|\.bash_history|\.zsh_history|\.npmrc|\.yarnrc|\.docker|id_rsa|id_dsa|authorized_keys|known_hosts)\b/i,
      severity: 3,
      description: 'Sensitive configuration or history file access',
    },
    {
      pattern: /\.\.[\/\\]/,
      severity: 2,
      description: 'Path traversal sequence',
    },
    {
      pattern: /%2e%2e[%\/\\]/i,
      severity: 2,
      description: 'URL-encoded path traversal',
    },
    {
      pattern: /\.\.%2f/i,
      severity: 2,
      description: 'Mixed encoding path traversal',
    },
  ],

  command_injection: [
    {
      pattern:
        /(?:[;&|`]\s*|\b)(rm|del|format|fdisk|shutdown|reboot|halt|init|env|printenv|powershell|pwsh|cmd\.exe)\b/i,
      severity: 3,
      description: 'Destructive or sensitive command injection',
    },
    {
      pattern:
        /[;&|`]\s*(whoami|id|hostname|uname|tasklist|netstat|ipconfig|ifconfig|arp|route)\b/i,
      severity: 3,
      description: 'Reconnaissance command injection',
    },
    {
      pattern:
        /\bprocess\.(?:exit|env|mainModule|global|cwd|memoryUsage|version)\b/,
      severity: 3,
      description: 'Node.js process object injection',
    },
    {
      pattern: /\$\([^)]+\)/,
      severity: 3,
      description: 'Command substitution',
    },
    {
      pattern: /`[^`]+`/,
      severity: 3,
      description: 'Backtick command execution',
    },
    {
      pattern:
        /\$\{IFS\}|(?:\/usr\/bin\/)?(?:nc|netcat|ncat|bash|python|perl|php|ruby|lua)\s+-e\s+['"]?\/bin\/(?:ba)?sh['"]?/i,
      severity: 3,
      description: 'Shell bypass or reverse shell execution',
    },
    {
      pattern: /[;&|`]\s*(cat|ls|dir|type|more|less|head|tail)\s/i,
      severity: 2,
      description: 'File reading command',
    },
    {
      pattern: /[;&|`]\s*(wget|curl|fetch|lynx|links)\s/i,
      severity: 2,
      description: 'Download command',
    },
    {
      pattern: /\|\s*(bash|sh|cmd|powershell|python|perl|ruby|php)/i,
      severity: 2,
      description: 'Shell pipe injection',
    },
    {
      pattern: /[;&|`]/,
      severity: 1,
      description: 'Shell metacharacter present',
    },
  ],

  ssrf: [
    {
      pattern: /(localhost|127\.0\.0\.1|0\.0\.0\.0|::1)/i,
      severity: 2,
      description: 'Localhost SSRF attempt',
    },
    {
      pattern:
        /(169\.254\.169\.254|168\.63\.129\.16|100\.100\.100\.200|192\.0\.0\.192|metadata\.google|fd00:ec2::254)/i,
      severity: 3,
      description: 'Cloud metadata access attempt',
    },
    {
      pattern: /(metadata\.google\.internal|instance-data|169\.254\.)/i,
      severity: 3,
      description: 'Expanded cloud metadata or link-local access attempt',
    },
    {
      pattern: /internal\.(service|api|host)/i,
      severity: 2,
      description: 'Internal service access attempt',
    },
    {
      pattern:
        /(?:https?|gopher|ftp|dict|file):\/\/(?:0x[0-9a-f]+|[0-9]{8,12}|0[0-7]{10,12})\b/i,
      severity: 3,
      description: 'Non-standard IP encoding SSRF (hex, decimal, or octal)',
    },
    {
      pattern: /\[?::ffff:(?:127\.0\.0\.1|169\.254\.\d+\.\d+)\]?/i,
      severity: 3,
      description: 'IPv6-mapped IPv4 SSRF',
    },
    {
      pattern: /file:\/\//i,
      severity: 2,
      description: 'File protocol SSRF',
    },
    {
      pattern: /gopher:\/\//i,
      severity: 2,
      description: 'Gopher protocol SSRF',
    },
    {
      pattern: /dict:\/\//i,
      severity: 2,
      description: 'Dict protocol SSRF',
    },
    {
      pattern: /(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/,
      severity: 1,
      description: 'Private IP address',
    },
  ],

  header_injection: [
    {
      pattern: /[\r\n]\s*(content-type|content-length|location|set-cookie):/i,
      severity: 3,
      description: 'HTTP response splitting',
    },
    {
      pattern: /[\r\n]\s*\r\n/,
      severity: 3,
      description: 'Header terminator injection',
    },
    {
      pattern: /[\r\n]/,
      severity: 2,
      description: 'CRLF sequence',
    },
    {
      pattern: /%0[dDaAeE]/,
      severity: 2,
      description: 'URL-encoded CRLF',
    },
  ],

  encoding_attack: [
    {
      pattern: /%25[0-9a-fA-F]{2}/,
      severity: 2,
      description: 'Double URL encoding',
    },
    {
      pattern: /%u[0-9a-fA-F]{4}/,
      severity: 2,
      description: 'Unicode encoding',
    },
    {
      pattern: /\\x[0-9a-fA-F]{2}/,
      severity: 2,
      description: 'Hex encoding',
    },
    {
      pattern: /&#x?[0-9a-fA-F]+;/,
      severity: 1,
      description: 'HTML numeric entity',
    },
  ],

  nosql_injection: [
    {
      pattern: /\$(where|accumulator|function)['"]?\s*[:\]]/i,
      severity: 3,
      description: 'MongoDB NoSQL injection operator',
    },
    {
      pattern:
        /\$(gt|gte|lt|lte|ne|eq|in|nin|exists|type|mod|regex|text|all|elemMatch|size|expr|jsonSchema)['"]?\s*[:\]]/i,
      severity: 3,
      description: 'MongoDB operator injection',
    },
    {
      pattern: /\$javascript/i,
      severity: 3,
      description: 'MongoDB JavaScript injection',
    },
    {
      pattern: /{\s*\$.*?:/i,
      severity: 2,
      description: 'NoSQL query operator pattern',
    },
    {
      pattern: /\$or\s*:\s*\[/i,
      severity: 2,
      description: 'MongoDB $or array injection',
    },
    {
      pattern: /ObjectId\s*\(/i,
      severity: 1,
      description: 'MongoDB ObjectId reference',
    },
  ],

  prototype_pollution: [
    {
      pattern:
        /(__proto__|__defineGetter__|__defineSetter__|__lookupGetter__|__lookupSetter__)\s*[\[.(]/i,
      severity: 3,
      description: 'Prototype pollution via internal methods',
    },
    {
      pattern: /constructor\s*[\[.]\s*prototype/i,
      severity: 3,
      description: 'Prototype pollution via constructor',
    },
    {
      pattern: /prototype\s*[\[.]\s*\w+\s*=/i,
      severity: 3,
      description: 'Direct prototype modification',
    },
    {
      pattern: /Object\s*\.\s*assign\s*\(\s*\w+\s*,/i,
      severity: 2,
      description: 'Object.assign potential pollution',
    },
    {
      pattern: /Object\s*\.\s*defineProperty/i,
      severity: 2,
      description: 'Object.defineProperty usage',
    },
    {
      pattern: /\[\s*['"]__proto__['"]\s*\]/i,
      severity: 2,
      description: 'Bracket notation __proto__ access',
    },
  ],

  log_injection: [
    {
      pattern: /\$\{\s*(jndi|ldap|dns|rmi|jmx|nis|iiop)\s*:/gi,
      severity: 3,
      description: 'JNDI/LDAP injection attempt',
    },
    {
      pattern: /\$\{\s*(lower|upper)\s*:/gi,
      severity: 2,
      description: 'Log4j variable manipulation',
    },
    {
      pattern: /\$\{[^}]+\}/,
      severity: 2,
      description: 'Variable interpolation pattern',
    },
    {
      pattern: /%(\d+\$)?[sdif]/,
      severity: 1,
      description: 'Format string pattern',
    },
    {
      pattern: /\n\s*(ERROR|WARN|INFO|DEBUG|FATAL)\s*[:\[]/i,
      severity: 2,
      description: 'Log level injection',
    },
  ],

  ssti: [
    {
      pattern: /\{\{\s*['"]?.*['"]?\s*\}\}/,
      severity: 3,
      description: 'Generic template interpolation pattern',
    },
    {
      pattern:
        /\{\{\s*(config|self|request|session|g|get_flashed_messages|url_for|app)\s*\}\}/i,
      severity: 3,
      description: 'SSTI sensitive object access',
    },
    {
      pattern:
        /\{\{\s*.*\.(__class__|__mro__|__subclasses__|__globals__)\s*\}\}/i,
      severity: 3,
      description: 'Python SSTI introspection',
    },
    {
      pattern: /\$\{\s*.*\s*\}/,
      severity: 2,
      description: 'SSTI/Expression Language pattern',
    },
    {
      pattern: /<%\s*.*\s*%>/,
      severity: 2,
      description: 'ERB/ASP template pattern',
    },
    {
      pattern: /\[% \w+ %\]/,
      severity: 2,
      description: 'Template Toolkit pattern',
    },
  ],

  insecure_deserialization: [
    {
      pattern: /O:\d+:"[^"]+":\d+:\{/i,
      severity: 3,
      description: 'PHP serialized object pattern',
    },
    {
      pattern: /PHP_Incomplete_Class/i,
      severity: 3,
      description: 'PHP insecure deserialization indicator',
    },
    {
      pattern: /rO0ABX/i, // Base64 for 0xAC ED 00 05 (Java serialization header)
      severity: 3,
      description: 'Java serialization header (Base64)',
    },
    {
      pattern: /(_serialized_|__type|__jsonclass__)/i,
      severity: 2,
      description: 'Potential custom deserialization marker',
    },
    {
      pattern: /y0A/i, // Base64 for .NET serialization
      severity: 2,
      description: '.NET serialization indicator',
    },
  ],
};
