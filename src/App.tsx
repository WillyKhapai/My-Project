import React, { useState, useEffect, useRef } from "react";
import { 
  Droplets, 
  Wind, 
  ArrowDownCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Thermometer,
  CloudRain,
  Activity,
  History,
  Settings2,
  Bell
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// --- Types & Constants ---

enum WarningLevel {
  SAFE = "SAFE",
  CAUTION = "CAUTION",
  WARNING = "WARNING",
  DANGER = "DANGER"
}

interface LogEntry {
  id: string;
  time: string;
  level: WarningLevel;
  message: string;
}

const MAX_LEVEL = 100;
const DRAIN_RATE_BASE = 0.5;
const UPDATE_INTERVAL = 100; // ms

// --- Components ---

const LEDIndicator = ({ 
  level, 
  active, 
  label, 
  color 
}: { 
  level: WarningLevel, 
  active: boolean, 
  label: string, 
  color: string 
}) => {
  return (
    <div className="flex items-center gap-3 py-2 px-3 border-b border-white/5 last:border-0">
      <div className="relative flex items-center justify-center">
        <motion.div 
          animate={active ? { scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] } : { scale: 1, opacity: 0.2 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className={`w-4 h-4 rounded-full ${color} ${active ? 'shadow-[0_0_12px_rgba(255,255,255,0.5)]' : ''}`}
        />
        {active && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className={`absolute w-4 h-4 rounded-full border ${color.replace('bg-', 'border-')}`}
          />
        )}
      </div>
      <div className="flex flex-col">
        <span className={`text-[10px] uppercase tracking-widest font-bold ${active ? 'text-white' : 'text-zinc-600'}`}>
          {label}
        </span>
        <span className={`text-[9px] mono ${active ? 'text-zinc-400' : 'text-zinc-700'}`}>
          Threshold: {active ? 'ACTIVE' : 'STANDBY'}
        </span>
      </div>
    </div>
  );
};

export default function App() {
  const [waterLevel, setWaterLevel] = useState(30);
  const [rainIntensity, setRainIntensity] = useState(0);
  const [drainPower, setDrainPower] = useState(1);
  const [temp, setTemp] = useState(24.5);
  const [isRunning, setIsRunning] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Derived state
  const warningLevel = waterLevel > 85 ? WarningLevel.DANGER :
                      waterLevel > 65 ? WarningLevel.WARNING :
                      waterLevel > 45 ? WarningLevel.CAUTION : WarningLevel.SAFE;

  // Simulation Logic
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setWaterLevel(prev => {
        const rain = (rainIntensity / 10);
        const drain = (drainPower * DRAIN_RATE_BASE) / 5;
        const newLevel = prev + rain - drain;
        return Math.min(Math.max(newLevel, 0), MAX_LEVEL);
      });
      
      // Dynamic Temperature fluctuation
      setTemp(prev => prev + (Math.random() - 0.5) * 0.1);
    }, UPDATE_INTERVAL);

    return () => clearInterval(timer);
  }, [isRunning, rainIntensity, drainPower]);

  // Log automation
  useEffect(() => {
    const lastLog = logs[0];
    if (!lastLog || lastLog.level !== warningLevel) {
      const messages = {
        [WarningLevel.SAFE]: "Groundwater levels normal. Soil saturation optimal.",
        [WarningLevel.CAUTION]: "Minor increase detected. Aquifer pressure stable.",
        [WarningLevel.WARNING]: "System Warning: Groundwater levels exceeding threshold.",
        [WarningLevel.DANGER]: "CRITICAL: Flood risk detected. Soil fully saturated!"
      };
      
      setLogs(prev => [{
        id: Math.random().toString(36),
        time: new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
        level: warningLevel,
        message: messages[warningLevel]
      }, ...prev].slice(0, 50));
    }
  }, [warningLevel]);

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col selection:bg-brand-accent selection:text-white overflow-hidden">
      {/* Header Bar */}
      <header className="h-14 border-b border-brand-border flex items-center justify-between px-6 bg-brand-panel relative overflow-hidden">
        <div className="scanline" />
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-brand-accent/20 flex items-center justify-center border border-brand-accent/40">
            <Activity className="w-5 h-5 text-brand-accent" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-tighter uppercase leading-none">HydraGuard <span className="text-brand-accent">v2.4</span></h1>
            <span className="text-[10px] text-zinc-500 font-medium tracking-widest mono uppercase">Autonomous Monitoring Unit</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded border border-white/5">
            <Thermometer className="w-3 h-3 text-brand-warning" />
            <span className="text-xs mono font-bold">{temp.toFixed(1)}°C</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded border border-white/5">
            <History className="w-3 h-3 text-zinc-400" />
            <span className="text-xs mono font-bold text-zinc-400">{new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit'})}</span>
          </div>
          <button 
            onClick={() => setIsRunning(!isRunning)}
            className={`px-4 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${
              isRunning ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'
            }`}
          >
            {isRunning ? 'Pause Core' : 'Resume Core'}
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_380px] p-4 gap-4 overflow-hidden">
        
        {/* Left: Visualization */}
        <div className="bg-brand-panel border border-brand-border rounded-xl relative flex flex-col tech-grid overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/5 to-transparent pointer-events-none" />
          
          {/* Legend Area */}
          <div className="p-4 border-b border-brand-border flex items-center justify-between z-10 bg-brand-panel/50 backdrop-blur-sm">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Monitor Surface</span>
                <span className="text-xl font-bold flex items-baseline gap-1">
                  {waterLevel.toFixed(1)} <span className="text-xs text-zinc-500 font-medium">% Saturation</span>
                </span>
              </div>
              <div className="w-px h-10 bg-brand-border" />
              <div className="flex gap-4">
                <div className="flex flex-col">
                  <span className="text-[9px] text-zinc-500 uppercase font-bold">Rainfall</span>
                  <span className="text-sm mono text-blue-400 font-bold">{rainIntensity.toFixed(0)} mm/h</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-zinc-500 uppercase font-bold">Drainage</span>
                  <span className="text-sm mono text-emerald-400 font-bold">{(drainPower * DRAIN_RATE_BASE).toFixed(1)} L/s</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${
                warningLevel === WarningLevel.DANGER ? 'bg-red-500/20 text-red-500 border-red-500/40' :
                warningLevel === WarningLevel.WARNING ? 'bg-amber-500/20 text-amber-500 border-amber-500/40' :
                'bg-emerald-500/20 text-emerald-500 border-emerald-500/40'
              }`}>
                {warningLevel === WarningLevel.DANGER && <AlertTriangle className="w-3 h-3" />}
                {warningLevel === WarningLevel.SAFE && <CheckCircle2 className="w-3 h-3" />}
                {warningLevel} STATUS
              </div>
            </div>
          </div>

          {/* Visualization Canvas */}
          <div className="flex-1 relative p-12 flex items-center justify-center">
            <div className="w-[80%] max-w-2xl h-full border-2 border-brand-border rounded-lg relative overflow-hidden bg-zinc-900 group">
              {/* Soil Layers */}
              <div className="absolute inset-0 flex flex-col">
                <div className="flex-1 bg-[#8B4513]/20 border-b border-brand-border flex items-end justify-center pb-2">
                  <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest opacity-40">Humus / Topsoil</span>
                </div>
                <div className="flex-1 bg-[#DEB887]/20 border-b border-brand-border flex items-end justify-center pb-2">
                  <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest opacity-40">Fine Sand Stratum</span>
                </div>
                <div className="flex-1 bg-[#708090]/20 border-b border-brand-border flex items-end justify-center pb-2">
                  <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest opacity-40">Silty Clay Layer</span>
                </div>
                <div className="flex-1 bg-[#4682B4]/10 flex items-end justify-center pb-2">
                  <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest opacity-40">Main Aquifer Zone</span>
                </div>
              </div>

              {/* Dynamic Water Group */}
              <motion.div 
                className="absolute bottom-0 left-0 right-0 bg-brand-accent/30 border-t-2 border-brand-accent shadow-[0_-20px_50px_-10px_rgba(59,130,246,0.3)]"
                initial={false}
                animate={{ height: `${waterLevel}%` }}
                transition={{ type: "spring", stiffness: 50, damping: 20 }}
              >
                {/* Surface Ripple Effect */}
                <div className="absolute top-0 left-0 right-0 h-4 overflow-hidden -translate-y-full">
                  <motion.div 
                    animate={{ x: [-100, 100] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-[200%] h-full opacity-50 bg-gradient-to-r from-transparent via-brand-accent to-transparent"
                  />
                </div>

                {/* Underwater Particles */}
                <div className="absolute inset-0 opacity-40 pointer-events-none">
                  {[...Array(20)].map((_, i) => (
                    <motion.div 
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      style={{ 
                        left: `${Math.random() * 100}%`, 
                        bottom: `${Math.random() * 100}%` 
                      }}
                      animate={{ 
                        y: [0, -100], 
                        opacity: [0, 1, 0],
                        x: [0, (Math.random() - 0.5) * 20]
                      }}
                      transition={{ 
                        duration: 2 + Math.random() * 3, 
                        repeat: Infinity,
                        delay: Math.random() * 2
                      }}
                    />
                  ))}
                </div>

                {/* Saturation Label */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="mono text-5xl font-black text-brand-bg opacity-30 select-none">
                    {waterLevel.toFixed(0)}%
                  </span>
                </div>
              </motion.div>

              {/* Rain Viz Overlay */}
              <AnimatePresence>
                {rainIntensity > 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none overflow-hidden"
                  >
                    {[...Array(Math.floor(rainIntensity / 2) + 5)].map((_, i) => (
                      <motion.div 
                        key={i}
                        className="absolute w-[1px] bg-brand-accent/60"
                        style={{ 
                          left: `${Math.random() * 100}%`,
                          height: `${10 + Math.random() * 30}px`,
                          top: '-50px'
                        }}
                        animate={{ y: [0, 800] }}
                        transition={{ 
                          duration: 0.2 + Math.random() * 0.4, 
                          repeat: Infinity,
                          ease: "linear",
                          delay: Math.random() * 2
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Rulers */}
            <div className="absolute left-6 h-full py-12 flex flex-col justify-between text-[10px] mono text-zinc-600 font-bold">
              <span>100% - FLOOD</span>
              <span>80%</span>
              <span>60%</span>
              <span>40%</span>
              <span>20%</span>
              <span>0% - DRY</span>
            </div>
          </div>
        </div>

        {/* Right: Controls & History */}
        <div className="flex flex-col gap-4 overflow-hidden">
          
          {/* LED Indicators Card */}
          <div className="bg-brand-panel border border-brand-border rounded-xl flex flex-col">
            <div className="p-3 border-b border-brand-border flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                <Bell className="w-3 h-3 text-brand-accent" />
                Warning Array
              </span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
            <div className="flex flex-col">
              <LEDIndicator 
                level={WarningLevel.DANGER} 
                active={warningLevel === WarningLevel.DANGER} 
                label="Critical Flood" 
                color="bg-red-500" 
              />
              <LEDIndicator 
                level={WarningLevel.WARNING} 
                active={warningLevel === WarningLevel.WARNING} 
                label="High Elevation" 
                color="bg-amber-500" 
              />
              <LEDIndicator 
                level={WarningLevel.CAUTION} 
                active={warningLevel === WarningLevel.CAUTION} 
                label="Saturation Alert" 
                color="bg-blue-400" 
              />
              <LEDIndicator 
                level={WarningLevel.SAFE} 
                active={warningLevel === WarningLevel.SAFE} 
                label="Nominal Levels" 
                color="bg-emerald-500" 
              />
            </div>
          </div>

          {/* Simulation Controls Card */}
          <div className="bg-brand-panel border border-brand-border rounded-xl p-4 flex flex-col gap-5">
            <div className="flex items-center gap-2 pb-1 border-b border-brand-border">
              <Settings2 className="w-3 h-3 text-zinc-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Environment Control</span>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase font-bold tracking-wide flex items-center gap-2">
                    <CloudRain className="w-3 h-3 text-blue-400" /> Rain Intensity
                  </label>
                  <span className="text-xs mono font-bold text-blue-400">{rainIntensity} mm/h</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={rainIntensity} 
                  onChange={(e) => setRainIntensity(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-accent"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase font-bold tracking-wide flex items-center gap-2">
                    <ArrowDownCircle className="w-3 h-3 text-emerald-400" /> Drainage Power
                  </label>
                  <span className="text-xs mono font-bold text-emerald-400">x{drainPower.toFixed(1)}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="5" 
                  step="0.1"
                  value={drainPower} 
                  onChange={(e) => setDrainPower(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button 
                  onClick={() => { setRainIntensity(100); setDrainPower(0); }}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 p-2 rounded text-[9px] uppercase font-bold tracking-widest transition-colors"
                >
                  Induce Flood
                </button>
                <button 
                  onClick={() => { setRainIntensity(0); setDrainPower(5); }}
                  className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 p-2 rounded text-[9px] uppercase font-bold tracking-widest transition-colors"
                >
                  Dry Cycle
                </button>
              </div>
            </div>
          </div>

          {/* Event History Card */}
          <div className="bg-brand-panel border border-brand-border rounded-xl flex-1 flex flex-col overflow-hidden">
             <div className="p-3 border-b border-brand-border flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                <History className="w-3 h-3 text-zinc-500" />
                System Logs
              </span>
              <button 
                onClick={() => setLogs([])}
                className="text-[9px] text-zinc-600 hover:text-zinc-400 uppercase font-bold"
              >
                Flush
              </button>
            </div>
            <div 
              className="flex-1 overflow-y-auto p-3 space-y-2 font-mono scrollbar-hide"
              ref={scrollRef}
            >
              <AnimatePresence initial={false}>
                {logs.map((log) => (
                  <motion.div 
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col border-l border-zinc-800 pl-3 py-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-zinc-500">{log.time}</span>
                      <span className={`text-[8px] font-black uppercase px-1 rounded ${
                        log.level === WarningLevel.DANGER ? 'bg-red-500/20 text-red-500' :
                        log.level === WarningLevel.WARNING ? 'bg-amber-500/20 text-amber-500' :
                        'text-emerald-500'
                      }`}>
                        [{log.level}]
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-300 leading-tight mt-0.5">{log.message}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
              {logs.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-zinc-700 opacity-50 italic">
                  <Info className="w-4 h-4 mb-2" />
                  <span className="text-[10px]">Awaiting telemetry...</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Footer Info */}
      <footer className="h-8 border-t border-brand-border flex items-center px-6 justify-between text-[9px] text-zinc-600 bg-brand-panel uppercase tracking-[0.2em] font-bold">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            <span>Telemetry Link Stable</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wind className="w-2.5 h-2.5" />
            <span>Pressure: 1013.2 hPa</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span>Lat: 40.7128° N</span>
          <span>Lon: 74.0060° W</span>
          <span className="text-brand-accent">S-ID: HG-GLOBAL-32C</span>
        </div>
      </footer>
    </div>
  );
}
