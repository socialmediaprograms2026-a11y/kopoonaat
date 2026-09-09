import { Pool } from "pg";
import { GoogleGenAI } from "@google/genai";

export type IntegrationState = "CONNECTED" | "MISSING_CREDENTIALS" | "NOT_CONFIGURED" | "CONNECTION_FAILED";

export interface EnvVariableDoc {
  name: string;
  type: "Secret Key" | "API Token" | "Account ID" | "Publisher ID" | "Tracking Tag" | "Database Connection URL" | "Webhook Secret" | "Email Configuration";
  isRequired: boolean;
  isSet: boolean;
  previewValue?: string;
  serviceName: string;
  dashboardLocation: string;
  requiresApproval: boolean;
  approvalDetails: string;
  description: string;
}

export interface ServiceIntegrationStatus {
  id: string;
  name: string;
  arabicName: string;
  category: "database" | "affiliate" | "email" | "ai";
  status: IntegrationState;
  isEnabled: boolean;
  statusMessage: string;
  lastTestedAt?: string;
  isInitialTarget: boolean; // Highlights whether this is the chosen step
  variables: EnvVariableDoc[];
}

// In-memory cache of enabled state and last test results
const integrationStateOverrides: Record<
  string,
  {
    isEnabled?: boolean;
    lastTestedAt?: string;
    cachedStatus?: IntegrationState;
    cachedMessage?: string;
  }
> = {};

function maskValue(val?: string): string {
  if (!val) return "";
  if (val.length <= 4) return "****";
  if (val.startsWith("postgres://") || val.startsWith("postgresql://")) {
    try {
      const url = new URL(val);
      return `postgres://${url.username ? "***:***@" : ""}${url.host}${url.pathname}`;
    } catch {
      return "postgres://***";
    }
  }
  return `${val.substring(0, 3)}...${val.substring(val.length - 2)}`;
}

export class IntegrationService {
  private static instance: IntegrationService;

  public static getInstance(): IntegrationService {
    if (!IntegrationService.instance) {
      IntegrationService.instance = new IntegrationService();
    }
    return IntegrationService.instance;
  }

  // 1. Check Database (DATABASE_URL)
  public async testDatabase(): Promise<{ status: IntegrationState; message: string }> {
    const dbUrl = process.env.DATABASE_URL?.trim();

    if (!dbUrl) {
      return {
        status: "NOT_CONFIGURED",
        message: "لم يتم تعيين متغير DATABASE_URL. النظام يعمل حالياً بنظام التخزين المحلي الآمن (.data/affiliate_db.json)."
      };
    }

    if (!dbUrl.startsWith("postgres://") && !dbUrl.startsWith("postgresql://")) {
      return {
        status: "CONNECTION_FAILED",
        message: "صيغة DATABASE_URL غير صحيحة. يجب أن تبدأ بـ postgresql:// أو postgres://"
      };
    }

    let pool: Pool | null = null;
    try {
      pool = new Pool({
        connectionString: dbUrl,
        connectionTimeoutMillis: 4000,
        ssl: dbUrl.includes("sslmode=require") || dbUrl.includes("supabase.co") || dbUrl.includes("neon.tech")
          ? { rejectUnauthorized: false }
          : undefined
      });

      const client = await pool.connect();
      const res = await client.query("SELECT 1 AS connected_check, current_database() AS db_name, version() AS pg_ver;");
      client.release();
      await pool.end();

      const dbName = res.rows[0]?.db_name || "PostgreSQL";
      return {
        status: "CONNECTED",
        message: `تم الاتصال بقاعدة البيانات بنجاح: ${dbName} (استجابة فورية)`
      };
    } catch (err: any) {
      if (pool) {
        try {
          await pool.end();
        } catch {
          // ignore
        }
      }
      return {
        status: "CONNECTION_FAILED",
        message: `فشل الاتصال بقاعدة البيانات: ${err.message || String(err)}`
      };
    }
  }

