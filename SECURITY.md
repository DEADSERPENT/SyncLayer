# Security Documentation - RTCS Figma Plugin

## Overview

This document outlines the security measures implemented in the Real-Time Content Sync (RTCS) Figma plugin to protect users from common vulnerabilities and ensure safe operation.

---

## Security Features

### 1. Input Validation & Sanitization

#### URL Validation
- **Maximum length**: 2048 characters
- **Protocol restriction**: Only HTTP and HTTPS allowed
- **Blocked domains**: localhost, 127.0.0.1, 0.0.0.0, ::1
- **Private IP blocking**: Prevents connections to private network ranges
  - 10.0.0.0/8
  - 172.16.0.0/12
  - 192.168.0.0/16
  - 169.254.0.0/16 (link-local)

#### Field Path Validation
- **Maximum length**: 500 characters
- **Allowed characters**: Letters, numbers, dots, brackets, underscores only
- **Pattern**: `^[a-zA-Z0-9._\[\]]+$`
- Prevents code injection through field paths

#### Authentication Value Validation
- **Maximum length**: 1024 characters
- **Minimum length check**: Bearer tokens must be at least 10 characters
- Sanitized before storage

#### Data Path Validation
- **Maximum length**: 500 characters
- **Allowed characters**: Letters, numbers, dots, brackets, underscores only
- Optional field (can be empty)

---

### 2. XSS (Cross-Site Scripting) Prevention

#### Backend Protection
- All user inputs are sanitized before processing
- Null bytes removed from strings
- Control characters filtered from text content

#### Frontend Protection
- HTML escaping for all dynamic content
- No direct `innerHTML` usage for user-generated content
- DOM manipulation using `textContent` and `createE Element`
- Input sanitization on all form fields

---

### 3. Rate Limiting

#### Request Throttling
- **Limit**: 100 requests per minute
- **Window**: 60 seconds (rolling)
- **Behavior**: Throws error when limit exceeded
- Prevents abuse and DoS attacks

---

### 4. Data Size Limits

#### Response Size Protection
- **Maximum response size**: 10MB
- **Content-Type validation**: Must be `application/json`
- **Content-Length check**: Validates before parsing
- Prevents memory exhaustion attacks

#### Text Content Limits
- **Maximum text per layer**: 50,000 characters
- **Truncation**: Auto-truncates with warning
- Prevents UI performance issues

#### Mapping Limits
- **Maximum mappings**: 100 per document
- Prevents excessive resource usage

---

### 5. Secure API Communication

#### Request Timeout
- **Timeout**: 30 seconds
- **Abort signal**: Automatic cancellation on timeout
- Prevents hanging requests

#### Headers
- Custom User-Agent: `Figma-RTCS-Plugin/1.0`
- Content-Type validation
- Proper authentication headers

#### HTTPS Support
- Supports both HTTP and HTTPS
- Recommends HTTPS for production use

---

### 6. Error Message Sanitization

#### Sensitive Data Redaction
Automatically removes from error messages:
- Bearer tokens → `Bearer [REDACTED]`
- API keys → `api_key=[REDACTED]`
- Passwords → `password=[REDACTED]`
- Token parameters → `token=[REDACTED]`

#### Error Message Limits
- **Maximum length**: 500 characters
- Prevents information leakage

---

### 7. Secure Storage

#### Figma clientStorage
- Used for all persistent data
- Plugin-specific namespace
- No external storage or transmission

#### Stored Data
- Connection configurations
- Cached API responses
- Layer mappings
- Settings and preferences

#### Data Encryption
- Relies on Figma's built-in storage encryption
- No custom encryption (follows Figma best practices)

---

### 8. Content Security

#### Control Character Filtering
Removes dangerous characters from text:
- Null bytes (`\0`)
- ASCII control characters (0x00-0x1F, 0x7F)
- Preserves newlines and tabs

#### String Sanitization
- Trimming whitespace
- Length limiting
- Type checking

---

## Threat Model

### Protected Against

✅ **XSS (Cross-Site Scripting)**
- Input sanitization
- Output encoding
- No innerHTML with user data

✅ **Code Injection**
- Field path validation
- URL validation
- Regex-based filtering

✅ **SSRF (Server-Side Request Forgery)**
- Private IP blocking
- Localhost blocking
- Protocol restrictions

✅ **DoS (Denial of Service)**
- Rate limiting
- Response size limits
- Text length limits
- Mapping count limits

✅ **Information Leakage**
- Error message sanitization
- Sensitive data redaction
- Controlled error responses

✅ **Memory Exhaustion**
- Response size limits
- Text truncation
- Resource limits

---

### Not Protected Against (External Factors)

