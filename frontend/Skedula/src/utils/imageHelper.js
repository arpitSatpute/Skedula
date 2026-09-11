import logo from '../components/logo/logo.png';

/**
 * Robustly parses and extracts an array of valid, deduplicated image URLs from any service or business object.
 * Prioritizes imageUrls array -> images array -> imageUrl string/array to prevent duplicate concatenation.
 */
export const extractServiceImages = (service, fallback = logo) => {
  if (!service) return fallback ? [fallback] : [];

  const rawInputs = [];

  if (Array.isArray(service.imageUrls) && service.imageUrls.length > 0) {
    rawInputs.push(...service.imageUrls);
  } else if (Array.isArray(service.images) && service.images.length > 0) {
    rawInputs.push(...service.images);
  } else if (service.imageUrl) {
    if (Array.isArray(service.imageUrl)) {
      rawInputs.push(...service.imageUrl);
    } else {
      rawInputs.push(service.imageUrl);
    }
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

  // Deduplicate URLs while preserving order
  const uniqueUrls = Array.from(new Set(cleanUrls));

  if (uniqueUrls.length > 0) {
    return uniqueUrls;
  }
  return fallback ? [fallback] : [];
};

export const getPrimaryServiceImage = (service, fallback = logo) => {
  const images = extractServiceImages(service, fallback);
  return images[0] || fallback;
};

