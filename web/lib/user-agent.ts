/**
 * Lightweight User-Agent parsing (no dependency) — just enough to show
 * "Windows · Desktop" / "iOS · iPhone" instead of a raw UA string in the
 * admin panel's session list. Not meant to be exhaustive/bulletproof
 * (UA sniffing never is), just a readable approximation.
 */
export interface ParsedUserAgent {
  os: string;
  device: string;
  icon: "desktop" | "mobile" | "tablet";
}

export function parseUserAgent(ua: string | null): ParsedUserAgent {
  if (!ua) return { os: "Unknown OS", device: "Unknown device", icon: "desktop" };

  const isIPad = /iPad/.test(ua);
  const isIPhone = /iPhone/.test(ua);
  const isAndroid = /Android/.test(ua);
  const isMobileUA = /Mobile/.test(ua);
  const isTabletAndroid = isAndroid && !isMobileUA;

  let os = "Unknown OS";
  if (/Windows NT/.test(ua)) os = "Windows";
  else if (isIPad || isIPhone) os = "iOS";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (isAndroid) os = "Android";
  else if (/CrOS/.test(ua)) os = "ChromeOS";
  else if (/Linux/.test(ua)) os = "Linux";

  let device = "Desktop";
  let icon: ParsedUserAgent["icon"] = "desktop";
  if (isIPad || isTabletAndroid) {
    device = "Tablet";
    icon = "tablet";
  } else if (isIPhone || (isAndroid && isMobileUA)) {
    device = "Phone";
    icon = "mobile";
  }

  return { os, device, icon };
}
