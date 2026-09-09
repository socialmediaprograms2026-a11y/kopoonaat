export type EntityStatus = "ACTIVE" | "PENDING" | "REJECTED" | "DISABLED" | "EXPIRED" | "UNKNOWN";
export type VerificationSource = "ADMIN_MANUAL" | "API_FEED" | "AFFILIATE_NETWORK" | "COMMUNITY_VOTE" | "UNVERIFIED";
export type CommissionStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "PAID";
export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING" | "BUY_ONE_GET_ONE" | "DEAL";

export interface Merchant {
  id: string;
  slug: string;
  name: string;
  arabicName: string;
  tagline: string;
  logoText: string;
  logoBg: string;
  logoUrl?: string;
  primaryColor: string;
  category: string;
  featured: boolean;
  country: string;
  supportedCountries?: string[];
  currency?: string;
  active?: boolean;
  verified?: boolean;
  lastVerifiedAt?: string;
  websiteUrl: string;
  affiliateUrl: string; // The configured base tracking URL or template
  affiliateNetwork: string; // e.g. "Amazon Associates", "Awin", "Impact", "CJ", "ShareASale", "Admitad", "ArabClicks", "Direct"
  affiliateProgramId?: string;
  affiliateTrackingId?: string;
  commissionRate: string;
  cookieDuration: string;
  programStatus: EntityStatus;
  approvalStatus: "APPROVED" | "PENDING_APPLICATION" | "NOT_APPLIED" | "REJECTED";
  seoTitle: string;
  seoDescription: string;
  aboutStore: string;
  shortDescription?: string;
  savingTips: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type AffiliateMerchant = Merchant;

export interface Product {
  id: string;
  slug: string;
  merchantId: string;
  name: string;
  arabicName: string;
  description: string;
  image: string;
  productUrl: string; // Merchant clean direct link
  affiliateUrl: string; // Generated tracking link
  price: number;
  oldPrice?: number;
  currency: string;
  discountPercentage?: number;
  availability: "IN_STOCK" | "OUT_OF_STOCK" | "PREORDER";
  sku?: string;
  gtin?: string;
  ean?: string;
  upc?: string;
  brand?: string;
  model?: string;
  rating?: number;
  reviewsCount?: number;
  externalProductId?: string;
  network?: string;
  category: string;
  source: "API" | "FEED" | "MANUAL";
  commissionRate?: string;
  commissionType?: "PERCENTAGE" | "FIXED";
  metadata?: Record<string, any>;
  lastPriceCheckedAt?: string;
  lastSyncedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type AffiliateProduct = Product;

export interface ProductPriceHistory {
  id: string;
  productId: string;
  merchantId?: string;
  price: number;
  oldPrice?: number;
  currency?: string;
  recordedAt: string;
}

export interface Coupon {
  id: string;
  merchantId: string;
  storeId?: string; // Alias matching merchantId
  code: string;
  title: string;
  description: string;
  discountType: DiscountType;
  discountValue: string; // e.g. "15%" or "50 SAR"
  minimumOrder?: string;
  maximumDiscount?: string;
  startDate?: string;
  expiryDate: string; // ISO date string
  affiliateUrl?: string;
  type: "coupon" | "deal";
  status: EntityStatus;
  isExclusive: boolean;
  badge?: string;
  verificationStatus: "VERIFIED" | "UNVERIFIED" | "EXPIRED" | "REPORTED_FAILING";
  verificationSource: VerificationSource;
  verificationMethod?: string;
  verified?: boolean;
  lastVerifiedAt: string;
  clickCount?: number;
  copyCount?: number;
  successCount?: number;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  slug: string;
  merchantId: string;
  storeId?: string;
  title: string;
  arabicTitle: string;
  description: string;
  dealType: "FLASH_SALE" | "DIRECT_DISCOUNT" | "BUNDLE" | "FREE_SHIPPING" | "BOGO" | "LIMITED_TIME";
  originalPrice?: number;
  discountedPrice?: number;
  calculatedDiscountPercentage?: number;
  currency: string;
  affiliateUrl: string;
  startDate?: string;
  expiryDate: string;
  status: EntityStatus;
  verified: boolean;
  lastVerifiedAt: string;
  verificationSource: VerificationSource;
  image?: string;
  category: string;
  isFeatured?: boolean;
  clickCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryItem {
  id: string;
  slug: string;
  name: string;
  arabicName: string;
  icon?: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  featured?: boolean;
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CountryConfig {
  code: string; // e.g. "SA", "AE", "KW", "QA", "BH", "OM", "EG", "JO", "MA"
  name: string;
  arabicName: string;
  currency: string;
  flag: string;
  phonePrefix: string;
  isActive: boolean;
  isDefault: boolean;
}

export interface CopyEvent {
  id: string;
  couponId?: string;
  merchantId?: string;
  merchantName?: string;
  storeId?: string;
  couponCode: string;
  sessionId?: string;
  visitorId?: string;
  ipAddress?: string;
  country?: string;
  referer?: string;
  userAgent?: string;
  timestamp: string;
}

export interface CouponVerification {
  id: string;
  couponId: string;
  verifiedBy: string; // admin user ID or "SYSTEM_CRON" or "COMMUNITY_FEEDBACK"
  status: "VALID" | "INVALID" | "EXPIRED";
  notes?: string;
  verifiedAt: string;
}

export interface Click {
  id: string;
  clickId: string; // Unique tracking token sent as subID
  merchantId: string;
  productId?: string;
  couponId?: string;
  campaign?: string;
  subId: string;
  destinationUrl: string;
  referer?: string;
  userAgent?: string;
  deviceType: "mobile" | "desktop" | "tablet" | "bot" | "unknown";
  ipAddress?: string; // Anonymized/hashed for privacy
  country?: string;
  sessionId?: string;
  visitorId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  timestamp: string;
}

export type AffiliateClick = Click;

export interface Conversion {
  id: string;
  conversionId: string; // Internal unique conversion ID
  externalConversionId?: string; // External transaction ID from network (deduplication key)
  clickId: string; // Matching subId click token
  merchantId: string;
  productId?: string;
  network: string; // "Amazon", "Awin", "Impact", "CJ", "ShareASale", "Admitad", "ArabClicks", etc.
  orderReference: string;
  orderValue: number;
  commissionAmount: number;
  estimatedCommissionAmount?: number;
  currency: string;
  status: CommissionStatus;
  rawPayload?: Record<string, any>;
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  paidAt?: string;
  reconciledAt?: string;
}

export type AffiliateConversion = Conversion;

export interface Commission {
  id: string;
  conversionId: string;
  merchantId: string;
  amount: number;
  currency: string;
  status: CommissionStatus;
  isEstimated?: boolean;
  network: string;
  source?: string;
  externalId?: string;
  payoutDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export type AffiliateCommission = Commission;

export interface EmailSubscriber {
  id: string;
  email: string;
  verificationToken?: string;
  isVerified: boolean;
  status: "ACTIVE" | "UNSUBSCRIBED" | "BOUNCED" | "PENDING_VERIFICATION";
  subscribedAt: string;
  verifiedAt?: string;
  unsubscribedAt?: string;
  source: string;
  preferences: {
    dealAlerts: boolean;
    couponAlerts: boolean;
    weeklyDigest: boolean;
  };
}

export interface PriceAlert {
  id: string;
  email: string;
  productId: string;
  merchantId: string;
  targetPrice: number;
  currentPriceAtCreation: number;
  status: "ACTIVE" | "TRIGGERED" | "CANCELLED";
  triggeredAt?: string;
  createdAt: string;
}

export interface CouponAlert {
  id: string;
  email: string;
  merchantId: string;
  status: "ACTIVE" | "CANCELLED";
  createdAt: string;
}

export interface SyncJob {
  id: string;
  jobName: string; // "COUPON_EXPIRY_CHECK" | "PRICE_FEED_SYNC" | "AFFILIATE_REPORTING_SYNC"
  status: "SUCCESS" | "FAILED" | "IN_PROGRESS";
  itemsProcessed: number;
  errors?: string[];
  startedAt: string;
  finishedAt: string;
  durationMs: number;
}

export interface WebhookEvent {
  id: string;
  network: string;
  eventId: string;
  payload: Record<string, any>;
  signatureValid: boolean;
  processed: boolean;
  errorMessage?: string;
  receivedAt: string;
}

export type AffiliateWebhookEvent = WebhookEvent;

export interface AffiliateIntegrationLog {
  id: string;
  provider: string;
  action: string;
  status: "SUCCESS" | "ERROR" | "WARNING" | "INFO";
  requestTime?: string;
  responseTime?: string;
  httpStatus?: number;
  error?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AffiliateIntegration {
  id: string;
  name: string;
  provider: string; // "amazon" | "cj" | "awin" | "impact" | "shareasale" | "admitad" | "arabclicks" | "postgres" | "email" | "gemini"
  network: string;
  status: "CONNECTED" | "NOT_CONFIGURED" | "INVALID_CREDENTIALS" | "DISABLED" | "PENDING_APPROVAL";
  enabled: boolean;
  apiKey?: string; // masked in client
  apiSecret?: string; // masked in client
  affiliateId?: string;
  publisherId?: string;
  trackingId?: string;
  websiteId?: string;
  webhookSecret?: string; // masked in client
  baseUrl?: string;
  lastTestedAt?: string;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateNetworkConfig {
  id: string;
  name: string;
  networkKey: "awin" | "impact" | "cj" | "shareasale" | "admitad" | "partnerize" | "amazon" | "arabclicks" | "custom";
  region: string;
  website: string;
  apiKeyEnvName: string;
  secretEnvName?: string;
  publisherIdEnvName?: string;
  webhookSecretEnvName?: string;
  supportsWebhooks: boolean;
  supportsApiReporting: boolean;
  supportsSubIds: boolean;
  subIdParamName: string;
  connectionStatus: "CONNECTED" | "NOT_CONFIGURED" | "INVALID_CREDENTIALS" | "PENDING_APPROVAL";
  lastTestedAt?: string;
  notes: string;
}

export interface AffiliateSyncLog {
  id: string;
  provider: string; // "awin" | "impact" | "cj" | "amazon" | "shareasale" | "admitad" | "arabclicks" | "ALL"
  jobType: "TRANSACTIONS_SYNC" | "COMMISSIONS_SYNC" | "HISTORICAL_RECONCILIATION" | "FULL_PIPELINE";
  startedAt: string;
  finishedAt: string;
  status: "SUCCESS" | "PARTIAL" | "FAILED" | "IN_PROGRESS";
  recordsFetched: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsSkipped: number;
  totalSalesValue?: number;
  totalCommissionAmount?: number;
  currency?: string;
  errors: string[];
  durationMs: number;
}

export interface ProviderHealthStatus {
  networkKey: string;
  name: string;
  status: "CONNECTED" | "DELAYED" | "AUTH_ERROR" | "NOT_CONFIGURED" | "LIMITED";
  message: string;
  lastSuccessAt?: string;
  lastErrorAt?: string;
  lastErrorMessage?: string;
  rateLimitRemaining?: number;
  rateLimitReset?: string;
  apiReportingSupported: boolean;
  webhookSupported: boolean;
}

export interface TrendingNicheRecord {
  id: string;
  name: string;
  englishName: string;
  category: string;
  monthlySearchVolume: string;
  opportunityScore: number; // 0 - 100
  competitionLevel: "سهل" | "متوسط" | "مرتفع" | "شرس";
  growthTrend: string; // e.g. "+35% هذا الشهر"
  topKeywords: string[];
  recommendedNetworks: string[];
  averageCommission: string;
  market: "mena" | "global" | "all";
  reasonForTrend: string;
  lastAnalyzedAt: string;
}

export interface NicheSyncJobReport {
  id: string;
  jobName: string;
  status: "SUCCESS" | "FAILED" | "IN_PROGRESS";
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  nichesCount: number;
  topTrendingNiche: string;
  averageOpportunityScore: number;
  totalSearchVolumeEstimate: string;
  summary: string;
  triggeredBy: "CRON_SCHEDULE" | "MANUAL_ADMIN" | "INITIAL_BOOT";
  items: TrendingNicheRecord[];
  aiModelUsed?: string;
}

export interface PayoutDestinationConfig {
  method: "crypto" | "digital_wallet" | "gift_card" | "paypal" | "bank";
  walletAddress?: string;
  walletNetwork?: string; // e.g. "BEP20" | "ERC20" | "TRC20" | "Binance Smart Chain"
  walletExchange?: string; // e.g. "Binance"
  accountIdentifier: string;
  accountHolderName?: string;
  autoPayoutThresholdSar: number; // e.g. 100 SAR
  status: "ACTIVE" | "PENDING_VERIFICATION" | "PAUSED";
  lastVerifiedAt?: string;
  notes?: string;
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  adminId: string;
  adminEmail: string;
  ip: string;
  userAgent?: string;
  action: string;
  entityType: string;
  entityId?: string;
  status: "SUCCESS" | "FAILED";
  details?: Record<string, any>;
}

export interface PayoutTransactionRecord {
  id: string;
  amountSar: number;
  amountCryptoUsdt?: number;
  method: "crypto" | "digital_wallet" | "gift_card" | "paypal" | "bank";
  destinationAddress: string;
  destinationNetwork: string;
  exchange: string;
  txHash?: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "CONFIRMED_ON_CHAIN";
  initiatedAt: string;
  completedAt?: string;
  notes: string;
}

