import { describe, it, expect } from 'vitest';
import {
  cseSubjects,
  getSubjects,
  getSubjectById,
  getFlashcards,
  getVivaQuestions,
  calculateProgress,
  calculateSyllabusProgress,
  exportRevisionNotesMarkdown,
  Flashcard
} from '../shared/studysignal.ts';

describe('StudySignal (Product 04 • Wave B)', () => {
  it('covers all 4 core Indian CSE subjects (OS, DBMS, CN, System Design)', () => {
    const subjects = getSubjects();
    expect(subjects.length).toBe(4);

    const ids = subjects.map(s => s.id);
    expect(ids).toContain('os');
    expect(ids).toContain('dbms');
    expect(ids).toContain('cn');
    expect(ids).toContain('system_design');
  });

  it('provides structured syllabus units with classified topics and importance levels', () => {
    for (const sub of cseSubjects) {
      expect(sub.units.length).toBeGreaterThanOrEqual(3);
      for (const unit of sub.units) {
        expect(unit.topics.length).toBeGreaterThanOrEqual(2);
        for (const topic of unit.topics) {
          expect(['Critical', 'High', 'Medium']).toContain(topic.importance);
          expect(topic.name.length).toBeGreaterThan(5);
        }
      }
    }
  });

  it('provides comprehensive active recall flashcards with key points', () => {
    const cards = getFlashcards();
    expect(cards.length).toBeGreaterThanOrEqual(6);

    for (const c of cards) {
      expect(c.question.length).toBeGreaterThan(10);
      expect(c.answer.length).toBeGreaterThan(15);
      expect(c.keyPoints.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('includes natural technical Telugu explanations for bilingual Indian CSE students', () => {
    const cards = getFlashcards();
    for (const c of cards) {
      expect(c.teluguExplanation.length).toBeGreaterThan(20);
      // Verify Telugu Unicode characters exist (range \u0C00-\u0C7F)
      expect(/[\u0C00-\u0C7F]/.test(c.teluguExplanation)).toBe(true);
    }

    const viva = getVivaQuestions();
    for (const v of viva) {
      expect(v.teluguSummary.length).toBeGreaterThan(20);
      expect(/[\u0C00-\u0C7F]/.test(v.teluguSummary)).toBe(true);
    }
  });

  it('provides technical viva questions with expected keywords and examiner traps', () => {
    const viva = getVivaQuestions();
    expect(viva.length).toBeGreaterThanOrEqual(4);

    for (const v of viva) {
      expect(v.expectedKeywords.length).toBeGreaterThanOrEqual(4);
      expect(v.modelAnswer.length).toBeGreaterThan(50);
      expect(v.examinerTrap.length).toBeGreaterThan(15);
    }
  });

  it('accurately calculates mastery progress percentages', () => {
    const osCards = getFlashcards('os');
    const total = osCards.length;

    const zeroProgress = calculateProgress([], 'os');
    expect(zeroProgress.percentage).toBe(0);

    const masteredIds = osCards.map(c => c.id);
    const fullProgress = calculateProgress(masteredIds, 'os');
    expect(fullProgress.percentage).toBe(100);
    expect(fullProgress.masteredCount).toBe(total);
  });

  it('exports complete revision notes and viva guides in valid Markdown', () => {
    const md = exportRevisionNotesMarkdown('os');
    expect(md).toContain('# Complete Revision & Viva Voce Guide: Operating Systems');
    expect(md).toContain('## 📚 Core Syllabus Overview');
    expect(md).toContain('## ⚡ Active Recall Revision Cards');
    expect(md).toContain('## 🎯 Viva Simulator & Technical Interview Questions');
    expect(md).toContain('Telugu Concept Summary');
  });

  it('calculates syllabus completion progress from user completed topic IDs', () => {
    const osSubject = getSubjectById('os')!;
    const allTopics = osSubject.units.flatMap(u => u.topics);
    const totalCount = allTopics.length;

    const zero = calculateSyllabusProgress([], 'os');
    expect(zero.totalTopics).toBe(totalCount);
    expect(zero.completedCount).toBe(0);
    expect(zero.percentage).toBe(0);

    const firstTwo = [allTopics[0].id, allTopics[1].id];
    const partial = calculateSyllabusProgress(firstTwo, 'os');
    expect(partial.completedCount).toBe(2);
    expect(partial.percentage).toBe(Math.round((2 / totalCount) * 100));

    const allIds = allTopics.map(t => t.id);
    const full = calculateSyllabusProgress(allIds, 'os');
    expect(full.completedCount).toBe(totalCount);
    expect(full.percentage).toBe(100);
  });

  it('embeds custom student notes and user-checked syllabus topics into exported markdown', () => {
    const customCard: Flashcard = {
      id: 'custom_1',
      subjectId: 'os',
      unitId: 'os_u1',
      topic: 'Banker’s Algorithm Avoidance',
      question: 'What is a safe state in deadlock avoidance?',
      answer: 'A state where there exists at least one sequence of processes that can execute without deadlocking.',
      keyPoints: ['Safe sequence exists', 'Resource allocation graph has no cycles'],
      teluguExplanation: 'సేఫ్ స్టేట్ అంటే సిస్టమ్ డెడ్‌లాక్ లేకుండా అన్ని ప్రాసెస్‌లను విజయవంతంగా పూర్తి చేయగల స్థితి.',
      mastered: false
    };

    const completed = ['os_t1', 'os_t2'];
    const md = exportRevisionNotesMarkdown('os', [customCard], completed);

    expect(md).toContain('Banker’s Algorithm Avoidance');
    expect(md).toContain('Safe sequence exists');
    expect(md).toContain('సేఫ్ స్టేట్');
    expect(md).toContain('- [x] **Process State Transitions & PCB**');
  });
});
