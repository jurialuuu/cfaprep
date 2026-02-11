
import React, { useState, useEffect } from 'react';
import { getAIPersonalyPlan, getTopicExplanation } from '../services/geminiService';
import { StudySettings, CFATopic } from '../types';
import { AI_GUIDE_QUESTIONS } from '../constants';

interface AIAdvisorProps {
  settings: StudySettings;
  topics: CFATopic[];
  savedPlan?: any;
  onSavePlan: (plan: any) => void;
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ settings, topics, savedPlan, onSavePlan }) => {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [explanation, setExplanation] = useState('');
  const [explaining, setExplaining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});

  const toggleTask = (weekIdx: number, dayIdx: number) => {
    const key = `${weekIdx}-${dayIdx}`;
    setCheckedTasks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGeneratePlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAIPersonalyPlan(settings, topics);
      if (result && result.weeklyBreakdown && result.weeklyBreakdown.length > 0) {
        onSavePlan(result);
      } else {
        setError("Invalid AI response structure.");
      }
    } catch (e: any) {
      setError("AI Service Timeout. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async (q?: string) => {
    const finalQuery = q || query;
    if (!finalQuery) return;
    setExplaining(true);
    setExplanation('');
    try {
      const result = await getTopicExplanation("General CFA Concepts", finalQuery);
      setExplanation(result || "No explanation found.");
      if (!q) setQuery('');
    } catch (e) {
      setExplanation("Tutor offline.");
    }
    setExplaining(false);
  };

  const formatResponse = (text: string) => {
    if (!text) return null;
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<b class="text-white">$1</b>');
    formatted = formatted.replace(/^\s*[\*\-]\s+(.*)/gm, '<li class="ml-4 mb-0.5">$1</li>');
    return formatted.split('\n').map((line, i) => (
      <p key={i} className="mb-1 text-[11px]" dangerouslySetInnerHTML={{ __html: line }} />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-xl">
          <h2 className="text-lg font-black tracking-[0.2em] mb-1 uppercase">AI Architect</h2>
          <p className="text-slate-400 text-xs font-medium">Precision study roadmap for the Nov 2026 window.</p>
        </div>
        
        <button 
          onClick={handleGeneratePlan}
          disabled={loading}
          className="bg-white text-slate-900 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 disabled:opacity-50 transition-all shadow-lg active:scale-95 shrink-0"
        >
          {loading ? 'Processing...' : (savedPlan ? 'Refresh Roadmap' : 'Generate 8-Week Plan')}
        </button>
      </div>

      {savedPlan && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Strategy Intent
            </h3>
            <p className="text-slate-700 font-bold text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">{savedPlan.strategy}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {savedPlan.weeklyBreakdown.map((week: any, wIdx: number) => (
              <div key={wIdx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-50">
                  <span className="text-[10px] font-black text-indigo-600 tracking-widest uppercase">Week {week.week}</span>
                  <span className="text-[9px] font-bold text-slate-400 px-1.5 py-0.5 bg-slate-50 rounded uppercase">{week.topic.split(' ')[0]}</span>
                </div>
                <div className="space-y-1.5">
                  {week.dailyTasks?.map((task: string, dIdx: number) => (
                    <div 
                      key={dIdx} 
                      onClick={() => toggleTask(wIdx, dIdx)}
                      className={`flex items-start gap-2 p-1.5 rounded-lg transition-all cursor-pointer ${
                        checkedTasks[`${wIdx}-${dIdx}`] 
                          ? 'bg-emerald-50 opacity-40' 
                          : 'bg-slate-50 border border-slate-100 hover:border-indigo-100'
                      }`}
                    >
                      <div className={`mt-0.5 shrink-0 w-3 h-3 rounded border flex items-center justify-center ${
                        checkedTasks[`${wIdx}-${dIdx}`] ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-300'
                      }`}>
                        {checkedTasks[`${wIdx}-${dIdx}`] && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <p className={`text-[9px] font-bold leading-tight ${checkedTasks[`${wIdx}-${dIdx}`] ? 'text-emerald-800 line-through' : 'text-slate-600'}`}>
                        {task}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Core Survival Tips</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {savedPlan.tips.map((tip: string, i: number) => (
                <div key={i} className="text-[10px] font-bold text-slate-600 p-2.5 bg-white rounded-lg border border-slate-200">
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <h3 className="text-xs font-black uppercase tracking-widest mb-4">CFA Knowledge Engine</h3>
        <div className="flex flex-wrap gap-1.5 mb-6">
          {AI_GUIDE_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => handleAsk(q)}
              className="text-[9px] font-black px-2.5 py-1 rounded-lg border border-slate-800 text-slate-500 hover:border-indigo-500 hover:text-indigo-400 transition-colors uppercase tracking-tight"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Concept query..."
            className="flex-1 bg-slate-800 border-slate-700 rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none placeholder:text-slate-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          />
          <button 
            onClick={() => handleAsk()}
            disabled={explaining || !query}
            className="bg-indigo-600 px-6 py-2 rounded-xl text-xs font-black uppercase hover:bg-indigo-500 disabled:opacity-30 flex items-center gap-2"
          >
            {explaining ? '...' : 'Analyze'}
          </button>
        </div>
        {explanation && (
          <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700 text-xs text-slate-300 animate-in slide-in-from-top-2">
            <div className="prose prose-invert prose-xs max-w-none">
                {formatResponse(explanation)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAdvisor;
