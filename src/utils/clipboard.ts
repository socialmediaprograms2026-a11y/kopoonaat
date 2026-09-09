/**
 * Safe and Robust Clipboard Utility for Mobile, Desktop, and iFrames
 * ------------------------------------------------------------------
 * Supports:
 * 1. Modern navigator.clipboard.writeText API
 * 2. Fallback to hidden document.execCommand('copy') with textarea element
 * 3. Automatic coupon copy tracking and backend persistence
 */

import { trackCouponCopy } from "./analytics";

export interface CopyOptions {
  brandName?: string;
  merchantId?: string;
  couponId?: string;
  silentAnalytics?: boolean;
}

/**
 * Copies text to clipboard safely across all devices and iframe contexts.
 * Returns true on success, false on failure.
 */
export async function copyToClipboardSafe(
  text: string,
  options?: CopyOptions
): Promise<boolean> {
  if (!text) return false;

  let copySuccess = false;

  // 1. Try modern navigator.clipboard API
  if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(text);
      copySuccess = true;
    } catch {
      // If modern API is blocked (e.g. iframe permission), fallback to execCommand below
      copySuccess = false;
    }
  }

  // 2. Fallback: DOM execCommand('copy')
  if (!copySuccess && typeof document !== "undefined") {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      // Prevent scrolling and zooming on iOS
      textarea.style.position = "fixed";
      textarea.style.top = "0";
      textarea.style.left = "0";
      textarea.style.width = "2em";
      textarea.style.height = "2em";
      textarea.style.padding = "0";
      textarea.style.border = "none";
      textarea.style.outline = "none";
      textarea.style.boxShadow = "none";
      textarea.style.background = "transparent";
      textarea.style.opacity = "0.01";
      textarea.setAttribute("readonly", "");

      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);

      const successful = document.execCommand("copy");
      document.body.removeChild(textarea);

      if (successful) {
        copySuccess = true;
      }
    } catch {
      copySuccess = false;
    }
  }

  // 3. Track copy event if options provided
  if (copySuccess && !options?.silentAnalytics) {
    const brandName = options?.brandName || "Store";
    const merchantId = options?.merchantId || brandName.toLowerCase().replace(/\s+/g, "-");
    trackCouponCopy(text, brandName, merchantId);
  }

  return copySuccess;
}
