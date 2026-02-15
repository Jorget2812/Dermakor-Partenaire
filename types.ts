export interface Category {
  id: string;
  name: string;
  slug: string;
  order_index?: number;
}

export enum UserTier {
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM', // Legacy alias
  PREMIUM_BASE = 'PREMIUM_BASE',
  PREMIUM_PRO = 'PREMIUM_PRO',
  PREMIUM_ELITE = 'PREMIUM_ELITE'
}

export enum Language {
  FR = 'FR',
  DE = 'DE',
  IT = 'IT'
}

export interface UserProfitData {
  estimatedRetailSales: number;
  estimatedProfit: number;
  margin: number;
}

export interface User {
  id: string;
  name: string;
  instituteName: string;
  tier: UserTier;
  currentSpend: number;
  monthlyGoal: number;
  consecutiveMonths: number;
  ranking?: number; // Position in Elite 20
  joinDate?: string;
  profitData?: UserProfitData;
  academyAccessStatus?: 'ACTIVE' | 'INACTIVE';
  academyAccessType?: 'AUTOMATIC' | 'TEMPORARY' | 'PERMANENT';
  academyAccessUntil?: string;
  completedResources?: string[]; // Array of resource IDs
  certificates?: string[]; // Array of level names (e.g. "PREMIUM_PRO")
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
  strategicLabel?: 'BEST_SELLER' | 'HIGH_ROTATION' | 'HIGH_MARGIN' | 'STRATEGIC' | 'TENDENCY' | 'RECOMMENDED';
  unitProfit?: number;
  marginAtRetail?: number;
}

export interface StrategicPack {
  id: string;
  name: string;
  price: number;
  description: string;
  items: { productId: string; quantity: number }[];
  image?: string;
  badge?: string;
}

