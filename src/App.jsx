import React, { useState, useEffect, useMemo } from 'react';
import { Copy, Check, History, X } from 'lucide-react';

function App() {
  const [isNether, setIsNether] = useState(false); // false: Overworld -> Nether, true: Nether -> Overworld
  const [inputCoords, setInputCoords] = useState({ x: '', y: '', z: '' });
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('antigravity-history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Instant Conversion Logic (Derived State)
  const displayedCoords = useMemo(() => {
    const convert = (val) => {
      const num = Number(val) || 0;
      return isNether ? num * 8 : Math.floor(num / 8);
    };

    return {
      x: convert(inputCoords.x),
      y: inputCoords.y === '' ? 0 : inputCoords.y, // Default to 0 if empty for display
      z: convert(inputCoords.z)
    };
  }, [inputCoords, isNether]);

  // Save to history debounced (optional) or just rely on manual history usage? 
  // For instant calc apps, usually we only save significant actions or have a manual "Save" button.
  // Given the request didn't specify auto-history, I'll keep history usage for manual loads or maybe add a "Save" button later if requested.
  // PROACTIVE DECISION: For now, I will NOT auto-spam the history on every keystroke. I will add a small "Save" icon button next to result?
  // Actually, to keep it simple as requested: "Remove convert button", I will just show result. 
  // I will assume history is less critical for "instant" view unless they copy it.
  // Let's hook history save to the "Copy" action for now, as that indicates a "final" interesting result.

  const copyToClipboard = () => {
    const text = `X: ${displayedCoords.x}, Y: ${displayedCoords.y}, Z: ${displayedCoords.z}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // Save to history on Copy
      const newEntry = {
        id: Date.now(),
        from: { ...inputCoords },
        to: displayedCoords,
        dimension: isNether ? 'Nether → Overworld' : 'Overworld → Nether',
        timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      };
      
      const updatedHistory = [newEntry, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem('antigravity-history', JSON.stringify(updatedHistory));
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('antigravity-history');
  };

  return (
    <div className={`min-h-screen transition-colors duration-700 ease-in-out flex flex-col items-center py-10 px-4 relative ${isNether ? 'bg-minecraft-nether' : 'bg-minecraft-world'}`}>
      
      {/* Header Title */}
      <h1 className="text-4xl md:text-5xl text-white mb-8 drop-shadow-md text-center" 
          style={{ textShadow: '4px 4px 0 #000' }}>
        Minecraft<br/>
        <span className="text-2xl text-[#cdcdcd]">Coordinates Calculator</span>
      </h1>

      {/* History Toggle Button */}
      <button 
        onClick={() => setShowHistory(true)}
        className="absolute top-6 right-6 p-3 bg-[#373737] border-4 border-white text-white hover:bg-[#555]"
        style={{ borderColor: '#ffffff #555555 #555555 #ffffff' }}
      >
        <History size={24} />
      </button>

      {/* Dimension Selector Panel */}
      <div className="mc-window w-full max-w-md mb-8">
        <div className="mc-window-inset flex flex-col items-center">
          <label className="text-[#aaa] mb-4 uppercase tracking-widest text-sm">Dimension Mode</label>
          
          <div className="mc-switch-panel w-full p-4 relative">
             {/* Separated Text Headers */}
            <div className="flex justify-between items-center mb-4 px-2 w-full">
              <span className={`text-xl transition-all duration-300 ${!isNether ? 'text-[#00cf6b] scale-110 drop-shadow-md' : 'text-[#555]'}`}>
                Overworld
              </span>
              <span className={`text-xl transition-all duration-300 ${isNether ? 'text-[#ff5555] scale-110 drop-shadow-md' : 'text-[#555]'}`}>
                Nether
              </span>
            </div>
            
            <button 
              onClick={() => setIsNether(!isNether)}
              className="w-full h-14 relative bg-[#111] border-2 border-[#555] cursor-pointer overflow-hidden group shadow-inner"
            >
              {/* Toggle Slider */}
              <div 
                className={`absolute top-0 bottom-0 w-1/2 bg-[#333] border-4 transition-transform duration-500 ease-in-out flex items-center justify-center z-10
                  ${isNether ? 'translate-x-full bg-red-900 border-red-500 shadow-[0_0_15px_rgba(255,0,0,0.5)]' : 'translate-x-0 bg-green-900 border-green-500 shadow-[0_0_15px_rgba(0,255,0,0.5)]'}`}
              >
                <div className="w-2 h-8 bg-white/20 rounded-full"></div>
              </div>

              {/* Text Labels - Improved Visibility */}
              <div className="absolute inset-0 flex justify-between px-8 items-center pointer-events-none z-20 font-bold">
                <span className={`text-base transition-colors duration-300 ${!isNether ? 'text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.8)]' : 'text-[#444]'}`}>
                  TO OVERWORLD
                </span>
                <span className={`text-base transition-colors duration-300 ${isNether ? 'text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.8)]' : 'text-[#444]'}`}>
                  TO NETHER
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Converter Panel */}
      <div className="mc-window w-full max-w-2xl">
        <div className="mc-window-inset flex flex-col gap-6">
          <h2 className="text-center text-xl text-[#cdcdcd] mb-2 shadow-black drop-shadow-sm">Coordinate Converter</h2>
          
          <div className="grid grid-cols-3 gap-4">
            {['x', 'y', 'z'].map(axis => (
              <div key={axis} className="flex flex-col gap-2">
                <label className="text-center text-[#aaa] uppercase text-sm">{axis}</label>
                <input
                  type="number"
                  value={inputCoords[axis]}
                  onChange={(e) => setInputCoords({...inputCoords, [axis]: e.target.value})}
                  className="mc-input-field"
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          {/* Instant Result Display */}
           <div className="mt-6 bg-[#111] border-2 border-[#555] p-6 text-center animate-pulse-once">
             <span className="block text-[#aaa] text-sm mb-2 uppercase tracking-wide">Calculated Destination</span>
             <div className="text-5xl text-[#ffff55] mb-4 font-bold tracking-wider" style={{ textShadow: '4px 4px 0 #3f3f00' }}>
               {displayedCoords.x}, {displayedCoords.y}, {displayedCoords.z}
             </div>
             
             <button 
                onClick={copyToClipboard}
                className="mx-auto flex items-center gap-2 px-6 py-2 bg-[#333] border-2 border-[#555] hover:bg-[#444] hover:border-white transition-all text-[#cdcdcd] hover:text-white"
              >
                {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                <span className="text-lg">{copied ? 'COPIED!' : 'COPY RESULT'}</span>
              </button>
           </div>
        </div>
      </div>

      {/* Footer / Explanation */}
      <div className="mt-12 bg-[#000000aa] p-6 max-w-xl mx-auto border-2 border-[#333] text-center backdrop-blur-sm">
        <h3 className="text-[#cdcdcd] text-lg mb-2">How It Works</h3>
        <p className="text-[#888] text-sm leading-relaxed">
          <span className="text-[#00cf6b] block mb-1">Overworld → Nether: <strong>÷ 8</strong></span>
          <span className="text-[#ff5555] block mb-1">Nether → Overworld: <strong>× 8</strong></span>
          <span className="text-[#aaa] block text-xs mt-2">(Y-level remains constant)</span>
        </p>
      </div>

      <div className="mt-8 text-[#555] text-xs text-center font-sans">
        © 2026 Minecraft Coordinates Calculator
      </div>

      {/* History Modal Overlay */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="mc-window w-full max-w-lg">
             <div className="flex justify-between items-center p-2 bg-[#2c2c2c] border-b-4 border-[#1a1a1a]">
               <span className="ml-2 text-[#cdcdcd]">HISTORY</span>
               <button onClick={() => setShowHistory(false)} className="bg-[#ff5555] p-1 border-2 border-[#800000]">
                 <X size={20} color="white" />
               </button>
             </div>
             
             <div className="bg-[#1a1a1a] p-4 max-h-[60vh] overflow-y-auto">
               {history.length === 0 ? (
                 <p className="text-[#555] text-center py-8">No history yet...</p>
               ) : (
                 <div className="space-y-3">
                   {history.map((entry) => (
                     <div key={entry.id} className="bg-[#333] p-3 border-2 border-[#555] flex justify-between items-center">
                       <div>
                         <div className="text-xs text-[#aaa] mb-1">{entry.dimension}</div>
                         <div className="text-[#fff]">
                           {entry.from.x}, {entry.from.y}, {entry.from.z} 
                           <span className="mx-2 text-[#aaa]">→</span> 
                           <span className="text-[#ffff55]">{entry.to.x}, {entry.to.y}, {entry.to.z}</span>
                         </div>
                       </div>
                       <button 
                         onClick={() => {
                           setInputCoords(entry.from);
                           setIsNether(entry.dimension.includes('Nether →'));
                           setDisplayedCoords(entry.to);
                           setShowHistory(false);
                         }}
                         className="text-xs bg-[#555] px-2 py-1 text-white hover:bg-[#777]"
                       >
                         LOAD
                       </button>
                     </div>
                   ))}
                 </div>
               )}
               
               {history.length > 0 && (
                 <button onClick={clearHistory} className="w-full mt-4 text-[#ff5555] text-sm hover:underline">
                   CLEAR ALL
                 </button>
               )}
             </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
