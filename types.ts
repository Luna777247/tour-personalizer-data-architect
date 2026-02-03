
export interface RapidApiKey {
  key: string;
  host: string;
}

export interface PlaceData {
  name: string;
  formatted_address?: string;
  lat: number;
  lng: number;
  rating?: number;
  user_ratings_total?: number;
  place_id?: string;
  types?: string[];
  source?: 'osm' | 'google' | 'opencage' | 'gemini-maps';
  google_maps_uri?: string;
}

export interface TransportToNext {
  mode: string;
  distance_km: number;
  travel_time_hours: number;
  cost_usd: number;
  cost_vnd?: number;
}

export interface TourPlace {
  place_id?: string;
  name: string;
  name_en?: string;
  search_query?: string;
  activity_description?: string;
  activity_description_en?: string;
  estimated_price_vnd?: number;
  estimated_price_usd?: number;
  rating?: number;
  avg_price_usd?: number;
  arrival_time: string;
  departure_time: string;
  visit_duration_hours: number;
  transport_to_next?: TransportToNext;
  personalization_reason?: string;
  lat?: number;
  lng?: number;
  provider?: string;
  google_maps_uri?: string;
}

export interface TimeBlock {
  block_type: string;
  time_range: string;
  places: TourPlace[];
}

export interface DailyItinerary {
  day_number: number;
  date: string;
  day_title?: string;
  day_title_en?: string;
  blocks: TimeBlock[];
  summary: {
    total_places: number;
    places_cost_usd: number;
    transport_cost_usd: number;
    total_cost_usd: number;
    places_cost_vnd?: number;
    transport_cost_vnd?: number;
    total_cost_vnd?: number;
  };
}

export interface PersonalizedTour {
  destination: string;
  duration_days: number;
  user_id: string;
  user_preferences: {
    interests: string[];
    budget_range: string;
    travel_party: string;
    accommodation_type: string;
  };
  daily_itineraries: DailyItinerary[];
  summary: {
    total_days: number;
    total_places: number;
    places_cost_usd: number;
    transport_cost_usd: number;
    total_cost_usd: number;
  };
  timeblock_configuration?: any;
}

export type BudgetLevel = 'ECONOMY' | 'STANDARD' | 'LUXURY';
export type TravelPace = 'RELAXED' | 'MODERATE' | 'INTENSE';

/**
 * Interface đồng bộ hoàn toàn với USER_SCHEMA_DEFINITION và responseSchema trong geminiService.ts
 */
export interface UserProfile {
  id: string;
  // Metadata fields (Persona style)
  basic_info: {
    age?: number;
    gender?: string;
    nationality?: string;
    language?: string;
    group_size: { adults: number; children: number };
    has_children?: boolean;
    has_elderly?: boolean;
    // Schema fields (Booking style)
    departure?: string;
    destination?: string;
    start_date?: string;
    end_date?: string;
  };
  preferences: {
    budget_level?: string;
    interests: string[];
    travel_style?: string;
    activity_level?: string;
    crowd_tolerance?: string;
    special_needs?: string[];
  };
  // Các khối dữ liệu bổ sung từ USER_SCHEMA_DEFINITION
  budget_and_style?: {
    budget?: number;
    tour_type?: string;
    travel_style?: string;
  };
  services?: {
    hotel?: {
      stars: number;
      room_type: string;
    };
    transport?: string;
    extras?: {
      tour_guide: boolean;
      tickets: boolean;
      insurance: boolean;
    };
  };
  contact_info?: {
    full_name: string;
    phone: string;
    email: string;
  };
}

/**
 * Interface cho hồ sơ người dùng giả lập sinh từ generateUserForTour
 */
export interface SyntheticUserProfile {
  fullName: string;
  ageRange: "18-24" | "25-35" | "36-50" | "51+";
  interests: string[];
  budgetLevel: BudgetLevel;
  travelPace: TravelPace;
  dietaryRestrictions: string;
  companions: string;
  specialNeeds: string;
}

export interface Tour {
  url?: string;
  title: string;
  tour_code?: string;
  departure_location?: string;
  destination: string;
  duration: string;
  price_text?: string;
  price_value?: number;
  original_price?: string;
  rating_score?: string;
  review_count?: string;
  view_count?: string;
  vehicles?: string[];
  processed_itinerary: DailyItinerary[];
  overall_summary?: {
    total_cost_vnd: number;
    total_cost_usd: number;
    total_places: number;
    places_cost_vnd: number;
    places_cost_usd: number;
    transport_cost_vnd: number;
    transport_cost_usd: number;
  };
  feasibility_score?: number;
}

export interface GeneratedData {
  metadata: {
    version: string;
    generated_at: string;
    engine: string;
  };
  user_schema: any;
  sample_user_profile: UserProfile;
  personalized_tour: PersonalizedTour;
  places?: PlaceData[];
}

export enum AppState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
