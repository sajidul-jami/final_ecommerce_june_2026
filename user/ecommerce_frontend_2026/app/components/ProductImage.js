'use client';

import Image from 'next/image';
import { useState } from 'react';
import { PRODUCT_IMAGE_BASE_URL } from '@/app/lib/api';

export function getProductImageSrc(photo) {
  const imageName = photo || 'noimage.jpg';

  if (/^https?:\/\//i.test(imageName) || imageName.startsWith('/')) {
    return imageName;
  }

  return `${PRODUCT_IMAGE_BASE_URL.replace(/\/$/, '')}/${imageName}`;
}

export default function ProductImage({ photo, alt, className = 'object-contain p-3', ...props }) {
  const [src, setSrc] = useState(getProductImageSrc(photo));

  return (
    <Image
      {...props}
      src={src}
      alt={alt || 'Product image'}
      className={className}
      onError={() => setSrc('/images/productsimg/noimage.jpg')}
    />
  );
}
