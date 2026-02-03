
import React, { useState, useRef, useMemo } from 'react';
import { 
  validateTourData, 
  normalizeTourData, 
  filterTours, 
  sortTours, 
  getTourStats 
} from '../utils/dataProcessor';

interface Props {
  onGenerate: (rawJson: any) => void;
  onAutoProcess: (tourList: any[]) => void;
  isLoading: boolean;
  isBatchRunning: boolean;
  processedTitles: string[];
}

const InputSection: React.FC<Props> = ({ onGenerate, onAutoProcess, isLoading, isBatchRunning, processedTitles }) => {
  const [tourList, setTourList] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'duration' | 'title'>('rating');
  const [filterDestination, setFilterDestination] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Memoize stats để tránh tính lại không cần thiết
  const tourStats = useMemo(() => {
    if (tourList.length === 0) return null;
    return getTourStats(tourList);
  }, [tourList]);

  // Filtered và sorted tours
  const processedTours = useMemo(() => {
    let tours = tourList;
    
    // Apply filter nếu có
    if (filterDestination) {
      tours = filterTours(tours, { destination: filterDestination });
    }
    
    // Apply sort
    return sortTours(tours, sortBy, 'desc');
  }, [tourList, filterDestination, sortBy]);

  const handleFile = async (file: File) => {
    if (file.type !== "application/json") {
      alert("Vui lòng tải lên tệp JSON hợp lệ.");
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        let list = Array.isArray(json) ? json : [json];
        
        // Validate và normalize dữ liệu
        let validCount = 0;
        let invalidCount = 0;
        
        list = list.map(tour => {
          if (validateTourData(tour)) {
            validCount++;
            return normalizeTourData(tour);
          } else {
            invalidCount++;
            return null;
          }
        }).filter(Boolean);
        
        setTourList(list);
        setSelectedIndex(0);
        setFileName(file.name);
        setIsProcessing(false);
        
        // Thông báo kết quả
        if (invalidCount > 0) {
          alert(`Đã nạp ${validCount} tours hợp lệ. ${invalidCount} tours bị bỏ qua do thiếu dữ liệu bắt buộc.`);
        } else {
          console.log(`✅ Đã nạp thành công ${validCount} tours`);
        }
      } catch (err) {
        alert("Lỗi khi đọc JSON. Vui lòng kiểm tra lại định dạng tệp.");
        setIsProcessing(false);
      }
    };
    
    reader.onerror = () => {
      alert("Lỗi khi đọc file.");
      setIsProcessing(false);
    };
    
    reader.readAsText(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const currentTour = processedTours[selectedIndex];
  const isProcessed = currentTour && processedTitles.some(t => t.includes(currentTour.title || currentTour.destination));

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 w-full overflow-hidden">
      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">📂</span>
        Dữ liệu nguồn
      </h2>

      <div className="space-y-6">
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => !isBatchRunning && !isProcessing && fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center transition-all
            ${isBatchRunning || isProcessing ? 'opacity-50 cursor-not-allowed border-slate-200' : 'cursor-pointer border-slate-200 hover:border-blue-400 hover:bg-slate-50'}
            ${isDragging ? 'border-blue-500 bg-blue-50' : ''}
            ${tourList.length > 0 ? 'bg-green-50/10 border-green-200' : ''}
          `}
        >
          <input type="file" ref={fileInputRef} onChange={onFileChange} accept=".json" className="hidden" disabled={isBatchRunning || isProcessing} />
          <div className="flex flex-col items-center">
            {isProcessing ? (
              <>
                <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-xs font-semibold text-slate-700">Đang xử lý...</p>
              </>
            ) : tourList.length > 0 ? (
              <>
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-slate-700 truncate max-w-full px-2">{fileName}</p>
                <p className="text-[10px] text-slate-400 mt-1">Đã nạp {tourList.length} tours</p>
                {tourStats && (
                  <div className="mt-2 text-[9px] text-slate-500 space-y-0.5">
                    <div>Giá TB: {Math.round(tourStats.priceRange.avg).toLocaleString()}đ</div>
                    <div>Điểm TB: {tourStats.avgRating.toFixed(2)}/5</div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-slate-600">Kéo thả file JSON vào đây</p>
                <p className="text-[10px] text-slate-400 mt-1">File lớn (15MB+) sẽ được xử lý tự động</p>
              </>
            )}
          </div>
        </div>

        {tourList.length > 0 && (
          <div className="space-y-4 overflow-hidden">
            {/* Filters and Sort */}
            {tourStats && tourStats.destinations.length > 1 && (
              <div className="flex gap-2 text-[10px]">
                <select 
                  value={filterDestination}
                  onChange={(e) => setFilterDestination(e.target.value)}
                  className="flex-1 p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  disabled={isBatchRunning}
                >
                  <option value="">Tất cả điểm đến ({tourList.length})</option>
                  {tourStats.destinations.map(dest => (
                    <option key={dest} value={dest}>
                      {dest} ({tourList.filter(t => t.destination === dest).length})
                    </option>
                  ))}
                </select>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  disabled={isBatchRunning}
                >
                  <option value="rating">Sắp xếp: Điểm</option>
                  <option value="price">Sắp xếp: Giá</option>
                  <option value="duration">Sắp xếp: Thời gian</option>
                  <option value="title">Sắp xếp: Tên</option>
                </select>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex justify-between">
                <span>Hành trình trong file</span>
                <span className="text-blue-500 font-black">{selectedIndex + 1} / {processedTours.length}</span>
              </label>
              <div className="flex gap-2 items-center">
                <button 
                  disabled={selectedIndex === 0 || isBatchRunning}
                  onClick={() => setSelectedIndex(prev => prev - 1)}
                  className="flex-shrink-0 p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-all active:scale-90"
                >
                  ◀
                </button>
                <select 
                  value={selectedIndex}
                  disabled={isBatchRunning}
                  onChange={(e) => setSelectedIndex(parseInt(e.target.value))}
                  className="flex-1 min-w-0 p-2 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500 bg-white truncate disabled:bg-slate-50"
                >
                  {processedTours.map((t, idx) => (
                    <option key={idx} value={idx}>
                      {processedTitles.some(pt => pt.includes(t.title || t.destination)) ? '✅ ' : ''}{t.title || `Tour ${idx + 1}`}
                    </option>
                  ))}
                </select>
                <button 
                  disabled={selectedIndex === processedTours.length - 1 || isBatchRunning}
                  onClick={() => setSelectedIndex(prev => prev + 1)}
                  className="flex-shrink-0 p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 transition-all active:scale-90"
                >
                  ▶
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => currentTour && onGenerate(currentTour)}
                disabled={isLoading || !currentTour || isBatchRunning}
                className={`
                  py-3 px-2 text-white text-[11px] font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2
                  ${isProcessed ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'}
                  disabled:bg-slate-200 disabled:shadow-none active:scale-95
                `}
              >
                {isLoading && !isBatchRunning ? '...' : isProcessed ? 'Cập nhật tour' : 'Kiến tạo đơn'}
              </button>

              <button
                onClick={() => onAutoProcess(processedTours)}
                disabled={isLoading && !isBatchRunning}
                className={`
                  py-3 px-2 font-bold text-[11px] rounded-xl transition-all shadow-md flex items-center justify-center gap-2 border
                  ${isBatchRunning 
                    ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
                    : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-400 hover:text-indigo-600'}
                  disabled:opacity-50 active:scale-95
                `}
              >
                {isBatchRunning ? (
                  <><span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span> Dừng Batch</>
                ) : (
                  <>🚀 Xử lý tự động ({processedTours.length})</>
                )}
              </button>
            </div>
            
            {isBatchRunning && (
              <p className="text-[9px] text-center font-bold text-indigo-500 uppercase animate-pulse">
                Hệ thống đang xử lý tự động... vui lòng không đóng tab
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InputSection;
