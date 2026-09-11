import dns from 'node:dns/promises';
import net from 'node:net';

export interface GuardResult {
  allowed: boolean;
  reason?: string;
  resolvedIp?: string;
}

/**
 * Checks whether an IPv4 address belongs to a private, loopback, or cloud metadata range.
 */
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true; // Invalid format treated as unsafe
  }

  const [a, b] = parts;

  // 0.0.0.0/8 - Current network
  if (a === 0) return true;

  // 127.0.0.0/8 - Loopback
  if (a === 127) return true;

  // 10.0.0.0/8 - Private-Use
  if (a === 10) return true;

  // 172.16.0.0/12 - Private-Use (172.16.0.0 – 172.31.255.255)
  if (a === 172 && b >= 16 && b <= 31) return true;

  // 192.168.0.0/16 - Private-Use
  if (a === 192 && b === 168) return true;

  // 169.254.0.0/16 - Link Local (includes AWS/GCP metadata service 169.254.169.254)
  if (a === 169 && b === 254) return true;

  // 224.0.0.0/4 - Multicast
  if (a >= 224 && a <= 239) return true;

  // 240.0.0.0/4 - Reserved
  if (a >= 240) return true;

  // 255.255.255.255 - Broadcast
  if (parts.every((p) => p === 255)) return true;

  return false;
}

/**
 * Checks whether an IPv6 address is loopback, link-local, or private.
 */
function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();

  // Loopback
  if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1') return true;

  // Unspecified
  if (normalized === '::' || normalized === '0:0:0:0:0:0:0:0') return true;

  // Unique Local Address (fc00::/7 -> fc00 to fdff)
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;

  // Link-Local (fe80::/10)
  if (normalized.startsWith('fe80')) return true;

  // IPv4-mapped IPv6 (::ffff:127.0.0.1)
  if (normalized.includes('::ffff:')) {
    const ipv4Part = normalized.split('::ffff:')[1];
    if (ipv4Part && net.isIPv4(ipv4Part)) {
      return isPrivateIPv4(ipv4Part);
    }
  }

  return false;
}

/**
 * Validates a destination URL against SSRF rules.
 * Resolves the hostname via DNS to prevent DNS-rebinding attacks.
 */
export async function validateTargetUrl(
  rawUrl: string,
  allowPrivateNetwork = false
): Promise<GuardResult> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { allowed: false, reason: 'Invalid URL format' };
  }

  // Only permit HTTP and HTTPS schemes
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { allowed: false, reason: `Unsupported protocol: ${parsed.protocol}. Only http and https are permitted.` };
  }

  const hostname = parsed.hostname;

  // Check explicit localhost aliases
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    if (!allowPrivateNetwork) {
      return { allowed: false, reason: 'Requests to localhost are blocked by SSRF protection.' };
    }
  }

  if (allowPrivateNetwork) {
    return { allowed: true };
  }

  // If the hostname is already an IP literal
  if (net.isIP(hostname)) {
    const isPrivate = net.isIPv4(hostname) ? isPrivateIPv4(hostname) : isPrivateIPv6(hostname);
    if (isPrivate) {
      return {
        allowed: false,
        reason: `Requests to private or internal IP address (${hostname}) are blocked by SSRF protection.`,
        resolvedIp: hostname,
      };
    }
    return { allowed: true, resolvedIp: hostname };
  }

  // Resolve hostname via DNS
  try {
    const lookupResult = await dns.lookup(hostname, { all: true });
    for (const record of lookupResult) {
      const isPrivate = record.family === 4 ? isPrivateIPv4(record.address) : isPrivateIPv6(record.address);
      if (isPrivate) {
        return {
          allowed: false,
          reason: `Hostname ${hostname} resolves to private IP (${record.address}), blocked by SSRF protection.`,
          resolvedIp: record.address,
        };
      }
    }
    return { allowed: true, resolvedIp: lookupResult[0]?.address };
  } catch (error: any) {
    return { allowed: false, reason: `DNS lookup failed for hostname '${hostname}': ${error.message}` };
  }
}
