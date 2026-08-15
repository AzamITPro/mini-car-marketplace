export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'dealer' | 'rental_agency' | 'admin';
  phone?: string;
  showroom_name?: string;
  city?: string;
  is_verified?: boolean;
}

export interface PriceRating {
  badge: 'great' | 'fair' | 'high';
  label: string;
  color: string;
  bg: string;
  icon: string;
}

export interface Car {
  id: number;
  user_id: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  transaction_type: 'sale' | 'rent';
  description?: string;
  city: string;
  condition: 'new' | 'used';
  mileage?: number;
  transmission?: 'automatic' | 'manual';
  fuel_type?: 'petrol' | 'diesel' | 'hybrid' | 'electric';
  engine_power?: number;
  body_type?: 'suv' | 'sedan' | 'hatchback' | 'coupe' | 'truck' | 'van';
  status?: 'active' | 'sold' | 'reserved';
  image_url?: string;
  is_available: boolean;
  price_rating?: PriceRating;
  user?: User;
  created_at?: string;
  updated_at?: string;
}

export interface Rental {
  id: number;
  user_id: number;
  car_id: number;
  start_date: string;
  end_date: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  car?: Car;
  created_at?: string;
}

export interface ReviewItem {
  id: number;
  user_id: number;
  dealer_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  user?: {
    id: number;
    name: string;
  };
}

export interface Dealer {
  id: number;
  name: string;
  showroom_name: string;
  role: 'dealer' | 'rental_agency' | 'user';
  phone?: string;
  city?: string;
  is_verified?: boolean;
  cars_count: number;
  average_rating: number;
  total_reviews: number;
  cars?: Car[];
  reviews?: ReviewItem[];
}