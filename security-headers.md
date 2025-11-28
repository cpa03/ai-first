# Security Headers and CSP Configuration

# Add these headers to your Next.js configuration or web server

# Content Security Policy

Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.openai.com https://api.anthropic.com https://\*.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self';

# X-Frame-Options

X-Frame-Options: DENY

# X-Content-Type-Options

X-Content-Type-Options: nosniff

# X-XSS-Protection

X-XSS-Protection: 1; mode=block

# Referrer Policy

Referrer-Policy: strict-origin-when-cross-origin

# Permissions Policy

Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()

# Strict-Transport-Security (HTTPS only)

# Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
