
import { GoogleGenAI, Type } from "@google/genai";
import { Tour, SyntheticUserProfile, GeneratedData, PlaceData } from "../types";

// Khởi tạo AI với API Key từ môi trường
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Phân tích và sửa lỗi JSON từ phản hồi của AI
 */
const safeJsonParse = (text: string) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      const jsonCandidate = text.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(jsonCandidate);
      } catch (innerError) {
        console.error("JSON Recovery failed:", jsonCandidate);
      }
    }
    throw new Error("AI response is not valid JSON.");
  }
};

const ensureObject = (val: any) => {
  if (!val) return {};
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch (e) { return val; }
  }
  return val;
};

const USER_SCHEMA_DEFINITION = {
  "type": "object",
  "properties": {
    "id": { "type": "string" },

    "basic_info": {
      "type": "object",
      "properties": {
        "departure": { "type": "string" },
        "destination": { "type": "string" },
        "start_date": { "type": "string", "format": "date" },
        "end_date": { "type": "string", "format": "date" },
        "group_size": {
          "type": "object",
          "properties": {
            "adults": { "type": "integer", "minimum": 1 },
            "children": { "type": "integer", "minimum": 0 }
          }
        }
      }
    },

    "budget_and_style": {
      "type": "object",
      "properties": {
        "budget": { "type": "number" },
        "tour_type": { 
          "type": "string", 
          "enum": ["Budget", "Standard", "Luxury"] 
        },
        "travel_style": { 
          "type": "string", 
          "enum": ["Relaxation", "Exploration", "Adventure", "Family", "Couple", "Business"] 
        }
      }
    },

    "preferences": {
      "type": "object",
      "properties": {
        "interests": { 
          "type": "array", 
          "items": { 
            "type": "string",
            "enum": ["Beach", "Mountain", "Culture", "Food", "Shopping"]
          } 
        },
        "activity_level": { 
          "type": "string", 
          "enum": ["Light", "Moderate", "High"] 
        },
        "special_needs": { 
          "type": "array", 
          "items": { "type": "string" } 
        }
      }
    },

    "services": {
      "type": "object",
      "properties": {
        "hotel": {
          "type": "object",
          "properties": {
            "stars": { "type": "integer", "minimum": 1, "maximum": 5 },
            "room_type": { "type": "string" }
          }
        },
        "transport": { 
          "type": "string", 
          "enum": ["Flight", "Train", "Private Car", "Bus"] 
        },
        "extras": {
          "type": "object",
          "properties": {
            "tour_guide": { "type": "boolean" },
            "tickets": { "type": "boolean" },
            "insurance": { "type": "boolean" }
          }
        }
      }
    },

    "contact_info": {
      "type": "object",
      "properties": {
        "full_name": { "type": "string" },
        "phone": { "type": "string" },
        "email": { "type": "string", "format": "email" }
      }
    }
  }
};


/**
 * KIẾN TRÚC SƯ TRƯỞNG: Tạo tour cá nhân hóa từ dữ liệu thô
 */
