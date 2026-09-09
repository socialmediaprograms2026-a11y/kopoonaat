import { Merchant, Product, Coupon, ProviderHealthStatus, AffiliateSyncLog } from "../db/schema";

export interface TrackingUrlOptions {
  clickId: string;
  subId?: string;
  campaign?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  customParams?: Record<string, string>;
}

export interface WebhookValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ParsedConversion {
  conversionId: string;
  externalConversionId?: string;
  orderReference: string;
  clickId: string;
  merchantId?: string;
  productId?: string;
  orderValue: number;
  commissionAmount: number;
  estimatedCommissionAmount?: number;
  currency: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "PAID";
  timestamp: string;
  rawPayload: Record<string, any>;
}

export interface SyncReportResult {
  success: boolean;
  transactionsFetched: number;
  conversionsSaved: number;
  totalCommissionAmount: number;
  message: string;
  errors?: string[];
}

export interface AffiliateNetworkAdapter {
  readonly networkKey: string;
  readonly name: string;

  /**
   * Builds the official tracking URL with subId / clickId appended
   */
  buildTrackingUrl(
    merchant: Merchant,
    target: { product?: Product; coupon?: Coupon },
    options: TrackingUrlOptions
  ): string;

  /**
   * Creates an affiliate tracking URL from any direct URL
   */
  createAffiliateLink(targetUrl: string, options: TrackingUrlOptions): string;

  /**
   * Validates incoming webhook signature/secret
   */
  validateWebhook(
    headers: Record<string, string | string[] | undefined>,
    rawBody: any,
    secret?: string
  ): WebhookValidationResult;

  /**
   * Parses webhook body/query into a normalized conversion record
   */
  parseWebhookPayload(body: any, query?: any): ParsedConversion | null;

  /**
   * Tests API connectivity with credentials in env
   */
  testConnection(): Promise<{ connected: boolean; message: string; details?: any }>;

  /**
   * Fetches raw transactions from the network within a date range
   */
  getTransactions?(startDate?: string, endDate?: string): Promise<ParsedConversion[]>;

  /**
   * Fetches official commission records from the network
   */
  getCommissions?(startDate?: string, endDate?: string): Promise<any[]>;

  /**
   * Fetches aggregated performance / reports from the network
   */
  getReports?(startDate?: string, endDate?: string): Promise<any>;

  /**
   * Gets the live provider health status (connectivity, rate limits, sync state)
   */
  getStatus?(): Promise<ProviderHealthStatus>;

  /**
   * Synchronizes transactions and commissions from the network to local DB
   */
  sync?(options?: {
    startDate?: string;
    endDate?: string;
    mode?: "INCREMENTAL" | "RECONCILIATION";
  }): Promise<AffiliateSyncLog>;

  /**
   * Searches live products from network API/Feed
   */
  searchProducts?(query: string, options?: any): Promise<Product[]>;

  /**
   * Gets specific product by external ID
   */
  getProduct?(externalId: string): Promise<Product | null>;

  /**
   * Retrieves products for merchant/catalog
   */
  getProducts?(params?: any): Promise<Product[]>;

  /**
   * Fetches conversions for date range
   */
  getConversions?(startDate?: string, endDate?: string): Promise<ParsedConversion[]>;

  /**
   * Syncs products from network to local catalog
   */
  syncProducts?(merchantId?: string): Promise<{ synced: number; errors?: string[] }>;

  /**
   * Automatic background fetch of official transactions & commissions reports via API
   */
  fetchTransactionsReport?(startDate?: string, endDate?: string): Promise<SyncReportResult>;
}


