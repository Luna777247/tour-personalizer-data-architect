
import React, { useState, useEffect, useCallback } from 'react';
import InputSection from './components/InputSection';
import ResultView from './components/ResultView';
import { GeneratedData, AppState, PlaceData } from './types';
import { generateTourDataFromRaw, searchPlaceWithGeminiMaps } from './services/geminiService';
import { searchPlace } from './services/locationService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [collection, setCollection] = useState<GeneratedData[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [lockSchema, setLockSchema] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Batch states
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    const saved = localStorage.getItem('tour_architect_collection');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCollection(parsed);
        if (parsed.length > 0) setCurrentIndex(0);
      } catch (e) {
        console.error("Failed to load saved collection", e);
      }
    }
  }, []);

  useEffect(() => {
    if (collection.length > 0) {
      localStorage.setItem('tour_architect_collection', JSON.stringify(collection));
    }
  }, [collection]);

  const processSingleTour = useCallback(async (rawJson: any, silent: boolean = false) => {
    if (!silent) {
      setAppState(AppState.LOADING);
      setError(null);
    }
    setLoadingStep(`Đang phân tích: ${rawJson.title || 'Tour'}`);
    
    try {
      const existingSchema = (lockSchema && collection.length > 0) 
        ? collection[0].user_schema 
        : undefined;

      const data = await generateTourDataFromRaw(rawJson, existingSchema);
      
      // DEBUG: Log the generated data structure
      console.log("🔍 Gemini Response Structure:", {
        destination: data.personalized_tour?.destination,
        duration_days: data.personalized_tour?.duration_days,
        num_itineraries: data.personalized_tour?.daily_itineraries?.length,
        first_day_blocks: data.personalized_tour?.daily_itineraries?.[0]?.blocks?.length,
        first_day_first_block: data.personalized_tour?.daily_itineraries?.[0]?.blocks?.[0],
        full_itineraries: data.personalized_tour?.daily_itineraries
      });
      
      setLoadingStep('Địa lý hóa với Google Maps Grounding...');
      
      const allLocationQueries: string[] = [];
      const destination = data.personalized_tour?.destination || "";

      const itineraries = data.personalized_tour?.daily_itineraries || [];
      itineraries.forEach(day => {
        const blocks = day.blocks || [];
        blocks.forEach(block => {
          const places = block.places || [];
          places.forEach(p => {
            if (p.name) allLocationQueries.push(p.name);
          });
        });
      });
      
      const uniqueQueries = Array.from(new Set(allLocationQueries));
      const results = await Promise.all(uniqueQueries.map(async (query) => {
        let grounded = await searchPlaceWithGeminiMaps(query, destination);
        if (!grounded) grounded = await searchPlace(query);
        return grounded;
      }));
      
      const queryToPlaceMap = new Map<string, PlaceData>();
      uniqueQueries.forEach((query, idx) => {
        const placeResult = results[idx];
        if (placeResult) queryToPlaceMap.set(query, placeResult);
      });

      const updatedItineraries = itineraries.map(day => {
        // Ensure blocks exist with places
        const blocks = (day.blocks || []).map(block => ({
          ...block,
          places: (block.places || []).map(p => {
            const geoInfo = queryToPlaceMap.get(p.name);
            return {
              ...p,
              place_id: geoInfo?.place_id || geoInfo?.name || p.place_id,
              google_maps_uri: geoInfo?.google_maps_uri || p.google_maps_uri,
              lat: geoInfo?.lat || p.lat,
              lng: geoInfo?.lng || p.lng,
              provider: geoInfo?.source || p.provider
            };
          })
        }));
        
        // If no blocks or blocks are empty, return day as-is to show empty state
        return {
          ...day,
          blocks: blocks.length > 0 ? blocks : [
            { block_type: "breakfast", time_range: "07:00 - 09:00", places: [] },
            { block_type: "morning", time_range: "09:00 - 12:00", places: [] },
            { block_type: "lunch", time_range: "12:00 - 14:00", places: [] },
            { block_type: "afternoon", time_range: "14:00 - 18:00", places: [] },
            { block_type: "dinner", time_range: "18:00 - 20:00", places: [] },
            { block_type: "evening", time_range: "20:00 - 22:00", places: [] },
            { block_type: "hotel", time_range: "22:00 - 07:00", places: [] }
          ]
        };
      });

      const finalData: GeneratedData = {
        ...data,
        personalized_tour: {
          ...data.personalized_tour,
          daily_itineraries: updatedItineraries
        },
        places: results.filter((p): p is PlaceData => p !== null)
      };

      setCollection(prev => {
        const exists = prev.findIndex(item => 
          item.personalized_tour.destination === finalData.personalized_tour.destination
        );
        if (exists > -1) {
          const newColl = [...prev];
          newColl[exists] = finalData;
          return newColl;
        }
        return [finalData, ...prev];
      });
      
      if (!silent) {
        setCurrentIndex(0);
        setAppState(AppState.SUCCESS);
      }
      return true;
    } catch (err: any) {
      console.error("Process error:", err);
      if (!silent) {
        setError(err.message || 'Lỗi không xác định');
        setAppState(AppState.ERROR);
      }
      throw err;
    }
  }, [lockSchema, collection]);

  const handleAutoProcess = async (tourList: any[]) => {
    if (isBatchRunning) {
      setIsBatchRunning(false);
      return;
    }
    const unmappedTours = tourList.filter(t => !collection.some(c => c.personalized_tour.destination === (t.destination || t.title)));
    if (unmappedTours.length === 0) {
      alert("Tất cả đã xử lý xong.");
      return;
    }
    setIsBatchRunning(true);
    setAppState(AppState.LOADING);
    setBatchProgress({ current: 0, total: unmappedTours.length });
    setError(null);
    for (let i = 0; i < unmappedTours.length; i++) {
      if (!isBatchRunning && i > 0) break; 
      try {
        setBatchProgress(prev => ({ ...prev, current: i + 1 }));
        await processSingleTour(unmappedTours[i], true);
        if (i < unmappedTours.length - 1) {
          setLoadingStep(`Hoàn tất ${i+1}. Chờ 1.5s...`);
          await new Promise(r => setTimeout(r, 1500));
        }
      } catch (e: any) {
        setLoadingStep(`Lỗi tại tour #${i+1}. Tiếp tục sau 3s...`);
        await new Promise(r => setTimeout(r, 3000));
      }
    }
    setIsBatchRunning(false);
    setAppState(AppState.SUCCESS);
    setCurrentIndex(0);
  };

  const clearData = () => {
    if (window.confirm("Xóa toàn bộ dữ liệu đã lưu?")) {
      setCollection([]);
      setCurrentIndex(-1);
      localStorage.removeItem('tour_architect_collection');
    }
  };

  const downloadAll = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(collection, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `Tour_Export_${new Date().getTime()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100">
      <nav className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-40 shadow-sm backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl flex items-center justify-center text-white shadow-lg">
              <span className="font-bold text-xl">T</span>
            </div>
            <div>
              <h1 className="font-bold text-slate-900 tracking-tight leading-none text-sm sm:text-base">TourArchitect <span className="text-indigo-600 text-[10px] ml-1 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">v1.5.1</span></h1>
              <p className="text-[9px] uppercase font-black text-slate-400 tracking-[0.2em] mt-1">Block-Based AI Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {collection.length > 0 && (
              <>
                <button onClick={clearData} className="hidden sm:block text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase px-2">Clear</button>
                <button onClick={downloadAll} className="text-[10px] sm:text-xs font-bold bg-slate-900 text-white px-3 sm:px-5 py-2 rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-md">
                  <span>📦</span> Export ({collection.length})
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <InputSection 
              onGenerate={(tour) => processSingleTour(tour)} 
              onAutoProcess={handleAutoProcess}
              isLoading={appState === AppState.LOADING} 
              isBatchRunning={isBatchRunning}
              processedTitles={collection.map(c => c.personalized_tour?.destination || "")} 
            />
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-800">Engine Config</h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Consistency</span>
                  <button onClick={() => setLockSchema(!lockSchema)} className={`w-10 h-5 rounded-full relative transition-all ${lockSchema ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${lockSchema ? 'left-6' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>
              <ul className="space-y-2 text-[11px] text-slate-500 font-medium">
                <li className="flex gap-2"><span className="text-indigo-500">✔</span> Maps Grounding (Gemini 2.5)</li>
                <li className="flex gap-2"><span className="text-indigo-500">✔</span> Full 7-Blocks Enforcement</li>
                <li className="flex gap-2"><span className="text-indigo-500">✔</span> Geo-Contextual Invention</li>
                <li className="flex gap-2"><span className="text-indigo-500">✔</span> Robust JSON Recovery</li>
              </ul>
            </div>
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                <div className="flex gap-2 items-center"><span className="font-bold">⚠️ Error:</span> {error}</div>
                <button onClick={() => setError(null)} className="text-[10px] underline text-left opacity-70">Ẩn thông báo</button>
              </div>
            )}
            {appState === AppState.LOADING && (
              <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-indigo-700 uppercase tracking-wider truncate">
                      {isBatchRunning ? `Batch Process (${batchProgress.current}/${batchProgress.total})` : 'Architecture in progress'}
                    </p>
                    <p className="text-[10px] text-indigo-500 mt-0.5 font-medium truncate">{loadingStep}</p>
                  </div>
                </div>
                {isBatchRunning && (
                   <div className="w-full h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}></div>
                   </div>
                )}
              </div>
            )}
          </div>
          <div className="lg:col-span-8">
            <ResultView data={collection[currentIndex] || null} history={collection} onSelectHistory={(index) => setCurrentIndex(index)} activeIndex={currentIndex} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