export const generateTourDataFromRaw = async (rawJson: any, existingSchema?: any): Promise<GeneratedData> => {
  const prompt = `
    PHÂN TÍCH VÀ KIẾN TẠO DỮ LIỆU TOUR (BẮT BUỘC JSON):
    
    Dữ liệu nguồn: ${JSON.stringify(rawJson)}

    QUY TẮC THIẾT KẾ HÀNH TRÌNH:
    1. Với tất cả các ngày giữa (không phải ngày đầu và ngày cuối), BẮT BUỘC phải có đủ 7 khối thời gian:
       - 'breakfast' (07:00-08:00)
       - 'morning' (08:00-11:00)
       - 'lunch' (11:00-13:00)
       - 'afternoon' (13:00-18:30)
       - 'dinner' (18:30-20:30)
       - 'evening' (20:30-22:00)
       - 'hotel' (22:00-07:00)
    
    2. Nếu dữ liệu nguồn thiếu thông tin cho bất kỳ block nào, bạn PHẢI TỰ SINH địa điểm (nhà hàng, điểm tham quan, hoạt động) phù hợp với Profile người dùng và khu vực địa lý của block liền trước/sau.
    
    3. Đảm bảo cấu trúc 'timeblock_configuration' khớp chính xác với khung giờ trên.
    
    4. Trả về Profile mẫu (sample_user_profile) phản ánh đúng đối tượng khách hàng của tour này.
    
    5. BẮT BUỘC: Mỗi địa điểm (NGOẠI TRỪ địa điểm cuối cùng trong mỗi block và địa điểm cuối cùng trong ngày) phải có thông tin 'transport_to_next' bao gồm:
       - mode: phương tiện (walking, motorbike, taxi, bus, train)
       - distance_km: khoảng cách tính bằng km
       - travel_time_hours: thời gian di chuyển tính bằng giờ (có thể là số thập phân như 0.05 = 3 phút)
       - cost_usd: chi phí di chuyển (walking = 0)
    
    6. Tính toán thời gian arrival_time và departure_time dựa trên travel_time từ địa điểm trước đó.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          user_schema: { 
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              properties: { type: Type.OBJECT, properties: { info: { type: Type.STRING } } }
            }
          },
          sample_user_profile: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              basic_info: { 
                type: Type.OBJECT, 
                properties: {
                  age: { type: Type.NUMBER },
                  gender: { type: Type.STRING },
                  nationality: { type: Type.STRING },
                  language: { type: Type.STRING },
                  group_size: { 
                    type: Type.OBJECT,
                    properties: {
                      adults: { type: Type.NUMBER },
                      children: { type: Type.NUMBER }
                    }
                  },
                  has_children: { type: Type.BOOLEAN },
                  has_elderly: { type: Type.BOOLEAN },
                  departure: { type: Type.STRING },
                  destination: { type: Type.STRING },
                  start_date: { type: Type.STRING },
                  end_date: { type: Type.STRING }
                }
              },
              preferences: { 
                type: Type.OBJECT,
                properties: {
                  budget_level: { type: Type.STRING },
                  interests: { type: Type.ARRAY, items: { type: Type.STRING } },
                  travel_style: { type: Type.STRING },
                  activity_level: { type: Type.STRING },
                  crowd_tolerance: { type: Type.STRING },
                  special_needs: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              },
              budget_and_style: {
                type: Type.OBJECT,
                properties: {
                  budget: { type: Type.NUMBER },
                  tour_type: { type: Type.STRING },
                  travel_style: { type: Type.STRING }
                }
              },
              services: {
                type: Type.OBJECT,
                properties: {
                  hotel: {
                    type: Type.OBJECT,
                    properties: {
                      stars: { type: Type.NUMBER },
                      room_type: { type: Type.STRING }
                    }
                  },
                  transport: { type: Type.STRING },
                  extras: {
                    type: Type.OBJECT,
                    properties: {
                      tour_guide: { type: Type.BOOLEAN },
                      tickets: { type: Type.BOOLEAN },
                      insurance: { type: Type.BOOLEAN }
                    }
                  }
                }
              },
              contact_info: {
                type: Type.OBJECT,
                properties: {
                  full_name: { type: Type.STRING },
                  phone: { type: Type.STRING },
                  email: { type: Type.STRING }
                }
              }
            }
          },
          personalized_tour: {
            type: Type.OBJECT,
            properties: {
              destination: { type: Type.STRING },
              duration_days: { type: Type.NUMBER },
              user_id: { type: Type.STRING },
              user_preferences: { 
                type: Type.OBJECT,
                properties: {
                  interests: { type: Type.ARRAY, items: { type: Type.STRING } },
                  budget_range: { type: Type.STRING },
                  travel_party: { type: Type.STRING },
                  accommodation_type: { type: Type.STRING }
                }
              },
              daily_itineraries: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day_number: { type: Type.NUMBER },
                    date: { type: Type.STRING },
                    blocks: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          block_type: { type: Type.STRING },
                          time_range: { type: Type.STRING },
                          places: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                name: { type: Type.STRING },
                                arrival_time: { type: Type.STRING },
                                departure_time: { type: Type.STRING },
                                visit_duration_hours: { type: Type.NUMBER },
                                avg_price_usd: { type: Type.NUMBER },
                                personalization_reason: { type: Type.STRING },
                                transport_to_next: {
                                  type: Type.OBJECT,
                                  properties: {
                                    mode: { type: Type.STRING },
                                    distance_km: { type: Type.NUMBER },
                                    travel_time_hours: { type: Type.NUMBER },
                                    cost_usd: { type: Type.NUMBER }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    summary: { 
                      type: Type.OBJECT,
                      properties: {
                        total_places: { type: Type.NUMBER },
                        places_cost_usd: { type: Type.NUMBER },
                        transport_cost_usd: { type: Type.NUMBER },
                        total_cost_usd: { type: Type.NUMBER }
                      }
                    }
                  }
                }
              },
              summary: { 
                type: Type.OBJECT,
                properties: {
                  total_days: { type: Type.NUMBER },
                  total_places: { type: Type.NUMBER },
                  places_cost_usd: { type: Type.NUMBER },
                  transport_cost_usd: { type: Type.NUMBER },
                  total_cost_usd: { type: Type.NUMBER }
                }
              },
              timeblock_configuration: { 
                type: Type.OBJECT,
                properties: {
                  timeblocks: { 
                    type: Type.OBJECT,
                    properties: {
                      meals: { type: Type.OBJECT, properties: { breakfast: { type: Type.OBJECT, properties: { start: { type: Type.STRING }, end: { type: Type.STRING } } } } }
                    }
                  }
                }
              }
            }
          }
        },
        required: ["sample_user_profile", "personalized_tour"]
      }
    }
  });

  // Directly access text property from GenerateContentResponse
  const parsedResponse = safeJsonParse(response.text);
  
  // Ensure objects are initialized to avoid crashes in consumer components
  const personalized_tour = parsedResponse.personalized_tour || {};
  if (!personalized_tour.daily_itineraries) personalized_tour.daily_itineraries = [];

  return {
    metadata: {
      version: "1.5.1",
      generated_at: new Date().toISOString(),
      engine: "Gemini-3-Flash"
    },
    user_schema: existingSchema || USER_SCHEMA_DEFINITION,
    sample_user_profile: ensureObject(parsedResponse.sample_user_profile),
    personalized_tour: personalized_tour
  };
};

/**
 * CHUYÊN GIA ĐỊA LÝ: Tìm kiếm thông tin Maps chính xác (Grounded)
 */
export const searchPlaceWithGeminiMaps = async (query: string, locationContext?: string): Promise<PlaceData | null> => {
  try {
    // We use gemini-2.5-flash with googleMaps tool as requested
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Find the official Google Maps information for the place: "${query}"${locationContext ? ` located in or near ${locationContext}` : ''}. Please provide the exact name, full address, and coordinates if possible.`,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    // Find the first map grounding chunk
    const mapsChunk = groundingChunks?.find(chunk => chunk.maps);

    if (mapsChunk && mapsChunk.maps) {
      // Maps grounding returns uri and title
      return {
        name: mapsChunk.maps.title || query,
        formatted_address: response.text?.split('\n')[0] || mapsChunk.maps.title, // Use text output as fallback for address
        lat: 0, // Gemini Maps tool doesn't directly return lat/lng in the chunk, we rely on the URI or text
        lng: 0,
        google_maps_uri: mapsChunk.maps.uri,
        source: 'gemini-maps'
      };
    }

    return null;
  } catch (error) {
    console.warn("Gemini Maps Grounding failed for", query, error);
    return null;
  }
};


