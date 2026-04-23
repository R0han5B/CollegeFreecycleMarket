'use client';

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { sanitizeImageUrl } from '@/lib/utils';

interface ImageFallbackProps extends Omit<ImageProps, 'src'> {
  src?: string | null;
  fallback: React.ReactNode;
}

export function ImageFallback({ src, fallback, alt, ...props }: ImageFallbackProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const { onError, ...imageProps } = props;
  const safeSrc = sanitizeImageUrl(src);

  if (!safeSrc || failedSrc === safeSrc) {
    return <>{fallback}</>;
  }

  return (
    <Image
      {...imageProps}
      src={safeSrc}
      alt={alt}
      onError={(event) => {
        setFailedSrc(safeSrc);
        onError?.(event);
      }}
    />
  );
}
