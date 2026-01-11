/**
 * Validates that a file is a genuine image by checking MIME type and magic bytes.
 * This provides defense-in-depth against file extension spoofing attacks.
 */

const VALID_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Map MIME types to standardized extensions
export const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp'
};

/**
 * Validates a file is a genuine image by checking:
 * 1. MIME type is an allowed image type
 * 2. Magic bytes match the expected image format
 * 
 * @param file - The file to validate
 * @returns true if file is a valid image, false otherwise
 */
export const validateImageFile = async (file: File): Promise<boolean> => {
  // Check MIME type first
  if (!VALID_MIME_TYPES.includes(file.type)) {
    return false;
  }
  
  try {
    // Verify magic bytes to prevent extension spoofing
    const buffer = await file.slice(0, 12).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    // JPEG: FF D8 FF
    if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
      return file.type === 'image/jpeg';
    }
    
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
      return file.type === 'image/png';
    }
    
    // GIF: 47 49 46 38 (GIF8)
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
      return file.type === 'image/gif';
    }
    
    // WebP: 52 49 46 46 ... 57 45 42 50 (RIFF...WEBP)
    if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
      // Check for WEBP at bytes 8-11
      if (bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
        return file.type === 'image/webp';
      }
    }
    
    return false;
  } catch {
    return false;
  }
};

/**
 * Gets the standardized file extension for an image based on its MIME type
 * 
 * @param mimeType - The MIME type of the file
 * @returns The standardized extension, or 'jpg' as fallback
 */
export const getImageExtension = (mimeType: string): string => {
  return MIME_TO_EXT[mimeType] || 'jpg';
};
