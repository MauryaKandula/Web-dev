import { describe, it, expect } from 'vitest';
import {
  validatePayload,
  simulateWorkflowRun,
  exportToMermaid,
  exportToActivepiecesJSON,
  curatedWorkflowPacks
} from '../shared/workflowvault.ts';

describe('WorkflowVault Automation & Simulation Engine', () => {
  const formWorkflow = curatedWorkflowPacks[0]; // wf_form_to_sheets
  const receiptWorkflow = curatedWorkflowPacks[1]; // wf_receipt_parser
  const placementWorkflow = curatedWorkflowPacks[2]; // wf_placement_notifier

  it('validates payloads against required field constraints', () => {
    const validRes = validatePayload({ name: 'MK', rollNumber: '21CS01', email: 'mk@test.com' }, ['name', 'rollNumber']);
    expect(validRes.valid).toBe(true);
    expect(validRes.missing.length).toBe(0);

    const invalidRes = validatePayload({ name: 'MK' }, ['name', 'rollNumber', 'email']);
    expect(invalidRes.valid).toBe(false);
    expect(invalidRes.missing).toEqual(['rollNumber', 'email']);
  });

  it('simulates Form-to-Sheets workflow with payload transformation and Discord embed', () => {
    const sim = simulateWorkflowRun(formWorkflow, formWorkflow.samplePayload);

    expect(sim.success).toBe(true);
    expect(sim.stepResults.length).toBe(4);
    expect(sim.stepResults.every((s) => s.status === 'success')).toBe(true);
    expect(sim.finalOutput.discordEmbed).toBeDefined();
    expect(sim.finalOutput.discordEmbed.title).toContain('Sample Organizer');
  });

  it('correctly calculates 18% GST and flags expenses over threshold in Receipt Parser', () => {
    const sim = simulateWorkflowRun(receiptWorkflow, {
      merchant: 'Dell India Enterprise',
      amount: '12000',
      hasGst: true,
      category: 'Lab Equipment'
    });

    expect(sim.success).toBe(true);
    const parsed = sim.finalOutput.parsedReceipt;
    expect(parsed.netAmount).toBe(12000);
    expect(parsed.gstAmount).toBe(2160); // 18% of 12000
    expect(parsed.totalAmount).toBe(14160);
    expect(parsed.flaggedForReview).toBe(true);
  });

  it('calculates countdown and urgency in Placement Notifier workflow', () => {
    const sim = simulateWorkflowRun(placementWorkflow, placementWorkflow.samplePayload);

    expect(sim.success).toBe(true);
    const notif = sim.finalOutput.notification;
    expect(notif.company).toBe('Oracle Financial Services');
    expect(notif.packageCTC).toBe('14.5 LPA');
    expect(notif.urgency).toBe('CRITICAL');
    expect(notif.whatsappMessage).toContain('Oracle Financial Services');
  });

  it('halts and skips subsequent steps when a validator step encounters missing data', () => {
    const brokenPayload = { name: 'Aditya' }; // Missing rollNumber, email, branch
    const sim = simulateWorkflowRun(formWorkflow, brokenPayload);

    expect(sim.success).toBe(false);
    expect(sim.stepResults[1].status).toBe('failed');
    expect(sim.stepResults[2].status).toBe('skipped');
    expect(sim.stepResults[3].status).toBe('skipped');
  });

  it('exports valid Mermaid flowchart syntax', () => {
    const mermaid = exportToMermaid(formWorkflow);
    expect(mermaid).toContain('flowchart TD');
    expect(mermaid).toContain('subgraph wf_form_to_sheets');
    expect(mermaid).toContain('step_0');
  });

  it('exports valid Activepieces JSON schema', () => {
    const jsonStr = exportToActivepiecesJSON(formWorkflow);
    const parsed = JSON.parse(jsonStr);
    expect(parsed.schemaVersion).toBe('1.0.0');
    expect(parsed.name).toBe(formWorkflow.title);
    expect(parsed.pieces.length).toBe(formWorkflow.steps.length);
  });
});
