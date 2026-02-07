
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
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-amber-600 bg-amber-50';
      case 'Low': return 'text-emerald-600 bg-emerald-50';
      default: return 'text-slate-600 bg-slate-50';
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

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full overflow-hidden">
      <div className="p-5 border-b border-slate-50 bg-slate-50/30">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-slate-800 leading-tight">{topic.name}</h4>
          <span className="text-[10px] font-semibold text-slate-400 shrink-0 ml-2">
            {topic.weightMin}-{topic.weightMax}%
          </span>
        </div>
        <div className="flex gap-2">
          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-block ${getDifficultyColor(topic.difficulty)}`}>
            {topic.difficulty}
          </span>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-block bg-slate-100 text-slate-600">
            Est: {topic.estimatedHours}h
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {/* View Switcher */}
        <div className="flex border-b border-slate-100">
          {(['study', 'review', 'history'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setActiveView(v)}
              className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                activeView === v ? 'text-blue-600 bg-blue-50/50' : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="p-5 flex-1">
          {activeView === 'study' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <p className="text-sm text-slate-500 leading-relaxed mb-4">{topic.description}</p>
              
              {/* Timer UI */}
              <div className={`p-3 rounded-lg border flex flex-col gap-2 transition-all ${timerRunning ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${timerRunning ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`}></div>
                    <span className="text-lg font-mono font-bold text-slate-700 tracking-wider">{formatTime(seconds)}</span>
                  </div>
                  <div className="flex gap-2">
                    {!timerRunning ? (
                      <button 
                        onClick={startTimer}
                        className="bg-blue-600 text-white text-[11px] font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        Start
                      </button>
                    ) : (
                      <button 
                        onClick={stopTimer}
                        className="bg-red-600 text-white text-[11px] font-bold px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                      >
                        Finish
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Mastery</span>
                  <span className="text-blue-600">{progress}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={progress} 
                  onChange={(e) => onProgressChange(topic.id, parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500">Logged: <b className="text-slate-800">{totalLoggedHours.toFixed(1)}h</b></span>
                <button 
                  onClick={() => setIsLogging(!isLogging)}
                  className="text-[11px] font-bold text-blue-600 hover:underline"
                >
                  {isLogging ? 'Cancel' : 'Manual Log'}
                </button>
              </div>

              {isLogging && (
                <form onSubmit={handleLogSubmit} className="bg-slate-50 p-3 rounded-lg border border-slate-200 animate-in slide-in-from-top-2">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input type="date" required value={newSession.date} onChange={e => setNewSession({...newSession, date: e.target.value})} className="text-[10px] p-2 rounded border border-slate-200 outline-none" />
                    <input type="number" placeholder="Hours" required min="0.01" step="0.01" value={newSession.hours} onChange={e => setNewSession({...newSession, hours: parseFloat(e.target.value)})} className="text-[10px] p-2 rounded border border-slate-200 outline-none" />
                  </div>
                  <textarea placeholder="Notes..." value={newSession.notes} onChange={e => setNewSession({...newSession, notes: e.target.value})} className="w-full text-[10px] p-2 rounded border border-slate-200 outline-none h-12 mb-2 resize-none" />
                  <button className="w-full bg-blue-600 text-white text-[11px] font-bold py-2 rounded-lg hover:bg-blue-700">Save</button>
                </form>
              )}
            </div>
          )}

          {activeView === 'review' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Key Concept Review</h5>
              <p className="text-xs text-slate-500 italic mb-2">Summarize core formulas or difficult terms here.</p>
              <textarea 
                value={reviewNotes}
                onChange={(e) => onReviewNotesChange(topic.id, e.target.value)}
                placeholder="Start typing your review notes for this topic..."
                className="w-full h-48 text-sm p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 resize-none font-medium text-slate-700"
              />
              <div className="flex items-center justify-end">
                <span className="text-[10px] text-slate-400">Notes auto-save locally</span>
              </div>
            </div>
          )}

          {activeView === 'history' && (
            <div className="animate-in fade-in duration-300">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Study Session History</h5>
              {sessions.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xs text-slate-400 italic">No sessions logged yet.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {sessions.slice().reverse().map(s => (
                    <div key={s.id} className="text-[10px] p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                      <div className="flex justify-between font-bold text-slate-700">
                        <span>{s.date}</span>
                        <span className="text-blue-600">{s.hoursSpent.toFixed(2)}h</span>
                      </div>
                      {s.notes && <p className="text-slate-500 mt-1 italic leading-relaxed">{s.notes}</p>}
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
