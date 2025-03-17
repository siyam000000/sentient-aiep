export function isSupportedImageType(type: string): boolean {
  return ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(type)
}

