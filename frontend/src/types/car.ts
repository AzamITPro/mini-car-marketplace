export interface User {
  id: number;
  name: string;
  email: string;
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
  is_available: boolean;
  user?: User;
  created_at?: string;
  updated_at?: string;
}