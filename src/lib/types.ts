export type UMKMCategory = 'fnb' | 'retail' | 'services' | 'craft';

export type BorderRadiusStyle = 'sharp' | 'smooth' | 'rounded' | 'pill';
export type HeroLayoutStyle = 'split' | 'banner' | 'minimal';

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  isPromo?: boolean;
  promoPrice?: number;
  badge?: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  comment: string;
  rating: number;
}

export interface SiteStyle {
  themeId: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  cardBackgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  borderRadius: BorderRadiusStyle;
  heroStyle: HeroLayoutStyle;
}

export interface UMKMSite {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: UMKMCategory;
  phone: string; // WhatsApp number format e.g. 628123456789
  address: string;
  openingHours: string;
  instagram?: string;
  gmapsUrl?: string;
  style: SiteStyle;
  products: ProductItem[];
  features: string[];
  testimonials: TestimonialItem[];
  updatedAt: string;
}

export interface CartItem {
  product: ProductItem;
  quantity: number;
  notes?: string;
}

export interface ColorPreset {
  id: string;
  name: string;
  category: string;
  style: SiteStyle;
}
