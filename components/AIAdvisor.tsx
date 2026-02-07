
import React, { useState } from 'react';
import { getAIPersonalyPlan, getTopicExplanation } from '../services/geminiService';
import { StudySettings, CFATopic } from '../types';

interface AIAdvisorProps {
  settings: StudySettings;
  topics: CFATopic[];
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ settings, topics }) => {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [query, setQuery] = useState('');
  const [explanation, setExplanation] = useState('');
  const [explaining, setExplaining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local state for checking off daily tasks (session-based for now)
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
        setPlan(result);
      } else {
        setError("The AI could not generate a valid structure. Please try again.");
      }
    } catch (e: any) {
      console.error("AI Plan Generation Error:", e);
      setError("Service temporarily unavailable. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async () => {
    if (!query) return;
    setExplaining(true);
    try {
      const result = await getTopicExplanation("General CFA Concepts", query);
      setExplanation(result || "I couldn't find a clear explanation for that concept.");
    } catch (e) {
      setExplanation("Tutor service is currently unavailable.");
    }
    setExplaining(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-700 to-blue-800 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl font-bold mb-2">AI Study Strategist</h2>
          <p className="text-indigo-100 mb-6 text-sm">
            Leverage Gemini 3.0 to generate a high-precision weekly roadmap with daily actionable tasks tailored for the November 2026 exam window.
          </p>
          
          <div className="flex flex-col gap-4 items-start">
            <button 
              onClick={handleGeneratePlan}
              disabled={loading}
              className="bg-white text-indigo-700 px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-50 transition-all disabled:opacity-50 flex items-center gap-3 shadow-lg active:scale-95"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Crafting Your Roadmap...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  Generate 8-Week Daily Plan
                </>
              )}
            </button>
            
            {error && (
              <div className="bg-red-500/20 border border-red-500/40 text-red-100 px-4 py-2 rounded-lg text-xs font-medium animate-in fade-in slide-in-from-left-2">
                {error}
              </div>
            )}
          </div>
        </div>
        {/* Decorative element */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {plan && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Core Strategy
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">{plan.strategy}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plan.weeklyBreakdown.map((week: any, wIdx: number) => (
              <div key={wIdx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                  <span className="font-extrabold text-indigo-600 tracking-tight">WEEK {week.week}</span>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded uppercase">{week.topic}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  Daily Action Checklist
                </h4>
                <div className="space-y-2">
                  {week.dailyTasks?.map((task: string, dIdx: number) => (
                    <div 
                      key={dIdx} 
                      onClick={() => toggleTask(wIdx, dIdx)}
                      className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer group ${
                        checkedTasks[`${wIdx}-${dIdx}`] 
                          ? 'bg-emerald-50 border-emerald-100 opacity-60' 
                          : 'bg-slate-50 border-slate-100 hover:border-indigo-100'
                      }`}
                    >
                      <div className={`mt-0.5 shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        checkedTasks[`${wIdx}-${dIdx}`] 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'bg-white border-slate-300 group-hover:border-indigo-400'
                      }`}>
                        {checkedTasks[`${wIdx}-${dIdx}`] && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <div className="flex-1">
                        <span className={`text-[11px] block font-bold mb-0.5 ${checkedTasks[`${wIdx}-${dIdx}`] ? 'text-emerald-700' : 'text-slate-500'}`}>
                          Day {dIdx + 1}
                        </span>
                        <p className={`text-[11px] leading-snug ${checkedTasks[`${wIdx}-${dIdx}`] ? 'text-emerald-600 line-through' : 'text-slate-600'}`}>
                          {task}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 shadow-inner">
            <h4 className="font-bold text-indigo-800 mb-4 text-xs uppercase tracking-widest flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0012 18.75c-1.03 0-1.959-.403-2.656-1.003l-.548-.547z" /></svg>
              Candidate Survival Tips
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {plan.tips.map((tip: string, i: number) => (
                <div key={i} className="flex items-start text-[11px] text-indigo-700 p-3 bg-white rounded-xl border border-indigo-100 hover:shadow-sm transition-shadow">
                  <span className="mr-3 mt-1.5 block h-1 w-1 rounded-full bg-indigo-400 shrink-0"></span>
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-2xl">
        <div className="max-w-xl mb-6">
          <h3 className="text-lg font-bold mb-2">Instant CFA Concept Tutor</h3>
          <p className="text-slate-400 text-sm">Ask about any difficult Level 1 concept for a concise, exam-focused explanation.</p>
        </div>
        <div className="flex gap-3">
          <input 
            type="text" 
            placeholder="e.g., Explain the difference between Modified and Effective Duration..."
            className="flex-1 bg-slate-800 border-slate-700 rounded-xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          />
          <button 
            onClick={handleAsk}
            disabled={explaining || !query}
            className="bg-indigo-600 px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-500 transition-all disabled:opacity-30 flex items-center gap-2"
          >
            {explaining ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Analyze'}
          </button>
        </div>
        {explanation && (
          <div className="mt-6 p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 text-sm text-slate-300 leading-relaxed animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tutor Response</span>
            </div>
            {explanation}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAdvisor;
