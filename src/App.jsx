import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Square, Plus, Trash2, Edit3, Check, 
  Sparkles, Award, Clock, Calendar, BarChart3, Settings, Volume2, 
  VolumeX, Gift, Smile, Frown, ChevronRight, Upload, RefreshCw, Trophy,
  Palette, Image as ImageIcon, Info, X, GripVertical, Sliders
} from 'lucide-react';
import Matter from 'matter-js';
import confetti from 'canvas-confetti';

// 預設的完成獎勵圖片 (讀取專案 public 資料夾中的 gift.png)
const DEFAULT_REWARD_IMAGE = "/gift.png";

// --- Sound Synthesizer (Web Audio API) ---
class SoundEffects {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playClick() {
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {
      // Audio fallback
    }
  }

  playTick() {
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch (e) {}
  }

  playVictory() {
    try {
      this.init();
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.25, this.ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.12 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.12);
        osc.stop(this.ctx.currentTime + idx * 0.12 + 0.3);
      });
    } catch (e) {}
  }

  playSad() {
    try {
      this.init();
      const notes = [400, 350, 300, 250];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.15);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.15 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.15);
        osc.stop(this.ctx.currentTime + idx * 0.15 + 0.25);
      });
    } catch (e) {}
  }

  playDrop() {
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {}
  }
}

const sfx = new SoundEffects();

// --- 30 Macaron Color Swatches ---
const MACARON_COLORS = [
  '#FF8B94', '#FF9AA2', '#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA', '#74B9FF', '#A29BFE', '#FD79A8',
  '#FAD390', '#F8C291', '#6A89CC', '#82CCDD', '#B8E994', '#F6B93B', '#E55039', '#4A69BD', '#60A3BC', '#78E08F',
  '#FA8231', '#EB3B5A', '#20BF6B', '#0FB9B1', '#2D98DA', '#3867D6', '#8854D0', '#A55EEA', '#D1D8E0', '#778CA3'
];

// Initial Habit Tags with default Macaron Colors
const INITIAL_TAGS = [
  { id: 'car', name: '玩具車車', icon: '🚗', defaultTime: 15, color: '#FFB7B2', shapeStyle: 'solid' },
  { id: 'art', name: '自由畫畫', icon: '🎨', defaultTime: 20, color: '#B5EAD7', shapeStyle: 'solid' },
  { id: 'read', name: '閱讀時間', icon: '📚', defaultTime: 25, color: '#C7CEEA', shapeStyle: 'solid' },
  { id: 'block', name: '積木城堡', icon: '🧩', defaultTime: 30, color: '#FFDAC1', shapeStyle: 'solid' },
  { id: 'tomato', name: '專注蕃茄', icon: '🍅', defaultTime: 10, color: '#FF8B94', shapeStyle: 'solid' },
];

const RULER_OPTIONS = [5, 10, 15, 20, 25, 30, 45, 60];

