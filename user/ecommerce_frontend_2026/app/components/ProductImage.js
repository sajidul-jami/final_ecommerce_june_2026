'use client';

import Image from 'next/image';
import { useState } from 'react';
import { getProductImageSrc } from '@/app/lib/apiConfig';

export { getProductImageSrc };

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
