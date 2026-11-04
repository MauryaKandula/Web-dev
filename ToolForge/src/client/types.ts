export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'creator' | 'admin';
  avatar_url?: string;
}

export interface Product {
  id: string;
  creator_id: string;
  creator_name: string;
  creator_avatar?: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  category: 'cli_tools' | 'web_scripts' | 'ai_prompts' | 'ui_templates' | 'dev_utilities' | 'games' | string;
  price_inr: number;
  is_subscription: number;
  status: 'approved' | 'pending_review' | 'rejected';
  version: string;
  release_notes?: string;
  download_filename: string;
  file_size_kb: number;
  sales_count: number;
  rating_avg: number;
  rating_count: number;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface LibraryItem {
  id: string;
  product_id: string;
  title: string;
  tagline: string;
  version: string;
  category: string;
  download_filename: string;
  file_size_kb: number;
  creator_name: string;
  license_key: string;
  download_count: number;
  purchased_at: string;
}
