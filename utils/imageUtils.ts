import { config } from '@/constants/config';

/**
 * Constructs a full image URL from a relative path or filename
 * If the image is already a full URL (http/https), returns it as-is
 * If it's a relative path, prepends the API base URL
 * If it's a base64 data URI, returns it as-is (properly formatted for Android)
 * If it's a raw base64 string, converts it to a proper data URI
 */
export const getImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath) {
    return null;
  }

  // If it's already a full URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it's a base64 data URI, ensure it's properly formatted for Android
  if (imagePath.startsWith('data:image/')) {
    // Ensure the base64 string is properly formatted
    // Android sometimes has issues with base64 strings that have whitespace or are malformed
    return imagePath.trim();
  }

  // Check if it's a raw base64 string (starts with base64-like characters)
  // Base64 strings typically start with characters like iVBORw0KGgo (PNG) or /9j/4AAQ (JPEG)
  // and are usually quite long
  const isLikelyBase64 = /^[A-Za-z0-9+/=]+$/.test(imagePath) && imagePath.length > 100;
  if (isLikelyBase64 && !imagePath.includes(' ') && !imagePath.includes('\n')) {
    // Try to detect image type from common base64 prefixes
    let mimeType = 'image/jpeg'; // default
    if (imagePath.startsWith('iVBORw0KGgo')) {
      mimeType = 'image/png';
    } else if (imagePath.startsWith('/9j/4AAQ') || imagePath.startsWith('/9j/')) {
      mimeType = 'image/jpeg';
    } else if (imagePath.startsWith('R0lGODlh') || imagePath.startsWith('R0lGOD')) {
      mimeType = 'image/gif';
    } else if (imagePath.startsWith('UklGR')) {
      mimeType = 'image/webp';
    }
    return `data:${mimeType};base64,${imagePath}`;
  }

  // If it's a local file path (file://, content://, etc.), return as-is
  if (imagePath.startsWith('file://') || 
      imagePath.startsWith('content://') || 
      imagePath.startsWith('ph://')) {
    return imagePath;
  }

  // If it starts with '/', it's likely a relative path from the backend
  // Prepend the API base URL
  const baseUrl = config.API_BASE_URL.replace(/\/$/, ''); // Remove trailing slash
  const imagePathClean = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  return `${baseUrl}${imagePathClean}`;
};

