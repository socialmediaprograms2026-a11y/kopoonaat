import { pgTable, text, integer, boolean, doublePrecision, jsonb, timestamp } from "drizzle-orm/pg-core";

export const merchants = pgTable("merchants", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  arabicName: text("arabic_name").notNull(),
  tagline: text("tagline"),
  logoText: text("logo_text"),
  logoBg: text("logo_bg"),
  primaryColor: text("primary_color"),
  category: text("category").notNull(),
  featured: boolean("featured").default(false),
  country: text("country").default("السعودية"),
  websiteUrl: text("website_url").notNull(),
  affiliateUrl: text("affiliate_url").notNull(),
  affiliateNetwork: text("affiliate_network").notNull(),
  affiliateProgramId: text("affiliate_program_id"),
  affiliateTrackingId: text("affiliate_tracking_id"),
  commissionRate: text("commission_rate").default("5%"),
  cookieDuration: text("cookie_duration").default("30 يوم"),
  programStatus: text("program_status").default("ACTIVE"),
  approvalStatus: text("approval_status").default("APPROVED"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  aboutStore: text("about_store"),
  savingTips: jsonb("saving_tips"),
  metadata: jsonb("metadata"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  merchantId: text("merchant_id").notNull(),
  name: text("name").notNull(),
  arabicName: text("arabic_name").notNull(),
  description: text("description"),
  image: text("image"),
  productUrl: text("product_url").notNull(),
  affiliateUrl: text("affiliate_url").notNull(),
  price: doublePrecision("price").notNull(),
  oldPrice: doublePrecision("old_price"),
  currency: text("currency").default("SAR"),
  discountPercentage: doublePrecision("discount_percentage"),
  availability: text("availability").default("IN_STOCK"),
  sku: text("sku"),
  brand: text("brand"),
  rating: doublePrecision("rating"),
  reviewsCount: integer("reviews_count"),
  externalProductId: text("external_product_id"),
  network: text("network"),
  category: text("category").notNull(),
  source: text("source").default("MANUAL"),
  commissionRate: text("commission_rate"),
  commissionType: text("commission_type"),
  metadata: jsonb("metadata"),
  lastSyncedAt: text("last_synced_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const coupons = pgTable("coupons", {
  id: text("id").primaryKey(),
  merchantId: text("merchant_id").notNull(),
  code: text("code").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  discountType: text("discount_type").default("PERCENTAGE"),
  discountValue: text("discount_value").notNull(),
  minimumOrder: text("minimum_order"),
  expiryDate: text("expiry_date").notNull(),
  affiliateUrl: text("affiliate_url"),
  type: text("type").default("coupon"),
  status: text("status").default("ACTIVE"),
  isExclusive: boolean("is_exclusive").default(false),
  badge: text("badge"),
  verificationStatus: text("verification_status").default("VERIFIED"),
  verificationSource: text("verification_source").default("ADMIN_MANUAL"),
  lastVerifiedAt: text("last_verified_at"),
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const clicks = pgTable("clicks", {
  id: text("id").primaryKey(),
  clickId: text("click_id").notNull().unique(),
  merchantId: text("merchant_id").notNull(),
  productId: text("product_id"),
  couponId: text("coupon_id"),
  destinationUrl: text("destination_url").notNull(),
  subId: text("sub_id"),
  campaign: text("campaign"),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  deviceType: text("device_type").default("unknown"),
  ipAddress: text("ip_address"),
  country: text("country"),
  sessionId: text("session_id"),
  visitorId: text("visitor_id"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  utmContent: text("utm_content"),
  utmTerm: text("utm_term"),
  createdAt: text("created_at").notNull()
});

export const conversions = pgTable("conversions", {
  id: text("id").primaryKey(),
  conversionId: text("conversion_id").notNull(),
  clickId: text("click_id"),
  merchantId: text("merchant_id").notNull(),
  productId: text("product_id"),
  network: text("network").notNull(),
  orderReference: text("order_reference").notNull(),
  orderValue: doublePrecision("order_value").default(0),
  commissionAmount: doublePrecision("commission_amount").default(0),
  currency: text("currency").default("SAR"),
  status: text("status").default("PENDING"),
  rawPayload: jsonb("raw_payload"),
  approvedAt: text("approved_at"),
  rejectedAt: text("rejected_at"),
  paidAt: text("paid_at"),
  createdAt: text("created_at").notNull()
});

export const commissions = pgTable("commissions", {
  id: text("id").primaryKey(),
  conversionId: text("conversion_id").notNull(),
  merchantId: text("merchant_id").notNull(),
  amount: doublePrecision("amount").notNull().default(0),
  currency: text("currency").default("SAR"),
  status: text("status").default("PENDING"),
  network: text("network").notNull(),
  source: text("source"),
  externalId: text("external_id"),
  payoutDate: text("payout_date"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at")
});

export const webhookEvents = pgTable("webhook_events", {
  id: text("id").primaryKey(),
  network: text("network").notNull(),
  eventId: text("event_id").notNull(),
  payload: jsonb("payload"),
  signatureValid: boolean("signature_valid").default(false),
  processed: boolean("processed").default(false),
  errorMessage: text("error_message"),
  receivedAt: text("received_at").notNull()
});

export const integrationLogs = pgTable("integration_logs", {
  id: text("id").primaryKey(),
  provider: text("provider").notNull(),
  action: text("action").notNull(),
  status: text("status").notNull(),
  requestTime: text("request_time"),
  responseTime: text("response_time"),
  httpStatus: integer("http_status"),
  error: text("error"),
  metadata: jsonb("metadata"),
  createdAt: text("created_at").notNull()
});

export const integrations = pgTable("integrations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  provider: text("provider").notNull(),
  network: text("network").notNull(),
  status: text("status").default("NOT_CONFIGURED"),
  enabled: boolean("enabled").default(false),
  apiKey: text("api_key"),
  apiSecret: text("api_secret"),
  affiliateId: text("affiliate_id"),
  publisherId: text("publisher_id"),
  trackingId: text("tracking_id"),
  websiteId: text("website_id"),
  webhookSecret: text("webhook_secret"),
  baseUrl: text("base_url"),
  lastTestedAt: text("last_tested_at"),
  lastSyncedAt: text("last_synced_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull()
});

export const priceAlerts = pgTable("price_alerts", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull(),
  email: text("email").notNull(),
  targetPrice: doublePrecision("target_price").notNull(),
  initialPrice: doublePrecision("initial_price").notNull(),
  currency: text("currency").default("SAR"),
  status: text("status").default("ACTIVE"),
  triggeredAt: text("triggered_at"),
  createdAt: text("created_at").notNull()
});

export const syncJobs = pgTable("sync_jobs", {
  id: text("id").primaryKey(),
  jobName: text("job_name").notNull(),
  status: text("status").notNull(),
  itemsProcessed: integer("items_processed").default(0),
  startedAt: text("started_at").notNull(),
  finishedAt: text("finished_at"),
  durationMs: integer("duration_ms"),
  errorMessage: text("error_message")
});
