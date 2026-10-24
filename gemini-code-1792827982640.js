import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, Calendar, BarChart2, Settings, Play, Pause, Square, RotateCcw, 
  Plus, Trash2, Edit2, Upload, Gift, AlertCircle, Check, Sparkles 
} from 'lucide-react';

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
    { id: 'h1', tagName: '閱讀時間', type: 'completed', time: '10:30 AM', icon: '📚', rewardIcon: '' }
  ]);

  const [currentTimeStr, setCurrentTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? '