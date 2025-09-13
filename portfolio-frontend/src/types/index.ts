export interface User {
  id: number;
  name: string;
  title: string;
  email: string;
  phone: string;
  bio: string;
  avatar_url: string;
  created_at: string;
}

export interface Patent {
  id: number;
  user_id: number;
  title: string;
  patent_number: string;
  description: string;
  filing_date: string;
  grant_date: string;
  status: 'pending' | 'granted' | 'expired';
  category: string;
  created_at: string;
}


export interface NewsArticle {
  id: number;
  user_id: number;
  headline: string;
  media_outlet: string;
  publication_date: string;
  article_url: string;
  summary: string;
  image_url: string;
  created_at: string;
}

export interface AnimationConfig {
  duration: number;
  delay: number;
  easing: string;
}

export interface ScrollPosition {
  scrollY: number;
  scrollDirection: 'up' | 'down';
}