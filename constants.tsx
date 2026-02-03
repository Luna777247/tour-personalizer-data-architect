
import React from 'react';
import { Tour } from './types';

export const INITIAL_TOUR_DATA: Tour = {
  "url": "https://www.trangantravel.com.vn/tour-bac-kinh-to-chau-hang-chau-thuong-hai-7n6d-bay-vn.html",
  "title": "Hành trình Di sản Trung Hoa: Bắc Kinh - Tô Châu - Hàng Châu - Thượng Hải (7 Ngày 6 Đêm) (Cụm 4)",
  "tour_code": "TQ-7D003-CỤM",
  "departure_location": "Hà Nội",
  "destination": "Bắc Kinh (Trung Quốc)",
  "duration": "7 Ngày",
  "price_text": "17,000,000đ",
  "price_value": 17000000,
  "original_price": "23,490,000đ",
  "rating_score": "4.95/5",
  "review_count": "5",
  "view_count": "3",
  "vehicles": ["Máy bay"],
  "processed_itinerary": [
    {
      "day_number": 1,
      "day_title": "Hà Nội - Bắc Kinh",
      "day_title_en": "Hanoi - Beijing",
      /* Added missing required date property */
      "date": "Day 1",
      "blocks": [
        {
          "block_type": "dinner",
          "time_range": "18:30 - 20:30",
          "places": [
            {
              "name": "Nhà hàng Vịt Quay Bắc Kinh",
              "name_en": "Peking Duck Restaurant",
              "search_query": "Peking Duck restaurant Beijing",
              "activity_description": "Thưởng thức đặc sản Vịt quay Bắc Kinh nổi tiếng.",
              "activity_description_en": "Enjoy the famous local specialty Peking Duck.",
              "estimated_price_vnd": 500000,
              "estimated_price_usd": 20,
              "arrival_time": "18:30",
              "departure_time": "20:30",
              "visit_duration_hours": 2,
              "transport_to_next": {
                "mode": "Xe du lịch/Tour Bus",
                "distance_km": 5,
                "travel_time_hours": 0.2,
                "cost_vnd": 50000,
                "cost_usd": 2
              },
              "lat": 39.9278306,
              "lng": 116.4561301,
              "provider": "Nominatim"
            }
          ]
        },
        {
          "block_type": "hotel",
          "time_range": "22:00 - 07:00",
          "places": [
            {
              "name": "Khách sạn tại Bắc Kinh",
              "name_en": "Hotel in Beijing",
              "search_query": "4 star hotel Beijing",
              "activity_description": "Nghỉ đêm tại Bắc Kinh.",
              "activity_description_en": "Overnight in Beijing.",
              "estimated_price_vnd": 1500000,
              "estimated_price_usd": 60,
              "arrival_time": "22:00",
              "departure_time": "07:00",
              "visit_duration_hours": 9,
              "transport_to_next": {
                "mode": "Đi bộ/Walk",
                "distance_km": 0,
                "travel_time_hours": 0,
                "cost_vnd": 0,
                "cost_usd": 0
              },
              "lat": 39.9885331,
              "lng": 116.3995574,
              "provider": "OpenCage"
            }
          ]
        }
      ],
      "summary": {
        "places_cost_vnd": 2000000,
        "places_cost_usd": 80,
        "transport_cost_vnd": 50000,
        "transport_cost_usd": 2,
        "total_cost_vnd": 2050000,
        "total_cost_usd": 82,
        "total_places": 2
      }
    },
    {
      "day_number": 2,
      "day_title": "Bắc Kinh - Vạn Lý Trường Thành",
      "day_title_en": "Beijing - Great Wall",
      /* Added missing required date property */
      "date": "Day 2",
      "blocks": [
        {
          "block_type": "afternoon",
          "time_range": "13:00 - 18:30",
          "places": [
            {
              "name": "Sân vận động Tổ Chim",
              "name_en": "Bird's Nest Stadium",
              "search_query": "Beijing National Stadium",
              "activity_description": "Chụp hình lưu niệm bên ngoài sân vận động Olympic.",
              "activity_description_en": "Take photos outside the Olympic Stadium.",
              "estimated_price_vnd": 0,
              "estimated_price_usd": 0,
              "arrival_time": "16:30",
              "departure_time": "18:00",
              "visit_duration_hours": 1.5,
              "transport_to_next": {
                "mode": "Xe du lịch/Tour Bus",
                "distance_km": 10,
                "travel_time_hours": 0.3,
                "cost_vnd": 50000,
                "cost_usd": 2
              },
              "lat": 39.9914041,
              "lng": 116.3902864,
              "provider": "Nominatim"
            }
          ]
        },
        {
          "block_type": "dinner",
          "time_range": "18:30 - 20:30",
          "places": [
            {
              "name": "Nhà hàng tại Bắc Kinh",
              "name_en": "Beijing Restaurant",
              "search_query": "Chinese restaurant Beijing",
              "activity_description": "Dùng bữa tối.",
              "activity_description_en": "Dinner service.",
              "estimated_price_vnd": 300000,
              "estimated_price_usd": 12,
              "arrival_time": "18:30",
              "departure_time": "20:30",
              "visit_duration_hours": 2,
              "transport_to_next": {
                "mode": "Xe du lịch/Tour Bus",
                "distance_km": 5,
                "travel_time_hours": 0.2,
                "cost_vnd": 50000,
                "cost_usd": 2
              },
              "lat": 39.9418491,
              "lng": 116.4116236,
              "provider": "Nominatim"
            }
          ]
        },
        {
          "block_type": "evening",
          "time_range": "20:30 - 22:00",
          "places": [
            {
              "name": "Phố mua sắm",
              "name_en": "Shopping Street",
              "search_query": "Wangfujing snack street",
              "activity_description": "Tự do tham quan và tìm hiểu các vật phẩm phong thủy (Tỳ hưu).",
              "activity_description_en": "Free time for sightseeing and learning about feng shui items (Pi Xiu).",
              "estimated_price_vnd": 0,
              "estimated_price_usd": 0,
              "arrival_time": "20:30",
              "departure_time": "22:00",
              "visit_duration_hours": 1.5,
              "transport_to_next": {
                "mode": "Xe du lịch/Tour Bus",
                "distance_km": 5,
                "travel_time_hours": 0.2,
                "cost_vnd": 50000,
                "cost_usd": 2
              },
              "lat": 39.9098345,
              "lng": 116.4047354,
              "provider": "Nominatim"
            }
          ]
        },
        {
          "block_type": "hotel",
          "time_range": "22:00 - 07:00",
          "places": [
            {
              "name": "Khách sạn tại Bắc Kinh",
              "name_en": "Hotel in Beijing",
              "search_query": "4 star hotel Beijing",
              "activity_description": "Nghỉ đêm tại Bắc Kinh.",
              "activity_description_en": "Overnight in Beijing.",
              "estimated_price_vnd": 1500000,
              "estimated_price_usd": 60,
              "arrival_time": "22:00",
              "departure_time": "07:00",
              "visit_duration_hours": 9,
              "transport_to_next": {
                "mode": "Đi bộ/Walk",
                "distance_km": 0,
                "travel_time_hours": 0,
                "cost_vnd": 0,
                "cost_usd": 0
              },
              "lat": 39.9885331,
              "lng": 116.3995574,
              "provider": "OpenCage"
            }
          ]
        }
      ],
      "summary": {
        "places_cost_vnd": 1800000,
        "places_cost_usd": 72,
        "transport_cost_vnd": 150000,
        "transport_cost_usd": 6,
        "total_cost_vnd": 1950000,
        "total_cost_usd": 78,
        "total_places": 4
      }
    },
    {
      "day_number": 3,
      "day_title": "Tử Cấm Thành - Di Hòa Viên",
      "day_title_en": "Forbidden City - Summer Palace",
      /* Added missing required date property */
      "date": "Day 3",
      "blocks": [
        {
          "block_type": "morning",
          "time_range": "08:00 - 11:00",
          "places": [
            {
              "name": "Quảng trường Thiên An Môn",
              "name_en": "Tiananmen Square",
              "search_query": "Tiananmen Square",
              "activity_description": "Tham quan trung tâm chính trị của Trung Quốc.",
              "activity_description_en": "Visit the political center of China.",
              "estimated_price_vnd": 0,
              "estimated_price_usd": 0,
              "arrival_time": "08:30",
              "departure_time": "09:30",
              "visit_duration_hours": 1,
              "transport_to_next": {
                "mode": "Đi bộ/Walk",
                "distance_km": 1,
                "travel_time_hours": 0.2,
                "cost_vnd": 0,
                "cost_usd": 0
              },
              "lat": 39.9027218,
              "lng": 116.3914409,
              "provider": "Nominatim"
            },
            {
              "name": "Tử Cấm Thành",
              "name_en": "Forbidden City",
              "search_query": "The Palace Museum Beijing",
              "activity_description": "Khám phá hoàng cung của hai triều đại Minh-Thanh. (Thay thế bằng Thiên Đàn nếu hết vé).",
              "activity_description_en": "Explore the imperial palace of the Minh and Qing dynasties. (Alternative: Temple of Heaven).",
              "estimated_price_vnd": 210000,
              "estimated_price_usd": 8.4,
              "arrival_time": "09:45",
              "departure_time": "11:00",
              "visit_duration_hours": 1.25,
              "transport_to_next": {
                "mode": "Xe du lịch/Tour Bus",
                "distance_km": 5,
                "travel_time_hours": 0.3,
                "cost_vnd": 50000,
                "cost_usd": 2
              },
              "lat": 39.9172757,
              "lng": 116.3907694,
              "provider": "Nominatim"
            }
          ]
        },
        {
          "block_type": "lunch",
          "time_range": "11:00 - 13:00",
          "places": [
            {
              "name": "Nhà hàng địa phương",
              "name_en": "Local Restaurant",
              "search_query": "Restaurant near Forbidden City",
              "activity_description": "Dùng bữa trưa tại nhà hàng.",
              "activity_description_en": "Lunch at a local restaurant.",
              "estimated_price_vnd": 300000,
              "estimated_price_usd": 12,
              "arrival_time": "11:30",
              "departure_time": "13:00",
              "visit_duration_hours": 1.5,
              "transport_to_next": {
                "mode": "Xe du lịch/Tour Bus",
                "distance_km": 15,
                "travel_time_hours": 0.5,
                "cost_vnd": 50000,
                "cost_usd": 2
              },
              "lat": 39.9174165,
              "lng": 116.3895043,
              "provider": "Nominatim"
            }
          ]
        },
        {
          "block_type": "afternoon",
          "time_range": "13:00 - 18:30",
          "places": [
            {
              "name": "Di Hòa Viên",
              "name_en": "Summer Palace",
              "search_query": "Summer Palace Beijing",
              "activity_description": "Tham quan Cung điện mùa hè của Từ Hy Thái Hậu.",
              "activity_description_en": "Visit Empress Dowager Cixi's summer palace.",
              "estimated_price_vnd": 175000,
              "estimated_price_usd": 7,
              "arrival_time": "13:30",
              "departure_time": "16:00",
              "visit_duration_hours": 2.5,
              "transport_to_next": {
                "mode": "Xe du lịch/Tour Bus",
                "distance_km": 20,
                "travel_time_hours": 0.5,
                "cost_vnd": 50000,
                "cost_usd": 2
              },
              "lat": 39.9900983,
              "lng": 116.2647403,
              "provider": "Nominatim"
            },
            {
              "name": "Phố Vương Phủ Tỉnh",
              "name_en": "Wangfujing Street",
              "search_query": "Wangfujing Street",
              "activity_description": "Tự do mua sắm tại phố sầm uất nhất Bắc Kinh.",
              "activity_description_en": "Free shopping at Beijing's busiest street.",
              "estimated_price_vnd": 0,
              "estimated_price_usd": 0,
              "arrival_time": "16:30",
              "departure_time": "18:30",
              "visit_duration_hours": 2,
              "transport_to_next": {
                "mode": "Xe du lịch/Tour Bus",
                "distance_km": 5,
                "travel_time_hours": 0.2,
                "cost_vnd": 50000,
                "cost_usd": 2
              },
              "lat": 39.907951,
              "lng": 116.4051803,
              "provider": "Nominatim"
            }
          ]
        },
        {
          "block_type": "dinner",
          "time_range": "18:30 - 20:30",
          "places": [
            {
              "name": "Nhà hàng tại Bắc Kinh",
              "name_en": "Beijing Restaurant",
              "search_query": "Chinese restaurant Beijing",
              "activity_description": "Dùng bữa tối.",
              "activity_description_en": "Dinner service.",
              "estimated_price_vnd": 300000,
              "estimated_price_usd": 12,
              "arrival_time": "18:45",
              "departure_time": "20:30",
              "visit_duration_hours": 1.75,
              "transport_to_next": {
                "mode": "Xe du lịch/Tour Bus",
                "distance_km": 5,
                "travel_time_hours": 0.2,
                "cost_vnd": 50000,
                "cost_usd": 2
              },
              "lat": 39.9418491,
              "lng": 116.4116236,
              "provider": "Nominatim"
            }
          ]
        },
        {
          "block_type": "hotel",
          "time_range": "22:00 - 07:00",
          "places": [
            {
              "name": "Khách sạn tại Bắc Kinh",
              "name_en": "Hotel in Beijing",
              "search_query": "4 star hotel Beijing",
              "activity_description": "Nghỉ đêm tại Bắc Kinh.",
              "activity_description_en": "Overnight in Beijing.",
              "estimated_price_vnd": 1500000,
              "estimated_price_usd": 60,
              "arrival_time": "22:00",
              "departure_time": "07:00",
              "visit_duration_hours": 9,
              "transport_to_next": {
                "mode": "Đi bộ/Walk",
                "distance_km": 0,
                "travel_time_hours": 0,
                "cost_vnd": 0,
                "cost_usd": 0
              },
              "lat": 39.9885331,
              "lng": 116.3995574,
              "provider": "OpenCage"
            }
          ]
        }
      ],
      "summary": {
        "places_cost_vnd": 2485000,
        "places_cost_usd": 99.4,
        "transport_cost_vnd": 250000,
        "transport_cost_usd": 10,
        "total_cost_vnd": 2735000,
        "total_cost_usd": 109.4,
        "total_places": 7
      }
    }
  ],
  "overall_summary": {
    "total_cost_vnd": 17000000,
    "total_cost_usd": 680,
    "total_places": 40,
    "places_cost_vnd": 14550000,
    "places_cost_usd": 582,
    "transport_cost_vnd": 2450000,
    "transport_cost_usd": 98
  },
  "feasibility_score": 95
};

