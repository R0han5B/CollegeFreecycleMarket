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

  return normalizedUrl
}
