import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateQRToken,
  verifyAndCheckIn,
  generateCertificate,
  exportAttendeesCSV,
  defaultSampleEvent,
  defaultSampleAttendees,
  type Attendee,
  type EventConfig
} from '../shared/campusops.ts';

describe('CampusOps Shared Verification & Ticketing Engine', () => {
  let event: EventConfig;
  let attendees: Attendee[];
  let usedTokens: Set<string>;

  beforeEach(() => {
    event = { ...defaultSampleEvent };
    // Deep copy attendees
    attendees = JSON.parse(JSON.stringify(defaultSampleAttendees));
    usedTokens = new Set<string>();
  });

  it('generates a deterministic base64 QR check-in token', () => {
    const token = generateQRToken('att_01', event.id, '21CS042', event.organizerSecret, 1700000000000);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);
  });

  it('successfully verifies a valid attendee token and marks them checked in', () => {
    const attendee = attendees[0];
    const res = verifyAndCheckIn(attendee.qrToken, event, attendees, usedTokens);

    expect(res.success).toBe(true);
    expect(res.status).toBe('CHECKED_IN');
    expect(attendee.checkedIn).toBe(true);
    expect(attendee.checkedInAt).toBeDefined();
    expect(attendee.certificateId).toContain('CERT-');
    expect(usedTokens.has(attendee.qrToken)).toBe(true);
  });

  it('prevents replay attacks when the same QR token is scanned twice', () => {
    const attendee = attendees[0];
    const res1 = verifyAndCheckIn(attendee.qrToken, event, attendees, usedTokens);
    expect(res1.success).toBe(true);

    const res2 = verifyAndCheckIn(attendee.qrToken, event, attendees, usedTokens);
    expect(res2.success).toBe(false);
    expect(res2.status).toBe('ALREADY_CHECKED_IN');
    expect(res2.message).toContain('Replay Protection');
  });

  it('rejects forged tokens with altered payload or wrong secret', () => {
    // Generate token with an unauthorized secret
    const forgedToken = generateQRToken('att_01', event.id, '21CS042', 'WRONG_UNAUTHORIZED_SECRET');
    const res = verifyAndCheckIn(forgedToken, event, attendees, usedTokens);

    expect(res.success).toBe(false);
    expect(res.status).toBe('INVALID_SIGNATURE');
    expect(res.message).toContain('Security Alert');
  });

  it('rejects expired tokens beyond the expiry window', () => {
    const twoWeeksAgo = Date.now() - 14 * 24 * 3600 * 1000;
    const expiredToken = generateQRToken('att_02', event.id, '22IT108', event.organizerSecret, twoWeeksAgo);
    const res = verifyAndCheckIn(expiredToken, event, attendees, usedTokens);

    expect(res.success).toBe(false);
    expect(res.status).toBe('EXPIRED_TOKEN');
  });

  it('enforces capacity limits on general tickets when venue is full', () => {
    event.maxCapacity = 1;
    // Check in attendee 1 (VIP)
    verifyAndCheckIn(attendees[0].qrToken, event, attendees, usedTokens);

    // Attendee 2 is General tier
    const res = verifyAndCheckIn(attendees[1].qrToken, event, attendees, usedTokens);
    expect(res.success).toBe(false);
    expect(res.status).toBe('CAPACITY_REACHED');
  });

  it('generates a verifiable cryptographic certificate upon check-in', () => {
    const attendee = attendees[0];
    attendee.checkedIn = true;
    const cert = generateCertificate(attendee, event);

    expect(cert.attendeeName).toBe(attendee.name);
    expect(cert.rollNumber).toBe(attendee.rollNumber);
    expect(cert.verificationHash).toBeDefined();
    expect(cert.verificationHash.length).toBe(16);
  });

  it('exports RFC-compliant CSV with proper headers and escaping', () => {
    const csv = exportAttendeesCSV(attendees);
    expect(csv).toContain('ID,Name,Roll Number,Email,College');
    expect(csv).toContain('"Sample Attendee 01"');
    expect(csv).toContain('"SAMPLE-001"');
  });
});
