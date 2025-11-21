// Types for RifaGyn Platform

export interface Campaign {
  id: string;
  slug?: string;
  title: string;
  description?: string;
  logo_url?: string;
  base_price: number;
  total_quotas: number;
  quotas_sold: number;
  quotas_available: number;
  status: 'active' | 'inactive' | 'completed';
  visibility: 'public' | 'private';
  draw_date?: string;
  created_at: string;
  updated_at: string;
  meta?: {
    highlight?: boolean;
    featured?: boolean;
  };
}

export interface Combo {
  id: string;
  campaign_id: string;
  quantity: number;
  price: number;
  discount?: number;
  popular?: boolean;
}

export interface Order {
  id: string;
  user_id: string;
  campaign_id: string;
  campaign_name: string;
  quantity: number;
  amount: number;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  pix_code?: string;
  qr_code?: string;
  expires_at?: string;
  paid_at?: string;
  created_at: string;
}

export interface Ticket {
  id: string;
  order_id: string;
  campaign_id: string;
  number: number;
  user_id: string;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface DashboardStats {
  total_sold: number;
  total_revenue: number;
  total_users: number;
  total_campaigns: number;
  total_tickets: number;
}

export interface UserStats {
  total_tickets: number;
  total_spent: number;
  active_campaigns: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
