/**
 * Shared production-grade contact, URL, and template-placeholder validators.
 */

const DANGEROUS_SCHEME_RE = /^\s*(javascript|data|vbscript)\s*:/i;

const PLACEHOLDER_EXACT = new Set([
  'abc university',
  'xyz company',
  'mon yyyy',
  'city, country',
  'domain/industry',
  'role name',
  '<firstname>',
  '<lastname>',
  '{relevant courses: if any}',
  'youremail@youremail.com',
  '+91 12233 34455',
]);

export function isTemplatePlaceholder(value) {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return false;
  if (PLACEHOLDER_EXACT.has(trimmed)) return true;
  if (/^<[^>]+>$/.test(trimmed)) return true;
  if (/^\{[^}]+\}$/.test(trimmed)) return true;
  if (trimmed.includes('abc university') || trimmed.includes('xyz company') || trimmed.includes('mon yyyy')) {
    return true;
  }
  return false;
}

export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (!trimmed || isTemplatePlaceholder(trimmed)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
}

export function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const trimmed = phone.trim();
  if (!trimmed || isTemplatePlaceholder(trimmed)) return false;
  if (!/^[+\d\s\-()]+$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

export function isValidLinkedIn(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed || isTemplatePlaceholder(trimmed)) return false;
  if (DANGEROUS_SCHEME_RE.test(trimmed)) return false;
  return /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|pub|company)\/[a-zA-Z0-9\-_%]+\/?$/i.test(trimmed)
    || /^(https?:\/\/)?(www\.)?linkedin\.com\/[^\s]+$/i.test(trimmed);
}

export function sanitizeHref(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed || DANGEROUS_SCHEME_RE.test(trimmed)) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}
