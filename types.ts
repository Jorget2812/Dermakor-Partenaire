export enum UserTier {
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM'
}

export enum Language {
  FR = 'FR',
  DE = 'DE',
  IT = 'IT'
}

export interface User {
  id: string;
  name: string;
  instituteName: string;
  tier: UserTier;
  currentSpend: number;
  monthlyGoal: number; // 300 for Standard, 800 for Premium
}

// --- PRICING ENGINE TYPES ---
export type DiscountType = 'PERCENTAGE' | 'FIXED';

export interface PricingConfig {
  type: DiscountType;
  value: number;
}

export interface ProductPricing {
  basePrice: number;
  standard: PricingConfig;
  premium: PricingConfig;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number; // Legacy field, treated as Base Price if pricing object is missing
  pricing?: ProductPricing; // New pricing engine configuration
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  description: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface AcademyResource {
  id: string;
  title: string;
  type: 'VIDEO' | 'PDF' | 'CERTIFICATION';
  tierReq: UserTier; // STANDARD means everyone, PREMIUM means restricted
  thumbnail: string;
  duration?: string; // e.g. "12 pages" or "14 min"
}

// --- ADMIN SPECIFIC TYPES ---

export type AdminPage = 'dashboard' | 'partners' | 'orders' | 'catalog' | 'pricing' | 'reports' | 'settings';

export interface Partner {
  id: string;
  instituteName: string;
  contactName: string;
  email: string;
  location: string; // e.g., "Lausanne • VD"
  tier: UserTier;
  joinDate: string;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  monthlySpend: number;
}

export interface AdminOrderItem {
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

export interface AdminOrder {
  id: string;
  date: string;
  partnerName: string;
  tier: UserTier;
  total: number;
  status: 'PREPARATION' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  itemsCount: number;
  items?: AdminOrderItem[]; // Optional for list view, required for detail view
  shippingAddress?: string;
}

export interface AdminProduct extends Product {
  stockCount: number;
  stdPrice: number;
  premPrice: number;
}

export type TranslationKey = 
  | 'login_title'
  | 'login_subtitle'
  | 'login_select_level'
  | 'login_std_title'
  | 'login_std_subtitle'
  | 'login_std_price'
  | 'login_std_features'
  | 'login_prem_title'
  | 'login_prem_subtitle'
  | 'login_prem_price'
  | 'login_prem_features'
  | 'login_btn_access'
  | 'login_no_account'
  | 'login_become_partner'
  | 'login_back'
  | 'login_space_std'
  | 'login_space_prem'
  | 'login_id_label'
  | 'login_id_label_prem'
  | 'login_pwd_label'
  | 'login_secure_std'
  | 'login_secure_prem'
  | 'login_btn'
  | 'login_secure'
  | 'nav_dashboard'
  | 'nav_order'
  | 'nav_academy'
  | 'nav_logout'
  | 'dash_welcome'
  | 'dash_tier_status'
  | 'dash_progress_title'
  | 'dash_min_goal'
  | 'dash_current_spend'
  | 'dash_recent_orders'
  | 'dash_order_id'
  | 'dash_date'
  | 'dash_amount'
  | 'dash_status'
  | 'order_title'
  | 'order_subtitle'
  | 'order_col_product'
  | 'order_col_price'
  | 'order_col_qty'
  | 'order_col_total'
  | 'order_summary'
  | 'order_submit'
  | 'academy_title'
  | 'academy_subtitle'
  | 'academy_locked'
  | 'academy_view'
  | 'common_premium_badge'
  | 'common_standard_badge'
  // Admin Pricing Translations
  | 'pricing_title'
  | 'pricing_subtitle'
  | 'global_config'
  | 'apply_global'
  | 'save_changes'
  | 'base_price'
  | 'std_tier'
  | 'prem_tier'
  | 'final_price'
  | 'savings'
  | 'method'
  | 'percentage'
  | 'fixed'
  | 'history';

export type Translations = Record<Language, Record<TranslationKey, string>>;