/**
 * CHUYÊN GIA NGƯỜI DÙNG: Sinh profile mẫu
 */
export const generateUserForTour = async (tour: Tour): Promise<SyntheticUserProfile> => {
  const prompt = `
    Dựa trên tour này: "${tour.title}" đến ${tour.destination} trong ${tour.duration}.
    Hãy sinh một hồ sơ người dùng (User Profile) giả lập thực tế, người sẽ quan tâm đến tour này nhưng có những nhu cầu cá nhân cụ thể.
    
    Trả về DUY NHẤT một đối tượng JSON theo schema này:
    {
      "fullName": string,
      "ageRange": "18-24" | "25-35" | "36-50" | "51+",
      "interests": string[] (chọn từ: Lịch sử, Ẩm thực, Mua sắm, Nhiếp ảnh, Văn hóa, Thiên nhiên, Kiến trúc, Phật giáo),
      "budgetLevel": "ECONOMY" | "STANDARD" | "LUXURY",
      "travelPace": "RELAXED" | "MODERATE" | "INTENSE",
      "dietaryRestrictions": string (ví dụ: ăn chay, không ăn cay, dị ứng hải sản),
      "companions": string (ví dụ: Solo, Cặp đôi, Gia đình có trẻ nhỏ, Nhóm bạn),
      "specialNeeds": string
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text || '{}') as SyntheticUserProfile;
  } catch (error) {
    console.error("Error generating user:", error);
    throw error;
  }
};
