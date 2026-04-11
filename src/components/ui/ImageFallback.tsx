'use client';

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';

interface ImageFallbackProps extends Omit<ImageProps, 'src'> {
  src?: string | null;
  fallback: React.ReactNode;
}

export function ImageFallback({ src, fallback, alt, ...props }: ImageFallbackProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const { onError, ...imageProps } = props;

  if (!src || failedSrc === src) {
    return <>{fallback}</>;
  }

  return (
    <Image
      {...imageProps}
      src={src}
      alt={alt}
      onError={(event) => {
        setFailedSrc(src);
        onError?.(event);
      }}
    />
  );
}
