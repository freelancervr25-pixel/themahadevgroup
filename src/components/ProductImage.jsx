import React from "react";

const ProductImage = ({ src, alt, className, onError, ...props }) => {
  // Check if the image is an emoji or short text
  const isEmoji = (str) => {
    if (!str || str.trim() === "") return false;
    // Check if it's a single emoji or very short text (like "✨", "💥", "🌈")
    return str.length <= 3 && /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(str);
  };

  // If it's an emoji, create a styled div instead of img
  if (isEmoji(src)) {
    return (
      <div 
        className={`emoji-image ${className || ''}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '4rem',
          backgroundColor: '#f5f5f5',
          borderRadius: '10px',
          minHeight: '200px',
          border: '2px solid #e0e0e0'
        }}
        {...props}
      >
        {src}
      </div>
    );
  }

  // For regular images (URLs, base64, etc.)
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={onError}
      {...props}
    />
  );
};

export default ProductImage;
