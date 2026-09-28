export interface Subcategory {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  englishName: string;
  slug: string;
  image: string;
  subcategories: Subcategory[];
  productCountInfo?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  subcategoryId?: string;
  image: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  description?: string;
  isActive: boolean;
  rating?: number;
  reviewCount?: number;
  isBestseller?: boolean;
}

export interface HeroBanner {
  id: string;
  tagline: string;
  title: string;
  subtitle: string;
  image: string;
  badges: string[];
  ctaText: string;
  ctaLink: string;
}

export interface AstrologyService {
  id: string;
  name: string;
  description: string;
}

export interface PujaMaterialSection {
  title: string;
  englishTitle: string;
  items: string[];
}
