import React, { useState } from 'react';
import {
  defaultSampleEvent,
  defaultSampleAttendees,
  generateQRToken,
  verifyAndCheckIn,
  generateCertificate,
  exportAttendeesCSV,
  type Attendee,
  type EventConfig,
  type CheckInResult
} from '../../shared/campusops.ts';
import {
  ArrowLeft,
  QrCode,
  Users,
  UserPlus,
  Award,
  CheckCircle2,
  XCircle,
  Download,
  ShieldCheck,
  Search,
  Sparkles,
  Volume2
} from 'lucide-react';
import { Product } from '../types.ts';

interface CampusOpsPageProps {
  isOwned: boolean;
  onBack: () => void;
  onBuy: (product: Product) => void;
  product?: Product;
}

export const CampusOpsPage: React.FC<CampusOpsPageProps> = ({
  isOwned,
  onBack,
  onBuy,
  product
}) => {
  const [activeTab, setActiveTab] = useState<'scanner' | 'attendees' | 'register' | 'certificates'>('scanner');
  const [event] = useState<EventConfig>(defaultSampleEvent);
  const [attendees, setAttendees] = useState<Attendee[]>(defaultSampleAttendees);
  const [usedTokens, setUsedTokens] = useState<Set<string>>(new Set<string>());

  // Scanner state
  const [scanInput, setScanInput] = useState<string>('');
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<string>('all');

  // Certificate selection
  const [selectedCertAttendee, setSelectedCertAttendee] = useState<Attendee | null>(attendees[0]);

  // New Attendee Registration State
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    email: '',
    college: 'Hyderabad University of Tech',
    branch: 'Computer Science & Engineering',
    year: 3,
    ticketTier: 'General' as Attendee['ticketTier']
  });

  const handleUnlockPro = () => {
    const targetProduct: Product = product || {
      id: 'prod_campusops',
      creator_id: 'usr_creator_1',
      title: 'CampusOps: College Event & QR Replay Prevention Workbench',
      slug: 'campusops-college-events',
      tagline: 'Cryptographic QR check-in, capacity guard, and verifiable certificates.',
      description: 'Local event check-in and certificate preview with sample data. Not suitable for production ticketing.',
      category: 'dev_utilities',
      price_inr: 199,
      is_subscription: 0,
      version: '1.0.0',
      download_filename: 'campusops_v1.0.0.zip',
      file_size_kb: 4800,
      sales_count: 0,
      rating_avg: 0,
      rating_count: 0,
      creator_name: 'ToolForge Systems',
      status: 'approved',
      created_at: new Date().toISOString()
    };
    onBuy(targetProduct);
  };

  // Play Web Audio Chime
  const playChime = (success: boolean) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (success) {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(146.83, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      }
    } catch {
      // AudioContext not allowed or unsupported in headless environments
    }
  };

  const handleProcessScan = (tokenToScan: string) => {
    if (!tokenToScan.trim()) return;
    const clonedAttendees = [...attendees];
    const clonedUsed = new Set(usedTokens);

    const result = verifyAndCheckIn(tokenToScan.trim(), event, clonedAttendees, clonedUsed);
    setAttendees(clonedAttendees);
    setUsedTokens(clonedUsed);
    setLastResult(result);
    playChime(result.success);
    setScanInput('');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.rollNumber) return;

    const newId = `att_${Date.now().toString().slice(-4)}`;
    const qrToken = generateQRToken(newId, event.id, formData.rollNumber, event.organizerSecret);

    const newEntry: Attendee = {
      id: newId,
      name: formData.name,
      rollNumber: formData.rollNumber,
      email: formData.email,
      college: formData.college,
      branch: formData.branch,
      year: formData.year,
      ticketTier: formData.ticketTier,
      registeredAt: new Date().toISOString(),
      checkedIn: false,
      qrToken
    };

    setAttendees([newEntry, ...attendees]);
    setFormData({
      name: '',
      rollNumber: '',
      email: '',
      college: 'Hyderabad University of Tech',
      branch: 'Computer Science & Engineering',
      year: 3,
      ticketTier: 'General'
    });
    setActiveTab('attendees');
  };

  const handleExportCSV = () => {
    const csvContent = exportAttendeesCSV(attendees);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.id}_attendees.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const checkedInCount = attendees.filter((a) => a.checkedIn).length;
  const filteredAttendees = attendees.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.college.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === 'all' || a.ticketTier === tierFilter;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">CampusOps</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                PRO EVENT OPS
              </span>
              {isOwned && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>UNLOCKED</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Ported from Hack Road prototype: Cryptographic QR Check-In, Replay Prevention & Verifiable Certificates.
            </p>
          </div>
        </div>

        {/* Capacity Overview Bar */}
        <div className="flex items-center space-x-4 bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-2.5">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Venue Attendance</span>
            <span className="text-sm font-mono font-extrabold text-white">
              {checkedInCount} / {event.maxCapacity}{' '}
              <span className="text-xs text-slate-500">({Math.round((checkedInCount / event.maxCapacity) * 100)}%)</span>
            </span>
          </div>
          <div className="h-2 w-28 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                checkedInCount >= event.maxCapacity ? 'bg-rose-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${Math.min(100, (checkedInCount / event.maxCapacity) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Pro Watermark Guard */}
      {!isOwned && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-purple-950/40 to-slate-900/60 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-white block">Evaluating CampusOps Community Edition</span>
              <span className="text-slate-400">
                Unlock full organizer pass to export unlimited attendees, customize HMAC keys, and generate verifiable certificates.
              </span>
            </div>
          </div>
          <button
            onClick={handleUnlockPro}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition whitespace-nowrap"
          >
            Unlock Organizer License — ₹199
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('scanner')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'scanner'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Live Gate Scanner</span>
        </button>
        <button
          onClick={() => setActiveTab('attendees')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'attendees'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Attendees Roster ({attendees.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('register')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'register'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Registration Desk</span>
        </button>
        <button
          onClick={() => setActiveTab('certificates')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'certificates'
              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Digital Certificates</span>
        </button>
      </div>

      {/* TAB 1: Live Gate Scanner */}
      {activeTab === 'scanner' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-white">QR Code Gate Ingest</h2>
              <p className="text-xs text-slate-400 mt-1">
                Scan attendee badge or paste base64 QR payload. Validates HMAC signature and prevents replay attacks.
              </p>
            </div>

            {/* Quick Test Scenarios */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Simulate Real Gate Scenarios:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => handleProcessScan(attendees[0].qrToken)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-[11px] font-semibold text-slate-300 hover:text-cyan-400 transition text-left"
                >
                  <span className="text-emerald-400 font-bold block">✓ Valid VIP Pass</span>
                  Aarav (21CS042)
                </button>
                <button
                  onClick={() => handleProcessScan(attendees[1].qrToken)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-[11px] font-semibold text-slate-300 hover:text-cyan-400 transition text-left"
                >
                  <span className="text-cyan-400 font-bold block">✓ Valid General</span>
                  Pooja (22IT108)
                </button>
                <button
                  onClick={() => handleProcessScan(attendees[0].qrToken)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-xl text-[11px] font-semibold text-slate-300 hover:text-amber-400 transition text-left"
                >
                  <span className="text-amber-400 font-bold block">⚠ Replay Test</span>
                  Rescan Aarav
                </button>
                <button
                  onClick={() =>
                    handleProcessScan(
                      generateQRToken('att_fake', event.id, 'FAKE999', 'FORGED_SECRET_KEY')
                    )
                  }
                  className="px-3 py-2 bg-slate-950 border border-slate-800 hover:border-rose-500/50 rounded-xl text-[11px] font-semibold text-slate-300 hover:text-rose-400 transition text-left"
                >
                  <span className="text-rose-400 font-bold block">✕ Forged Pass</span>
                  Bad HMAC Key
                </button>
              </div>
            </div>

            {/* Manual Scan Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleProcessScan(scanInput)}
                placeholder="Paste raw Base64 QR Token or scan barcode scanner..."
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-slate-600 outline-none"
              />
              <button
                onClick={() => handleProcessScan(scanInput)}
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-cyan-500/20"
              >
                Verify & Admit
              </button>
            </div>

            {/* Scan Feedback Banner */}
            {lastResult && (
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  lastResult.success
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {lastResult.success ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-sm">{lastResult.status}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(lastResult.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs">{lastResult.message}</p>
                    {lastResult.attendee && (
                      <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] grid grid-cols-2 gap-2 font-mono">
                        <div>
                          <span className="text-slate-400">Name:</span> {lastResult.attendee.name}
                        </div>
                        <div>
                          <span className="text-slate-400">Roll No:</span> {lastResult.attendee.rollNumber}
                        </div>
                        <div>
                          <span className="text-slate-400">Tier:</span> {lastResult.attendee.ticketTier}
                        </div>
                        <div>
                          <span className="text-slate-400">College:</span> {lastResult.attendee.college}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Security Diagnostics */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Gate Security Engine</span>
            </h3>
            <div className="text-xs text-slate-400 space-y-2">
              <p>
              This browser-only preview demonstrates an event check-in flow. It is not a production ticketing or attendance system:
              </p>
              <ul className="space-y-1.5 list-disc list-inside text-slate-300">
                <li>
                  <strong className="text-white">Local demo checksum:</strong> This sample hash is not a secure HMAC or proof of ticket authenticity.
                </li>
                <li>
                  <strong className="text-white">Session duplicate check:</strong> Re-used tokens are tracked only in this browser session.
                </li>
                <li>
                  <strong className="text-white">Dynamic Audio Cues:</strong> Multi-frequency synthesizer alert confirms admission without looking at screen.
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <div className="text-[11px] font-mono space-y-1 text-slate-400">
                <div>
                  <span className="text-slate-500">Event ID:</span> {event.id}
                </div>
                <div>
                  <span className="text-slate-500">Venue:</span> {event.venue}
                </div>
                <div>
                  <span className="text-slate-500">Mode:</span> Browser-only sample data
                </div>
                <div>
                  <span className="text-slate-500">Tokens Admitted:</span> {usedTokens.size}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Attendees Roster */}
      {activeTab === 'attendees' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by student name, roll number, college..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-600 outline-none"
                />
              </div>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none"
              >
                <option value="all">All Tiers</option>
                <option value="VIP">VIP</option>
                <option value="General">General</option>
                <option value="Volunteer">Volunteer</option>
              </select>
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition border border-slate-700"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Attendee</th>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">College & Branch</th>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4">Check-In Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredAttendees.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white font-sans">{att.name}</div>
                      <div className="text-[11px] text-slate-500">{att.email}</div>
                    </td>
                    <td className="py-3 px-4 text-cyan-300 font-bold">{att.rollNumber}</td>
                    <td className="py-3 px-4 text-slate-300 font-sans">
                      <div>{att.college}</div>
                      <div className="text-[11px] text-slate-500">
                        {att.branch} • Year {att.year}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          att.ticketTier === 'VIP'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : att.ticketTier === 'Volunteer'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {att.ticketTier}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {att.checkedIn ? (
                        <span className="flex items-center space-x-1.5 text-emerald-400 font-sans font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Admitted ({new Date(att.checkedInAt || '').toLocaleTimeString()})</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 font-sans">Not Checked In</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {!att.checkedIn ? (
                        <button
                          onClick={() => handleProcessScan(att.qrToken)}
                          className="px-2.5 py-1 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/30 rounded-lg text-[10px] font-bold font-sans transition"
                        >
                          Check In
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedCertAttendee(att);
                            setActiveTab('certificates');
                          }}
                          className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 rounded-lg text-[10px] font-bold font-sans transition"
                        >
                          View Cert
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Registration Desk */}
      {activeTab === 'register' && (
        <div className="max-w-2xl mx-auto bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-white">Walk-in & Late Registration Desk</h2>
            <p className="text-xs text-slate-400 mt-1">
              Issue an official cryptographically-signed badge for attendees registering on-site.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Student Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Vikramaditya Rao"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Roll Number / USN</label>
                <input
                  type="text"
                  required
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value.toUpperCase() })}
                  placeholder="e.g. 21CS145"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-white font-mono outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Student Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="attendee@example.test"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Ticket Tier</label>
                <select
                  value={formData.ticketTier}
                  onChange={(e) => setFormData({ ...formData, ticketTier: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-white outline-none"
                >
                  <option value="General">General Attendee</option>
                  <option value="VIP">VIP / Hackathon Finalist</option>
                  <option value="Volunteer">Student Volunteer</option>
                  <option value="Speaker">Guest Speaker</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-bold mb-1">College / University Name</label>
                <input
                  type="text"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Engineering Branch & Year</label>
                <input
                  type="text"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-white outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition mt-4"
            >
              Generate Demo Ticket & Record Check-In
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: Digital Certificates */}
      {activeTab === 'certificates' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-white">Select Checked-In Sample Attendee</h3>
            <p className="text-xs text-slate-400">
              The printable certificate is a local draft generated from preview data; it does not prove event attendance.
            </p>

            <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
              {attendees
                .filter((a) => a.checkedIn)
                .map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedCertAttendee(a)}
                    className={`w-full text-left p-3 rounded-xl border transition ${
                      selectedCertAttendee?.id === a.id
                        ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-bold text-xs">{a.name}</div>
                    <div className="text-[10px] font-mono mt-0.5">
                      {a.rollNumber} • {a.ticketTier}
                    </div>
                  </button>
                ))}
              {attendees.filter((a) => a.checkedIn).length === 0 && (
                <div className="text-center py-8 text-xs text-slate-500">
                  No attendees checked in yet. Check in an attendee in the Scanner tab first.
                </div>
              )}
            </div>
          </div>

          {/* Certificate Preview Frame */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
            {selectedCertAttendee ? (
              (() => {
                const cert = generateCertificate(selectedCertAttendee, event);
                return (
                  <div className="space-y-6">
                    {/* The Certificate Paper Frame */}
                    <div className="bg-slate-950 border-2 border-cyan-500/40 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl" />
                      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <div>
                          <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
                            CERTIFICATE OF PARTICIPATION
                          </span>
                          <h2 className="text-lg font-black text-white mt-1">{event.title}</h2>
                        </div>
                        <Award className="w-10 h-10 text-cyan-400 shrink-0" />
                      </div>

                      <div className="my-8 text-center space-y-3">
                        <p className="text-xs text-slate-400 italic">This certifies that</p>
                        <h3 className="text-2xl font-black text-white tracking-wide underline decoration-cyan-500/60 decoration-2 underline-offset-8">
                          {cert.attendeeName}
                        </h3>
                        <p className="text-xs text-slate-300 pt-2 font-mono">
                          Roll No: <span className="text-cyan-300 font-bold">{cert.rollNumber}</span> | {cert.college}
                        </p>
                        <p className="text-xs text-slate-400 max-w-md mx-auto pt-2">
                          is included in this sample certificate preview. Replace this text with accurate event details before use.
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-[10px] font-mono text-slate-500">
                        <div>
                          <div>Certificate ID: <span className="text-slate-300 font-bold">{cert.certificateId}</span></div>
                          <div>Preview checksum (not a signature): <span className="text-cyan-400 font-bold">{cert.verificationHash}</span></div>
                        </div>
                        <div className="text-right">
                          <div>Issued: <span className="text-slate-300">{cert.issuedAt}</span></div>
                          <div className="text-amber-300 font-bold">Local preview only</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => window.print()}
                        className="flex items-center space-x-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition"
                      >
                        <Download className="w-4 h-4" />
                        <span>Print Verifiable Certificate</span>
                      </button>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="text-center py-20 text-slate-500 text-xs">
                Select a checked-in attendee to render their certificate.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
