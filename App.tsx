
import React, { useState, useEffect, useMemo } from 'react';
import { CFA_TOPICS, TARGET_EXAM_DATE } from './constants';
import { UserProgress, StudySettings, CFATopic, StudySession } from './types';
import Dashboard from './components/Dashboard';
import TopicCard from './components/TopicCard';
import AIAdvisor from './components/AIAdvisor';
import Practice from './components/Practice';

type SortOption = 'name' | 'difficulty' | 'weight' | 'estimated';
type FilterOption = 'All' | 'High' | 'Medium' | 'Low';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'topics' | 'planner' | 'practice'>('dashboard');
  
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [filterBy, setFilterBy] = useState<FilterOption>('All');

  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('cfa_progress');
    const defaultProgress = {
      topicProgress: CFA_TOPICS.reduce((acc, t) => ({ ...acc, [t.id]: 0 }), {}),
      overallHours: 0,
      sessions: CFA_TOPICS.reduce((acc, t) => ({ ...acc, [t.id]: [] }), {})
    };
    if (!saved) return defaultProgress;
    
    const parsed = JSON.parse(saved);
    if (!parsed.sessions) parsed.sessions = defaultProgress.sessions;
    return parsed;
  });

  const [settings, setSettings] = useState<StudySettings>({
    startDate: new Date().toISOString().split('T')[0],
    examDate: TARGET_EXAM_DATE,
    hoursPerWeek: 15,
    hasBackground: false
  });

  useEffect(() => {
    localStorage.setItem('cfa_progress', JSON.stringify(progress));
  }, [progress]);

  const daysRemaining = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalized
    const exam = new Date(settings.examDate);
    exam.setHours(0, 0, 0, 0); // Normalized
    const diffTime = exam.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, [settings.examDate]);

  const handleProgressChange = (topicId: string, val: number) => {
    setProgress(prev => ({
      ...prev,
      topicProgress: { ...prev.topicProgress, [topicId]: val }
    }));
  };

  const handleHoursChange = (hours: number) => {
    setProgress(prev => ({ ...prev, overallHours: hours }));
  };

  const handleAddSession = (topicId: string, session: Omit<StudySession, 'id' | 'topicId'>) => {
    const newId = `${Date.now()}`;
    const fullSession: StudySession = { ...session, id: newId, topicId };
    
    setProgress(prev => {
      const topicSessions = prev.sessions[topicId] || [];
      return {
        ...prev,
        overallHours: parseFloat((prev.overallHours + session.hoursSpent).toFixed(2)),
        sessions: {
          ...prev.sessions,
          [topicId]: [...topicSessions, fullSession]
        }
      };
    });
  };

  const filteredAndSortedTopics = useMemo(() => {
    let list = [...CFA_TOPICS];
    
    if (filterBy !== 'All') {
      list = list.filter(t => t.difficulty === filterBy);
    }

    list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'difficulty') {
        const diffMap = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return diffMap[b.difficulty] - diffMap[a.difficulty];
      }
      if (sortBy === 'weight') return b.weightMax - a.weightMax;
      if (sortBy === 'estimated') return b.estimatedHours - a.estimatedHours;
      return 0;
    });

    return list;
  }, [sortBy, filterBy]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">C</div>
            <h1 className="font-bold text-slate-800 tracking-tight hidden sm:block">Level 1 Strategy</h1>
          </div>
          
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto no-scrollbar">
            {(['dashboard', 'topics', 'planner', 'practice'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center text-xs text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
            November 2026 Prep Active
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <header>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Candidate Dashboard</h2>
              <p className="text-slate-500 mt-1">Manage your overall timeline and registration window.</p>
            </header>
            <Dashboard 
              progress={progress} 
              daysRemaining={daysRemaining} 
              onHoursChange={handleHoursChange}
            />
            
            <section className="mt-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Ready to build your roadmap?</h3>
                  <p className="text-slate-500">Generate a full study calendar with daily action items.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('planner')}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center shadow-lg shadow-blue-100"
                >
                  Consult AI Advisor
                </button>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'topics' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Curriculum Mastery</h2>
                <p className="text-slate-500 mt-1">Track proficiency, log sessions, and use the stopwatch timer.</p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center bg-white rounded-lg border border-slate-200 px-3 py-1.5 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 mr-2 uppercase">Sort By:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="text-xs font-bold text-slate-600 outline-none bg-transparent"
                  >
                    <option value="name">Name</option>
                    <option value="difficulty">Difficulty</option>
                    <option value="weight">Exam Weight</option>
                    <option value="estimated">Est. Hours</option>
                  </select>
                </div>
                
                <div className="flex items-center bg-white rounded-lg border border-slate-200 px-3 py-1.5 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 mr-2 uppercase">Filter Diff:</span>
                  <select 
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                    className="text-xs font-bold text-slate-600 outline-none bg-transparent"
                  >
                    <option value="All">All</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedTopics.map(topic => (
                <TopicCard 
                  key={topic.id} 
                  topic={topic} 
                  progress={progress.topicProgress[topic.id] || 0}
                  sessions={progress.sessions[topic.id] || []}
                  onProgressChange={handleProgressChange}
                  onAddSession={handleAddSession}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'planner' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
             <header className="mb-8">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Smart Planner</h2>
              <p className="text-slate-500 mt-1">AI-driven scheduling with daily task breakdowns for November 2026.</p>
            </header>
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              <aside className="xl:col-span-1">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 sticky top-24 shadow-sm">
                  <h4 className="font-bold text-slate-800 mb-6 uppercase text-xs tracking-widest">Study Profile</h4>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Target Weekly Load</label>
                      <div className="flex items-center gap-2">
                         <input 
                          type="number" 
                          value={settings.hoursPerWeek}
                          onChange={(e) => setSettings({...settings, hoursPerWeek: parseInt(e.target.value)})}
                          className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold"
                        />
                        <span className="text-xs text-slate-400">Hours</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Finance Background</label>
                      <select 
                        value={settings.hasBackground ? 'yes' : 'no'}
                        onChange={(e) => setSettings({...settings, hasBackground: e.target.value === 'yes'})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                      >
                        <option value="no">Novice (Non-Finance)</option>
                        <option value="yes">Pro (Finance Background)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </aside>

              <div className="xl:col-span-3">
                <AIAdvisor settings={settings} topics={CFA_TOPICS} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'practice' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <header className="mb-8">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Practice Arena</h2>
              <p className="text-slate-500 mt-1">Drill questions and terms to reinforce your reading.</p>
            </header>
            <Practice />
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-xl">C</div>
          </div>
          <p className="text-sm text-slate-500 font-medium">© 2026 CFA Level 1 Study Strategy Planner</p>
          <div className="mt-4 flex justify-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="hover:text-blue-600 cursor-help">Curriculum Guide</span>
            <span>•</span>
            <span className="hover:text-blue-600 cursor-help">Study Groups</span>
            <span>•</span>
            <span className="hover:text-blue-600 cursor-help">Mock Exams</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