// Format 24h string ("14:00") into 12h string ("02:00 PM")
const formatTo12Hr = (time24) => {
  if (!time24) return '12:00 AM';
  let [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
};

// Convert total minutes (0-1439) into "HH:MM" 24h format
const minsToTime24 = (totalMins) => {
  const h = Math.floor(totalMins / 60) % 24;
  const m = totalMins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// Convert "HH:MM" 24h format to total minutes from midnight
const time24ToMins = (time24) => {
  if (!time24) return 0;
  const [h, m] = time24.split(':').map(Number);
  return h * 60 + m;
};

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('timer'); // 'timer', 'schedule', 'settings', 'stats'

  // Sound Mute State
  const [isMuted, setIsMuted] = useState(false);

  // Real-time Clock State for Schedule View
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Task & Tag State
  const [tags, setTags] = useState(INITIAL_TAGS);
  const [activeTag, setActiveTag] = useState(INITIAL_TAGS[0]);

  // Task Selector Dropdown Modal State
  const [showTaskSelectorModal, setShowTaskSelectorModal] = useState(false);

  // Edit Tag Modal State
  const [editingTag, setEditingTag] = useState(null);
  const [showColorPickerModal, setShowColorPickerModal] = useState(false);

  // Timer State
  const [selectedMinutes, setSelectedMinutes] = useState(INITIAL_TAGS[0].defaultTime);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TAGS[0].defaultTime * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Statistics Tracking
  const [stats, setStats] = useState({
    rewardCount: 0,
    sadCount: 0,
    totalMinutes: 0,
    history: []
  });

  // Matter.js Physics Engine Ref
  const physicsContainerRef = useRef(null);
  const engineRef = useRef(null);
  const renderRef = useRef(null);
  const runnerRef = useRef(null);
  const bodiesRef = useRef([]);

  // Timetable State
  const [selectedDateIndex, setSelectedDateIndex] = useState(2); // Wednesday default
  const [scheduleTasks, setScheduleTasks] = useState([
    { id: 's1', time: '09:00', title: '搭車上學', tagId: 'car', completed: true },
    { id: 's2', time: '10:30', title: '圖畫書時間', tagId: 'read', completed: false },
    { id: 's3', time: '14:00', title: '自由畫畫', tagId: 'art', completed: false },
    { id: 's4', time: '16:00', title: '積木城堡搭建', tagId: 'block', completed: false },
  ]);

  // Task Drag and Drop Reordering state
  const [draggedTaskIdx, setDraggedTaskIdx] = useState(null);

  // Time Slider Adjustment Modal State
  const [editingTaskTime, setEditingTaskTime] = useState(null); // { id, time }
  const [sliderMins, setSliderMins] = useState(540); // 09:00 default

  // New Schedule Modal State
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [newSchTitle, setNewSchTitle] = useState('');
  const [newSchTimeMins, setNewSchTimeMins] = useState(660); // 11:00 AM
  const [newSchTagId, setNewSchTagId] = useState(INITIAL_TAGS[0].id);

  // Drag and Drop Tag State for Timetable
  const [draggedTag, setDraggedTag] = useState(null);

  // Handle active tag selection
  const handleSelectTag = (tag) => {
    sfx.playClick();
    setActiveTag(tag);
    if (!isRunning) {
      setSelectedMinutes(tag.defaultTime);
      setTimeLeft(tag.defaultTime * 60);
    }
  };

  // Task Reordering Drag Handlers
  const handleTaskDragStart = (e, index) => {
    setDraggedTaskIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleTaskDragOver = (e, index) => {
    e.preventDefault();
    if (draggedTaskIdx === null || draggedTaskIdx === index) return;

    const updatedTasks = [...scheduleTasks];
    const [draggedItem] = updatedTasks.splice(draggedTaskIdx, 1);
    updatedTasks.splice(index, 0, draggedItem);

    setDraggedTaskIdx(index);
    setScheduleTasks(updatedTasks);
  };

  const handleTaskDragEnd = () => {
    setDraggedTaskIdx(null);
  };

  // Open Time Slider Modal
  const handleOpenTimeSlider = (task) => {
    sfx.playClick();
    setEditingTaskTime(task);
    setSliderMins(time24ToMins(task.time));
  };

  // Save Adjusted Time from Slider
  const handleSaveSliderTime = () => {
    if (!editingTaskTime) return;
    sfx.playClick();
    const newTime24 = minsToTime24(sliderMins);
    setScheduleTasks((prev) =>
      prev.map((t) => (t.id === editingTaskTime.id ? { ...t, time: newTime24 } : t))
    );
    setEditingTaskTime(null);
  };

  // Timer Countdown Effect
  useEffect(() => {
    let timer = null;
    if (isRunning && !isPaused) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimerComplete();
            return 0;
          }
          if (prev % 5 === 0) sfx.playTick();
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, isPaused, selectedMinutes, activeTag]);

  // Timer Completion Logic
  const handleTimerComplete = () => {
    setIsRunning(false);
    setIsPaused(false);
    
    sfx.playVictory();
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });

    setStats((prev) => ({
      ...prev,
      rewardCount: prev.rewardCount + 1,
      totalMinutes: prev.totalMinutes + selectedMinutes,
      history: [
        {
          id: Date.now().toString(),
          tagId: activeTag.id,
          icon: activeTag.customImageSrc || activeTag.icon,
          name: activeTag.name,
          status: 'success',
          timeSpent: selectedMinutes,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...prev.history
      ]
    }));

    dropPhysicsItem(activeTag, false);
  };

  // Timer Early Stop / Abandon Logic
  const handleStopTimer = () => {
    sfx.playClick();
    if (!isRunning && !isPaused) return;

    setIsRunning(false);
    setIsPaused(false);
    sfx.playSad();

    const elapsedMins = Math.max(1, Math.floor((selectedMinutes * 60 - timeLeft) / 60));

    const sadIconToUse = activeTag.customSadImageSrc || '🌧️';

    setStats((prev) => ({
      ...prev,
      sadCount: prev.sadCount + 1,
      history: [
        {
          id: Date.now().toString(),
          tagId: activeTag.id,
          icon: sadIconToUse,
          name: `${activeTag.name} (未完成)`,
          status: 'failed',
          timeSpent: elapsedMins,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...prev.history
      ]
    }));

    setTimeLeft(selectedMinutes * 60);
    dropPhysicsItem({ 
      ...activeTag, 
      icon: sadIconToUse, 
      customImageSrc: activeTag.customSadImageSrc || null, 
      color: '#FFFFFF' 
    }, true);
  };

  // Start / Pause Control
  const handleStartPause = () => {
    sfx.playClick();
    if (!isRunning) {
      setIsRunning(true);
      setIsPaused(false);
    } else {
      setIsPaused(!isPaused);
    }
  };

  // Reset Timer
  const handleReset = () => {
    sfx.playClick();
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(selectedMinutes * 60);
  };

  // Ruler Time Adjustment
  const handleSelectMinutes = (mins) => {
    sfx.playClick();
    if (isRunning) return;
    setSelectedMinutes(mins);
    setTimeLeft(mins * 60);
  };

  // --- Matter.js Physics Setup ---
  useEffect(() => {
    if (!physicsContainerRef.current) return;

    const container = physicsContainerRef.current;
    const width = container.clientWidth || 360;
    const height = container.clientHeight || 260;

    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1 }
    });
    engineRef.current = engine;

    const render = Matter.Render.create({
      element: container,
      engine: engine,
      options: {
        width: width,
        height: height,
        wireframes: false,
        background: 'transparent'
      }
    });
    renderRef.current = render;

    const ground = Matter.Bodies.rectangle(width / 2, height + 20, width, 50, { isStatic: true });
    const leftWall = Matter.Bodies.rectangle(-20, height / 2, 50, height * 2, { isStatic: true });
    const rightWall = Matter.Bodies.rectangle(width + 20, height / 2, 50, height * 2, { isStatic: true });

    Matter.Composite.add(engine.world, [ground, leftWall, rightWall]);

    const mouse = Matter.Mouse.create(render.canvas);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });
    Matter.Composite.add(engine.world, mouseConstraint);

    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);

    setTimeout(() => {
      dropPhysicsItem(INITIAL_TAGS[0], false);
      dropPhysicsItem(INITIAL_TAGS[1], false);
    }, 500);

    return () => {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
    };
  }, []);

  const dropPhysicsItem = (tagObj, isSad = false) => {
    if (!engineRef.current || !physicsContainerRef.current) return;
    sfx.playDrop();

    const container = physicsContainerRef.current;
    const width = container.clientWidth || 360;
    const dropX = Math.random() * (width - 80) + 40;

    const radius = 28;
    const canvas = document.createElement('canvas');
    canvas.width = radius * 2;
    canvas.height = radius * 2;
    const ctx = canvas.getContext('2d');

    const renderBodyWithSprite = () => {
      const body = Matter.Bodies.circle(dropX, -30, radius, {
        restitution: 0.6,
        friction: 0.1,
        render: {
          sprite: {
            texture: canvas.toDataURL(),
            xScale: 1,
            yScale: 1
          }
        }
      });

      bodiesRef.current.push(body);
      Matter.Composite.add(engineRef.current.world, body);
    };

    // White circle background if sad, otherwise tag color
    ctx.beginPath();
    ctx.arc(radius, radius, radius - 2, 0, Math.PI * 2);
    ctx.fillStyle = isSad ? '#FFFFFF' : (tagObj.color || '#FFB7B2');
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#78350f';
    ctx.stroke();

    const imageSrcToUse = isSad ? tagObj.customSadImageSrc : tagObj.customImageSrc;

    if (imageSrcToUse) {
      const img = new Image();
      img.src = imageSrcToUse;
      img.onload = () => {
        ctx.drawImage(img, 8, 8, radius * 2 - 16, radius * 2 - 16);
        renderBodyWithSprite();
      };
    } else {
      ctx.font = '26px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const displayIcon = typeof tagObj.icon === 'string' ? tagObj.icon : '🍅';
      ctx.fillText(displayIcon, radius, radius + 2);
      renderBodyWithSprite();
    }
  };

  const handleClearPool = () => {
    sfx.playClick();
    if (!engineRef.current) return;
    bodiesRef.current.forEach((body) => {
      Matter.Composite.remove(engineRef.current.world, body);
    });
    bodiesRef.current = [];
  };

  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Quick Add Task to Timetable
  const handleQuickAddScheduleTask = (tagObj) => {
    sfx.playClick();
    const lastTime = scheduleTasks.length > 0 ? scheduleTasks[scheduleTasks.length - 1].time : '09:00';
    const [h, m] = lastTime.split(':').map(Number);
    const nextH = (h + 1) % 24;
    const newTimeStr = `${nextH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

    const newTask = {
      id: Date.now().toString(),
      time: newTimeStr,
      title: tagObj.name,
      tagId: tagObj.id,
      completed: false
    };

    setScheduleTasks((prev) => [...prev, newTask].sort((a, b) => a.time.localeCompare(b.time)));
  };

  const toggleScheduleComplete = (id) => {
    sfx.playClick();
    setScheduleTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          if (nextCompleted) {
            sfx.playVictory();
            confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
          }
          return { ...t, completed: nextCompleted };
        }
        return t;
      })
    );
  };

  // Image Upload Handler
  const handleImageUpload = (e, type = 'normal') => {
    const file = e.target.files[0];
    if (file && editingTag) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setEditingTag((prev) => ({
          ...prev,
          [type === 'sad' ? 'customSadImageSrc' : 'customImageSrc']: uploadEvent.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Tag Edits
  const handleSaveTagEdit = () => {
    if (!editingTag) return;
    sfx.playClick();
    setTags((prev) => prev.map((t) => (t.id === editingTag.id ? editingTag : t)));
    if (activeTag.id === editingTag.id) {
      setActiveTag(editingTag);
    }
    setEditingTag(null);
  };

  // Days of Week Header Tracker with 7 distinct colors and English + Traditional Chinese names
  const weekDays = [
    { day: '星期一', enDay: 'Monday', date: '11/09', color: '#FFB7B2' },
    { day: '星期二', enDay: 'Tuesday', date: '11/10', color: '#FFDAC1' },
    { day: '星期三', enDay: 'Wednesday', date: '11/11', color: '#E2F0CB' },
    { day: '星期四', enDay: 'Thursday', date: '11/12', color: '#B5EAD7' },
    { day: '星期五', enDay: 'Friday', date: '11/13', color: '#C7CEEA' },
    { day: '星期六', enDay: 'Saturday', date: '11/14', color: '#FAD390' },
    { day: '星期日', enDay: 'Sunday', date: '11/15', color: '#FD79A8' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-amber-950 font-sans pb-12 select-none">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-[#FDFBF7]/90 backdrop-blur-md border-b-2 border-amber-900 px-4 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-400 border-2 border-amber-950 rounded-2xl flex items-center justify-center text-2xl shadow-[2px_2px_0px_#78350f]">
              🍅
            </div>
            <div>
              <h1 className="font-black text-2xl text-amber-950 tracking-wide">
                蕃茄MuMu仔
              </h1>
              <p className="text-xs font-extrabold text-amber-800 -mt-1">
                兒童習慣養成與專注計時器
              </p>
            </div>
          </div>

          {/* Enlarged Nav Tabs with 4 Different Distinct Colors */}
          <div className="flex items-center space-x-2 bg-amber-100/80 p-2 rounded-2xl border-3 border-amber-900 shadow-[2px_2px_0px_#78350f]">
            <button
              onClick={() => { sfx.playClick(); setActiveTab('timer'); }}
              className={`px-4 py-2.5 rounded-xl font-black text-sm md:text-base transition-all flex items-center space-x-2 border-2 ${
                activeTab === 'timer'
                  ? 'bg-[#FF9AA2] text-amber-950 border-amber-950 shadow-[2px_2px_0px_#78350f] scale-105'
                  : 'bg-white/80 text-amber-900 border-amber-800 hover:bg-[#FF9AA2]/40'
              }`}
            >
              <Clock className="w-5 h-5 stroke-[2.5]" />
              <span>專注計時</span>
            </button>

            <button
              onClick={() => { sfx.playClick(); setActiveTab('schedule'); }}
              className={`px-4 py-2.5 rounded-xl font-black text-sm md:text-base transition-all flex items-center space-x-2 border-2 ${
                activeTab === 'schedule'
                  ? 'bg-[#FAD390] text-amber-950 border-amber-950 shadow-[2px_2px_0px_#78350f] scale-105'
                  : 'bg-white/80 text-amber-900 border-amber-800 hover:bg-[#FAD390]/40'
              }`}
            >
              <Calendar className="w-5 h-5 stroke-[2.5]" />
              <span>時間表</span>
            </button>

            <button
              onClick={() => { sfx.playClick(); setActiveTab('stats'); }}
              className={`px-4 py-2.5 rounded-xl font-black text-sm md:text-base transition-all flex items-center space-x-2 border-2 ${
                activeTab === 'stats'
                  ? 'bg-[#B5EAD7] text-amber-950 border-amber-950 shadow-[2px_2px_0px_#78350f] scale-105'
                  : 'bg-white/80 text-amber-900 border-amber-800 hover:bg-[#B5EAD7]/40'
              }`}
            >
              <BarChart3 className="w-5 h-5 stroke-[2.5]" />
              <span>統計記錄</span>
            </button>

            <button
              onClick={() => { sfx.playClick(); setActiveTab('settings'); }}
              className={`px-4 py-2.5 rounded-xl font-black text-sm md:text-base transition-all flex items-center space-x-2 border-2 ${
                activeTab === 'settings'
                  ? 'bg-[#C7CEEA] text-amber-950 border-amber-950 shadow-[2px_2px_0px_#78350f] scale-105'
                  : 'bg-white/80 text-amber-900 border-amber-800 hover:bg-[#C7CEEA]/40'
              }`}
            >
              <Settings className="w-5 h-5 stroke-[2.5]" />
              <span>標籤設定</span>
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              const nextMute = !isMuted;
              setIsMuted(nextMute);
              if (!nextMute) sfx.playClick();
            }}
            className="p-3 bg-amber-100 hover:bg-amber-200 border-2 border-amber-900 rounded-xl text-amber-950 shadow-
