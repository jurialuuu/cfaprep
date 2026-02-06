
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex space-x-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveSubTab('quiz')}
          className={`pb-4 px-2 font-bold text-sm transition-all ${activeSubTab === 'quiz' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Mock Quiz
        </button>
        <button 
          onClick={() => setActiveSubTab('flashcards')}
          className={`pb-4 px-2 font-bold text-sm transition-all ${activeSubTab === 'flashcards' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Flashcards
        </button>
      </div>

      {activeSubTab === 'quiz' && (
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {CFA_TOPICS.find(t => t.id === question.topicId)?.name}
            </span>
            <span className="text-xs text-slate-500 font-medium">Question {currentQuestionIdx + 1}</span>
          </div>

          <h3 className="text-xl font-bold text-slate-800 mb-8 leading-snug">{question.text}</h3>

          <div className="space-y-4 mb-8">
            {question.options.map((opt, i) => {
              let style = "bg-slate-50 border-slate-200 hover:border-blue-300";
              if (selectedOption !== null) {
                if (i === question.correctIndex) style = "bg-emerald-50 border-emerald-500 text-emerald-800";
                else if (i === selectedOption) style = "bg-red-50 border-red-500 text-red-800";
                else style = "bg-slate-50 border-slate-100 opacity-50";
              }

              return (
                <button
                  key={i}
                  onClick={() => handleOptionSelect(i)}
                  className={`w-full text-left p-4 rounded-xl border-2 font-medium transition-all ${style}`}
                >
                  <div className="flex items-center">
                    <span className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center mr-3 font-bold text-xs">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </div>
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 animate-in slide-in-from-top-2">
              <h4 className="font-bold text-slate-800 text-sm mb-2">Explanation</h4>
              <p className="text-sm text-slate-600">{question.explanation}</p>
            </div>
          )}

          {selectedOption !== null && (
            <button 
              onClick={nextQuestion}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              Next Question
            </button>
          )}
        </div>
      )}

      {activeSubTab === 'flashcards' && (
        <div className="max-w-md mx-auto">
          <div className="perspective-1000 relative w-full h-80 mb-8 cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
            <div className={`relative w-full h-full transition-transform duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
              {/* Front */}
              <div className="absolute inset-0 backface-hidden bg-white border-2 border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl group-hover:shadow-2xl transition-shadow">
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-4">
                  {CFA_TOPICS.find(t => t.id === flashcard.topicId)?.name}
                </span>
                <h3 className="text-xl font-bold text-slate-800">{flashcard.front}</h3>
                <p className="absolute bottom-6 text-[10px] text-slate-400 font-bold uppercase">Click to Reveal</p>
              </div>
              {/* Back */}
              <div className="absolute inset-0 backface-hidden bg-blue-600 text-white border-2 border-blue-500 rounded-3xl p-8 flex flex-col items-center justify-center text-center rotate-y-180 shadow-xl">
                <h3 className="text-lg font-medium leading-relaxed">{flashcard.back}</h3>
                <p className="absolute bottom-6 text-[10px] text-blue-200 font-bold uppercase">Click to Flip Back</p>
              </div>
            </div>
          </div>

          <button 
            onClick={nextFlashcard}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors"
          >
            Next Flashcard
          </button>
          <p className="text-center mt-4 text-xs text-slate-400 font-medium italic">
            Visualizing {flashcardIdx + 1} of {SAMPLE_FLASHCARDS.length} terms
          </p>
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
