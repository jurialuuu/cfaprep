
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { CFA_TOPICS, REGISTRATION_DEADLINES } from '../constants';
import { UserProgress } from '../types';

interface DashboardProps {
  progress: UserProgress;
  daysRemaining: number;
  onHoursChange: (hours: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ progress, daysRemaining, onHoursChange }) => {
  const chartData = CFA_TOPICS.map(topic => ({
    name: topic.id.toUpperCase(),
    progress: progress.topicProgress[topic.id] || 0,
    weight: (topic.weightMin + topic.weightMax) / 2
  }));

  const overallProgress = Math.round(
    (Object.values(progress.topicProgress) as number[]).reduce((a, b) => a + b, 0) / CFA_TOPICS.length
  );

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#6366f1', '#14b8a6'];

  const today = new Date();
  today.setHours(0,0,0,0);
  const earlyBirdDate = new Date(REGISTRATION_DEADLINES.earlyBird);
  const standardDate = new Date(REGISTRATION_DEADLINES.standard);
  
  const isEarlyBirdPassed = today > earlyBirdDate;
  const isStandardPassed = today > standardDate;

  return (
    <div className="space-y-6">
      {/* Registration Reminder Alert */}
      {!isStandardPassed && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${isEarlyBirdPassed ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
          <div className="shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm">Action Required: Exam Registration</h4>
            <p className="text-xs opacity-90">
              {isEarlyBirdPassed 
                ? `Early-bird window passed. Standard registration deadline: ${REGISTRATION_DEADLINES.standard}.` 
                : `Save up to $300! Early-bird registration deadline: ${REGISTRATION_DEADLINES.earlyBird}.`}
            </p>
          </div>
          <a 
            href="https://www.cfainstitute.org/en/programs/cfa/exam/registration" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs font-bold underline px-3 py-1 bg-white/50 rounded-lg hover:bg-white/80 transition-colors"
          >
            Register Now
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Days to Exam */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <h3 className="text-slate-500 text-sm font-medium mb-1 uppercase tracking-wider">Days to Exam</h3>
          <div className="text-4xl font-bold text-blue-600">{daysRemaining}</div>
          <p className="text-[10px] text-slate-400 mt-2">November Window Countdown</p>
        </div>

        {/* Overall Completion */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center group relative">
          <h3 className="text-slate-500 text-sm font-medium mb-1 uppercase tracking-wider">Overall Mastery</h3>
          <div className="text-4xl font-bold text-emerald-500">{overallProgress}%</div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-500" 
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Average of all 10 sections</p>
        </div>

        {/* Hours Invested */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <h3 className="text-slate-500 text-sm font-medium mb-1 uppercase tracking-wider">Hours Invested</h3>
          <div className="flex items-baseline space-x-1">
            <input 
              type="number"
              value={progress.overallHours}
              onChange={(e) => onHoursChange(parseInt(e.target.value) || 0)}
              className="text-4xl font-bold text-amber-500 bg-transparent w-24 text-center border-b-2 border-transparent hover:border-amber-200 focus:border-amber-500 focus:outline-none transition-all"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Target: 300 Hours</p>
        </div>

        {/* Charts */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-slate-800 font-bold mb-6">Mastery by Topic</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} stroke="#64748b" />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} fontSize={10} stroke="#64748b" />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="progress" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-slate-800 font-bold mb-6">Weighting</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="weight"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
