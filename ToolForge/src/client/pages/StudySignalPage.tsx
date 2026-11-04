import React, { useState, useEffect } from 'react';
import {
  cseSubjects,
  getFlashcards,
  getVivaQuestions,
  calculateProgress,
  calculateSyllabusProgress,
  exportRevisionNotesMarkdown,
  SubjectSyllabus,
  Flashcard,
  VivaQuestion
} from '../../shared/studysignal.ts';
import { Product } from '../types.ts';
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  RotateCw,
  CheckCircle2,
  HelpCircle,
  Download,
  Languages,
  Eye,
  Star,
  Check,
  ChevronRight,
  ListTodo,
  Plus,
  X
} from 'lucide-react';

interface StudySignalPageProps {
  isOwned: boolean;
  onBack: () => void;
  onBuy: (product: Product) => void;
  product?: Product;
}

export const StudySignalPage: React.FC<StudySignalPageProps> = ({
  isOwned,
  onBack,
  onBuy,
  product
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('os');
  const [activeTab, setActiveTab] = useState<'flashcards' | 'syllabus' | 'viva'>('flashcards');
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showTelugu, setShowTelugu] = useState<boolean>(false);
  const [masteredCardIds, setMasteredCardIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('studysignal_mastered_cards');
      return stored ? JSON.parse(stored) : ['fc_2', 'fc_3'];
    } catch {
      return ['fc_2', 'fc_3'];
    }
  });
  const [completedTopicIds, setCompletedTopicIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('studysignal_completed_topics');
      if (stored) return new Set(JSON.parse(stored));
    } catch {
      // fallback
    }
    // Default initial completed topics from cseSubjects
    const initial = new Set<string>();
    cseSubjects.forEach(s => s.units.forEach(u => u.topics.forEach(t => {
      if (t.completed) initial.add(t.id);
    })));
    return initial;
  });
  const [vivaRatings, setVivaRatings] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem('studysignal_viva_ratings');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [customFlashcards, setCustomFlashcards] = useState<Flashcard[]>(() => {
    try {
      const stored = localStorage.getItem('studysignal_custom_cards');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [revealedVivaAnswers, setRevealedVivaAnswers] = useState<Set<string>>(new Set());
  const [exportNotice, setExportNotice] = useState<boolean>(false);
  const [showAddCardModal, setShowAddCardModal] = useState<boolean>(false);
  const [newCardTopic, setNewCardTopic] = useState<string>('');
  const [newCardQuestion, setNewCardQuestion] = useState<string>('');
  const [newCardAnswer, setNewCardAnswer] = useState<string>('');
  const [newCardTelugu, setNewCardTelugu] = useState<string>('');

  const activeSubject: SubjectSyllabus = cseSubjects.find(s => s.id === selectedSubjectId) || cseSubjects[0];
  const standardFlashcards: Flashcard[] = getFlashcards(selectedSubjectId);
  const subjectCustomCards: Flashcard[] = customFlashcards.filter(c => c.subjectId === selectedSubjectId);
  const flashcards: Flashcard[] = [...standardFlashcards, ...subjectCustomCards];
  const vivaQuestions: VivaQuestion[] = getVivaQuestions(selectedSubjectId);

  const currentCard = flashcards[currentCardIndex] || flashcards[0];
  const progress = calculateProgress(masteredCardIds, selectedSubjectId);
  const syllabusProgress = calculateSyllabusProgress(Array.from(completedTopicIds), selectedSubjectId);

  const toggleMastered = (cardId: string) => {
    const updated = masteredCardIds.includes(cardId)
      ? masteredCardIds.filter(id => id !== cardId)
      : [...masteredCardIds, cardId];
    setMasteredCardIds(updated);
    try {
      localStorage.setItem('studysignal_mastered_cards', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const toggleTopicCompleted = (topicId: string) => {
    const next = new Set(completedTopicIds);
    if (next.has(topicId)) next.delete(topicId);
    else next.add(topicId);
    setCompletedTopicIds(next);
    try {
      localStorage.setItem('studysignal_completed_topics', JSON.stringify(Array.from(next)));
    } catch {
      // Ignore
    }
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const toggleVivaAnswer = (id: string) => {
    const next = new Set(revealedVivaAnswers);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setRevealedVivaAnswers(next);
  };

  const setRating = (questionId: string, rating: number) => {
    const updated = { ...vivaRatings, [questionId]: rating };
    setVivaRatings(updated);
    try {
      localStorage.setItem('studysignal_viva_ratings', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleCreateCustomCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardQuestion.trim() || !newCardAnswer.trim()) return;

    const newCard: Flashcard = {
      id: `custom_fc_${Date.now()}`,
      subjectId: selectedSubjectId,
      unitId: `${selectedSubjectId}_u1`,
      topic: newCardTopic.trim() || 'My Notes',
      question: newCardQuestion.trim(),
      answer: newCardAnswer.trim(),
      keyPoints: [newCardAnswer.trim()],
      teluguExplanation: newCardTelugu.trim() || 'విద్యార్థి సొంత నోట్స్ ఆధారంగా రూపొందించబడింది.',
      mastered: false
    };

    const updated = [...customFlashcards, newCard];
    setCustomFlashcards(updated);
    try {
      localStorage.setItem('studysignal_custom_cards', JSON.stringify(updated));
    } catch {
      // Ignore
    }

    setNewCardTopic('');
    setNewCardQuestion('');
    setNewCardAnswer('');
    setNewCardTelugu('');
    setShowAddCardModal(false);
  };

  const handleExportNotes = () => {
    const markdown = exportRevisionNotesMarkdown(selectedSubjectId, customFlashcards, Array.from(completedTopicIds));
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedSubjectId}_revision_notes.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  const handleUnlockPro = () => {
    const targetProduct: Product = product || {
      id: 'prod_studysignal',
      creator_id: 'usr_creator_1',
      title: 'StudySignal: Notes, Revision & Viva Practice',
      slug: 'studysignal-cse-revision',
      tagline: 'Syllabus tracker, active recall flashcards & viva practice with Telugu technical summaries.',
      description: 'Comprehensive engineering revision workbench for Indian CSE students covering OS, DBMS, Networks, and System Design.',
      category: 'dev_utilities',
      price_inr: 149,
      is_subscription: 0,
      version: '1.0.0',
      download_filename: 'studysignal_v1.0.0.zip',
      file_size_kb: 3800,
      sales_count: 0,
      rating_avg: 0,
      rating_count: 0,
      creator_name: 'ToolForge Systems',
      status: 'approved',
      created_at: '2026-11-01T00:00:00.000Z'
    };
    onBuy(targetProduct);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800 mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Return to Marketplace"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Product 04 • Wave B
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
                StudySignal
                <BookOpen className="w-5 h-5 text-purple-400" />
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Indian CSE Subject Syllabus Tracker, Active Recall Flashcards & Viva Voce Simulator with Telugu Summaries
            </p>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowTelugu(!showTelugu)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
              showTelugu
                ? 'bg-purple-600/20 border-purple-500/40 text-purple-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Languages className="w-3.5 h-3.5 text-purple-400" />
            <span>Telugu Summaries ({showTelugu ? 'ON' : 'OFF'})</span>
          </button>

          <button
            onClick={handleExportNotes}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition active:scale-95"
          >
            {exportNotice ? <Check className="w-4 h-4 text-emerald-300" /> : <Download className="w-4 h-4" />}
            <span>{exportNotice ? 'Exported!' : 'Export Notes'}</span>
          </button>

          {!isOwned && (
            <button
              onClick={handleUnlockPro}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/20 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Unlock All Subjects (₹149)</span>
            </button>
          )}
        </div>
      </div>

      {/* Subject Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {cseSubjects.map((sub) => {
          const isSelected = sub.id === selectedSubjectId;
          return (
            <button
              key={sub.id}
              onClick={() => {
                setSelectedSubjectId(sub.id);
                setCurrentCardIndex(0);
                setIsFlipped(false);
              }}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-slate-900 border-purple-500/50 shadow-lg shadow-purple-500/5 ring-1 ring-purple-500/20'
                  : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-slate-500">{sub.code}</span>
                <span className="text-[10px] text-purple-400 font-semibold">{sub.semester}</span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1">{sub.name}</h3>
            </button>
          );
        })}
      </div>

      {/* Main Study Workbench Card */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/40 gap-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'flashcards'
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Active Recall Cards ({flashcards.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('syllabus')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'syllabus'
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>Syllabus Tracker</span>
            </button>

            <button
              onClick={() => setActiveTab('viva')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'viva'
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Viva Voce Simulator ({vivaQuestions.length})</span>
            </button>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <button
              onClick={() => setShowAddCardModal(true)}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-semibold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Card</span>
            </button>

            <div className="flex items-center space-x-3 text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl">
              <div>
                <span>Cards: </span>
                <span className="font-bold text-purple-400 font-mono">{progress.percentage}%</span>
              </div>
              <span className="text-slate-700">•</span>
              <div>
                <span>Syllabus: </span>
                <span className="font-bold text-emerald-400 font-mono">{syllabusProgress.percentage}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab 1: Active Recall Flashcard Deck */}
        {activeTab === 'flashcards' && (
          <div className="p-6 sm:p-10 flex flex-col items-center">
            {flashcards.length === 0 ? (
              <p className="text-slate-400 text-xs py-8">No flashcards found for this subject.</p>
            ) : (
              <div className="w-full max-w-2xl space-y-6">
                {/* Progress bar */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Card {currentCardIndex + 1} of {flashcards.length}</span>
                  <span className="text-purple-400 font-semibold">{currentCard.topic}</span>
                </div>

                {/* Flip Card Container */}
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="cursor-pointer min-h-[300px] rounded-3xl p-8 border border-slate-700/80 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl flex flex-col justify-between hover:border-purple-500/40 transition-all select-none"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {isFlipped ? 'Key Technical Answer' : 'Question'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMastered(currentCard.id);
                      }}
                      className={`flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition ${
                        masteredCardIds.includes(currentCard.id)
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{masteredCardIds.includes(currentCard.id) ? 'Mastered' : 'Mark Mastered'}</span>
                    </button>
                  </div>

                  {/* Card Content (Question or Answer) */}
                  <div className="my-6">
                    {!isFlipped ? (
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-white mb-2 leading-relaxed">
                          {currentCard.question}
                        </h2>
                        <span className="text-xs text-slate-500 block mt-4">
                          Click anywhere on card to flip and reveal technical answer...
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm font-semibold text-purple-300 leading-relaxed">
                          {currentCard.answer}
                        </p>
                        <div className="space-y-1.5 pt-2 border-t border-slate-800">
                          {currentCard.keyPoints.map((kp, idx) => (
                            <p key={idx} className="text-xs text-slate-300 leading-relaxed flex items-start space-x-2">
                              <span className="text-purple-400 font-bold">•</span>
                              <span>{kp}</span>
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Telugu Translation Drawer if toggled */}
                  {showTelugu && currentCard.teluguExplanation && (
                    <div className="p-3.5 bg-purple-950/30 border border-purple-500/30 rounded-2xl text-xs text-purple-200 mt-2">
                      <span className="font-bold text-[10px] uppercase tracking-wider block mb-1 text-purple-300">
                        తెలుగు వివరణ (Telugu Technical Phrasing):
                      </span>
                      <p className="leading-relaxed font-sans">{currentCard.teluguExplanation}</p>
                    </div>
                  )}

                  {/* Card Footer */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-800/60">
                    <span>Press Space or Click to flip</span>
                    <span className="flex items-center gap-1 text-purple-400 font-semibold">
                      <RotateCw className="w-3.5 h-3.5" />
                      Flip Card
                    </span>
                  </div>
                </div>

                {/* Deck Controls */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handlePrevCard}
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition"
                  >
                    ← Previous
                  </button>

                  <div className="flex space-x-1.5">
                    {flashcards.map((fc, i) => (
                      <button
                        key={fc.id}
                        onClick={() => {
                          setIsFlipped(false);
                          setCurrentCardIndex(i);
                        }}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          currentCardIndex === i
                            ? 'bg-purple-500 w-5'
                            : masteredCardIds.includes(fc.id)
                            ? 'bg-emerald-500/60'
                            : 'bg-slate-800'
                        }`}
                        title={fc.topic}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleNextCard}
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Syllabus Tracker */}
        {activeTab === 'syllabus' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="mb-2">
              <h2 className="text-base font-bold text-white mb-1">Curated University Syllabus Checklist</h2>
              <p className="text-xs text-slate-400">
                Aligned with standard JNTU, Anna University, VTU, and AKTU curriculum.
              </p>
            </div>

            <div className="space-y-6">
              {activeSubject.units.map((unit) => (
                <div key={unit.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h3 className="text-xs sm:text-sm font-bold text-white">
                      Unit {unit.unitNumber}: {unit.title}
                    </h3>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {unit.topics.length} Key Topics
                    </span>
                  </div>

                  <div className="space-y-2">
                    {unit.topics.map((topic) => {
                      const isDone = completedTopicIds.has(topic.id);
                      return (
                        <div
                          key={topic.id}
                          onClick={() => toggleTopicCompleted(topic.id)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition select-none ${
                            isDone
                              ? 'bg-emerald-950/20 border-emerald-500/30 text-white'
                              : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <CheckCircle2 className={`w-4 h-4 transition ${isDone ? 'text-emerald-400 fill-emerald-500/20' : 'text-slate-600'}`} />
                            <span className={isDone ? 'text-slate-200 font-medium line-through opacity-85' : 'text-slate-300'}>{topic.name}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            topic.importance === 'Critical' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            topic.importance === 'High' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {topic.importance}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Viva Voce Simulator */}
        {activeTab === 'viva' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="mb-2">
              <h2 className="text-base font-bold text-white mb-1">Technical Viva Voce Simulator</h2>
              <p className="text-xs text-slate-400">
                Practice answering actual viva questions. Rate your confidence from 1 to 5 stars to calibrate exam readiness.
              </p>
            </div>

            <div className="space-y-4">
              {vivaQuestions.map((vq, idx) => {
                const isRevealed = revealedVivaAnswers.has(vq.id);
                const rating = vivaRatings[vq.id] || 0;

                return (
                  <div key={vq.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        Viva Q{idx + 1} • {vq.topic}
                      </span>

                      {/* Confidence Star Rating */}
                      <div className="flex items-center space-x-1">
                        <span className="text-[10px] text-slate-500 mr-1.5">Confidence:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(vq.id, star)}
                            className="p-0.5 text-amber-400 hover:scale-110 transition"
                          >
                            <Star className={`w-3.5 h-3.5 ${star <= rating ? 'fill-amber-400' : 'text-slate-700'}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-white">{vq.question}</h3>

                    {/* Expected keywords tags */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="text-slate-500 font-semibold mr-1">Expected Keywords:</span>
                      {vq.expectedKeywords.map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                          {kw}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => toggleVivaAnswer(vq.id)}
                      className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isRevealed ? 'Hide Model Answer' : 'Reveal Model Answer & Examiner Trap'}</span>
                    </button>

                    {isRevealed && (
                      <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
                        <div>
                          <span className="font-bold text-[10px] uppercase tracking-wider text-emerald-400 block mb-1">
                            Model Technical Answer:
                          </span>
                          <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                            {vq.modelAnswer}
                          </p>
                        </div>

                        <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-amber-200">
                          <span className="font-bold text-[10px] uppercase tracking-wider block mb-1">
                            Examiner Trap & Common Pitfall:
                          </span>
                          <p>{vq.examinerTrap}</p>
                        </div>

                        {showTelugu && vq.teluguSummary && (
                          <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-xl text-purple-200">
                            <span className="font-bold text-[10px] uppercase tracking-wider block mb-1">
                              తెలుగు సారాంశం (Telugu Technical Summary):
                            </span>
                            <p>{vq.teluguSummary}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {/* Add Custom Study Card Modal */}
      {showAddCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Create Custom Revision Card</h3>
              </div>
              <button
                onClick={() => setShowAddCardModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomCard} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1.5">Topic / Subtopic Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Banker's Algorithm Safe State"
                  value={newCardTopic}
                  onChange={(e) => setNewCardTopic(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1.5">Question / Recall Prompt</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. What are the four necessary conditions for deadlock to occur?"
                  value={newCardQuestion}
                  onChange={(e) => setNewCardQuestion(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1.5">Model Answer / Key Takeaway</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Mutual exclusion, Hold and Wait, No Preemption, Circular Wait."
                  value={newCardAnswer}
                  onChange={(e) => setNewCardAnswer(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1.5">Telugu Technical Summary (Optional)</label>
                <input
                  type="text"
                  placeholder="తెలుగు వివరణ లేదా సారాంశం..."
                  value={newCardTelugu}
                  onChange={(e) => setNewCardTelugu(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCardModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-500/20 transition"
                >
                  Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
