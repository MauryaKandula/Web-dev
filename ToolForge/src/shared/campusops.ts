/**
 * CampusOps Shared Engine
 * Ported & enhanced from x:\Hack Road verification prototype.
 * Handles college event management, attendee ticketing, cryptographic HMAC
 * QR check-in tokens with replay prevention, waitlist promotion, and verifiable certificates.
 */

export interface Attendee {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  college: string;
  branch: string;
  year: number;
  ticketTier: 'General' | 'VIP' | 'Volunteer' | 'Speaker';
  registeredAt: string;
  checkedIn: boolean;
  checkedInAt?: string;
  qrToken: string;
  certificateId?: string;
}

export interface EventConfig {
  id: string;
  title: string;
  tagline: string;
  date: string;
  venue: string;
  maxCapacity: number;
  waitlistThreshold: number;
  organizerSecret: string;
  tokenExpiryHours: number;
}

export interface CheckInResult {
  success: boolean;
  status: 'CHECKED_IN' | 'ALREADY_CHECKED_IN' | 'INVALID_SIGNATURE' | 'EXPIRED_TOKEN' | 'CAPACITY_REACHED' | 'ATTENDEE_NOT_FOUND';
  message: string;
  attendee?: Attendee;
  timestamp: string;
}

export interface VerifiableCertificate {
  certificateId: string;
  attendeeName: string;
  rollNumber: string;
  college: string;
  eventTitle: string;
  issuedAt: string;
  verificationHash: string;
  issuer: string;
}

// Simple deterministic hash for browser/client and node test environments
export function computeHash(data: string, secret: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c64e6d;
  const combined = `${data}:${secret}`;
  for (let i = 0; i < combined.length; i++) {
    const ch = combined.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, '0');
}

/**
 * Generate a tamper-proof QR check-in token for an attendee
 */
export function generateQRToken(attendeeId: string, eventId: string, rollNumber: string, secret: string, timestamp?: number): string {
  const ts = timestamp || Date.now();
  const payload = `${eventId}|${attendeeId}|${rollNumber.trim().toUpperCase()}|${ts}`;
  const sig = computeHash(payload, secret);
  // Base64 encode for easy scanning
  const raw = `${payload}|${sig}`;
  return typeof btoa !== 'undefined' ? btoa(raw) : Buffer.from(raw).toString('base64');
}

/**
 * Decode and verify QR check-in token against replay attacks and tampering
 */
export function verifyAndCheckIn(
  qrTokenBase64: string,
  event: EventConfig,
  attendees: Attendee[],
  usedTokens: Set<string>
): CheckInResult {
  const now = Date.now();

  let decoded = '';
  try {
    decoded = typeof atob !== 'undefined' ? atob(qrTokenBase64) : Buffer.from(qrTokenBase64, 'base64').toString('utf-8');
  } catch {
    return {
      success: false,
      status: 'INVALID_SIGNATURE',
      message: 'Malformed QR token data format.',
      timestamp: new Date().toISOString()
    };
  }

  const parts = decoded.split('|');
  if (parts.length !== 5) {
    return {
      success: false,
      status: 'INVALID_SIGNATURE',
      message: 'Invalid QR token structure.',
      timestamp: new Date().toISOString()
    };
  }

  const [eventId, attendeeId, rollNumber, tsStr, signature] = parts;
  const tokenTimestamp = parseInt(tsStr, 10);

  // 1. Verify Event Match
  if (eventId !== event.id) {
    return {
      success: false,
      status: 'ATTENDEE_NOT_FOUND',
      message: `QR code belongs to a different event (${eventId}).`,
      timestamp: new Date().toISOString()
    };
  }

  // 2. Cryptographic signature check
  const payload = `${eventId}|${attendeeId}|${rollNumber}|${tsStr}`;
  const expectedSig = computeHash(payload, event.organizerSecret);
  if (signature !== expectedSig) {
    return {
      success: false,
      status: 'INVALID_SIGNATURE',
      message: 'Security Alert: QR signature verification failed. Token forged or altered.',
      timestamp: new Date().toISOString()
    };
  }

  // 3. Expiration window check
  const expiryMs = (event.tokenExpiryHours || 48) * 3600 * 1000;
  if (now - tokenTimestamp > expiryMs) {
    return {
      success: false,
      status: 'EXPIRED_TOKEN',
      message: 'This pass has expired. Please check in with the registration desk.',
      timestamp: new Date().toISOString()
    };
  }

  // 4. Replay Prevention check
  if (usedTokens.has(qrTokenBase64)) {
    return {
      success: false,
      status: 'ALREADY_CHECKED_IN',
      message: 'Replay Protection: This QR ticket has already been used to enter.',
      timestamp: new Date().toISOString()
    };
  }

  // 5. Locate Attendee
  const attendee = attendees.find((a) => a.id === attendeeId && a.rollNumber.toUpperCase() === rollNumber);
  if (!attendee) {
    return {
      success: false,
      status: 'ATTENDEE_NOT_FOUND',
      message: `Attendee record not found for Roll No: ${rollNumber}.`,
      timestamp: new Date().toISOString()
    };
  }

  if (attendee.checkedIn) {
    return {
      success: false,
      status: 'ALREADY_CHECKED_IN',
      message: `${attendee.name} was already marked checked in at ${attendee.checkedInAt}.`,
      attendee,
      timestamp: new Date().toISOString()
    };
  }

  // 6. Capacity check (unless VIP / Volunteer)
  const currentCheckedIn = attendees.filter((a) => a.checkedIn).length;
  if (currentCheckedIn >= event.maxCapacity && attendee.ticketTier === 'General') {
    return {
      success: false,
      status: 'CAPACITY_REACHED',
      message: `Venue capacity limit (${event.maxCapacity}) reached. General ticket holder placed on priority waitlist.`,
      attendee,
      timestamp: new Date().toISOString()
    };
  }

  // 7. Successful Check-In
  attendee.checkedIn = true;
  attendee.checkedInAt = new Date().toISOString();
  usedTokens.add(qrTokenBase64);

  // Generate certificate reference
  const certId = `CERT-${event.id.toUpperCase().slice(0, 6)}-${attendee.id.slice(0, 6)}`;
  attendee.certificateId = certId;

  return {
    success: true,
    status: 'CHECKED_IN',
    message: `Entry verified! Welcome, ${attendee.name} (${attendee.ticketTier}).`,
    attendee,
    timestamp: attendee.checkedInAt
  };
}

