// Utility function to normalize image URLs
export function normalizeImageUrl(url) {
  if (!url) return "";

  // Replace old localhost URLs with new production URLs
  return url
    .replace("http://127.0.0.1:8000", "https://biibiika.online")
    .replace("http://localhost:8000", "https://biibiika.online");
}

// Default export for Next.js custom loader (if needed)
export default function imageLoader({ src, width, quality }) {
  const normalizedSrc = normalizeImageUrl(src);

  // For Next.js built-in optimization
  const params = new URLSearchParams({
    url: normalizedSrc,
    w: width.toString(),
    q: quality?.toString() || "75",
  });

  return `/_next/image?${params.toString()}`;
}
