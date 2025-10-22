/**
 * Device Fingerprinting Utility
 * Generates a unique identifier for the user's device/browser
 */

export function generateDeviceFingerprint(): string {
  if (typeof window === "undefined") {
    return "server-side-render";
  }

  const components = [
    // User Agent
    navigator.userAgent || "",

    // Screen Resolution
    `${window.screen.width}x${window.screen.height}`,

    // Color Depth
    window.screen.colorDepth?.toString() || "",

    // Timezone
    Intl.DateTimeFormat().resolvedOptions().timeZone || "",

    // Language
    navigator.language || "",

    // Platform
    navigator.platform || "",

    // CPU Cores
    navigator.hardwareConcurrency?.toString() || "",

    // Device Memory (if available)
    (
      navigator as Navigator & { deviceMemory?: number }
    ).deviceMemory?.toString() || "",

    // Touch Support
    ("ontouchstart" in window).toString(),
  ];

  // Generate hash from components
  const fingerprint = hashCode(components.join("|"));

  return fingerprint;
}

/**
 * Simple hash function to convert string to hash
 */
function hashCode(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Get device name based on user agent
 */
export function getDeviceName(): string {
  if (typeof window === "undefined") {
    return "Unknown Device";
  }

  const ua = navigator.userAgent;

  // Detect OS
  let os = "Unknown OS";
  if (ua.includes("Windows NT 10")) os = "Windows 10/11";
  else if (ua.includes("Windows NT 6.3")) os = "Windows 8.1";
  else if (ua.includes("Windows NT 6.2")) os = "Windows 8";
  else if (ua.includes("Windows NT 6.1")) os = "Windows 7";
  else if (ua.includes("Mac OS X")) os = "macOS";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad"))
    os = "iOS";
  else if (ua.includes("Linux")) os = "Linux";

  // Detect Browser
  let browser = "Unknown Browser";
  if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("Chrome/") && !ua.includes("Edg/")) browser = "Chrome";
  else if (ua.includes("Firefox/")) browser = "Firefox";
  else if (ua.includes("Safari/") && !ua.includes("Chrome/"))
    browser = "Safari";
  else if (ua.includes("Opera/") || ua.includes("OPR/")) browser = "Opera";

  // Detect Device Type
  let deviceType = "Desktop";
  if (ua.includes("Mobile")) deviceType = "Mobile";
  else if (ua.includes("Tablet")) deviceType = "Tablet";

  return `${browser} on ${os} (${deviceType})`;
}

/**
 * Get device icon based on device type
 */
export function getDeviceIcon(deviceName: string): string {
  if (deviceName.includes("Mobile")) return "📱";
  if (deviceName.includes("Tablet")) return "📲";
  return "💻";
}

/**
 * Store device fingerprint in localStorage
 */
export function storeDeviceFingerprint(fingerprint: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("device_fingerprint", fingerprint);
  }
}

/**
 * Get stored device fingerprint from localStorage
 */
export function getStoredDeviceFingerprint(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("device_fingerprint");
  }
  return null;
}

/**
 * Get device information including fingerprint
 */
export function getDeviceInfo(): {
  deviceId: string;
  browser: string;
  os: string;
  type: string;
} {
  if (typeof window === "undefined") {
    return {
      deviceId: "server-side-render",
      browser: "Unknown",
      os: "Unknown",
      type: "Desktop",
    };
  }

  const ua = navigator.userAgent;

  // Detect OS
  let os = "Unknown OS";
  if (ua.includes("Windows NT 10")) os = "Windows 10/11";
  else if (ua.includes("Windows NT 6.3")) os = "Windows 8.1";
  else if (ua.includes("Windows NT 6.2")) os = "Windows 8";
  else if (ua.includes("Windows NT 6.1")) os = "Windows 7";
  else if (ua.includes("Mac OS X")) os = "macOS";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad"))
    os = "iOS";
  else if (ua.includes("Linux")) os = "Linux";

  // Detect Browser
  let browser = "Unknown Browser";
  if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("Chrome/") && !ua.includes("Edg/")) browser = "Chrome";
  else if (ua.includes("Firefox/")) browser = "Firefox";
  else if (ua.includes("Safari/") && !ua.includes("Chrome/"))
    browser = "Safari";
  else if (ua.includes("Opera/") || ua.includes("OPR/")) browser = "Opera";

  // Detect Device Type
  let type = "Desktop";
  if (ua.includes("Mobile")) type = "Mobile";
  else if (ua.includes("Tablet")) type = "Tablet";

  // Get or generate device ID
  const stored = getStoredDeviceFingerprint();
  const deviceId = stored || generateDeviceFingerprint();

  if (!stored) {
    storeDeviceFingerprint(deviceId);
  }

  return {
    deviceId,
    browser,
    os,
    type,
  };
}

/**
 * Get or generate device fingerprint (backward compatibility)
 */
export function getDeviceFingerprint(): string {
  const stored = getStoredDeviceFingerprint();
  if (stored) {
    return stored;
  }

  const fingerprint = generateDeviceFingerprint();
  storeDeviceFingerprint(fingerprint);
  return fingerprint;
}