⚠️ **Compromised APIs**
- Plugin cannot validate external API security
- Users responsible for API trust

⚠️ **Network-Level Attacks**
- MitM attacks on HTTP connections
- Solution: Use HTTPS APIs

⚠️ **Figma Platform Vulnerabilities**
- Relies on Figma's security model
- Regular updates recommended

---

## Best Practices for Users

### 1. API Security
✅ **DO:**
- Use HTTPS endpoints when possible
- Keep API keys/tokens secure
- Use read-only API tokens when possible
- Regularly rotate credentials

❌ **DON'T:**
- Share configuration files with sensitive data
- Use write-access tokens
- Connect to untrusted APIs
- Store credentials in version control

### 2. Data Privacy
✅ **DO:**
- Review data before syncing
- Use staging endpoints for testing
- Understand what data is being accessed

❌ **DON'T:**
- Sync sensitive/PII data to public designs
- Use production data for demos
- Share files with active connections

### 3. Network Security
✅ **DO:**
- Use VPN when connecting to internal APIs
- Verify SSL certificates
- Use company-approved networks

❌ **DON'T:**
- Use public Wi-Fi for sensitive data
- Ignore SSL warnings
- Connect to unverified endpoints

---

## Security Configuration

### Adjustable Limits (in code.ts)

```typescript
const SECURITY_CONFIG = {
  MAX_URL_LENGTH: 2048,
  MAX_AUTH_VALUE_LENGTH: 1024,
  MAX_DATA_PATH_LENGTH: 500,
  MAX_FIELD_PATH_LENGTH: 500,
  MAX_RESPONSE_SIZE: 10 * 1024 * 1024, // 10MB
  RATE_LIMIT_REQUESTS: 100,
  RATE_LIMIT_WINDOW: 60000, // 1 minute
  ALLOWED_PROTOCOLS: ['https:', 'http:'],
  BLOCKED_DOMAINS: ['localhost', '127.0.0.1', '0.0.0.0', '::1'],
  MAX_MAPPINGS: 100
};
```

---

## Vulnerability Reporting

### Found a Security Issue?

**DO NOT** open a public GitHub issue.

Instead, please:
1. Email security details privately
2. Include steps to reproduce
3. Allow 90 days for patch before disclosure

---

## Security Audit History

### Version 1.0.0 (2025-01-05)
- ✅ Initial security implementation
- ✅ Input validation added
- ✅ XSS protection implemented
- ✅ Rate limiting added
- ✅ Error sanitization implemented
- ✅ Private IP blocking added

---

## Compliance

### Data Handling
- **No external transmission**: Data stays in Figma
- **No logging**: No user data logged externally
- **No tracking**: No analytics or tracking
- **User control**: Users control all connections

### Privacy
- Plugin does not collect personal information
- All data processing happens locally
- No third-party services used
- Compliant with Figma Plugin Guidelines

---

## Security Checklist for Developers

Before publishing updates:

- [ ] All user inputs validated
- [ ] XSS protection in place
- [ ] Error messages sanitized
- [ ] Rate limiting tested
- [ ] Size limits enforced
- [ ] No sensitive data in logs
- [ ] Dependencies updated
- [ ] Security tests passed

---

## Updates and Maintenance

### Security Updates
- Regular dependency updates
- Security patches prioritized
- Follow Figma Plugin security guidelines
- Monitor for new vulnerabilities

### Version Policy
- Critical security fixes: Immediate release
- Non-critical fixes: Bundled in minor versions
- Security advisories: Documented in CHANGELOG

---

## Technical Implementation Details

### Validation Flow

```
User Input → Sanitization → Validation → Processing
                ↓              ↓             ↓
            Length Check   Format Check   Rate Limit
                ↓              ↓             ↓
            Trim/Clean    Regex Match    Counter Check
```

### Error Handling Flow

```
Error → Sanitization → Message Limit → User Display
           ↓               ↓               ↓
     Redact Tokens    500 char max    Safe Output
```

---

## Testing Security

### Manual Testing
1. Test with malicious URLs
2. Test with oversized inputs
3. Test with special characters
4. Test rate limiting
5. Test with malformed JSON

### Automated Testing
```bash
# Run linter
npm run lint

# Check for known vulnerabilities
npm audit

# Run tests
npm test
```

---

## Additional Resources

- [Figma Plugin Security Best Practices](https://www.figma.com/plugin-docs/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security Fundamentals](https://developer.mozilla.org/en-US/docs/Web/Security)

---

## License

Security features are part of the MIT-licensed plugin code.

---

**Last Updated**: January 2025
**Security Version**: 1.0
**Next Review**: March 2025
