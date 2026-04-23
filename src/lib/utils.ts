import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeImageUrl(url?: string | null) {
  if (!url) {
    return null
  }

  const normalizedUrl = url.trim()

  if (!normalizedUrl) {
    return null
  }

  if (
    normalizedUrl.includes("/uploads/") ||
    normalizedUrl.includes("\\uploads\\") ||
    normalizedUrl.includes("public/uploads") ||
    normalizedUrl.startsWith("uploads/") ||
    normalizedUrl.startsWith("/uploads/")
  ) {
    return null
  }

  if (
    normalizedUrl.startsWith("https://res.cloudinary.com/") &&
    normalizedUrl.includes("/image/upload/")
  ) {
    return normalizedUrl.replace("/image/upload/", "/image/upload/f_auto,q_auto/")
  }

  return normalizedUrl
}

export function getItemImages(item?: { image?: string | null; images?: string[] | null } | null) {
  const images = (item?.images ?? [])
    .map((imageUrl) => sanitizeImageUrl(imageUrl))
    .filter((imageUrl): imageUrl is string => Boolean(imageUrl))

  const primaryImage = sanitizeImageUrl(item?.image)

  if (primaryImage && !images.includes(primaryImage)) {
    images.unshift(primaryImage)
  }

  return images
}

export function getPrimaryItemImage(item?: { image?: string | null; images?: string[] | null } | null) {
  return getItemImages(item)[0] ?? null
}
