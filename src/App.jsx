import React, { useState, useEffect } from 'react';
import { 
  Clock, Calendar, BarChart3, Settings, Play, Pause, Square, RotateCcw, 
  Plus, Trash2, Edit2, Upload, Gift, AlertCircle, Check, Sparkles 
} from 'lucide-react';

// 預設的完成獎勵圖片 (已預先載入「蕃茄MuMu仔與禮物盒」圖案)
const DEFAULT_REWARD_IMAGE = "/gift.png";

export default function TomatoMuMuApp() {
  const [activeTab, setActiveTab] = useState('schedule');

  const [tags, setTags] = useState([
    { id: '1', name: '玩具車車', defaultMinutes: 15, color: '#FFB7B2', icon: '🚗' },
    { id: '2', name: '自由畫畫', defaultMinutes: 20, color: '#FFDAC1', icon: '🎨' },
    { id: '3', name: '閱讀時間', defaultMinutes: 25, color: '#E2F0CB', icon: '📚' },
    { id: '4', name: '積木城堡', defaultMinutes: 30, color: '#B5EAD7', icon: '🧩' },
    { id: '5', name: '專注蕃茄', defaultMinutes: 25, color: '#C7CEEA', icon: '🍅' },
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
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [editingTag, setEditingTag] = useState(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'pm' : 'am';
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      setCurrentTimeStr(`${formattedHours}:${formattedMinutes} ${ampm}`);
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
      handleCompleteTask();
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
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const handleCompleteTask = () => {
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A3B32] font-sans flex flex-col select-none">
      
      {/* Header 導覽列 */}
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

      {/* Main 內容區 */}
      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">

        {/* 1. 專注計時器 */}
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
              <button onClick={() => setTimeLeft(selectedTagForTimer.defaultMinutes * 60)} className="p-4 bg-[#F4EFE6] rounded-2xl">
                <RotateCcw size={24} />
              </button>
              <button onClick={() => setIsPaused(!isPaused)} className="flex-1 py-4 bg-amber-300 hover:bg-amber-400 text-amber-950 font-black rounded-2xl shadow-md flex items-center justify-center gap-2 text-lg">
                {isPaused ? <Play size={22} /> : <Pause size={22} />} {isPaused ? '繼續計時' : '暫停倒數'}
              </button>
              <button onClick={() => setIsRunning(false)} className="p-4 bg-red-100 text-red-600 rounded-2xl border-2 border-red-200">
                <Square size={24} />
              </button>
            </div>
          </div>
        )}

        {/* 2. 時間表 (預設顯示專屬圖片獎勵) */}
        {activeTab === 'schedule' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-[#F0EBE1] space-y-4">
                
                {tasks.map((task) => {
                  const tag = tags.find(t => t.id === task.tagId) || tags[0];
                  return (
                    <div key={task.id} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition ${
                      task.completed ? 'bg-pink-50/60 border-pink-200' : task.overdue ? 'bg-emerald-100 border-emerald-500' : 'bg-amber-50/50 border-amber-200'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className="bg-white px-3 py-1.5 rounded-xl font-bold shadow-sm text-sm border border-amber-100">
                          {task.timeStr}
                        </div>
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-2xl border border-amber-100">
                          {tag.icon}
                        </div>
                        <span className={`font-bold text-lg ${task.completed ? 'line-through text-slate-400' : 'text-[#4A3B32]'}`}>
                          {tag.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {task.completed ? (
                          /* 已完成：點擊圖片可切換狀態，直接呈現專屬蕃茄禮物盒圖片 */
                          <button 
                            onClick={() => handleToggleTask(task.id)}
                            className="flex items-center gap-2 bg-gradient-to-r from-pink-100 to-amber-100 px-3 py-1.5 rounded-2xl shadow-sm border border-pink-300 hover:scale-105 transition"
                            title="點擊切換完成狀態"
                          >
                            <img 
                              src={DEFAULT_REWARD_IMAGE} 
                              alt="蕃茄MuMu禮物" 
                              className="w-10 h-10 object-contain drop-shadow" 
                            />
                            <span className="font-bold text-pink-900 text-sm pr-1">已完成！</span>
                          </button>
                        ) : (
                          /* 未完成：顯示開始按鈕與直接標記完成按鈕 */
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleStartTimer(tag)} className="px-4 py-2 bg-amber-200 hover:bg-amber-300 rounded-xl font-bold text-amber-900 shadow-sm">
                              開始
                            </button>
                            <button 
                              onClick={() => handleToggleTask(task.id)}
                              className="px-3 py-2 bg-pink-100 hover:bg-pink-200 text-pink-900 rounded-xl font-bold text-xs shadow-sm flex items-center gap-1"
                            >
                              標記完成 ✨
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div className="flex items-center gap-3 py-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-md animate-pulse"></div>
                  <div className="flex-1 h-1.5 bg-emerald-500 rounded-full shadow-inner"></div>
                  <div className="px-3 py-1 bg-emerald-500 text-white font-bold rounded-xl text-xs shadow">
                    現在 ({currentTimeStr})
                  </div>
                </div>

              </div>
            </div>

            {/* 快速標籤欄 */}
            <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-[#F0EBE1] flex flex-col gap-4">
              <h3 className="font-bold text-[#5C4033] text-lg">快速標籤</h3>
              <div className="grid grid-cols-3 gap-3">
                {tags.map((tag) => (
                  <button key={tag.id} onClick={() => handleStartTimer(tag)} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#FDFBF7] hover:bg-amber-50 border-2 border-[#F0EBE1] shadow-sm aspect-square">
                    <span className="text-3xl mb-1">{tag.icon}</span>
                    <span className="text-xs font-bold text-[#5C4033] truncate w-full text-center">{tag.name}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 3. 統計與歷史 */}
        {activeTab === 'stats' && (
          <div className="bg-white rounded-3xl p-8 shadow-xl border-4 border-[#F0EBE1] space-y-6">
            <h2 className="text-2xl font-black text-[#5C4033]">統計與歷史記錄</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-pink-50 p-6 rounded-2xl border-2 border-pink-100 flex flex-col items-center">
                <span className="text-3xl font-black text-pink-700">1</span>
                <span className="text-sm font-bold text-pink-900 mt-1">完成任務數</span>
              </div>
              <div className="bg-amber-50 p-6 rounded-2xl border-2 border-amber-100 flex flex-col items-
