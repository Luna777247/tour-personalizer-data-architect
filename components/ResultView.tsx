
import React, { useState } from 'react';
import { GeneratedData, UserProfile } from '../types';

interface Props {
  data: GeneratedData | null;
  history: GeneratedData[];
  onSelectHistory: (index: number) => void;
  activeIndex: number;
}

const getBlockIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'breakfast': return '🍳';
    case 'morning': return '☀️';
    case 'lunch': return '🍲';
    case 'afternoon': return '☕';
    case 'dinner': return '🍽️';
    case 'evening': return '🌙';
    case 'hotel': return '🏨';
    default: return '📍';
  }
};

const ResultView: React.FC<Props> = ({ data, history, onSelectHistory, activeIndex }) => {
  const [activeTab, setActiveTab] = useState<'tour' | 'schema' | 'profile' | 'places'>('tour');

  if (!data) {
    return (
      <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-slate-400 p-12 bg-white rounded-3xl border border-slate-200 border-dashed">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100 shadow-inner"><span className="text-4xl">💎</span></div>
        <p className="text-xl font-black text-slate-700 tracking-tight">Data Playground Idle</p>
        <p className="text-sm mt-2 text-slate-400 max-w-xs text-center leading-relaxed font-medium">Nạp tệp JSON để bắt đầu quy trình trích xuất và kiến tạo dữ liệu tour v1.5.</p>
      </div>
    );
  }

  const downloadJson = (content: any, fileName: string) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(content, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${fileName}.json`;
    a.click();
  };

  const SchemaProperty = ({ name, prop, level = 0 }: { name: string; prop: any; level?: number }) => (
    <div className={`py-2 ${level > 0 ? 'ml-6 border-l border-slate-700 pl-4' : ''}`}>
      <div className="flex items-center gap-2">
        <span className="text-indigo-400 font-mono text-sm">{name}:</span>
        <span className="text-slate-500 text-[10px] uppercase font-bold bg-slate-800 px-1.5 py-0.5 rounded">{prop.type}</span>
        {prop.enum && <span className="text-amber-400 text-[10px] font-bold">[{prop.enum.join(', ')}]</span>}
      </div>
      {prop.description && <p className="text-slate-400 text-[10px] mt-1 italic">{prop.description}</p>}
      {prop.properties && (
        <div className="mt-1">
          {Object.entries(prop.properties).map(([k, v]: [string, any]) => (
            <SchemaProperty key={k} name={k} prop={v} level={level + 1} />
          ))}
        </div>
      )}
      {prop.items && prop.items.properties && (
        <div className="mt-1">
          {Object.entries(prop.items.properties).map(([k, v]: [string, any]) => (
            <SchemaProperty key={k} name={k} prop={v} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );

  const ProfileCard = ({ profile }: { profile: UserProfile }) => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-2xl font-black text-slate-900 tracking-tight">Hồ sơ khách hàng</h4>
          <p className="text-xs text-slate-400 font-medium">Dữ liệu được AI ánh xạ từ tour và nhu cầu người dùng</p>
        </div>
        <button onClick={() => downloadJson(profile, 'user_profile')} className="text-[10px] font-black bg-slate-900 text-white px-4 py-2 rounded-xl uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all">Export JSON</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
            <span className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">👤</span>
            <h5 className="font-black text-slate-800 uppercase tracking-widest text-xs">Thông tin cơ bản</h5>
          </div>
          <div className="grid grid-cols-2 gap-y-4 gap-x-2">
            {profile.basic_info.age && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Độ tuổi</p>
                <p className="text-sm font-black text-slate-700">{profile.basic_info.age} tuổi</p>
              </div>
            )}
            {profile.basic_info.gender && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Giới tính</p>
                <p className="text-sm font-black text-slate-700">{profile.basic_info.gender}</p>
              </div>
            )}
            {profile.basic_info.nationality && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Quốc tịch</p>
                <p className="text-sm font-black text-slate-700">{profile.basic_info.nationality}</p>
              </div>
            )}
            {profile.basic_info.departure && (
              <div className="col-span-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Hành trình</p>
                <p className="text-sm font-black text-slate-700">{profile.basic_info.departure} → {profile.basic_info.destination}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Nhóm khách</p>
              <p className="text-sm font-black text-slate-700">
                {typeof profile.basic_info.group_size === 'object' 
                  ? `${profile.basic_info.group_size.adults} NL, ${profile.basic_info.group_size.children} TE`
                  : `${profile.basic_info.group_size} người`}
              </p>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
            <span className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500">🎯</span>
            <h5 className="font-black text-slate-800 uppercase tracking-widest text-xs">Sở thích & Phong cách</h5>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Mức ngân sách & Tour</p>
              <p className="text-sm font-black text-indigo-600">
                {profile.preferences.budget_level || profile.budget_and_style?.tour_type || 'N/A'} 
                {profile.budget_and_style?.budget && ` (Max: $${profile.budget_and_style.budget})`}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Phong cách du lịch</p>
              <p className="text-sm font-black text-slate-700">{profile.preferences.travel_style || profile.budget_and_style?.travel_style || 'Cá nhân hóa'}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.preferences.interests.map((int, i) => (
                <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg border border-indigo-100 uppercase">{int}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Services & Contact */}
        {profile.services && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
              <span className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500">🏨</span>
              <h5 className="font-black text-slate-800 uppercase tracking-widest text-xs">Dịch vụ yêu cầu</h5>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Khách sạn</span>
                <span className="text-xs font-black text-slate-700">{profile.services.hotel?.stars}★ - {profile.services.hotel?.room_type}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Vận chuyển</span>
                <span className="text-xs font-black text-slate-700">{profile.services.transport}</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {profile.services.extras?.tour_guide && <span className="text-[9px] font-black bg-green-50 text-green-600 px-2 py-1 rounded-full border border-green-100">HDV RIÊNG</span>}
                {profile.services.extras?.insurance && <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-full border border-blue-100">BẢO HIỂM</span>}
                {profile.services.extras?.tickets && <span className="text-[9px] font-black bg-purple-50 text-purple-600 px-2 py-1 rounded-full border border-purple-100">VÉ THAM QUAN</span>}
              </div>
            </div>
          </div>
        )}

        {profile.contact_info && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
              <span className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500">📞</span>
              <h5 className="font-black text-slate-800 uppercase tracking-widest text-xs">Liên hệ</h5>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Họ và tên</p>
                <p className="text-sm font-black text-slate-700">{profile.contact_info.full_name}</p>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Điện thoại</p>
                  <p className="text-sm font-black text-slate-700">{profile.contact_info.phone}</p>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                  <p className="text-sm font-black text-slate-700 truncate">{profile.contact_info.email}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {history.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar scroll-smooth">
          {history.map((h, idx) => (
            <button key={idx} onClick={() => onSelectHistory(idx)} className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${activeIndex === idx ? 'bg-indigo-900 text-white border-indigo-900 shadow-lg scale-105' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'}`}>
              {h.personalized_tour.destination} - {h.sample_user_profile.id.substring(0, 5)}...
            </button>
          ))}
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden flex flex-col min-h-[650px]">
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-1">
          {[
            { id: 'tour', label: 'Hành trình Blocks', icon: '⚡' },
            { id: 'places', label: 'Geo Intelligence', icon: '🌍' },
            { id: 'profile', label: 'User Profile', icon: '👤' },
            { id: 'schema', label: 'User Schema Definition', icon: '🏗️' }
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-6 py-4 text-[11px] font-black uppercase tracking-widest transition-all shrink-0 rounded-2xl flex items-center gap-2 ${activeTab === tab.id ? 'text-indigo-600 bg-white shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        <div className="p-8 flex-1 overflow-auto bg-gradient-to-b from-white to-indigo-50/20">
          {activeTab === 'tour' && (
            <div className="space-y-12 animate-in fade-in zoom-in-95 duration-500">
              <header className="border-l-[6px] border-indigo-600 pl-8 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-black bg-indigo-900 text-white px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-indigo-100">
                      DESTINATION: {data.personalized_tour.destination}
                    </span>
                    <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full uppercase tracking-widest border border-slate-200">
                      USER ID: {data.personalized_tour.user_id}
                    </span>
                  </div>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Hành trình {data.personalized_tour.duration_days} ngày cá nhân hóa</h3>
                  <div className="flex gap-4 mt-4">
                    <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Tổng chi phí dự kiến</p>
                      <p className="text-lg font-black text-indigo-600">${data.personalized_tour.summary?.total_cost_usd?.toFixed(2)}</p>
                    </div>
                    <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Phong cách</p>
                      <p className="text-lg font-black text-slate-700">{data.personalized_tour.user_preferences?.accommodation_type}</p>
                    </div>
                  </div>
                </div>
              </header>

              <div className="space-y-16">
                {data.personalized_tour.daily_itineraries.map((day) => (
                  <div key={day.day_number} className="relative">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="bg-indigo-600 text-white text-xs font-black px-6 py-2.5 rounded-2xl shadow-lg shadow-indigo-100 uppercase tracking-widest">
                        Ngày {day.day_number} &bull; {day.date}
                      </div>
                      <div className="h-px flex-1 bg-slate-200"></div>
                      <div className="text-[10px] font-bold text-slate-400 flex gap-4">
                        <span>💰 ${day.summary?.total_cost_usd?.toFixed(2)}</span>
                        <span>📍 {day.summary?.total_places} địa điểm</span>
                      </div>
                    </div>

                    <div className="space-y-8 pl-4 border-l-2 border-slate-100">
                      {day.blocks.map((block, bIdx) => (
                        <div key={bIdx} className="relative">
                          <div className="absolute -left-[2.1rem] top-0 w-8 h-8 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center shadow-sm z-10 text-sm">
                            {getBlockIcon(block.block_type)}
                          </div>
                          
                          <div className="mb-4">
                            <h5 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                              {block.block_type}
                              <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{block.time_range}</span>
                            </h5>
                          </div>

                          <div className="grid grid-cols-1 gap-4">
                            {block.places.map((place, pIdx) => (
                              <div key={pIdx} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h6 className="font-black text-slate-800 text-base flex items-center gap-2">
                                      {place.name}
                                      {place.google_maps_uri && (
                                        <a href={place.google_maps_uri} target="_blank" rel="noreferrer" title="Grounded Google Map" className="text-blue-500 hover:text-blue-700">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                          </svg>
                                        </a>
                                      )}
                                    </h6>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">
                                      ⏰ {place.arrival_time} - {place.departure_time} ({place.visit_duration_hours}h)
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-black text-indigo-500">${place.avg_price_usd || 0}</p>
                                  </div>
                                </div>
                                
                                {place.personalization_reason && (
                                  <p className="text-[11px] text-slate-500 italic bg-indigo-50/30 p-2 rounded-lg border border-indigo-100/30 mb-3">
                                    "{place.personalization_reason}"
                                  </p>
                                )}

                                {place.transport_to_next && (
                                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs">⚡</span>
                                      <span className="text-[10px] font-black text-slate-400 uppercase">Tiếp theo: {place.transport_to_next.mode}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500">
                                      <span>📏 {place.transport_to_next.distance_km}km</span>
                                      <span>⏱️ {place.transport_to_next.travel_time_hours}h</span>
                                      <span className="text-green-600">💸 ${place.transport_to_next.cost_usd}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'places' && (
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-2xl font-black text-slate-900 tracking-tight">Geo Intelligence</h4>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full border border-blue-200">Gemini 2.5 Maps Tool Grounding</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.places?.map((place, idx) => (
                    <div key={idx} className="p-5 bg-white border border-slate-200 rounded-3xl flex flex-col gap-3 shadow-sm hover:border-blue-300 transition-colors">
                      <div className="flex gap-4 items-center">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 font-bold">📍</div>
                        <div>
                          <h5 className="font-black text-slate-900 text-sm">{place.name}</h5>
                          <p className="text-[9px] text-slate-400 uppercase font-black">{place.source}</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed min-h-[30px]">{place.formatted_address}</p>
                      <div className="flex justify-between items-center border-t border-slate-50 pt-3 mt-auto">
                        <span className="text-[9px] font-mono text-slate-300">ID: {place.place_id?.substring(0, 15)}...</span>
                        <a 
                          href={place.google_maps_uri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-[9px] font-black text-indigo-600 uppercase flex items-center gap-1 hover:text-indigo-800"
                        >
                          {place.google_maps_uri ? 'View Grounded Map' : 'Search Maps'} ↗
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-6 animate-in fade-in duration-500">
               <div className="flex justify-between items-center">
                  <h4 className="text-2xl font-black text-slate-900 tracking-tight">User Schema Definition</h4>
                  <button onClick={() => downloadJson(data.user_schema, 'user_schema')} className="text-[10px] font-bold bg-slate-900 text-white px-3 py-1.5 rounded-lg uppercase">Download Raw</button>
               </div>
               <div className="bg-[#0f172a] rounded-3xl p-8 border border-slate-800 shadow-2xl overflow-hidden">
                  <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-800">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="ml-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">openapi_schema_v3.json</span>
                  </div>
                  <div className="max-h-[500px] overflow-y-auto no-scrollbar">
                    {Object.entries(data.user_schema.properties || {}).map(([key, prop]: [string, any]) => (
                      <SchemaProperty key={key} name={key} prop={prop} />
                    ))}
                  </div>
               </div>
            </div>
          )}
          
          {activeTab === 'profile' && <ProfileCard profile={data.sample_user_profile} />}
        </div>
      </div>
    </div>
  );
};

export default ResultView;