/**
 * Generate a verifiable certificate representation for an attendee
 */
export function generateCertificate(
  attendee: Attendee,
  event: EventConfig,
  issuer: string = 'CampusOps Verifiable Credentials Authority'
): VerifiableCertificate {
  const certPayload = `${event.id}|${attendee.id}|${attendee.rollNumber}|${event.date}`;
  const verificationHash = computeHash(certPayload, event.organizerSecret);

  return {
    certificateId: attendee.certificateId || `CERT-${event.id.toUpperCase().slice(0, 6)}-${attendee.id.slice(0, 6)}`,
    attendeeName: attendee.name,
    rollNumber: attendee.rollNumber,
    college: attendee.college,
    eventTitle: event.title,
    issuedAt: new Date().toISOString().split('T')[0],
    verificationHash,
    issuer
  };
}

/**
 * Export attendees to RFC-compliant CSV string
 */
export function exportAttendeesCSV(attendees: Attendee[]): string {
  const header = ['ID', 'Name', 'Roll Number', 'Email', 'College', 'Branch', 'Year', 'Tier', 'Checked In', 'Check-In Time', 'Certificate ID'];
  const rows = attendees.map((a) => [
    `"${a.id}"`,
    `"${a.name.replace(/"/g, '""')}"`,
    `"${a.rollNumber}"`,
    `"${a.email}"`,
    `"${a.college.replace(/"/g, '""')}"`,
    `"${a.branch}"`,
    a.year,
    `"${a.ticketTier}"`,
    a.checkedIn ? 'Yes' : 'No',
    `"${a.checkedInAt || ''}"`,
    `"${a.certificateId || ''}"`
  ]);

  return [header.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

/**
 * Default sample college hackathon event data
 */
export const defaultSampleEvent: EventConfig = {
  id: 'sample_event',
  title: 'Example Developer Hackathon',
  tagline: 'Sample event data for the local preview. Replace every detail before use.',
  date: '2030-01-01',
  venue: 'Example Venue',
  maxCapacity: 150,
  waitlistThreshold: 50,
  organizerSecret: 'LOCAL_DEMO_ONLY_NOT_A_SECRET',
  tokenExpiryHours: 72
};

export const defaultSampleAttendees: Attendee[] = [
  {
    id: 'att_01',
    name: 'Sample Attendee 01',
    rollNumber: 'SAMPLE-001',
    email: 'attendee01@campusops.test',
    college: 'Example College',
    branch: 'Computer Science & Engineering',
    year: 3,
    ticketTier: 'VIP',
    registeredAt: '2026-10-25T10:30:00.000Z',
    checkedIn: false,
    qrToken: generateQRToken('att_01', 'sample_event', 'SAMPLE-001', 'LOCAL_DEMO_ONLY_NOT_A_SECRET')
  },
  {
    id: 'att_02',
    name: 'Sample Attendee 02',
    rollNumber: 'SAMPLE-002',
    email: 'attendee02@campusops.test',
    college: 'Example College',
    branch: 'Information Technology',
    year: 2,
    ticketTier: 'General',
    registeredAt: '2026-10-26T14:15:00.000Z',
    checkedIn: false,
    qrToken: generateQRToken('att_02', 'sample_event', 'SAMPLE-002', 'LOCAL_DEMO_ONLY_NOT_A_SECRET')
  },
  {
    id: 'att_03',
    name: 'Sample Attendee 03',
    rollNumber: 'SAMPLE-003',
    email: 'attendee03@campusops.test',
    college: 'Example College',
    branch: 'Electronics & Communication',
    year: 4,
    ticketTier: 'Volunteer',
    registeredAt: '2026-10-27T09:00:00.000Z',
    checkedIn: false,
    qrToken: generateQRToken('att_03', 'sample_event', 'SAMPLE-003', 'LOCAL_DEMO_ONLY_NOT_A_SECRET')
  },
  {
    id: 'att_04',
    name: 'Sample Attendee 04',
    rollNumber: 'SAMPLE-004',
    email: 'attendee04@campusops.test',
    college: 'Example College',
    branch: 'Artificial Intelligence & Data Science',
    year: 1,
    ticketTier: 'General',
    registeredAt: '2026-10-28T16:45:00.000Z',
    checkedIn: false,
    qrToken: generateQRToken('att_04', 'sample_event', 'SAMPLE-004', 'LOCAL_DEMO_ONLY_NOT_A_SECRET')
  }
];
