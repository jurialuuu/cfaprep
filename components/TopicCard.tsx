
import React, { useState, useEffect, useRef } from 'react';
import { CFATopic, StudySession } from '../types';

interface TopicCardProps {
  topic: CFATopic;
  progress: number;
  sessions: StudySession[];
  onProgressChange: (topicId: string, val: number) => void;
  onAddSession: (topicId: string, session: Omit<StudySession, 'id' | 'topicId'>) => void;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic, progress, sessions, onProgressChange, onAddSession }) => {
  const [isLogging, setIsLogging] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
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
    // If the session was very short (less than 1 minute), maybe just set a minimum for display if it's > 0
    const logHours = decimalHours > 0.01 ? decimalHours : (seconds > 0 ? 0.01 : 0);
    
    if (logHours > 0) {
      setNewSession(prev => ({ ...prev, hours: logHours }));
      setIsLogging(true);
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
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-bold text-slate-800">{topic.name}</h4>
          <div className="flex gap-2 mt-1">
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-block ${getDifficultyColor(topic.difficulty)}`}>
              {topic.difficulty}
            </span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-block bg-slate-100 text-slate-600">
              Est: {topic.estimatedHours}h
            </span>
          </div>
        </div>
        <div className="text-xs font-semibold text-slate-400">
          {topic.weightMin}-{topic.weightMax}%
        </div>
      </div>
      
      <p className="text-sm text-slate-500 mb-6 flex-grow">{topic.description}</p>
      
      {/* Timer UI Section */}
      <div className={`mb-4 p-3 rounded-lg border flex flex-col gap-2 transition-all ${timerRunning ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100' : 'bg-slate-50 border-slate-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${timerRunning ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`}></div>
            <span className="text-lg font-mono font-bold text-slate-700 tracking-wider">{formatTime(seconds)}</span>
          </div>
          <div className="flex gap-2">
            {!timerRunning ? (
              <button 
                onClick={startTimer}
                className="bg-blue-600 text-white text-[11px] font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm active:scale-95"
              >
                Start Study
              </button>
            ) : (
              <button 
                onClick={stopTimer}
                className="bg-red-600 text-white text-[11px] font-bold px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-sm active:scale-95"
              >
                Finish & Log
              </button>
            )}
          </div>
        </div>
        {timerRunning && <p className="text-[10px] text-blue-600 font-medium animate-pulse text-center">Stopwatch is recording...</p>}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-700">
            <span>Mastery Progress</span>
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

        <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-2 border-t border-slate-100">
          <span>Logged: <b className="text-slate-800">{totalLoggedHours.toFixed(2)}h</b></span>
          <div className="flex gap-2">
             <button 
              onClick={() => setShowHistory(!showHistory)}
              className={`p-1 rounded transition-colors ${showHistory ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-600'}`}
              title="View History"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
            <button 
              onClick={() => setIsLogging(!isLogging)}
              className={`text-[11px] font-bold px-2 py-1 rounded transition-colors ${isLogging ? 'text-red-600 bg-red-50' : 'text-blue-600 hover:bg-blue-50'}`}
            >
              {isLogging ? 'Cancel' : 'Manual Log'}
            </button>
          </div>
        </div>

        {isLogging && (
          <form onSubmit={handleLogSubmit} className="bg-slate-50 p-3 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input 
                type="date" 
                required
                value={newSession.date}
                onChange={e => setNewSession({...newSession, date: e.target.value})}
                className="text-[10px] p-2 rounded border border-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input 
                type="number" 
                placeholder="Hours"
                required
                min="0.01"
                step="0.01"
                value={newSession.hours}
                onChange={e => setNewSession({...newSession, hours: parseFloat(e.target.value)})}
                className="text-[10px] p-2 rounded border border-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <textarea 
              placeholder="Study notes for this session..."
              value={newSession.notes}
              onChange={e => setNewSession({...newSession, notes: e.target.value})}
              className="w-full text-[10px] p-2 rounded border border-slate-200 outline-none resize-none h-14 mb-2 focus:ring-1 focus:ring-blue-500"
            />
            <button className="w-full bg-blue-600 text-white text-[11px] font-bold py-2 rounded-lg hover:bg-blue-700 shadow-sm">Save Study Session</button>
          </form>
        )}

        {showHistory && (
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 max-h-40 overflow-y-auto animate-in fade-in duration-200">
            <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Logged History</h5>
            {sessions.length === 0 ? (
              <p className="text-[10px] text-slate-400 italic">No sessions logged yet. Start studying!</p>
            ) : (
              <div className="space-y-3">
                {sessions.slice().reverse().map(s => (
                  <div key={s.id} className="text-[10px] border-b border-slate-100 pb-2 last:border-0">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>{s.date}</span>
                      <span className="bg-blue-50 px-1.5 rounded text-blue-600">{s.hoursSpent.toFixed(2)}h</span>
                    </div>
                    {s.notes && <p className="text-slate-500 italic mt-1 leading-relaxed">{s.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicCard;
