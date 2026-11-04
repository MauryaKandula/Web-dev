import React, { useState } from 'react';
import {
  defaultSampleProposal,
  calculateTotals,
  generateInvoice,
  generateUPIPaymentURI,
  type ProjectProposal,
  type Milestone,
  type Invoice
} from '../../shared/freelanceos.ts';
import {
  ArrowLeft,
  Briefcase,
  FileText,
  CreditCard,
  CheckCircle2,
  Clock,
  Printer,
  Sparkles,
  ShieldCheck,
  QrCode,
  DollarSign,
  Send,
  Building
} from 'lucide-react';
import { Product } from '../types.ts';

interface FreelanceOSPageProps {
  isOwned: boolean;
  onBack: () => void;
  onBuy: (product: Product) => void;
  product?: Product;
}

export const FreelanceOSPage: React.FC<FreelanceOSPageProps> = ({
  isOwned,
  onBack,
  onBuy,
  product
}) => {
  const [proposal, setProposal] = useState<ProjectProposal>(defaultSampleProposal);
  const [activeTab, setActiveTab] = useState<'proposal' | 'milestones' | 'invoice' | 'upi'>('proposal');
  const [invoice, setInvoice] = useState<Invoice>(() => generateInvoice(defaultSampleProposal, 'INV-2026-042', 10));

  const handleUnlockPro = () => {
    if (product) onBuy(product);
  };

  const handleMilestoneAction = (milestoneId: string, nextStatus: Milestone['status']) => {
    const updated = {
      ...proposal,
      milestones: proposal.milestones.map((m) =>
        m.id === milestoneId
          ? {
              ...m,
              status: nextStatus,
              approvedAt: nextStatus === 'approved' ? new Date().toISOString() : m.approvedAt
            }
          : m
      )
    };
    setProposal(updated);
    setInvoice(generateInvoice(updated, invoice.invoiceNumber));
  };

  const totals = calculateTotals(proposal.milestones, proposal.discountInr, proposal.gstRatePercent);

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
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">FreelanceOS</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                CLIENT OPS
              </span>
              {isOwned && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>UNLOCKED</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Draft client proposals, milestones, invoices, and UPI payment URI text.
            </p>
          </div>
        </div>

        <div role="note" className="rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-3 text-xs leading-relaxed text-amber-200">
          The client, tax, bank, and UPI fields are placeholders. Do not send the sample invoice or use its UPI URI for payment; this preview does not collect or verify money.
        </div>

        {/* Contract Budget Badge */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-2.5 flex items-center space-x-4">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Contract Value</span>
            <span className="text-sm font-mono font-black text-emerald-400">
              ₹{totals.totalAmountInr.toLocaleString('en-IN')} INR
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            {proposal.milestones.filter((m) => m.status === 'approved' || m.status === 'paid').length} /{' '}
            {proposal.milestones.length} Milestones Cleared
          </span>
        </div>
      </div>

      {/* Pro Watermark Guard */}
      {!isOwned && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/40 to-slate-900/60 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-white block">Evaluating FreelanceOS Starter Edition</span>
              <span className="text-slate-400">
                The paid upgrade and live client sync are not configured in this preview.
              </span>
            </div>
          </div>
          <button
            onClick={handleUnlockPro}
            disabled={!product}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50"
            title={!product ? 'Paid upgrades are not configured in this preview.' : 'Continue to checkout'}
          >
            {product ? 'Unlock FreelanceOS — ₹' + product.price_inr : 'Paid upgrade unavailable in preview'}
          </button>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-3">
        <button
          onClick={() => setActiveTab('proposal')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'proposal'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Project Proposal & Scope</span>
        </button>
        <button
          onClick={() => setActiveTab('milestones')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'milestones'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Milestone Client Portal</span>
        </button>
        <button
          onClick={() => setActiveTab('invoice')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'invoice'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Printable PDF Invoice</span>
        </button>
        <button
          onClick={() => setActiveTab('upi')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'upi'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>UPI & Payment Links</span>
        </button>
      </div>

      {/* TAB 1: Proposal Overview */}
      {activeTab === 'proposal' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                PROJECT PROPOSAL & SPECIFICATION
              </span>
              <h2 className="text-lg font-black text-white mt-1">{proposal.title}</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{proposal.scopeSummary}</p>
            </div>

            {/* Deliverables Checklist */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">Scope Deliverables</span>
              <div className="space-y-2">
                {proposal.deliverables.map((deliv, idx) => (
                  <div key={idx} className="flex items-start space-x-2 p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300">{deliv}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Stack */}
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider block mb-2">Approved Tech Stack</span>
              <div className="flex flex-wrap gap-2">
                {proposal.techStack.map((tech) => (
                  <span key={tech} className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-semibold text-emerald-300">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">Contract Terms & IP Clauses</span>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                {proposal.termsAndConditions.map((term, idx) => (
                  <li key={idx}>{term}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Client & Developer Info */}
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs">
              <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                <Building className="w-4 h-4 text-emerald-400" />
                <span>Client Organization</span>
              </h3>
              <div className="space-y-1.5 text-slate-300">
                <div className="font-bold text-white text-sm">{proposal.client.company}</div>
                <div>Contact: {proposal.client.name}</div>
                <div>Email: {proposal.client.email}</div>
                <div>Phone: {proposal.client.phone}</div>
                <div className="font-mono text-[11px] text-slate-400">GSTIN: {proposal.client.gstin}</div>
                <div className="text-[11px] text-slate-500 pt-1">{proposal.client.address}</div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4 text-xs">
              <h3 className="text-sm font-extrabold text-white">Freelance Developer</h3>
              <div className="space-y-1.5 text-slate-300">
                <div className="font-bold text-white text-sm">{proposal.developer.name}</div>
                <div>{proposal.developer.title}</div>
                <div>Email: {proposal.developer.email}</div>
                <div className="font-mono text-[11px] text-emerald-400 font-bold">UPI ID: {proposal.developer.upiId}</div>
                <div className="font-mono text-[11px] text-slate-400">PAN: {proposal.developer.panNumber}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Milestone Portal */}
      {activeTab === 'milestones' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-white">Milestone Approval Preview</h2>
            <p className="text-xs text-slate-400 mt-1">
              Track deliverables stage-by-stage. Track deliverables and approvals. This tool does not authorize or move money.
            </p>
          </div>

          <div className="space-y-4">
            {proposal.milestones.map((ms, idx) => (
              <div
                key={ms.id}
                className="p-5 bg-slate-950 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-mono font-bold text-xs text-emerald-400">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-sm text-white">{ms.title}</h4>
                      <p className="text-xs text-slate-400">{ms.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-extrabold text-white text-sm">
                      ₹{ms.amountInr.toLocaleString('en-IN')}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                        ms.status === 'approved' || ms.status === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : ms.status === 'submitted'
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                          : ms.status === 'in_progress'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {ms.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-slate-900 text-xs text-slate-400 gap-2">
                  <div>
                    <span className="text-slate-500 font-bold uppercase text-[10px] block">Deliverable Handover</span>
                    <span className="text-slate-300 font-medium">{ms.deliverable}</span>
                  </div>

                  {/* Milestone Lifecycle Buttons */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {ms.status === 'pending' && (
                      <button
                        onClick={() => handleMilestoneAction(ms.id, 'in_progress')}
                        className="px-3 py-1 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold transition"
                      >
                        Start Work
                      </button>
                    )}
                    {ms.status === 'in_progress' && (
                      <button
                        onClick={() => handleMilestoneAction(ms.id, 'submitted')}
                        className="px-3 py-1 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-bold transition"
                      >
                        Submit to Client
                      </button>
                    )}
                    {ms.status === 'submitted' && (
                      <button
                        onClick={() => handleMilestoneAction(ms.id, 'approved')}
                        className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold transition flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Client Approve & Release</span>
                      </button>
                    )}
                    {ms.status === 'approved' && (
                      <button
                        onClick={() => handleMilestoneAction(ms.id, 'paid')}
                        className="px-3 py-1 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-bold transition"
                      >
                        Mark Payment Received
                      </button>
                    )}
                    {ms.status === 'paid' && (
                      <span className="text-emerald-400 font-bold text-xs flex items-center space-x-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Paid in Full</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Printable PDF Invoice */}
      {activeTab === 'invoice' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
          </div>

          {/* Clean Invoice Paper Container */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8 max-w-4xl mx-auto shadow-2xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <h2 className="text-2xl font-black text-white">TAX INVOICE</h2>
                <div className="text-xs font-mono text-emerald-400 mt-1">Invoice #{invoice.invoiceNumber}</div>
                <div className="text-xs text-slate-400 mt-1">
                  Issued: {invoice.issueDate} • Due Date: {invoice.dueDate}
                </div>
              </div>

              <div className="text-right text-xs">
                <div className="font-extrabold text-white text-sm">{invoice.developer.name}</div>
                <div className="text-slate-400">{invoice.developer.title}</div>
                <div className="text-slate-400">{invoice.developer.email}</div>
                <div className="font-mono text-emerald-400 font-bold">UPI: {invoice.developer.upiId}</div>
              </div>
            </div>

            {/* Billed To */}
            <div className="text-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Billed To:</span>
              <div className="font-bold text-white text-sm">{invoice.client.company}</div>
              <div className="text-slate-300">Attn: {invoice.client.name}</div>
              <div className="text-slate-400">{invoice.client.address}</div>
              <div className="font-mono text-slate-400">GSTIN: {invoice.client.gstin}</div>
            </div>

            {/* Itemized Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-2.5">Item Description</th>
                    <th className="py-2.5 text-center">Qty</th>
                    <th className="py-2.5 text-right">Unit Price</th>
                    <th className="py-2.5 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {invoice.lineItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 font-sans font-medium text-white">{item.description}</td>
                      <td className="py-3 text-center text-slate-400">{item.quantity}</td>
                      <td className="py-3 text-right text-slate-400">₹{item.unitPriceInr.toLocaleString('en-IN')}</td>
                      <td className="py-3 text-right font-bold text-white">₹{item.totalInr.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Breakdown */}
            <div className="border-t border-slate-800 pt-4 flex justify-end">
              <div className="w-72 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span>₹{invoice.subtotalInr.toLocaleString('en-IN')}</span>
                </div>
                {invoice.discountInr > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount:</span>
                    <span>-₹{invoice.discountInr.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>GST ({invoice.gstRatePercent}%):</span>
                  <span>₹{invoice.gstAmountInr.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
                  <span>Grand Total:</span>
                  <span className="text-emerald-400">₹{invoice.totalAmountInr.toLocaleString('en-IN')} INR</span>
                </div>
              </div>
            </div>

            {/* Notes & Bank Details */}
            <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="font-bold text-slate-300">Payment Instructions:</div>
              <div>{invoice.notes}</div>
              {invoice.developer.bankDetails && (
                <div className="font-mono pt-1 text-slate-300">
                  Bank: {invoice.developer.bankDetails.bankName} | A/C: {invoice.developer.bankDetails.accountNumber} | IFSC: {invoice.developer.bankDetails.ifscCode}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: UPI Deep Links */}
      {activeTab === 'upi' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-extrabold text-white">NPCI Instant UPI Payment URI</h3>
            <p className="text-xs text-slate-400">
              Compatible with Google Pay, PhonePe, Paytm, and all BHIM UPI compliant applications in India.
            </p>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-emerald-400 break-all">
              {invoice.upiPaymentUri}
            </div>

            <div className="pt-2">
              <a
                href={invoice.upiPaymentUri}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition"
              >
                <CreditCard className="w-4 h-4" />
                <span>Launch UPI App on Mobile</span>
              </a>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-extrabold text-white">Razorpay Payment Link Generator</h3>
            <p className="text-xs text-slate-400">
              Embeddable HTML snippet for student clients paying via NetBanking, Credit Cards, or Corporate EMI.
            </p>

            <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
{`<form>
  <script src="https://checkout.razorpay.com/v1/payment-button.js"
    data-payment_button_id="pl_sample_button_id"
    data-amount="${totals.totalAmountInr * 100}">
  </script>
</form>`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
