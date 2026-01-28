import { Hono } from "hono";
import { cors } from "hono/cors";
import { sign, verify } from "hono/jwt";
import type { Client } from "@sdk/server-types";
import { tables } from "@generated";
import { eq } from "drizzle-orm";
import Papa from "papaparse";

const JWT_SECRET = "youware-secret-key-change-this";
const DEFAULT_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSIcY_pndHy91i5AE9asBpmtD0DP_msWb2vT8rs2rFFGiBLVy8mILf9Ac_rGKlizFYhdXOQIheHi5lx/pub?output=csv";

const DEFAULT_CSV_DATA = `رقم المرور,اسم المشترك,رقم المشترك,عدد الاسهم,إجمالي مدخراتك,دفعة شهرية (ريال),قيمة سهم الاساس,قيمة سهم الحالي,القيمة الحقيقة لمحفظتك,نسبة تملك في صندوق,نسبة النمو المحفظة,راس المال المحفظة,رابط الصورة
536003223,جعفر طاهر النزر,1,40,SAR36٬000,SAR2٬000,SAR900,SAR952٫82,SAR38٬112٫86,19٫70%,5٫9%,SAR168٬300,
504996691,عباس صالح النزر,2,24,21600,1200,,,SAR22٬867٫71,11٫82%,5٫9%,,
545473331,محمد دعبل العثمان,3,5,4000,1000,,,SAR4٬764٫11,9٫85%,5٫9%,,
560090953,يوسف أحمد المحمدعلي,4,15,13500,750,,,SAR14٬292٫32,7٫39%,5٫9%,,
551567697,علي طاهر النزر,5,10,9000,500,,,SAR9٬528٫21,4٫93%,5٫9%,,
551679520,حسن علي النزر,6,10,9000,500,,,SAR9٬528٫21,4٫93%,5٫9%,,
561930452,عبدالخالق أحمد المحمدعلي,7,10,9000,500,,,SAR9٬528٫21,4٫93%,5٫9%,,
582299942,أحمد علي العثمان,8,10,9000,500,,,SAR9٬528٫21,4٫93%,5٫9%,,
550978601,علي عبدالله الشهاب,9,10,9000,500,,,SAR9٬528٫21,4٫93%,5٫9%,,
537926814,معصومة الجبران,10,7,6300,350,,,SAR6٬669٫75,3٫45%,5٫9%,,
506394798,عباس طاهر النزر,11,6,5400,300,,,SAR5٬716٫93,2٫96%,5٫9%,,
567935956,قاسم  طاهرالنزر,12,6,5400,300,,,SAR5٬716٫93,2٫96%,5٫9%,,
500895023,عبدالمجيد جعفر النزر,13,6,5400,300,,,SAR5٬716٫93,2٫96%,5٫9%,,
569373888,محمد طاهر النزر,14,4,3600,200,,,SAR3٬811٫29,1٫97%,5٫9%,,
569221338,محمد المحمدعلي,15,4,3050,200,,,SAR3٬811٫29,1٫97%,5٫9%,,
552657630,زينب النزر,16,6,5400,300,,,SAR5٬716٫93,2٫96%,5٫9%,,
551257703,مريم النزر,17,3,2700,150,,,SAR2٬858٫46,1٫48%,5٫9%,,
562087772,أسماء المطلق,18,3,2700,150,,,SAR2٬858٫46,1٫48%,5٫9%,,
542626031,حوراء المطلق,19,3,2700,150,,,SAR2٬858٫46,1٫48%,5٫9%,,
537926876,زهره الشهاب,20,3,2850,150,,,SAR2٬858٫46,1٫48%,5٫9%,,
564519351,أحمد طاهر المطلق,21,3,2700,150,,,SAR2٬858٫46,1٫48%,5٫9%,,
,المجموع,21,188,SAR168٬300,SAR10٬150,,SAR10٬830٫43,SAR179٬130٫43,100%,,,`;

const DEFAULT_PORTFOLIO_DATA = `اسم الصندوق,الرمز,عدد الوحدات (عددالاسهم),سعر السوق ,إجمالي القيمة بالدولار,إجمالي القيمة بالريال 
يغطي الأسهم الامريكية الكبرى (S&P500),SPUS,257,52٫19,$13٬412٫83,SAR50٬298٫11
يغطي قطاع التكنلوجيا العالمي (بمافيه أمريكيا )	,SPTE,109,38٫13,$4٬156٫17,SAR15٬585٫64
(الأسواق المتقدمة والناشئة بإستثناء أمريكا),SPWO,0,30,$0٫00,SAR0٫00
البيتكوين,IBIT,41,50٫45,$2٬068٫45,SAR7٬756٫69
ذهب ,GLDM,0,101٫78,$0٫00,SAR0٫00
صكوك,Deeds,51,,$0٫00,SAR58٬467٫00
صندوق مبادر للقروض,Loan Fund,,,,SAR40٬093٫00
وديعة,,,,,SAR22٬508٫00
إجمالي المحفظة,,,,$19٬637٫45,SAR194٬576٫10`;

