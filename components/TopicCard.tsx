
import React, { useState, useEffect, useRef } from 'react';
import { CFATopic, StudySession } from '../types';

interface TopicCardProps {
  topic: CFATopic;
  progress: number;
  sessions: StudySession[];
  reviewNotes: string;
  onProgressChange: (topicId: string, val: number) => void;
  onReviewNotesChange: (topicId: string, notes: string) => void;
  onAddSession: (topicId: string, session: Omit<StudySession, 'id' | 'topicId'>) => void;
}

const TopicCard: React.FC<TopicCardProps> = ({ 
  topic, 
  progress, 
  sessions, 
  reviewNotes,
  onProgressChange, 
  onReviewNotesChange,
  onAddSession 
}) => {
  const [activeView, setActiveView] = useState<'study' | 'review' | 'history'>('study');
  const [isLogging, setIsLogging] = useState(false);
  const [newSession, setNewSession] = useState({ date: new Date().toISOString().split('T')[0], hours: 1, notes: '' });

  // Timer State
  const [timerRunning, setTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = window.setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startTimer = () => setTimerRunning(true);
  
  const stopTimer = () => {
    setTimerRunning(false);
    const decimalHours = parseFloat((seconds / 3600).toFixed(2));
    const logHours = decimalHours > 0.01 ? decimalHours : (seconds > 0 ? 0.01 : 0);
    
    if (logHours > 0) {
      setNewSession(prev => ({ ...prev, hours: logHours }));
      setIsLogging(true);
      setActiveView('study');
    }
    setSeconds(0);
  };

  const getDifficultyColor = (diff: string) => {
    switch(diff) {
      case 'High': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Low': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSession(topic.id, {
      date: newSession.date,
      hoursSpent: newSession.hours,
      notes: newSession.notes
    });
    setNewSession({ date: new Date().toISOString().split('T')[0], hours: 1, notes: '' });
    setIsLogging(false);
  };

  const totalLoggedHours = sessions.reduce((acc, s) => acc + s.hoursSpent, 0);

  const masteryStatus = () => {
    if (progress === 0) return { label: 'EMPTY', color: 'bg-slate-100 text-slate-500 border-slate-200' };
    if (progress < 40) return { label: 'LEARNING', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (progress < 80) return { label: 'REVIEW', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    return { label: 'READY', color: 'bg-emerald-500 text-white border-emerald-600' };
  };

  const status = masteryStatus();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col h-[520px] overflow-hidden group">
      {/* Visual Header - More Compact */}
      <div className="p-5 border-b border-slate-50 bg-slate-50/50">
        <div className="flex justify-between items-start mb-3">
          <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md border-2 ${getDifficultyColor(topic.difficulty)}`}>
            {topic.difficulty}
          </span>
          <div className="text-right">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Exam Weight</span>
            <span className="text-xs font-black text-slate-800 tracking-tight">{topic.weightMin}-{topic.weightMax}%</span>
          </div>
        </div>
        
        <h4 className="text-sm font-black text-slate-900 leading-tight mb-4 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
          {topic.name}
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black tracking-widest border-2 ${status.color}`}>
              {status.label}
            </span>
            <span className="text-[10px] font-black text-slate-900">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ease-out ${progress >= 80 ? 'bg-emerald-500' : 'bg-slate-900'}`} 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {/* Navigation Tabs - Slimmer */}
        <div className="flex px-2 bg-white">
          {(['study', 'review', 'history'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setActiveView(v)}
              className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest transition-all relative ${
                activeView === v ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {v}
              {activeView === v && <div className="absolute bottom-1 left-3 right-3 h-0.5 bg-slate-900 rounded-full"></div>}
            </button>
          ))}
        </div>

        <div className="p-5 flex-1 overflow-y-auto no-scrollbar">
          {activeView === 'study' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                {topic.description}
              </p>
              
              {/* Focus Timer - Sleeked Down */}
              <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${timerRunning ? 'bg-slate-900 border-slate-900 shadow-md' : 'bg-white border-slate-100 shadow-sm'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className={`text-[8px] font-black uppercase tracking-[0.2em] mb-0.5 ${timerRunning ? 'text-slate-500' : 'text-slate-400'}`}>Session</span>
                    <span className={`text-xl font-mono font-black tracking-tight ${timerRunning ? 'text-white' : 'text-slate-800'}`}>{formatTime(seconds)}</span>
                  </div>
                  <button 
                    onClick={timerRunning ? stopTimer : startTimer}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        timerRunning 
                        ? 'bg-rose-500 text-white shadow-lg' 
                        : 'bg-slate-900 text-white hover:bg-black shadow-md'
                    }`}
                  >
                    {timerRunning ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    ) : (
                        <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Progress Mastery - Tighter */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h5 className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Update Mastery</h5>
                  <span className="text-[9px] font-black text-indigo-600">{progress}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={progress} 
                  onChange={(e) => onProgressChange(topic.id, parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-100 rounded-full appearance-none cursor-pointer accent-slate-900"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Focus Accumulation</span>
                  <p className="text-sm font-black text-slate-800 tracking-tight">
                    {totalLoggedHours.toFixed(1)}h 
                    <span className="text-slate-400 font-bold ml-1 text-[10px]">/ {topic.estimatedHours}h</span>
                  </p>
                </div>
                <button 
                  onClick={() => setIsLogging(!isLogging)}
                  className={`p-2 rounded-lg border-2 transition-colors ${isLogging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 bg-white hover:border-slate-900'}`}
                >
                  <svg className={`w-4 h-4 text-slate-900 transition-transform ${isLogging ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>

              {isLogging && (
                <form onSubmit={handleLogSubmit} className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200 animate-in slide-in-from-top-4">
                  <div className="grid grid-cols-2 gap-3">
                    <input type="date" required value={newSession.date} onChange={e => setNewSession({...newSession, date: e.target.value})} className="text-[10px] font-bold p-2 rounded-lg border border-slate-200 outline-none" />
                    <input type="number" required min="0.01" step="0.01" value={newSession.hours} onChange={e => setNewSession({...newSession, hours: parseFloat(e.target.value)})} className="text-[10px] font-bold p-2 rounded-lg border border-slate-200 outline-none" placeholder="Hours" />
                  </div>
                  <textarea placeholder="Reading focus..." value={newSession.notes} onChange={e => setNewSession({...newSession, notes: e.target.value})} className="w-full text-[10px] font-bold p-2 rounded-lg border border-slate-200 outline-none h-16 resize-none" />
                  <button className="w-full bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest py-2.5 rounded-lg">Log Activity</button>
                </form>
              )}
            </div>
          )}

          {activeView === 'review' && (
            <div className="h-full flex flex-col space-y-3 animate-in fade-in duration-300">
              <h5 className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Cheat Sheet Notes</h5>
              <textarea 
                value={reviewNotes}
                onChange={(e) => onReviewNotesChange(topic.id, e.target.value)}
                placeholder="Key formulas, LOS summaries..."
                className="w-full flex-1 text-[11px] p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-indigo-200 resize-none font-bold text-slate-700 leading-relaxed transition-all shadow-inner"
              />
              <div className="flex items-center gap-2 p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></div>
                <p className="text-[8px] text-indigo-800 font-bold uppercase tracking-tight">Active recall is the key.</p>
              </div>
            </div>
          )}

          {activeView === 'history' && (
            <div className="h-full animate-in fade-in duration-300">
              <h5 className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-4">Study Trail</h5>
              {sessions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-30">
                  <span className="text-[8px] font-black uppercase tracking-widest">No Logs</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                  {sessions.slice().reverse().map(s => (
                    <div key={s.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition-all">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[8px] font-black text-slate-400 uppercase">{s.date}</span>
                        <span className="text-[10px] font-black text-slate-900">{s.hoursSpent.toFixed(2)}h</span>
                      </div>
                      {s.notes && <p className="text-[9px] text-slate-600 leading-snug font-bold italic line-clamp-2">{s.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicCard;
