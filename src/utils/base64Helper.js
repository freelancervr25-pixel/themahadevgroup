// Helper function to convert file to base64
import { compressImage } from './imageCompression';

export const fileToBase64 = (file, compress = true) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (compress) {
        // Use compression for better API performance
        const compressedBase64 = await compressImage(file, 800, 0.7);
        resolve(compressedBase64);
      } else {
        // Use original file without compression
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      }
    } catch (error) {
      reject(error);
    }
  });
};

// Helper function to validate image file
export const validateImageFile = (file) => {
  const validTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Please select a valid image file (JPEG, PNG, GIF, WebP)",
    };
  }

  if (file.size > maxSize) {
    return { valid: false, error: "Image size should be less than 5MB" };
  }

  return { valid: true };
};