export const INTEREST_OPTIONS = [
  "Lịch sử (History)", 
  "Ẩm thực (Food)", 
  "Mua sắm (Shopping)", 
  "Nhiếp ảnh (Photography)", 
  "Văn hóa (Culture)", 
  "Thiên nhiên (Nature)", 
  "Kiến trúc (Architecture)", 
  "Phật giáo (Buddhism)"
];

export const Icons = {
  Map: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
  ),
  Clock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  ),
  Currency: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.242.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.184a4.535 4.535 0 00-1.676-.662C6.602 10.766 6 11.541 6 12.5c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662V15a1 1 0 102 0v-.092c.765-.165 1.408-.399 1.84-.686.722-.48 1.324-1.255 1.324-2.222 0-.967-.602-1.742-1.324-2.222-.432-.287-1.075-.52-1.84-.686V7.85c.765.165 1.408.399 1.84.686.722.48 1.324 1.255 1.324 2.222a1 1 0 102 0c0-.967-.602-1.742-1.324-2.222-.432-.287-1.075-.52-1.84-.686V5z" clipRule="evenodd" />
    </svg>
  ),
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  ),
  Magic: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm12.854 4.854a.5.5 0 000-.708l-4-4a.5.5 0 00-.708 0l-12 12a.5.5 0 000 .708l4 4a.5.5 0 00.708 0l12-12zM12.5 5.5l3 3-9 9-3-3 9-9z" clipRule="evenodd" />
    </svg>
  )
};