export async function createApp(
  edgespark: Client<typeof tables>
): Promise<Hono> {
  const app = new Hono();

  // Enable CORS
  app.use("/*", cors());

  app.get("/api/public/health", (c) => c.text("Hello from Backend"));

  // Helper to get Sheet URL
  async function getSheetUrl() {
    const config = await edgespark.db
      .select()
      .from(tables.adminConfig)
      .where(eq(tables.adminConfig.key, "sheet_url"))
      .get();
    return config?.value || DEFAULT_SHEET_URL;
  }

  // Helper to fetch and parse Sheet Data
  async function fetchSheetData(url: string) {
    try {
      let csvText = "";
      
      if (url === "embedded") {
        csvText = DEFAULT_CSV_DATA;
      } else {
        // Ensure URL is in CSV export format
        let csvUrl = url;
        if (url.includes("docs.google.com/spreadsheets")) {
          if (url.includes("/pubhtml")) {
             csvUrl = url.replace("/pubhtml", "/pub?output=csv");
          } else if (url.includes("/edit")) {
             csvUrl = url.replace(/\/edit.*$/, "/export?format=csv");
          }
        }

        try {
          const response = await fetch(csvUrl);
          if (!response.ok) throw new Error("Failed to fetch sheet");
          csvText = await response.text();
        } catch (e) {
          console.warn("Failed to fetch remote sheet, falling back to embedded data", e);
          csvText = DEFAULT_CSV_DATA;
        }
      }
      
      const result = Papa.parse(csvText, { 
        header: true, 
        skipEmptyLines: true,
        transformHeader: (h) => h.trim()
      });
      return result.data as any[];
    } catch (e) {
      console.error("Sheet fetch error:", e);
      return [];
    }
  }

  // Helper to safely parse numbers, removing currency symbols or commas
  const parseNum = (val: any) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    let str = val.toString();
    // Replace Arabic decimal separator with dot
    str = str.replace(/٫/g, '.');
    // Remove Arabic thousands separator
    str = str.replace(/٬/g, '');
    // Remove other non-numeric chars (keeping dot and minus)
    return Number(str.replace(/[^\d.-]/g, '')) || 0;
  };

  // Helper to map row to user object using Arabic Column Names
  function mapRowToUser(row: any) {
    return {
      fullName: (row["اسم المشترك"] || row["Name"] || "").trim(),
      phoneNumber: (row["رقم المرور"] || row["Phone"] || "").toString().trim(),
      subscriberNumber: row["رقم المشترك"] || row["SubscriberID"] || "",
      sharesCount: parseNum(row["عدد الاسهم"] || row["Shares"]),
      totalSavings: parseNum(row["إجمالي مدخراتك"] || row["TotalSavings"]),
      monthlyPayment: parseNum(row["دفعة شهرية (ريال)"] || row["MonthlyPayment"]),
      baseShareValue: parseNum(row["قيمة سهم الاساس"] || row["BaseShareValue"]),
      currentShareValue: parseNum(row["قيمة سهم الحالي"] || row["CurrentShareValue"]),
      realPortfolioValue: parseNum(row["القيمة الحقيقة لمحفظتك"] || row["TotalAmount"]),
      ownershipPercentage: parseNum(row["نسبة تملك في صندوق"] || row["OwnershipPercentage"]),
      growthPercentage: parseNum(row["نسبة النمو المحفظة"] || row["GrowthPercentage"]),
      // Derived or extra fields
      totalIncome: 0,
      profileImage: "" 
    };
  }

  // Helper to map portfolio items
  function mapPortfolioItem(row: any) {
    const companyName = (row["اسم الصندوق"] || "").trim();
    // Deterministic mock growth
    const hash = companyName.split("").reduce((a: number, b: string) => a + b.charCodeAt(0), 0);
    const mockGrowth = ((hash % 200) - 50) / 10; // -5.0% to +15.0%

    return {
      companyName,
      assetSymbol: (row["الرمز"] || "").trim(),
      units: parseNum(row["عدد الوحدات (عددالاسهم)"]),
      marketPrice: parseNum(row["سعر السوق"]),
      totalValueUSD: parseNum(row["إجمالي القيمة بالدولار"]),
      totalValueSAR: parseNum(row["إجمالي القيمة بالريال"]),
      growth: mockGrowth
    };
  }

  // ==========================================
  // Admin Routes
  // ==========================================

  // Save Config
  app.post("/api/public/admin/config", async (c) => {
    const { sheetUrl } = await c.req.json();
    if (!sheetUrl) return c.json({ error: "URL required" }, 400);

    const existing = await edgespark.db
      .select()
      .from(tables.adminConfig)
      .where(eq(tables.adminConfig.key, "sheet_url"))
      .get();

    if (existing) {
      await edgespark.db
        .update(tables.adminConfig)
        .set({ value: sheetUrl })
        .where(eq(tables.adminConfig.key, "sheet_url"));
    } else {
      await edgespark.db.insert(tables.adminConfig).values({
        key: "sheet_url",
        value: sheetUrl,
      });
    }

    return c.json({ success: true });
  });

  // Get Config
  app.get("/api/public/admin/config", async (c) => {
    const url = await getSheetUrl();
    return c.json({ sheetUrl: url });
  });

  // Get Subscribers (Admin)
  app.get("/api/public/admin/subscribers", async (c) => {
    const url = await getSheetUrl();
    const data = await fetchSheetData(url);
    
    // Filter out total row and map
    const users = data
      .filter((row: any) => row["اسم المشترك"] && row["اسم المشترك"] !== "المجموع")
      .map(mapRowToUser);

    // Fetch profile images from DB
    const profileImages = await edgespark.db.select().from(tables.userProfiles).all();
    const imageMap = new Map(profileImages.map(p => [p.subscriberNumber, p.imageUrl]));

    // Merge images
    const usersWithImages = users.map(u => ({
      ...u,
      profileImage: imageMap.get(u.subscriberNumber) || ""
    }));

    return c.json(usersWithImages);
  });

  // ==========================================
  // Public/User Routes
  // ==========================================

  // Login
  app.post("/api/public/login", async (c) => {
    const { phoneNumber, password } = await c.req.json();
    
    const url = await getSheetUrl();
    const data = await fetchSheetData(url);
    
    // Find user by phone number (acting as password/login)
    // In this system, phone number is the key identifier
    const userRow = data.find((row: any) => {
      const phone = (row["رقم المرور"] || row["Phone"] || "").toString().trim();
      return phone === phoneNumber;
    });

    if (!userRow) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const user = mapRowToUser(userRow);
    
    // Create JWT
    const token = await sign({ 
      sub: user.subscriberNumber,
      role: "user",
      name: user.fullName
    }, JWT_SECRET);

    return c.json({ token, user });
  });

  // Update Profile Image
  app.post("/api/public/user/profile-image", async (c) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) return c.json({ error: "Unauthorized" }, 401);

    const token = authHeader.split(" ")[1];
    try {
      const payload = await verify(token, JWT_SECRET, "HS256");
      const userId = payload.sub as string;
      const { imageUrl } = await c.req.json();

      const existing = await edgespark.db
        .select()
        .from(tables.userProfiles)
        .where(eq(tables.userProfiles.subscriberNumber, userId))
        .get();

      if (existing) {
        await edgespark.db
          .update(tables.userProfiles)
          .set({ imageUrl })
          .where(eq(tables.userProfiles.subscriberNumber, userId));
      } else {
        await edgespark.db.insert(tables.userProfiles).values({
          subscriberNumber: userId,
          imageUrl,
        });
      }

      return c.json({ success: true });
    } catch (e) {
      return c.json({ error: "Invalid token" }, 401);
    }
  });

  // Get Current User
  app.get("/api/public/user/me", async (c) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) return c.json({ error: "Unauthorized" }, 401);

    const token = authHeader.split(" ")[1];
    try {
      const payload = await verify(token, JWT_SECRET, "HS256");
      const userId = payload.sub as string;

      const url = await getSheetUrl();
      const data = await fetchSheetData(url);
      
      const userRow = data.find((row: any) => {
        const id = row["رقم المشترك"] || row["SubscriberID"];
        return id == userId;
      });

      if (!userRow) return c.json({ error: "User not found" }, 404);

      const user = mapRowToUser(userRow);

      // Get profile image
      const profile = await edgespark.db
        .select()
        .from(tables.userProfiles)
        .where(eq(tables.userProfiles.subscriberNumber, userId))
        .get();
      
      if (profile) {
        user.profileImage = profile.imageUrl;
      }

      return c.json(user);
    } catch (e) {
      return c.json({ error: "Invalid token" }, 401);
    }
  });

  // Helper to parse portfolio data
  function parsePortfolioData(csvText: string) {
    const result = Papa.parse(csvText, { 
      header: true, 
      skipEmptyLines: true,
      transformHeader: (h) => h.trim()
    });

    const items = result.data.filter((row: any) => {
      // Filter out the total row if it exists
      return row["اسم الصندوق"] && row["اسم الصندوق"] !== "إجمالي المحفظة";
    }).map(mapPortfolioItem);

    // Try to find the total row
    const totalRow = result.data.find((row: any) => row["اسم الصندوق"] === "إجمالي المحفظة") as any;
    let totalPortfolioValue = 0;
    if (totalRow) {
       totalPortfolioValue = parseNum(totalRow["إجمالي القيمة بالريال"]);
    } else {
       // Calculate if not found
       totalPortfolioValue = items.reduce((sum, item) => sum + item.totalValueSAR, 0);
    }
    
    return { items, totalPortfolioValue };
  }

  // Get Portfolio Data (Public for now, or protected)
  app.get("/api/public/portfolio", async (c) => {
    // For now, using embedded portfolio data as it's separate from the subscriber sheet
    // In a real scenario, this might come from a second sheet or different URL
    const data = parsePortfolioData(DEFAULT_PORTFOLIO_DATA);
    return c.json(data);
  });

  return app;
}
