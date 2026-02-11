
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
    name: topic.id.substring(0,3).toUpperCase(),
    progress: progress.topicProgress[topic.id] || 0,
    weight: (topic.weightMin + topic.weightMax) / 2
  }));

  const overallProgress = Math.round(
    (Object.values(progress.topicProgress) as number[]).reduce((a, b) => a + b, 0) / CFA_TOPICS.length
  );

  const COLORS = [
    '#0f172a', '#1e293b', '#334155', '#475569', 
    '#64748b', '#94a3b8', '#4f46e5', '#6366f1', 
    '#818cf8', '#a5b4fc'
  ];

  const today = new Date();
  today.setHours(0,0,0,0);
  const earlyBirdDate = new Date(REGISTRATION_DEADLINES.earlyBird);
  const standardDate = new Date(REGISTRATION_DEADLINES.standard);
  
  const isEarlyBirdPassed = today > earlyBirdDate;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Days to Exam */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Time to Window</h3>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900">{daysRemaining}</span>
            <span className="text-[10px] font-bold text-slate-400">Days</span>
          </div>
        </div>

        {/* Overall Completion */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Overall Mastery</h3>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-600">{overallProgress}%</span>
            <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden self-center ml-2">
              <div className="bg-emerald-500 h-full" style={{ width: `${overallProgress}%` }} />
            </div>
          </div>
        </div>

        {/* Hours Invested */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Study Volume</h3>
          <div className="flex items-baseline gap-2">
            <input 
              type="number"
              value={progress.overallHours}
              onChange={(e) => onHoursChange(parseInt(e.target.value) || 0)}
              className="text-2xl font-black text-slate-900 bg-transparent w-16 focus:outline-none focus:ring-1 focus:ring-indigo-100 rounded"
            />
            <span className="text-[10px] font-bold text-slate-400">/ 300h</span>
          </div>
        </div>

        {/* Deadline Alert */}
        <div className={`p-4 rounded-xl border flex flex-col justify-center ${isEarlyBirdPassed ? 'bg-amber-50 border-amber-100' : 'bg-indigo-50 border-indigo-100'}`}>
          <h3 className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isEarlyBirdPassed ? 'text-amber-600' : 'text-indigo-600'}`}>Registration</h3>
          <p className="text-[10px] font-bold text-slate-700 leading-tight">
            {isEarlyBirdPassed ? 'Standard Closes Aug 11' : 'Early Bird Closes May 12'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastery Distribution</h3>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={8} fontWeight="bold" stroke="#94a3b8" />
                <YAxis domain={[0, 100]} hide />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                />
                <Bar dataKey="progress" radius={[2, 2, 0, 0]} barSize={32}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Curriculum Balance</h3>
          {/* Explicit height wrapper for ResponsiveContainer to prevent collapsing */}
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="weight"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={4}
                  label={({ name }) => name}
                  labelLine={false}
                  style={{ fontSize: '8px', fontWeight: 'bold' }}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
