import React, { useState, useEffect } from 'react';
import { 
  Clock, Calendar, BarChart3, Settings, Play, Pause, Square, RotateCcw, 
  Plus, Trash2, Edit2, Upload, Gift, AlertCircle, Check, Sparkles 
} from 'lucide-react';

// Default gift reward image hosted from public/gift.png
import defaultGiftImage from '/gift.png';

export default function TomatoMuMuApp() {
  const [activeTab, setActiveTab] = useState('schedule');

  const [tags, setTags] = useState([
    { id: '1', name: '玩具車車', defaultMinutes: 15, color: '#FFB7B2', icon: '🚗', customSadImageSrc: '', customCompletedImageSrc: '' },
    { id: '2', name: '自由畫畫', defaultMinutes: 20, color: '#FFDAC1', icon: '🎨', customSadImageSrc: '', customCompletedImageSrc: '' },
    { id: '3', name: '閱讀時間', defaultMinutes: 25, color: '#E2F0CB', icon: '📚', customSadImageSrc: '', customCompletedImageSrc: '' },
    { id: '4', name: '積木城堡', defaultMinutes: 30, color: '#B5EAD7', icon: '🧩', customSadImageSrc: '', customCompletedImageSrc: '' },
    { id: '5', name: '專注蕃茄', defaultMinutes: 25, color: '#C7CEEA', icon: '🍅', customSadImageSrc: '', customCompletedImageSrc: '' },
  ]);

  const [tasks, setTasks] = useState([
    { id: 't1', tagId: '3', timeStr: '10:30 AM', completed: true, overdue: false },
    { id: 't2', tagId: '1', timeStr: '02:00 PM', completed: false, overdue: true },
    { id: 't3', tagId: '2', timeStr: '04:00 PM', completed: false, overdue: false },
  ]);

  const [selectedTagForTimer, setSelectedTagForTimer] = useState(tags[0]);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [history, setHistory] = useState([
    { id: 'h1', tagName: '閱讀時間', type: 'completed', time: '10:30 AM', icon: '📚' }
  ]);

  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [editingTag, setEditingTag] = useState(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'pm' : 'am';
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes; setCurrentTimeStr(`${formattedHours}:${formattedMinutes}${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timer;
    if (isRunning && !isPaused && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
    }
    return () => clearInterval(timer);
  }, [isRunning, isPaused, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  const handleStartTimer = (tag) => {
    setSelectedTagForTimer(tag);
    setTimeLeft(tag.defaultMinutes * 60);
    setIsRunning(true);
    setIsPaused(false);
    setActiveTab('timer');
  };

  const handleToggleTask = (taskId) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const nextCompleted = !t.completed;
        if (nextCompleted) {
          const tag = tags.find(tagItem => tagItem.id === t.tagId);
          setHistory(prev => [{ id: Date.now(), tagName: tag ? tag.name : '任務', type: 'completed', time: currentTimeStr, icon: tag ? tag.icon : '✨' }, ...prev]);
        }
        return { ...t, completed: nextCompleted };
      }
      return t;
    }));
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A3B32] font-sans flex flex-col select-none">
      
      {/* Header */}
      <header className="px-6 pt-4 pb-2 flex justify-between items-center border-b border-[#F0EBE1]">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍅</span>
          <h1 className="text-xl font-black tracking-wide text-[#5C4033]">蕃茄MuMu仔</h1>
        </div>

        <nav className="flex bg-[#F4EFE6] p-1.5 rounded-2xl gap-2 shadow-inner">
          <button onClick={() => setActiveTab('timer')} className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${activeTab === 'timer' ? 'bg-white shadow text-[#5C4033]' : 'text-[#8C7A6B]'}`}>
            <Clock size={18} /> 專注計時
          </button>
          <button onClick={() => setActiveTab('schedule')} className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${activeTab === 'schedule' ? 'bg-white shadow text-[#5C4033]' : 'text-[#8C7A6B]'}`}>
            <Calendar size={18} /> 時間表
          </button>
          <button onClick={() => setActiveTab('stats')} className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${activeTab === 'stats' ? 'bg-white shadow text-[#5C4033]' : 'text-[#8C7A6B]'}`}>
            <BarChart3 size={18} /> 統計記錄
          </button>
          <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${activeTab === 'settings' ? 'bg-white shadow text-[#5C4033]' : 'text-[#8C7A6B]'}`}>
            <Settings size={18} /> 標籤設定
          </button>
        </nav>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">

        {/* 1. Timer View */}
        {activeTab === 'timer' && (
          <div className="bg-white rounded-3xl p-8 shadow-xl border-4 border-[#F0EBE1] flex flex-col items-center relative">
            <div className="absolute top-6 left-6 flex items-center gap-2 bg-pink-100 px-4 py-2 rounded-2xl border-2 border-pink-200">
              <span className="text-xl">{selectedTagForTimer.icon}</span>
              <span className="font-bold text-pink-900">{selectedTagForTimer.name}</span>
            </div>

            <div className="text-7xl font-black tracking-wider my-12 text-[#4A3B32] font-mono">
              {formatTime(timeLeft)}
            </div>

            <div className="flex gap-4 w-full max-w-md justify-center">
              <button onClick={() => setTimeLeft(selectedTagForTimer.defaultMinutes * 60)} className="p-4 bg-[#F4EFE6] rounded-2xl hover:bg-[#e8e2d5]">
                <RotateCcw size={24} />
              </button>
              <button onClick={() => setIsPaused(!isPaused)} className="flex-1 py-4 bg-amber-300 hover:bg-amber-400 text-amber-950 font-black rounded-2xl shadow-md flex items-center justify-center gap-2 text-lg">
                {isPaused ? <Play size={22} /> : <Pause size={22} />} {isPaused ? '繼續計時' : '暫停倒數'}
              </button>
              <button onClick={() => setIsRunning(false)} className="p-4 bg-red-100 text-red-600 rounded-2xl border-2 border-red-200 hover:bg-red-200">
                <Square size={24} />
              </button>
            </div>
          </div>
        )}

        {/* 2. Schedule View with Tasks and Icon Pool */}
        {activeTab === 'schedule' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-[#F0EBE1] space-y-4">
                
                {tasks.map((task) => {
                  const tag = tags.find(t => t.id === task.tagId) || tags[0];
                  return (
                    <div key={task.id} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition ${
                      task.completed ? 'bg-pink-50/60 border-pink-200' : task.overdue ? 'bg-red-50 border-red-300' : 'bg-amber-50/50 border-amber-200'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className="bg-white px-3 py-1.5 rounded-xl font-bold shadow-sm text-sm border border-amber-100">
                          {task.timeStr}
                        </div>
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-2xl border border-amber-100">
                          {tag.icon}
                        </div>
                        <span className={`font-bold text-lg ${
