
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
    const defaultProgress: UserProgress = {
      topicProgress: CFA_TOPICS.reduce((acc, t) => ({ ...acc, [t.id]: 0 }), {}),
      overallHours: 0,
      sessions: CFA_TOPICS.reduce((acc, t) => ({ ...acc, [t.id]: [] }), {}),
      reviewNotes: CFA_TOPICS.reduce((acc, t) => ({ ...acc, [t.id]: "" }), {}),
      savedPlan: null
    };
    if (!saved) return defaultProgress;
    
    const parsed = JSON.parse(saved);
    return {
      ...defaultProgress,
      ...parsed,
      sessions: parsed.sessions || defaultProgress.sessions,
      reviewNotes: parsed.reviewNotes || defaultProgress.reviewNotes,
    };
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
    today.setHours(0, 0, 0, 0);
    const exam = new Date(settings.examDate);
    exam.setHours(0, 0, 0, 0);
    const diffTime = exam.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, [settings.examDate]);

  const handleProgressChange = (topicId: string, val: number) => {
    setProgress(prev => ({
      ...prev,
      topicProgress: { ...prev.topicProgress, [topicId]: val }
    }));
  };

  const handleReviewNotesChange = (topicId: string, notes: string) => {
    setProgress(prev => ({
      ...prev,
      reviewNotes: { ...prev.reviewNotes, [topicId]: notes }
    }));
  };

  const handleHoursChange = (hours: number) => {
    setProgress(prev => ({ ...prev, overallHours: hours }));
  };

  const handleSavePlan = (plan: any) => {
    setProgress(prev => ({ ...prev, savedPlan: plan }));
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

  const groupedTopics = useMemo(() => {
    const groups: Record<string, CFATopic[]> = {
      'Ethics': [],
      'Investment Tools': [],
      'Asset Classes': [],
      'Portfolio Management': []
    };
    filteredAndSortedTopics.forEach(t => groups[t.category].push(t));
    return groups;
  }, [filteredAndSortedTopics]);

  const categoryCompletion = useMemo(() => {
    const stats: Record<string, number> = {};
    (Object.entries(groupedTopics) as [string, CFATopic[]][]).forEach(([cat, topics]) => {
      if (topics.length === 0) {
        stats[cat] = 0;
        return;
      }
      const sum = topics.reduce((acc, t) => acc + (progress.topicProgress[t.id] || 0), 0);
      stats[cat] = Math.round(sum / topics.length);
    });
    return stats;
  }, [groupedTopics, progress.topicProgress]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-sm">C</div>
            <div className="flex flex-col -space-y-1">
              <h1 className="font-bold text-slate-900 tracking-tight text-sm">Level 1 Strategy</h1>
              <span className="text-[9px] font-bold text-indigo-600 tracking-widest uppercase">Nov 2026 Window</span>
            </div>
          </div>
          
          <nav className="flex bg-slate-100 p-1 rounded-xl">
            {(['dashboard', 'topics', 'planner', 'practice'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
            Live Session
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest">Candidate Pulse</h2>
            </div>
            <Dashboard 
              progress={progress} 
              daysRemaining={daysRemaining} 
              onHoursChange={handleHoursChange}
            />
          </div>
        )}

        {activeTab === 'topics' && (
          <div className="animate-in fade-in duration-300">
            <div className="sticky top-[56px] z-40 bg-slate-50/90 backdrop-blur-sm py-3 mb-6 border-b border-slate-200 -mx-6 px-6">
              <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
                <div className="flex gap-2">
                  {Object.keys(groupedTopics).map(cat => (
                    <button 
                      key={cat}
                      onClick={() => scrollToSection(cat)}
                      className="group flex items-center gap-3 px-3 py-1.5 bg-white rounded-lg border border-slate-200 hover:border-indigo-400 transition-all shadow-sm"
                    >
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{cat}</span>
                      <span className="text-[10px] font-black text-indigo-600">{categoryCompletion[cat]}%</span>
                    </button>
                  ))}
                </div>
                
                <div className="flex gap-2 shrink-0">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="text-[10px] font-bold text-slate-700 outline-none bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-sm uppercase tracking-tight"
                  >
                    <option value="name">Name</option>
                    <option value="difficulty">Difficulty</option>
                    <option value="weight">Weight</option>
                  </select>
                  <select 
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                    className="text-[10px] font-bold text-slate-700 outline-none bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-sm uppercase tracking-tight"
                  >
                    <option value="All">All Levels</option>
                    <option value="High">High Only</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-12 pb-12">
              {(Object.entries(groupedTopics) as [string, CFATopic[]][]).map(([category, topics]) => topics.length > 0 && (
                <section key={category} id={category} className="scroll-mt-32">
                  <div className="flex items-center gap-4 mb-6">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] shrink-0">{category}</h3>
                    <div className="flex-1 h-px bg-slate-200"></div>
                    <span className="text-[10px] font-bold text-slate-400">{topics.length} Units</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topics.map(topic => (
                      <TopicCard 
                        key={topic.id} 
                        topic={topic} 
                        progress={progress.topicProgress[topic.id] || 0}
                        sessions={progress.sessions[topic.id] || []}
                        reviewNotes={progress.reviewNotes[topic.id] || ""}
                        onProgressChange={handleProgressChange}
                        onReviewNotesChange={handleReviewNotesChange}
                        onAddSession={handleAddSession}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'planner' && (
          <div className="animate-in fade-in duration-300">
            <AIAdvisor 
              settings={settings} 
              topics={CFA_TOPICS} 
              savedPlan={progress.savedPlan}
              onSavePlan={handleSavePlan}
            />
          </div>
        )}

        {activeTab === 'practice' && (
          <div className="animate-in fade-in duration-300">
            <Practice />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
