
import React, { useState } from 'react';
import { SAMPLE_QUESTIONS, SAMPLE_FLASHCARDS, CFA_TOPICS } from '../constants';

const Practice: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'quiz' | 'flashcards'>('quiz');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const question = SAMPLE_QUESTIONS[currentQuestionIdx % SAMPLE_QUESTIONS.length];
  const flashcard = SAMPLE_FLASHCARDS[flashcardIdx % SAMPLE_FLASHCARDS.length];

  const handleOptionSelect = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    setCurrentQuestionIdx(prev => prev + 1);
  };

  const nextFlashcard = () => {
    setIsFlipped(false);
    setTimeout(() => setFlashcardIdx(prev => prev + 1), 150);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit mx-auto">
        <button 
          onClick={() => setActiveSubTab('quiz')}
          className={`px-6 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === 'quiz' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Mock Quiz
        </button>
        <button 
          onClick={() => setActiveSubTab('flashcards')}
          className={`px-6 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === 'flashcards' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Active Recall
        </button>
      </div>

      {activeSubTab === 'quiz' && (
        <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
              {CFA_TOPICS.find(t => t.id === question.topicId)?.id} Unit
            </span>
            <span className="text-[9px] text-slate-400 font-black uppercase">Q {currentQuestionIdx + 1}</span>
          </div>

          <h3 className="text-base font-black text-slate-900 mb-6 leading-snug tracking-tight">{question.text}</h3>

          <div className="space-y-2 mb-6">
            {question.options.map((opt, i) => {
              let style = "bg-slate-50 border-slate-100 hover:border-indigo-300";
              if (selectedOption !== null) {
                if (i === question.correctIndex) style = "bg-emerald-50 border-emerald-500 text-emerald-900";
                else if (i === selectedOption) style = "bg-rose-50 border-rose-500 text-rose-900";
                else style = "bg-slate-50 border-slate-50 opacity-40";
              }

              return (
                <button
                  key={i}
                  onClick={() => handleOptionSelect(i)}
                  className={`w-full text-left p-3 rounded-xl border-2 text-xs font-bold transition-all ${style}`}
                >
                  <div className="flex items-center">
                    <span className="w-6 h-6 rounded-lg bg-white/50 flex items-center justify-center mr-3 font-black text-[9px]">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </div>
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 animate-in slide-in-from-top-2">
              <h4 className="text-[9px] font-black text-slate-400 uppercase mb-1">Rationale</h4>
              <p className="text-[10px] font-bold text-slate-600 leading-relaxed">{question.explanation}</p>
            </div>
          )}

          {selectedOption !== null && (
            <button 
              onClick={nextQuestion}
              className="w-full bg-slate-900 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg"
            >
              Continue Test
            </button>
          )}
        </div>
      )}

      {activeSubTab === 'flashcards' && (
        <div className="max-w-xs mx-auto">
          <div className="perspective-1000 relative w-full h-64 mb-6 cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
            <div className={`relative w-full h-full transition-transform duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
              {/* Front */}
              <div className="absolute inset-0 backface-hidden bg-white border border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-lg group-hover:shadow-xl transition-shadow">
                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-3">
                  Concept
                </span>
                <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">{flashcard.front}</h3>
                <span className="absolute bottom-4 text-[8px] text-slate-400 font-black uppercase tracking-[0.2em]">Reveal Back</span>
              </div>
              {/* Back */}
              <div className="absolute inset-0 backface-hidden bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center rotate-y-180 shadow-xl">
                <h3 className="text-[11px] font-bold leading-relaxed">{flashcard.back}</h3>
                <span className="absolute bottom-4 text-[8px] text-slate-500 font-black uppercase tracking-[0.2em]">Return</span>
              </div>
            </div>
          </div>

          <button 
            onClick={nextFlashcard}
            className="w-full bg-slate-900 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all"
          >
            Next Item
          </button>
        </div>
      )}

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default Practice;