  // 2. Test Amazon Associates (Initial chosen affiliate network)
  public async testAmazonAssociates(): Promise<{ status: IntegrationState; message: string }> {
    const tag = process.env.AMAZON_ASSOCIATES_TAG?.trim();

    if (!tag) {
      return {
        status: "NOT_CONFIGURED",
        message: "لم يتم إدخال AMAZON_ASSOCIATES_TAG بعد."
      };
    }

    // Validate Amazon Associate Tag format (typically e.g. "storename-21" or "mydeal-20")
    const amazonTagRegex = /^[a-zA-Z0-9_-]{3,50}$/;
    if (!amazonTagRegex.test(tag)) {
      return {
        status: "CONNECTION_FAILED",
        message: `صيغة وسم التتبع ${tag} غير مقبولة في أمازون (يجب أن يحتوي على حروف وأرقام وعلامة - فقط).`
      };
    }

    return {
      status: "CONNECTED",
      message: `تم التحقق من وسم تتبع أمازون السعودية (${tag}). محرك التوجيه /go جاهز لتضمين المعرف في كافة روابط المنتجات.`
    };
  }

  // 3. Test Awin (Modular)
  public async testAwin(): Promise<{ status: IntegrationState; message: string }> {
    const apiKey = process.env.AWIN_API_KEY?.trim();
    const pubId = process.env.AWIN_PUBLISHER_ID?.trim();

    if (!apiKey && !pubId) {
      return {
        status: "NOT_CONFIGURED",
        message: "تكامل Awin غير مفعّل (لم يتم إدخال أي مفاتيح)."
      };
    }

    if (!apiKey || !pubId) {
      const missing = !apiKey ? "AWIN_API_KEY" : "AWIN_PUBLISHER_ID";
      return {
        status: "MISSING_CREDENTIALS",
        message: `بيانات Awin غير مكتملة، المتغير الناقص هو: ${missing}`
      };
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`https://api.awin.com/publishers/${pubId}/programmes?accessToken=${apiKey}`, {
        signal: controller.signal,
        headers: { "User-Agent": "SaudiAffiliatePlatform/1.0" }
      });
      clearTimeout(timeout);

      if (res.ok) {
        return {
          status: "CONNECTED",
          message: `تم الاتصال بحساب Awin Publisher (${pubId}) والتحقق من الـ API بنجاح.`
        };
      } else {
        const errorText = await res.text();
        return {
          status: "CONNECTION_FAILED",
          message: `فشل فحص API شبكة Awin (رمز الحالة: ${res.status}): ${errorText.substring(0, 120)}`
        };
      }
    } catch (err: any) {
      return {
        status: "CONNECTION_FAILED",
        message: `تعذر الوصول لخادم Awin API: ${err.message || String(err)}`
      };
    }
  }

  // 4. Test Impact (Modular)
  public async testImpact(): Promise<{ status: IntegrationState; message: string }> {
    const sid = process.env.IMPACT_ACCOUNT_SID?.trim();
    const token = process.env.IMPACT_AUTH_TOKEN?.trim();

    if (!sid && !token) {
      return {
        status: "NOT_CONFIGURED",
        message: "تكامل Impact غير مفعّل."
      };
    }

    if (!sid || !token) {
      return {
        status: "MISSING_CREDENTIALS",
        message: `بيانات Impact ناقصة (${!sid ? "IMPACT_ACCOUNT_SID" : "IMPACT_AUTH_TOKEN"}).`
      };
    }

    try {
      const authHeader = "Basic " + Buffer.from(`${sid}:${token}`).toString("base64");
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`https://api.impact.com/Mediapartners/${sid}/Campaigns`, {
        signal: controller.signal,
        headers: {
          Authorization: authHeader,
          Accept: "application/json"
        }
      });
      clearTimeout(timeout);

      if (res.ok) {
        return {
          status: "CONNECTED",
          message: `تم التحقق من حساب Impact بنجاح (SID: ${sid}).`
        };
      } else {
        return {
          status: "CONNECTION_FAILED",
          message: `فشل التحقق من Impact API (رمز الخطأ: ${res.status}). تأكد من صحة Account SID و Auth Token.`
        };
      }
    } catch (err: any) {
      return {
        status: "CONNECTION_FAILED",
        message: `خطأ في الاتصال بـ Impact API: ${err.message}`
      };
    }
  }

  // 5. Test CJ (Modular)
  public async testCJ(): Promise<{ status: IntegrationState; message: string }> {
    const token = process.env.CJ_PERSONAL_ACCESS_TOKEN?.trim();
    const cid = process.env.CJ_PUBLISHER_CID?.trim();

    if (!token && !cid) {
      return { status: "NOT_CONFIGURED", message: "تكامل CJ غير مفعّل." };
    }
    if (!token || !cid) {
      return {
        status: "MISSING_CREDENTIALS",
        message: `بيانات CJ ناقصة (${!token ? "CJ_PERSONAL_ACCESS_TOKEN" : "CJ_PUBLISHER_CID"}).`
      };
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`https://advertiser-lookup.api.cj.com/v2/advertiser-lookup?requestor-cid=${cid}`, {
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      clearTimeout(timeout);

      if (res.ok) {
        return { status: "CONNECTED", message: `تم التحقق من اتصال CJ Affiliate بنجاح (CID: ${cid}).` };
      } else {
        return { status: "CONNECTION_FAILED", message: `فشل فحص CJ API (رمز: ${res.status}).` };
      }
    } catch (err: any) {
      return { status: "CONNECTION_FAILED", message: `خطأ في اتصال CJ: ${err.message}` };
    }
  }

  // 6. Test Admitad (Modular)
  public async testAdmitad(): Promise<{ status: IntegrationState; message: string }> {
    const clientId = process.env.ADMITAD_CLIENT_ID?.trim();
    const clientSecret = process.env.ADMITAD_CLIENT_SECRET?.trim();

    if (!clientId && !clientSecret) {
      return { status: "NOT_CONFIGURED", message: "تكامل Admitad غير مفعّل." };
    }
    if (!clientId || !clientSecret) {
      return { status: "MISSING_CREDENTIALS", message: "بيانات Admitad ناقصة (Client ID أو Client Secret)." };
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const authHeader = "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

      const res = await fetch("https://api.admitad.com/token/", {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "grant_type=client_credentials&client_id=" + encodeURIComponent(clientId) + "&scope=advcampaigns"
      });
      clearTimeout(timeout);

      if (res.ok) {
        return { status: "CONNECTED", message: "تم التحقق من بيانات OAuth مع شبكة Admitad بنجاح." };
      } else {
        return { status: "CONNECTION_FAILED", message: `فشل التحقق من Admitad (رمز: ${res.status}).` };
      }
    } catch (err: any) {
      return { status: "CONNECTION_FAILED", message: `خطأ اتصال Admitad: ${err.message}` };
    }
  }

  // 7. Test ArabClicks (Modular)
  public async testArabClicks(): Promise<{ status: IntegrationState; message: string }> {
    const key = process.env.ARABCLICKS_API_KEY?.trim();
    const affId = process.env.ARABCLICKS_AFFILIATE_ID?.trim();

    if (!key && !affId) {
      return { status: "NOT_CONFIGURED", message: "تكامل ArabClicks & DCM غير مفعّل." };
    }
    if (!key || !affId) {
      return { status: "MISSING_CREDENTIALS", message: "بيانات ArabClicks ناقصة (API Key أو Affiliate ID)." };
    }

    return {
      status: "CONNECTED",
      message: `تم حفظ بيانات ArabClicks (Affiliate ID: ${affId}) ومحرك التتبع جاهز لتوليد روابط الشبكة.`
    };
  }

  // 8. Test Email Service (Modular / Optional)
  public async testEmailService(): Promise<{ status: IntegrationState; message: string }> {
    const resendKey = process.env.RESEND_API_KEY?.trim();
    const sendgridKey = process.env.SENDGRID_API_KEY?.trim();
    const genericKey = process.env.EMAIL_API_KEY?.trim();

    const activeKey = resendKey || genericKey || sendgridKey;
    if (!activeKey) {
      return {
        status: "NOT_CONFIGURED",
        message: "مزود البريد الإلكتروني غير مفعّل (اختياري، يمكن إضافته في أي وقت)."
      };
    }

    if (resendKey || (genericKey && genericKey.startsWith("re_"))) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const res = await fetch("https://api.resend.com/api_keys", {
          signal: controller.signal,
          headers: { Authorization: `Bearer ${resendKey || genericKey}` }
        });
        clearTimeout(timeout);

        if (res.ok) {
          return { status: "CONNECTED", message: "تم الاتصال بـ Resend API بنجاح وجاهز لبث إشعارات البريد." };
        } else {
          return { status: "CONNECTION_FAILED", message: `فشل التحقق من Resend API Key (رمز: ${res.status}).` };
        }
      } catch (err: any) {
        return { status: "CONNECTION_FAILED", message: `خطأ في الاتصال بـ Resend: ${err.message}` };
      }
    }

    return {
      status: "CONNECTED",
      message: "تم ضبط مفتاح مزود البريد الإلكتروني."
    };
  }

  // 9. Test Gemini AI (Modular / Optional)
  public async testGemini(): Promise<{ status: IntegrationState; message: string }> {
    const key = process.env.GEMINI_API_KEY?.trim();
    if (!key) {
      return {
        status: "NOT_CONFIGURED",
        message: "مفتاح Gemini API غير مسجل (ميزة الذكاء الاصطناعي اختيارية)."
      };
    }

    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "اختبار اتصال موجز للغاية بكلمة واحدة: تم"
      });

      if (response && response.text) {
        return {
          status: "CONNECTED",
          message: "تم اختبار Gemini API بنجاح ومحرك تحليل النيشات جاهز للعمل."
        };
      }
      return {
        status: "CONNECTION_FAILED",
        message: "لم يتم استلام نص من نموذج Gemini."
      };
    } catch (err: any) {
      return {
        status: "CONNECTION_FAILED",
        message: `فشل فحص Gemini API: ${err.message || String(err)}`
      };
    }
  }

  // Get full integration catalog with comprehensive documentation for every variable
  public async getIntegrationCatalog(): Promise<ServiceIntegrationStatus[]> {
    // Database
    const dbTest = await this.testDatabase();
    // Amazon
    const amazonTest = await this.testAmazonAssociates();
    // Awin
    const awinTest = await this.testAwin();
    // Impact
    const impactTest = await this.testImpact();
    // CJ
    const cjTest = await this.testCJ();
    // Admitad
    const admitadTest = await this.testAdmitad();
    // ArabClicks
    const arabclicksTest = await this.testArabClicks();
    // Email
    const emailTest = await this.testEmailService();
    // Gemini
    const geminiTest = await this.testGemini();

    const catalog: ServiceIntegrationStatus[] = [
      // 1. DATABASE (PRIMARY TARGET)
      {
        id: "database",
        name: "PostgreSQL Database",
        arabicName: "قاعدة البيانات السحابية (PostgreSQL)",
        category: "database",
        status: integrationStateOverrides["database"]?.cachedStatus || dbTest.status,
        isEnabled: integrationStateOverrides["database"]?.isEnabled ?? true,
        statusMessage: integrationStateOverrides["database"]?.cachedMessage || dbTest.message,
        lastTestedAt: integrationStateOverrides["database"]?.lastTestedAt || new Date().toISOString(),
        isInitialTarget: true,
        variables: [
          {
            name: "DATABASE_URL",
            type: "Database Connection URL",
            isRequired: false, // Fallback to file db if omitted
            isSet: Boolean(process.env.DATABASE_URL?.trim()),
            previewValue: maskValue(process.env.DATABASE_URL),
            serviceName: "PostgreSQL (Supabase / Neon / Cloud SQL / Neon / Render)",
            dashboardLocation: "Project Settings -> Database -> Connection string (URI) -> Transaction Pooler / Direct",
            requiresApproval: false,
            approvalDetails: "لا يتطلب موافقة، ينشأ فوراً من أي مزود PostgreSQL مجاني أو سحابي.",
            description: "رابط الاتصال الكامل بقاعدة البيانات بصيغة: postgresql://[user]:[password]@[host]:[port]/[database]"
          }
        ]
      },

      // 2. AMAZON ASSOCIATES (CHOSEN INITIAL AFFILIATE NETWORK)
      {
        id: "amazon",
        name: "Amazon Associates (Amazon.sa)",
        arabicName: "أمازون أسوشيتس السعودية",
        category: "affiliate",
        status: integrationStateOverrides["amazon"]?.cachedStatus || amazonTest.status,
        isEnabled: integrationStateOverrides["amazon"]?.isEnabled ?? true,
        statusMessage: integrationStateOverrides["amazon"]?.cachedMessage || amazonTest.message,
        lastTestedAt: integrationStateOverrides["amazon"]?.lastTestedAt || new Date().toISOString(),
        isInitialTarget: true,
        variables: [
          {
            name: "AMAZON_ASSOCIATES_TAG",
            type: "Tracking Tag",
            isRequired: true,
            isSet: Boolean(process.env.AMAZON_ASSOCIATES_TAG?.trim()),
            previewValue: maskValue(process.env.AMAZON_ASSOCIATES_TAG),
            serviceName: "Amazon Associates Saudi Arabia (affiliate-program.amazon.sa)",
            dashboardLocation: "أعلى يمين لوحة تحكم أمازون أسوشيتس (Store ID / Tracking ID) مثل saudideals-21",
            requiresApproval: true,
            approvalDetails: "يتطلب إنشاء حساب في برنامج شركاء أمازون السعودية وتحقيق 3 مبيعات خلال 180 يوماً للموافقة النهائية.",
            description: "المعرّف الخاص بحسابك لتمريره مع كل رابط نقرة واحتساب عمولات التجزئة (4% - 9%)."
          }
        ]
      },

      // 3. AWIN (MODULAR / OPTIONAL)
      {
        id: "awin",
        name: "Awin Affiliate Network",
        arabicName: "شبكة أوين (Awin)",
        category: "affiliate",
        status: integrationStateOverrides["awin"]?.cachedStatus || awinTest.status,
        isEnabled: integrationStateOverrides["awin"]?.isEnabled ?? false,
        statusMessage: integrationStateOverrides["awin"]?.cachedMessage || awinTest.message,
        lastTestedAt: integrationStateOverrides["awin"]?.lastTestedAt,
        isInitialTarget: false,
        variables: [
          {
            name: "AWIN_API_KEY",
            type: "API Token",
            isRequired: true,
            isSet: Boolean(process.env.AWIN_API_KEY?.trim()),
            previewValue: maskValue(process.env.AWIN_API_KEY),
            serviceName: "Awin (awin.com)",
            dashboardLocation: "Account -> API credentials -> API Token",
            requiresApproval: true,
            approvalDetails: "يتطلب حساب ناشر (Publisher Account) وموافقة الشبكة مع إيداع رمزي يتم استرداده.",
            description: "رمز الوصول الشخصي للاتصال بـ Awin API لجلب تقارير المبيعات وحالة البرامج."
          },
          {
            name: "AWIN_PUBLISHER_ID",
            type: "Publisher ID",
            isRequired: true,
            isSet: Boolean(process.env.AWIN_PUBLISHER_ID?.trim()),
            previewValue: maskValue(process.env.AWIN_PUBLISHER_ID),
            serviceName: "Awin",
            dashboardLocation: "أعلى يمين لوحة الناشر (رقم الحساب المكون من 6-7 أرقام)",
            requiresApproval: true,
            approvalDetails: "يظهر بعد اعتماد حساب الناشر.",
            description: "رقم تعريف الناشر لتوليد روابط التتبع والـ ClickRef."
          },
          {
            name: "AWIN_WEBHOOK_SECRET",
            type: "Webhook Secret",
            isRequired: false,
            isSet: Boolean(process.env.AWIN_WEBHOOK_SECRET?.trim()),
            previewValue: maskValue(process.env.AWIN_WEBHOOK_SECRET),
            serviceName: "Awin",
            dashboardLocation: "Toolbox -> Publisher API / Webhook Notifications",
            requiresApproval: false,
            approvalDetails: "ينشأ عند ضبط رابط الويبهوك.",
            description: "مفتاح التوقيع السري للتحقق من مصداقية إشعارات المبيعات الواردة (HMAC-SHA256)."
          }
        ]
      },

      // 4. IMPACT RADIUS (MODULAR / OPTIONAL)
      {
        id: "impact",
        name: "Impact Radius",
        arabicName: "إمباكت راديوس (Impact)",
        category: "affiliate",
        status: integrationStateOverrides["impact"]?.cachedStatus || impactTest.status,
        isEnabled: integrationStateOverrides["impact"]?.isEnabled ?? false,
        statusMessage: integrationStateOverrides["impact"]?.cachedMessage || impactTest.message,
        lastTestedAt: integrationStateOverrides["impact"]?.lastTestedAt,
        isInitialTarget: false,
        variables: [
          {
            name: "IMPACT_ACCOUNT_SID",
            type: "Account ID",
            isRequired: true,
            isSet: Boolean(process.env.IMPACT_ACCOUNT_SID?.trim()),
            previewValue: maskValue(process.env.IMPACT_ACCOUNT_SID),
            serviceName: "Impact (impact.com)",
            dashboardLocation: "Settings -> API Access -> Account SID",
            requiresApproval: true,
            approvalDetails: "يتطلب حساب Media Partner معتمد من Impact.",
            description: "معرّف الحساب الرئيسي للناشر على منصة Impact."
          },
          {
            name: "IMPACT_AUTH_TOKEN",
            type: "Secret Key",
            isRequired: true,
            isSet: Boolean(process.env.IMPACT_AUTH_TOKEN?.trim()),
            previewValue: maskValue(process.env.IMPACT_AUTH_TOKEN),
            serviceName: "Impact",
            dashboardLocation: "Settings -> API Access -> Auth Token",
            requiresApproval: true,
            approvalDetails: "يتم توليده من لوحة المطورين.",
            description: "مفتاح المصادقة السري للوصول إلى REST API."
          },
          {
            name: "IMPACT_WEBHOOK_SECRET",
            type: "Webhook Secret",
            isRequired: false,
            isSet: Boolean(process.env.IMPACT_WEBHOOK_SECRET?.trim()),
            previewValue: maskValue(process.env.IMPACT_WEBHOOK_SECRET),
            serviceName: "Impact",
            dashboardLocation: "Settings -> Event Notifications -> Webhook Secret",
            requiresApproval: false,
            approvalDetails: "اختياري لتأمين الويبهوك.",
            description: "مفتاح التحقق من توقيع إشعارات التحويلات اللحظية."
          }
        ]
      },

      // 5. CJ AFFILIATE (MODULAR / OPTIONAL)
      {
        id: "cj",
        name: "CJ Affiliate (Commission Junction)",
        arabicName: "سي جيه أفلييت (CJ)",
        category: "affiliate",
        status: integrationStateOverrides["cj"]?.cachedStatus || cjTest.status,
        isEnabled: integrationStateOverrides["cj"]?.isEnabled ?? false,
        statusMessage: integrationStateOverrides["cj"]?.cachedMessage || cjTest.message,
        lastTestedAt: integrationStateOverrides["cj"]?.lastTestedAt,
        isInitialTarget: false,
        variables: [
          {
            name: "CJ_PERSONAL_ACCESS_TOKEN",
            type: "API Token",
            isRequired: true,
            isSet: Boolean(process.env.CJ_PERSONAL_ACCESS_TOKEN?.trim()),
            previewValue: maskValue(process.env.CJ_PERSONAL_ACCESS_TOKEN),
            serviceName: "CJ Affiliate (cj.com)",
            dashboardLocation: "Account -> Users -> Personal Access Tokens",
            requiresApproval: true,
            approvalDetails: "يتطلب حساب ناشر معتمد في CJ.",
            description: "توكن الوصول الشخصي لربط واجهة برمجة تطبيقات CJ."
          },
          {
            name: "CJ_PUBLISHER_CID",
            type: "Publisher ID",
            isRequired: true,
            isSet: Boolean(process.env.CJ_PUBLISHER_CID?.trim()),
            previewValue: maskValue(process.env.CJ_PUBLISHER_CID),
            serviceName: "CJ Affiliate",
            dashboardLocation: "أعلى الصفحة الرئيسية (CID رقم الحساب الخاص بك)",
            requiresApproval: true,
            approvalDetails: "يمنح مع حساب الناشر.",
            description: "معرف الناشر الترويجي (Company ID / CID)."
          }
        ]
      },

      // 6. ADMITAD (MODULAR / OPTIONAL)
      {
        id: "admitad",
        name: "Admitad",
        arabicName: "أدميتاد (Admitad)",
        category: "affiliate",
        status: integrationStateOverrides["admitad"]?.cachedStatus || admitadTest.status,
        isEnabled: integrationStateOverrides["admitad"]?.isEnabled ?? false,
        statusMessage: integrationStateOverrides["admitad"]?.cachedMessage || admitadTest.message,
        lastTestedAt: integrationStateOverrides["admitad"]?.lastTestedAt,
        isInitialTarget: false,
        variables: [
          {
            name: "ADMITAD_CLIENT_ID",
            type: "Account ID",
            isRequired: true,
            isSet: Boolean(process.env.ADMITAD_CLIENT_ID?.trim()),
            previewValue: maskValue(process.env.ADMITAD_CLIENT_ID),
            serviceName: "Admitad (admitad.com)",
            dashboardLocation: "Settings -> API and Webhooks -> API Clients",
            requiresApproval: true,
            approvalDetails: "يتطلب حساب ناشر وإنشاء تطبيق OAuth في قسم المطورين.",
            description: "معرف العميل لتطبيق OAuth للربط مع Admitad API."
          },
          {
            name: "ADMITAD_CLIENT_SECRET",
            type: "Secret Key",
            isRequired: true,
            isSet: Boolean(process.env.ADMITAD_CLIENT_SECRET?.trim()),
            previewValue: maskValue(process.env.ADMITAD_CLIENT_SECRET),
            serviceName: "Admitad",
            dashboardLocation: "Settings -> API and Webhooks -> API Clients -> Secret",
            requiresApproval: true,
            approvalDetails: "يظهر عند إنشاء تطبيق الـ API.",
            description: "المفتاح السري لتوليد OAuth Access Token."
          }
        ]
      },

      // 7. ARABCLICKS / DCM (MODULAR / OPTIONAL)
      {
        id: "arabclicks",
        name: "ArabClicks & DCM Network",
        arabicName: "عرب كليكس ودي سي إم نتورك",
        category: "affiliate",
        status: integrationStateOverrides["arabclicks"]?.cachedStatus || arabclicksTest.status,
        isEnabled: integrationStateOverrides["arabclicks"]?.isEnabled ?? false,
        statusMessage: integrationStateOverrides["arabclicks"]?.cachedMessage || arabclicksTest.message,
        lastTestedAt: integrationStateOverrides["arabclicks"]?.lastTestedAt,
        isInitialTarget: false,
        variables: [
          {
            name: "ARABCLICKS_API_KEY",
            type: "API Token",
            isRequired: true,
            isSet: Boolean(process.env.ARABCLICKS_API_KEY?.trim()),
            previewValue: maskValue(process.env.ARABCLICKS_API_KEY),
            serviceName: "ArabClicks / DCM Network",
            dashboardLocation: "Tools -> API Keys -> API Key (HasOffers / Tune platform)",
            requiresApproval: true,
            approvalDetails: "يتطلب موافقة مدير الحساب (Account Manager) في الشبكة.",
            description: "مفتاح API الخاص بحسابك لسحب العروض وروابط الكوبونات."
          },
          {
            name: "ARABCLICKS_AFFILIATE_ID",
            type: "Publisher ID",
            isRequired: true,
            isSet: Boolean(process.env.ARABCLICKS_AFFILIATE_ID?.trim()),
            previewValue: maskValue(process.env.ARABCLICKS_AFFILIATE_ID),
            serviceName: "ArabClicks",
            dashboardLocation: "الصفحة الرئيسية (Affiliate ID / User ID)",
            requiresApproval: true,
            approvalDetails: "يمنح مع اعتماد الحساب.",
            description: "معرّف الشريك لتوليد معاملات التتبع الفرعية (aff_sub)."
          }
        ]
      },

      // 8. EMAIL SERVICE (MODULAR / OPTIONAL)
      {
        id: "email",
        name: "Email Delivery Provider (Resend / SendGrid / Brevo)",
        arabicName: "خدمة إرسال البريد الإلكتروني والتنبيهات",
        category: "email",
        status: integrationStateOverrides["email"]?.cachedStatus || emailTest.status,
        isEnabled: integrationStateOverrides["email"]?.isEnabled ?? false,
        statusMessage: integrationStateOverrides["email"]?.cachedMessage || emailTest.message,
        lastTestedAt: integrationStateOverrides["email"]?.lastTestedAt,
        isInitialTarget: false,
        variables: [
          {
            name: "RESEND_API_KEY",
            type: "API Token",
            isRequired: false,
            isSet: Boolean(process.env.RESEND_API_KEY?.trim()),
            previewValue: maskValue(process.env.RESEND_API_KEY),
            serviceName: "Resend (resend.com)",
            dashboardLocation: "API Keys -> Create API Key",
            requiresApproval: false,
            approvalDetails: "تسجيل فوري، يتطلب التحقق من دومين الإرسال (DNS Records).",
            description: "مفتاح API الموصى به لإرسال تنبيهات الكوبونات وتأكيد الاشتراك الفوري."
          },
          {
            name: "EMAIL_FROM",
            type: "Email Configuration",
            isRequired: false,
            isSet: Boolean(process.env.EMAIL_FROM?.trim()),
            previewValue: process.env.EMAIL_FROM || "deals@saudicoupons.com",
            serviceName: "Email Configuration",
            dashboardLocation: "Verified Domains in Resend/SendGrid",
            requiresApproval: false,
            approvalDetails: "يتطلب إضافة سجلات SPF و DKIM للدومين.",
            description: "عنوان البريد الإلكتروني الذي ستصل منه الرسائل للمشتركين."
          }
        ]
      },

      // 9. GEMINI AI (MODULAR / OPTIONAL)
      {
        id: "gemini",
        name: "Google Gemini AI Engine",
        arabicName: "محرك الذكاء الاصطناعي (Gemini)",
        category: "ai",
        status: integrationStateOverrides["gemini"]?.cachedStatus || geminiTest.status,
        isEnabled: integrationStateOverrides["gemini"]?.isEnabled ?? false,
        statusMessage: integrationStateOverrides["gemini"]?.cachedMessage || geminiTest.message,
        lastTestedAt: integrationStateOverrides["gemini"]?.lastTestedAt,
        isInitialTarget: false,
        variables: [
          {
            name: "GEMINI_API_KEY",
            type: "Secret Key",
            isRequired: false,
            isSet: Boolean(process.env.GEMINI_API_KEY?.trim()),
            previewValue: maskValue(process.env.GEMINI_API_KEY),
            serviceName: "Google AI Studio (ai.google.dev)",
            dashboardLocation: "Get API Key -> Create API key in new/existing project",
            requiresApproval: false,
            approvalDetails: "ينشأ مجاناً وفوراً من منصة Google AI Studio.",
            description: "مفتاح التحليل الذكي للنيشات، اقتراح الكلمات المفتاحية، وتصنيف عروض المتاجر تلقائياً."
          }
        ]
      }
    ];

    return catalog;
  }

  // Run test on a specific service
  public async testSingleService(serviceId: string): Promise<{ status: IntegrationState; message: string }> {
    let result: { status: IntegrationState; message: string };

    switch (serviceId) {
      case "database":
        result = await this.testDatabase();
        break;
      case "amazon":
        result = await this.testAmazonAssociates();
        break;
      case "awin":
        result = await this.testAwin();
        break;
      case "impact":
        result = await this.testImpact();
        break;
      case "cj":
        result = await this.testCJ();
        break;
      case "admitad":
        result = await this.testAdmitad();
        break;
      case "arabclicks":
        result = await this.testArabClicks();
        break;
      case "email":
        result = await this.testEmailService();
        break;
      case "gemini":
        result = await this.testGemini();
        break;
      default:
        result = { status: "NOT_CONFIGURED", message: "الخدمة المحددة غير موجودة." };
    }

    integrationStateOverrides[serviceId] = {
      ...integrationStateOverrides[serviceId],
      cachedStatus: result.status,
      cachedMessage: result.message,
      lastTestedAt: new Date().toISOString()
    };

    return result;
  }

  // Toggle enable / disable modular integration
  public toggleService(serviceId: string, isEnabled: boolean): boolean {
    integrationStateOverrides[serviceId] = {
      ...integrationStateOverrides[serviceId],
      isEnabled
    };
    return isEnabled;
  }
}

export const integrationService = IntegrationService.getInstance();
