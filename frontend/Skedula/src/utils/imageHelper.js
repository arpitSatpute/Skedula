import logo from '../components/logo/logo.png';

/**
 * Robustly parses and extracts an array of valid image URLs from any service or business object.
 * Handles:
 * - Array of URLs: service.imageUrls = ['http...', 'http...']
 * - Single URL: service.imageUrl = 'http...'
 * - Comma-separated URLs: service.imageUrl = 'http...1, http...2'
 * - JSON string arrays: service.imageUrl = '["http...1", "http...2"]'
 * - Semicolon or pipe separated URLs: service.imageUrl = 'http...1;http...2'
 */
export const extractServiceImages = (service, fallback = logo) => {
  if (!service) return [fallback];

  const rawInputs = [];

  if (Array.isArray(service.imageUrls)) rawInputs.push(...service.imageUrls);
  if (Array.isArray(service.images)) rawInputs.push(...service.images);
  if (service.imageUrl) {
    if (Array.isArray(service.imageUrl)) rawInputs.push(...service.imageUrl);
    else rawInputs.push(service.imageUrl);
  }

  const flattenedUrls = [];

  for (const item of rawInputs) {
    if (!item) continue;
    if (typeof item !== 'string') {
      flattenedUrls.push(String(item));
      continue;
    }
    const trimmed = item.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          flattenedUrls.push(...parsed);
          continue;
        }
      } catch (_) {
        flattenedUrls.push(...trimmed.slice(1, -1).split(','));
        continue;
      }
    }
    if (trimmed.includes(',') || trimmed.includes(';') || trimmed.includes('|') || trimmed.includes('\n')) {
      const parts = trimmed.split(/[,;|\n]+/);
      flattenedUrls.push(...parts);
    } else {
      flattenedUrls.push(trimmed);
    }
  }

  // Clean, trim, strip quotes and validate URLs
  const cleanUrls = flattenedUrls
    .map(url => (typeof url === 'string' ? url.trim().replace(/^["']|["']$/g, '') : ''))
    .filter(url => url && (
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('/') ||
      url.startsWith('data:') ||
      url.startsWith('blob:')
    ));

  return cleanUrls.length > 0 ? cleanUrls : [fallback];
};

export const getPrimaryServiceImage = (service, fallback = logo) => {
  const images = extractServiceImages(service, fallback);
  return images[0] || fallback;
};
