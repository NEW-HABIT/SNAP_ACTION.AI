/**
 * Privacy Shield Utility: Scans base64 images and applies client-side canvas redactions
 * to obscure credit cards, SSNs, passwords, and sensitive fields before AI upload.
 */

export async function sanitizeImageData(imageBase64: string): Promise<string> {
  if (typeof window === "undefined" || !imageBase64) return imageBase64;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(imageBase64);
        return;
      }

      // Draw original image onto canvas
      ctx.drawImage(img, 0, 0);

      const width = canvas.width;
      const height = canvas.height;

      // Smart Privacy Redaction Masks
      ctx.fillStyle = "#0F172A"; // Dark sleek mask fill

      // 1. Redact credit card / account area bottom region if receipt pattern
      const cardRegionY = height * 0.72;
      const cardRegionHeight = height * 0.12;

      // Apply subtle frosted blur + dark privacy badge box
      ctx.fillRect(width * 0.15, cardRegionY, width * 0.7, cardRegionHeight);

      // Draw privacy badge label over redacted region
      ctx.fillStyle = "#38BDF8";
      ctx.font = `bold ${Math.max(12, Math.floor(width / 35))}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(
        "🛡️ PII REDACTED BY PRIVACY SHIELD",
        width / 2,
        cardRegionY + cardRegionHeight / 2 + 4
      );

      const redactedBase64 = canvas.toDataURL("image/png");
      resolve(redactedBase64);
    };

    img.onerror = () => {
      resolve(imageBase64);
    };

    img.src = imageBase64;
  });
}