export interface CartKPIs {
  totalCost: number;
  estimatedRetail: number;
  totalProfit: number;
  avgMargin: number;
  nextTierProgress: number;
  nextTierName: string;
  nextTierTarget: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface AcademyResource {
  id: string;
  title: string;
  description?: string;
  type: 'VIDEO' | 'PDF' | 'CERTIFICATION' | 'COURSE' | 'MASTERCLASS' | 'DOWNLOADABLE' | 'WEBINAR';
  category: string;
  tierReq: UserTier | 'SPECIFIC' | 'MULTIPLE';
  allowedTiers?: UserTier[]; // New flexible access
  visibilityMode?: 'HIDE' | 'LOCKED' | 'PREVIEW'; // New visibility rules
  academyLevel?: 'STANDARD' | 'PREMIUM_BASE' | 'PREMIUM_PRO' | 'PREMIUM_ELITE'; // Strategic grouping
  strategicLabel?: string; // e.g. "Recomendado para subir a Pro"
  volumeImpact?: string; // e.g. "Aumenta ticket promedio 27%"
  requiredVolume?: number; // Automatic unlock threshold (e.g. 2000 for Pro, 4000 for Elite)
  thumbnail: string;
  contentUrl?: string;
  duration?: string;
  orderIndex?: number;
  status: 'PUBLISHED' | 'DRAFT';
}

// --- ADMIN SPECIFIC TYPES ---

export type AdminPage = 'dashboard' | 'partners' | 'orders' | 'products' | 'collections' | 'inventory' | 'pricing' | 'reports' | 'settings' | 'vision' | 'academy';

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
  academyAccessStatus?: 'ACTIVE' | 'INACTIVE';
  academyAccessType?: 'AUTOMATIC' | 'TEMPORARY' | 'PERMANENT';
  academyAccessUntil?: string;
  academyAccess?: {
    status: 'ACTIVE' | 'INACTIVE';
    type: 'AUTOMATIC' | 'TEMPORARY' | 'PERMANENT';
    until?: string;
  };
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
  channel: string;
  paymentStatus: string;
  deliveryStatus: string;
  deliveryMethod: string;
  tags: string[];
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
  | 'admin_nav_vision'
  | 'admin_nav_academy'
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
  | 'partners_tab_prospects'
  | 'partners_table_actions'
  | 'partners_loading'
  | 'partners_empty'
  | 'partners_approve'
  | 'partners_reject'
  | 'partners_table_prospect'
  | 'partners_table_source'
  | 'partners_lead_date'
  | 'partners_prospect_empty'
  | 'partners_main_contact'
  | 'partners_business_email'
  | 'partners_profile_info'
  | 'partners_location'
  | 'partners_joined'
  | 'partners_tier_level'
  | 'partners_new_title'
  | 'partners_new_subtitle'
  | 'partners_label_institute'
  | 'partners_label_contact'
  | 'partners_label_location'
  | 'partners_label_tier'
  | 'partners_tier_standard_desc'
  | 'partners_tier_premium_desc'
  | 'partners_btn_create'
  // Academy Admin & Access
  | 'academy_admin_title'
  | 'academy_admin_subtitle'
  | 'academy_admin_create'
  | 'academy_admin_search'
  | 'academy_admin_empty'
  | 'academy_admin_loading'
  | 'academy_resource_video'
  | 'academy_resource_pdf'
  | 'academy_resource_course'
  | 'academy_resource_masterclass'
  | 'academy_resource_webinar'
  | 'academy_resource_download'
  | 'academy_form_title'
  | 'academy_form_desc'
  | 'academy_form_type'
  | 'academy_form_cat'
  | 'academy_form_tier'
  | 'academy_form_status'
  | 'academy_form_thumb'
  | 'academy_form_url_pdf'
  | 'academy_form_url_video'
  | 'academy_form_duration'
  | 'academy_form_order'
  | 'academy_form_submit'
  | 'academy_form_update'
  | 'academy_form_new'
  | 'academy_form_tier_std'
  | 'academy_form_tier_prem'
  | 'academy_form_tier_spec'
  | 'academy_access_title'
  | 'academy_access_active'
  | 'academy_access_locked'
  | 'academy_access_perm'
  | 'academy_access_temp'
  | 'academy_access_disable'
  | 'academy_access_expire'
  | 'academy_access_updated'
  | 'academy_admin_save_error'
  | 'academy_admin_delete_confirm'
  | 'common_no_description'
  | 'common_edit'
  | 'common_delete'
  | 'academy_form_title_placeholder'
  | 'academy_form_desc_placeholder'
  | 'academy_form_cat_placeholder'
  | 'academy_form_url_general'
  | 'academy_form_url_pdf_placeholder'
  | 'academy_form_url_video_placeholder'
  | 'academy_form_url_general_placeholder'
  | 'academy_form_duration_placeholder'
  | 'common_error'
  | 'academy_access_restricted'
  | 'academy_upsell_badge'
  | 'academy_upsell_title'
  | 'academy_upsell_desc'
  | 'academy_upsell_target'
  | 'academy_upsell_btn'
  // Strategic Order Module
  | 'order_fixed_summary'
  | 'order_retail_val'
  | 'order_potential_profit'
  | 'order_avg_margin'
  | 'order_tier_advance'
  | 'order_pack_title'
  | 'order_optimize_btn'
  | 'order_roi_alert'
  | 'order_filter_margin'
  | 'order_filter_rotation'
  | 'order_filter_elite'
  | 'order_label_best_seller'
  | 'order_label_high_rotation'
  | 'order_label_high_margin'
  | 'order_label_strategic'
  | 'order_label_tendency'
  | 'order_label_recommended'
  | 'order_unit_profit'
  | 'order_rrp_price'
  // Strategic Academy 2.0
  | 'academy_level_std'
  | 'academy_level_prem_base'
  | 'academy_level_prem_pro'
  | 'academy_level_prem_elite'
  | 'academy_progress_title'
  | 'academy_progress_unlock'
  | 'academy_lock_title_premium'
  | 'academy_lock_title_elite'
  | 'academy_lock_btn_upgrade'
  | 'academy_lock_requirement_elite'
  | 'academy_stat_efficiency'
  | 'academy_certificate_badge'
  | 'academy_certificate_download'
  | 'academy_dash_recommended'
  | 'academy_dash_new'
  | 'academy_dash_trend';

export type Translations = Record<Language, Record<TranslationKey, string>>;