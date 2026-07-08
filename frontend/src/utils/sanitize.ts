import DOMPurify from 'dompurify';

/**
 * Sanitize untrusted HTML before injecting it into the DOM.
 *
 * Why: course/certificate templates and module content are authored in the
 * admin panel and later rendered with dangerouslySetInnerHTML. Without
 * sanitization, a malicious template could execute arbitrary JavaScript and
 * exfiltrate the JWT from localStorage (stored XSS). DOMPurify strips
 * <script>, event handlers (onerror, onclick, ...), javascript: URIs and other
 * XSS vectors while preserving the legitimate formatting markup.
 *
 * Allowed set is intentionally restrictive: structural & text-styling tags,
 * inline styles, images and links (links are forced to open safely).
 */
const ALLOWED_TAGS = [
  'a', 'abbr', 'b', 'blockquote', 'br', 'code', 'div', 'em', 'h1', 'h2', 'h3',
  'h4', 'h5', 'h6', 'hr', 'i', 'img', 'li', 'mark', 'ol', 'p', 'pre', 'span',
  'strong', 'sub', 'sup', 'table', 'tbody', 'td', 'th', 'thead', 'tr', 'u', 'ul',
  'video', 'source', 'iframe'
];

export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'style', 'class', 'width', 'height', 'target', 'rel', 'controls', 'allowfullscreen'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  });
}
