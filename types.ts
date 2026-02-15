export interface Category {
  id: string;
  name: string;
  slug: string;
  order_index?: number;
}

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
  category: string; // Legacy string for compatibility
  categoryId?: string; // Reference to Category.id
  price: number; // Partner Price (Base)
  costPrice?: number; // Internal unit cost
  retailPrice?: number; // Web sale price for profit calculation
  pricing?: ProductPricing;
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  status?: 'ACTIVE' | 'DRAFT' | 'ARCHIVED' | 'OUT_OF_STOCK' | 'LOW_ROTATION';
  channels?: number;
  stock_quantity?: number;
  accumulated_profit?: number;
  monthly_rotation?: number;
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

export type AdminPage = 'dashboard' | 'partners' | 'orders' | 'products' | 'collections' | 'inventory' | 'catalog' | 'pricing' | 'reports' | 'settings';

export interface Partner {
  id: string;
  instituteName: string;
  contactName: string;
  email: string;
  location: string; // e.g., "Lausanne • VD"
  tier: UserTier;
  joinDate: string;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'APPROVED' | 'REJECTED';
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
  costPrice: number;
  retailPrice: number;
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
  | 'dash_active_tier_premium'
  | 'dash_monthly_goal'
  | 'dash_view_all'
  | 'history'
  // Admin Navigation
  | 'admin_nav_dashboard'
  | 'admin_nav_partners'
  | 'admin_nav_orders'
  | 'admin_nav_products'
  | 'admin_nav_collections'
  | 'admin_nav_inventory'
  | 'admin_nav_pricing'
  | 'admin_nav_reports'
  | 'admin_nav_settings'
  | 'admin_nav_operational'
  | 'admin_nav_strategy'
  | 'admin_logout'
  | 'admin_search_placeholder'
  // Admin Catalog
  | 'catalog_title'
  | 'catalog_search_placeholder'
  | 'catalog_tab_all'
  | 'catalog_tab_active'
  | 'catalog_tab_draft'
  | 'catalog_tab_archived'
  | 'catalog_metric_sales_rate'
  | 'catalog_metric_inventory_days'
  | 'catalog_metric_abc_analysis'
  | 'catalog_table_product'
  | 'catalog_table_status'
  | 'catalog_table_inventory'
  | 'catalog_table_category'
  | 'catalog_table_channels'
  | 'catalog_table_sku'
  | 'catalog_table_unavailable'
  | 'catalog_table_committed'
  | 'catalog_table_available'
  | 'catalog_table_on_hand'
  // Admin Partners
  | 'partners_title'
  | 'prospects_title'
  | 'partners_subtitle'
  | 'prospects_subtitle'
  | 'partners_table_institute'
  | 'partners_table_contact'
  | 'partners_table_join_date'
  | 'partners_table_actions'
  | 'partners_details'
  | 'partners_convert'
  | 'common_export'
  | 'common_import'
  | 'common_add_product'
  | 'common_days'
  | 'common_active'
  | 'common_archived'
  | 'common_draft'
  | 'common_in_stock'
  | 'common_no_results'
  | 'catalog_table_title'
  | 'catalog_table_conditions'
  | 'catalog_drawer_anatomy'
  | 'catalog_drawer_rotation'
  | 'catalog_drawer_sold_this_month'
  | 'catalog_drawer_accumulated_profit'
  | 'catalog_drawer_total_benefit'
  | 'catalog_drawer_total_benefit'
  | 'catalog_drawer_logistics'
  | 'catalog_drawer_physical_stock'
  | 'catalog_drawer_units'
  | 'catalog_drawer_edit_tech_sheet'
  | 'partners_status_pending'
  | 'partners_status_approved'
  | 'partners_status_rejected'
  | 'partners_add_new'
  | 'admin_nav_prospects'
  | 'partners_search_placeholder'
  | 'partners_tab_partners'
  | 'partners_tab_prospects';

export type Translations = Record<Language, Record<TranslationKey, string>>;