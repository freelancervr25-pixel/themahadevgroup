// Image compression utility for API requests
export const compressImage = (file, maxWidth = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      try {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Clean up
        URL.revokeObjectURL(img.src);
        
        resolve(compressedDataUrl);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Get file size in KB
export const getFileSizeKB = (file) => {
  return Math.round(file.size / 1024);
};

// Get base64 size in KB
export const getBase64SizeKB = (base64String) => {
  return Math.round(base64String.length / 1024);
};

// Calculate compression ratio
export const getCompressionRatio = (originalSize, compressedSize) => {
  return Math.round((1 - compressedSize / originalSize) * 100);
};
