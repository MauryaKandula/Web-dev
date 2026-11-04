/**
 * FreelanceOS Shared Engine
 * Complete client-work operating system for student freelancers and indie software creators.
 * Handles proposals, milestone approvals, tax/GST breakdown calculations,
 * printable PDF invoice generation, and UPI/Razorpay payment link construction.
 */

export interface ClientProfile {
  name: string;
  company: string;
  email: string;
  phone?: string;
  gstin?: string;
  address: string;
}

export interface DeveloperProfile {
  name: string;
  title: string;
  email: string;
  phone?: string;
  upiId: string;
  panNumber?: string;
  gstin?: string;
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  deliverable: string;
  amountInr: number;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'paid';
  submittedAt?: string;
  approvedAt?: string;
}

export interface ProjectProposal {
  id: string;
  title: string;
  client: ClientProfile;
  developer: DeveloperProfile;
  scopeSummary: string;
  techStack: string[];
  deliverables: string[];
  milestones: Milestone[];
  termsAndConditions: string[];
  discountInr: number;
  gstRatePercent: number; // 0% or 18%
  status: 'draft' | 'active' | 'completed';
  createdAt: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPriceInr: number;
  totalInr: number;
}

export interface Invoice {
  invoiceNumber: string;
  proposalId: string;
  issueDate: string;
  dueDate: string;
  client: ClientProfile;
  developer: DeveloperProfile;
  lineItems: InvoiceLineItem[];
  subtotalInr: number;
  discountInr: number;
  taxableAmountInr: number;
  gstRatePercent: number;
  gstAmountInr: number;
  totalAmountInr: number;
  paymentStatus: 'pending' | 'paid';
  upiPaymentUri: string;
  notes: string;
}

/**
 * Calculate financial totals with GST and discount math
 */
export function calculateTotals(
  milestones: Milestone[],
  discountInr: number = 0,
  gstRatePercent: number = 0
): {
  subtotalInr: number;
  discountInr: number;
  taxableAmountInr: number;
  gstAmountInr: number;
  totalAmountInr: number;
} {
  const subtotalInr = milestones.reduce((sum, m) => sum + m.amountInr, 0);
  const taxableAmountInr = Math.max(0, subtotalInr - discountInr);
  const gstAmountInr = Math.round(taxableAmountInr * (gstRatePercent / 100));
  const totalAmountInr = taxableAmountInr + gstAmountInr;

  return {
    subtotalInr,
    discountInr,
    taxableAmountInr,
    gstAmountInr,
    totalAmountInr
  };
}

/**
 * Generate standard National Payments Corporation of India (NPCI) UPI payment URI
 */
export function generateUPIPaymentURI(
  upiId: string,
  payeeName: string,
  amountInr: number,
  transactionNote: string
): string {
  const cleanUpi = upiId.trim();
  const cleanName = encodeURIComponent(payeeName.trim());
  const cleanNote = encodeURIComponent(transactionNote.trim());
  return `upi://pay?pa=${cleanUpi}&pn=${cleanName}&am=${amountInr.toFixed(2)}&cu=INR&tn=${cleanNote}`;
}

/**
 * Create a printable Invoice object from a project proposal
 */
export function generateInvoice(
  proposal: ProjectProposal,
  invoiceNumber: string = 'INV-2026-001',
  dueDateDays: number = 7
): Invoice {
  const totals = calculateTotals(proposal.milestones, proposal.discountInr, proposal.gstRatePercent);

  const lineItems: InvoiceLineItem[] = proposal.milestones.map((m) => ({
    description: `${m.title} — ${m.deliverable}`,
    quantity: 1,
    unitPriceInr: m.amountInr,
    totalInr: m.amountInr
  }));

  const issueDate = new Date().toISOString().split('T')[0];
  const dueDate = new Date(Date.now() + dueDateDays * 24 * 3600 * 1000).toISOString().split('T')[0];

  const upiPaymentUri = generateUPIPaymentURI(
    proposal.developer.upiId,
    proposal.developer.name,
    totals.totalAmountInr,
    `Payment for ${invoiceNumber}`
  );

  return {
    invoiceNumber,
    proposalId: proposal.id,
    issueDate,
    dueDate,
    client: proposal.client,
    developer: proposal.developer,
    lineItems,
    subtotalInr: totals.subtotalInr,
    discountInr: totals.discountInr,
    taxableAmountInr: totals.taxableAmountInr,
    gstRatePercent: proposal.gstRatePercent,
    gstAmountInr: totals.gstAmountInr,
    totalAmountInr: totals.totalAmountInr,
    paymentStatus: 'pending',
    upiPaymentUri,
    notes: 'Thank you for your business. Please make payment via UPI or direct bank transfer before the due date.'
  };
}

/**
 * Sample complete student freelance proposal
 */
export const defaultSampleProposal: ProjectProposal = {
  id: 'prop_example_project',
  title: 'Example Client Project',
  client: {
    name: 'Example Client',
    company: 'Sample Studio',
    email: 'client@freelanceos.test',
    phone: '',
    gstin: '',
    address: 'Example address — replace before use'
  },
  developer: {
    name: 'Demo Customer',
    title: 'Example Developer',
    email: 'developer@freelanceos.test',
    phone: '',
    upiId: 'sample@toolforge.test',
    panNumber: '',
    gstin: '',
    bankDetails: {
      accountNumber: '',
      ifscCode: '',
      bankName: 'Example bank — not configured'
    }
  },
  scopeSummary:
    'Design and develop a modern mobile-first catalog application featuring product browsing, search, dynamic WhatsApp order dispatch, customer inquiries, and administrative product management.',
  techStack: ['React 19', 'TypeScript', 'Tailwind CSS', 'SQLite', 'Node.js', 'Vite'],
  deliverables: [
    'Responsive customer web portal with instant search and categories',
    'Admin dashboard to manage products, pricing, and orders',
    'Automated WhatsApp cart link generator with itemized summary',
    'Vercel / GitHub Pages deployment and source code transfer'
  ],
  milestones: [
    {
      id: 'ms_1',
      title: 'Phase 1: Architecture & UI Prototype',
      description: 'System schema, wireframes, and responsive component prototype approval.',
      deliverable: 'Figma wireframes + clickable interactive Vite UI prototype.',
      amountInr: 10000,
      dueDate: '2026-11-10',
      status: 'approved',
      approvedAt: '2026-10-30T14:00:00Z'
    },
    {
      id: 'ms_2',
      title: 'Phase 2: Product Catalog & WhatsApp Checkout Engine',
      description: 'Catalog filtering, responsive product view, cart management, and order generation.',
      deliverable: 'Deployed test site on staging with working cart & WhatsApp checkout.',
      amountInr: 15000,
      dueDate: '2026-11-20',
      status: 'in_progress'
    },
    {
      id: 'ms_3',
      title: 'Phase 3: Admin Console & Production Handoff',
      description: 'Admin CRUD, inventory toggles, documentation, and domain configuration.',
      deliverable: 'Production deployment, admin credentials, and documented GitHub repo.',
      amountInr: 10000,
      dueDate: '2026-11-30',
      status: 'pending'
    }
  ],
  termsAndConditions: [
    '30% upfront milestone approval required before Phase 2 commencement.',
    'Includes 2 rounds of design revisions per milestone. Additional requests billed at ₹1,200/hr.',
    'Full intellectual property and source code rights transfer to the client upon receipt of final milestone payment.',
    '30 days of post-launch bug-fix warranty included at no extra cost.'
  ],
  discountInr: 1500,
  gstRatePercent: 0,
  status: 'active',
  createdAt: '2026-10-25'
};
