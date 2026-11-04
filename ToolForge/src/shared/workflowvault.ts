/**
 * WorkflowVault Shared Engine
 * Production automation patterns inspired by MIT Activepieces and modern workflow engines.
 * Provides schema validation, step-by-step dry run simulation, Activepieces JSON export,
 * and Mermaid visualization for high-utility student & creator automations.
 */

export interface StepExecutionResult {
  stepId: string;
  stepName: string;
  status: 'success' | 'failed' | 'skipped';
  durationMs: number;
  input: any;
  output: any;
  error?: string;
}

export interface WorkflowSimulationResult {
  workflowId: string;
  success: boolean;
  totalDurationMs: number;
  stepResults: StepExecutionResult[];
  finalOutput: any;
  logs: string[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'trigger' | 'validator' | 'transformer' | 'condition' | 'action';
  description: string;
  config: Record<string, any>;
}

export interface WorkflowPack {
  id: string;
  title: string;
  tagline: string;
  category: 'campus' | 'developer' | 'creator' | 'finance';
  icon: string;
  version: string;
  steps: WorkflowStep[];
  samplePayload: Record<string, any>;
  activepiecesFormat: Record<string, any>;
}

/**
 * Validates input against simple schema requirements (required fields & types)
 */
export function validatePayload(payload: Record<string, any>, requiredFields: string[]): { valid: boolean; missing: string[] } {
  const missing = requiredFields.filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === '');
  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Execute a deterministic in-browser dry-run simulation of a workflow pack
 */
export function simulateWorkflowRun(workflow: WorkflowPack, inputData: Record<string, any>): WorkflowSimulationResult {
  const logs: string[] = [];
  const stepResults: StepExecutionResult[] = [];
  const startTime = Date.now();
  let currentData = { ...inputData };
  let hasFailed = false;

  logs.push(`[${new Date().toISOString()}] Starting workflow execution: ${workflow.title}`);

  for (const step of workflow.steps) {
    const stepStart = Date.now();
    let stepOutput: any = null;
    let stepStatus: 'success' | 'failed' | 'skipped' = 'success';
    let stepError: string | undefined = undefined;

    if (hasFailed) {
      stepResults.push({
        stepId: step.id,
        stepName: step.name,
        status: 'skipped',
        durationMs: 0,
        input: null,
        output: null
      });
      continue;
    }

    try {
      if (step.type === 'trigger') {
        stepOutput = { receivedAt: new Date().toISOString(), payload: currentData };
        logs.push(`✓ Step [${step.name}]: Ingested event payload with ${Object.keys(currentData).length} fields.`);
      } else if (step.type === 'validator') {
        const required = (step.config.requiredFields as string[]) || [];
        const validation = validatePayload(currentData, required);
        if (!validation.valid) {
          throw new Error(`Validation failed. Missing required fields: ${validation.missing.join(', ')}`);
        }
        stepOutput = { valid: true, sanitized: currentData };
        logs.push(`✓ Step [${step.name}]: Schema validation passed for all required fields: [${required.join(', ')}].`);
      } else if (step.type === 'transformer') {
        if (workflow.id === 'wf_form_to_sheets') {
          stepOutput = {
            row: [
              new Date().toISOString(),
              currentData.name,
              currentData.rollNumber,
              currentData.email,
              currentData.branch,
              currentData.projectTitle || 'N/A'
            ],
            discordEmbed: {
              title: `🎯 New Hackathon Registration: ${currentData.name}`,
              description: `**Roll No:** ${currentData.rollNumber} | **Branch:** ${currentData.branch}`,
              color: 0x3b82f6,
              footer: { text: 'Automated by WorkflowVault' }
            }
          };
          currentData = { ...currentData, ...stepOutput };
        } else if (workflow.id === 'wf_receipt_parser') {
          const rawAmount = parseFloat(currentData.amount || '0');
          const gstRate = currentData.hasGst ? 0.18 : 0.0;
          const gstAmount = Math.round(rawAmount * gstRate * 100) / 100;
          const totalAmount = rawAmount + gstAmount;
          stepOutput = {
            merchant: currentData.merchant?.toUpperCase() || 'UNKNOWN MERCHANT',
            category: currentData.category || 'General Operations',
            netAmount: rawAmount,
            gstAmount,
            totalAmount,
            flaggedForReview: totalAmount > 10000
          };
          currentData = { ...currentData, parsedReceipt: stepOutput };
        } else if (workflow.id === 'wf_placement_notifier') {
          const deadline = new Date(currentData.deadline || Date.now());
          const hoursLeft = Math.max(0, Math.round((deadline.getTime() - Date.now()) / (1000 * 3600)));
          stepOutput = {
            company: currentData.company,
            role: currentData.role,
            packageCTC: `${currentData.ctcLpa || '8'} LPA`,
            hoursRemaining: hoursLeft,
            urgency: hoursLeft < 24 ? 'CRITICAL' : 'NORMAL',
            whatsappMessage: `🚨 *Placement Alert: ${currentData.company}* (${currentData.role})\n💰 Package: ${currentData.ctcLpa} LPA\n⏰ Deadline: ${currentData.deadline} (${hoursLeft}h remaining)\nEligible: ${currentData.eligibleBranches?.join(', ')}\nRegister immediately on the portal!`
          };
          currentData = { ...currentData, notification: stepOutput };
        } else {
          stepOutput = { transformed: true, at: new Date().toISOString() };
        }
        logs.push(`✓ Step [${step.name}]: Data transformed successfully.`);
      } else if (step.type === 'action') {
        stepOutput = {
          dispatched: true,
          destination: step.config.destination || 'Mock Webhook Service',
          responseStatus: 200,
          deliveredAt: new Date().toISOString()
        };
        logs.push(`✓ Step [${step.name}]: Dispatched notification to ${step.config.destination || 'External Endpoint'} [200 OK].`);
      }
    } catch (err: any) {
      stepStatus = 'failed';
      stepError = err.message || 'Step execution encountered an error.';
      hasFailed = true;
      logs.push(`✕ Step [${step.name}] FAILED: ${stepError}`);
    }

    const duration = Math.max(1, Date.now() - stepStart);
    stepResults.push({
      stepId: step.id,
      stepName: step.name,
      status: stepStatus,
      durationMs: duration,
      input: currentData,
      output: stepOutput,
      error: stepError
    });
  }

  const totalDuration = Date.now() - startTime;
  logs.push(`[${new Date().toISOString()}] Workflow execution completed in ${totalDuration}ms with status: ${hasFailed ? 'FAILED' : 'SUCCESS'}.`);

  return {
    workflowId: workflow.id,
    success: !hasFailed,
    totalDurationMs: totalDuration,
    stepResults,
    finalOutput: currentData,
    logs
  };
}

/**
 * Generate standard Mermaid flowchart representation
 */
export function exportToMermaid(workflow: WorkflowPack): string {
  let mm = `flowchart TD\n`;
  mm += `  subgraph ${workflow.id}["${workflow.title} [v${workflow.version}]"]\n`;
  for (let i = 0; i < workflow.steps.length; i++) {
    const s = workflow.steps[i];
    const nodeShape = s.type === 'trigger' ? `(("${s.name}"))` : s.type === 'validator' ? `{"${s.name}"}` : `["${s.name}"]`;
    mm += `    step_${i}${nodeShape}\n`;
    if (i > 0) {
      mm += `    step_${i - 1} --> step_${i}\n`;
    }
  }
  mm += `  end\n`;
  return mm;
}

/**
 * Export workflow to Activepieces standard JSON schema format
 */
export function exportToActivepiecesJSON(workflow: WorkflowPack): string {
  return JSON.stringify(
    {
      schemaVersion: '1.0.0',
      name: workflow.title,
      description: workflow.tagline,
      pieces: workflow.steps.map((s, idx) => ({
        index: idx,
        name: s.name,
        pieceType: s.type,
        settings: s.config
      })),
      trigger: {
        type: workflow.steps[0]?.type || 'WEBHOOK',
        settings: workflow.steps[0]?.config || {}
      }
    },
    null,
    2
  );
}

/**
 * Curated production-ready workflow automation packs
 */
export const curatedWorkflowPacks: WorkflowPack[] = [
  {
    id: 'wf_form_to_sheets',
    title: 'Registration Form to Sheets & Discord Alerts',
    tagline: 'Instant deduplication, spreadsheet logging, and styled webhook dispatch for college events.',
    category: 'campus',
    icon: 'Sheet',
    version: '1.2.0',
    steps: [
      {
        id: 'step_hook',
        name: 'Webhook Ingest Trigger',
        type: 'trigger',
        description: 'Receives POST payloads from Google Forms, Typeform, or custom React registration modals.',
        config: { method: 'POST', endpoint: '/webhook/event-register' }
      },
      {
        id: 'step_val',
        name: 'Student ID & Email Validator',
        type: 'validator',
        description: 'Validates roll number presence, institutional email domain, and required fields.',
        config: { requiredFields: ['name', 'rollNumber', 'email', 'branch'] }
      },
      {
        id: 'step_trans',
        name: 'Data Formatter & Discord Embed Builder',
        type: 'transformer',
        description: 'Constructs tabular spreadsheet row and rich Discord embed with tier colors.',
        config: { embedColor: '#3b82f6' }
      },
      {
        id: 'step_disp',
        name: 'Discord Webhook Dispatcher',
        type: 'action',
        description: 'Pushes notification to club organizers channel with zero rate limit collisions.',
        config: { destination: 'Discord #leads-live Webhook' }
      }
    ],
    samplePayload: {
      name: 'Sample Organizer',
      rollNumber: 'SAMPLE-001',
      email: 'organizer@workflowvault.test',
      branch: 'Computer Science',
      projectTitle: 'AI Smart Energy Grid'
    },
    activepiecesFormat: {
      type: 'PIECE_TRIGGER',
      pieceName: '@activepieces/piece-webhook'
    }
  },
  {
    id: 'wf_receipt_parser',
    title: 'Hackathon Expense & GST Receipt Parser',
    tagline: 'Extracts merchant, computes 18% GST reverse charges, and flags high-value expenditures.',
    category: 'finance',
    icon: 'Receipt',
    version: '1.0.0',
    steps: [
      {
        id: 'step_rcpt_in',
        name: 'Receipt Upload Trigger',
        type: 'trigger',
        description: 'Triggers when student organizer submits an expense claim with invoice info.',
        config: { acceptMime: 'application/json' }
      },
      {
        id: 'step_rcpt_val',
        name: 'Expense Field Validator',
        type: 'validator',
        description: 'Ensures amount, merchant, and expense category exist.',
        config: { requiredFields: ['merchant', 'amount', 'category'] }
      },
      {
        id: 'step_rcpt_calc',
        name: 'GST Tax & Policy Auditor',
        type: 'transformer',
        description: 'Calculates GST breakdown, flags invoices over ₹10,000 for faculty approval.',
        config: { thresholdLimit: 10000, defaultGstRate: 0.18 }
      },
      {
        id: 'step_rcpt_log',
        name: 'Budget Ledger Dispatcher',
        type: 'action',
        description: 'Appends clean journal entry to treasurer spreadsheet and finance queue.',
        config: { destination: 'Finance Google Sheet + Approval Slack' }
      }
    ],
    samplePayload: {
      merchant: 'RoboElements Components India',
      amount: '4500',
      hasGst: true,
      category: 'Hardware Prototyping Kits'
    },
    activepiecesFormat: {
      type: 'PIECE_TRIGGER',
      pieceName: '@activepieces/piece-google-sheets'
    }
  },
  {
    id: 'wf_placement_notifier',
    title: 'Placement Drive Deadline & WhatsApp Reminders',
    tagline: 'Calculates remaining hours, formats opt-in alert, and drafts calendar sync.',
    category: 'campus',
    icon: 'Bell',
    version: '1.1.0',
    steps: [
      {
        id: 'step_plc_hook',
        name: 'New Drive Notification Trigger',
        type: 'trigger',
        description: 'Triggers when college placement cell publishes a new hiring opening.',
        config: { channel: 'Placement Cell RSS / Webhook' }
      },
      {
        id: 'step_plc_val',
        name: 'Eligibility & Deadline Guard',
        type: 'validator',
        description: 'Verifies company name, CTC, deadline timestamp, and eligible branches.',
        config: { requiredFields: ['company', 'role', 'ctcLpa', 'deadline'] }
      },
      {
        id: 'step_plc_trans',
        name: 'Urgency & WhatsApp Message Formatter',
        type: 'transformer',
        description: 'Calculates countdown hours and formats high-urgency formatted alert message.',
        config: { urgentThresholdHours: 24 }
      },
      {
        id: 'step_plc_push',
        name: 'Broadcast Gateway Dispatcher',
        type: 'action',
        description: 'Broadcasts formatted alert to registered batch WhatsApp / Telegram groups.',
        config: { destination: 'Twilio / WhatsApp Business Gateway' }
      }
    ],
    samplePayload: {
      company: 'Oracle Financial Services',
      role: 'Associate Software Engineer',
      ctcLpa: '14.5',
      deadline: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
      eligibleBranches: ['CSE', 'IT', 'ECE']
    },
    activepiecesFormat: {
      type: 'PIECE_TRIGGER',
      pieceName: '@activepieces/piece-telegram'
    }
  }
];
