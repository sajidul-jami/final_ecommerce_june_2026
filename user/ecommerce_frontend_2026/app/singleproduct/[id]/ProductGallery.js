'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { getProductImageSrc } from '../../components/ProductImage';

const unique = (items) => Array.from(new Set(items.filter(Boolean)));

function buildImageCandidates(photo) {
  if (!photo) return ['noimage.jpg'];
  if (/^https?:\/\//i.test(photo)) return [photo];

  const dotIndex = photo.lastIndexOf('.');
  const base = dotIndex > -1 ? photo.slice(0, dotIndex) : photo;
  const ext = dotIndex > -1 ? photo.slice(dotIndex) : '.jpg';

  return unique([
    photo,
    photo.startsWith('large-') ? photo.replace(/^large-/, '') : `large-${photo}`,
    `${base}-1${ext}`,
    `${base}-2${ext}`,
    `${base}-3${ext}`,
  ]);
}

export default function ProductGallery({ product }) {
  const candidates = useMemo(() => {
    const tableImages = (product.images || []).map((image) => image.image_url || image);
    return unique([...tableImages, ...buildImageCandidates(product.photo)]);
  }, [product.images, product.photo]);
  const [visibleImages, setVisibleImages] = useState(candidates);
  const [activeImage, setActiveImage] = useState(candidates[0]);

  const hideImage = (image) => {
    setVisibleImages((images) => {
      const nextImages = images.filter((item) => item !== image);
      if (activeImage === image) {
        setActiveImage(nextImages[0] || 'noimage.jpg');
      }
      return nextImages.length ? nextImages : ['noimage.jpg'];
    });
  };

  return (
    <div className="space-y-3">
      <div className="group relative aspect-square overflow-hidden rounded-lg bg-slate-100">
        <Image
          src={getProductImageSrc(activeImage)}
          alt={`Image of ${product.name}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 420px"
          className="object-contain p-5 transition duration-300 group-hover:scale-125"
          onError={() => hideImage(activeImage)}
        />
      </div>

      {visibleImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {visibleImages.map((image) => (
            <button
              key={image}
              type="button"
              onMouseEnter={() => setActiveImage(image)}
              onFocus={() => setActiveImage(image)}
              onClick={() => setActiveImage(image)}
              className={`relative aspect-square overflow-hidden rounded-md border bg-slate-100 ${
                activeImage === image ? 'border-rose-500' : 'border-slate-200'
              }`}
            >
              <Image
                src={getProductImageSrc(image)}
                alt={`${product.name} thumbnail`}
                fill
                sizes="80px"
                className="object-contain p-2"
                onError={() => hideImage(image)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
