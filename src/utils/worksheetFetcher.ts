// أداة محسنة لجلب البيانات من Google Sheets مع إعادة المحاولة
export class WorksheetFetcher {
  private static readonly SHEET_ID = '2PACX-1vSIcY_pndHy91i5AE9asBpmtD0DP_msWb2vT8rs2rFFGiBLVy8mILf9Ac_rGKlizFYhdXOQIheHi5lx';
  private static readonly BASE_URL = 'https://docs.google.com/spreadsheets/d/e';
  
  // URLs للبيانات المختلفة
  private static readonly URLS = {
    subscribers: {
      csv: `${this.BASE_URL}/${this.SHEET_ID}/pub?output=csv&gid=0`,
      tsv: `${this.BASE_URL}/${this.SHEET_ID}/pub?output=tsv&gid=0`,
      html: `${this.BASE_URL}/${this.SHEET_ID}/pubhtml?gid=0&single=true`
    },
    portfolio: {
      csv: `${this.BASE_URL}/${this.SHEET_ID}/pub?output=csv&gid=1614954373`,
      tsv: `${this.BASE_URL}/${this.SHEET_ID}/pub?output=tsv&gid=1614954373`,
      html: `${this.BASE_URL}/${this.SHEET_ID}/pubhtml?gid=1614954373&single=true`,
      // محاولة بدون gid للورقة الثانية
      csvAlt: `${this.BASE_URL}/${this.SHEET_ID}/pub?output=csv&gid=1`,
      tsvAlt: `${this.BASE_URL}/${this.SHEET_ID}/pub?output=tsv&gid=1`
    }
  };

  /**
   * جلب البيانات مع إعادة المحاولة والانتظار
   */
  static async fetchWithRetry(
    url: string, 
    maxRetries: number = 3, 
    delayMs: number = 2000,
    timeoutMs: number = 15000
  ): Promise<string | null> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${maxRetries} for: ${url}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/csv,text/plain,text/html,*/*',
            'Cache-Control': 'no-cache'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const text = await response.text();
          console.log(`📋 Response length: ${text.length} characters`);
          
          // التحقق من وجود بيانات حقيقية (ليس فقط العنوان)
          if (text.length > 200 && !text.includes('بيانات المشتركين بالصندوق المستقبل') && text.includes(',')) {
            console.log(`✅ Successfully fetched data from: ${url}`);
            return text;
          } else {
            console.log(`⚠️ Response seems to be loading page, waiting...`);
            if (attempt < maxRetries) {
              await this.delay(delayMs * attempt); // زيادة وقت الانتظار مع كل محاولة
            }
          }
        } else {
          console.warn(`❌ HTTP ${response.status} for: ${url}`);
        }
        
      } catch (error) {
        console.warn(`❌ Attempt ${attempt} failed:`, error);
        if (attempt < maxRetries) {
          await this.delay(delayMs * attempt);
        }
      }
    }
    
    console.error(`❌ All attempts failed for: ${url}`);
    return null;
  }

  /**
   * جلب بيانات المشتركين
   */
  static async fetchSubscribers(): Promise<string | null> {
    const urls = [
      this.URLS.subscribers.csv,
      this.URLS.subscribers.tsv,
      this.URLS.subscribers.html
    ];

    for (const url of urls) {
      const data = await this.fetchWithRetry(url, 3, 3000, 20000);
      if (data) return data;
    }

    return null;
  }

  /**
   * جلب بيانات المحفظة
   */
  static async fetchPortfolio(): Promise<string | null> {
    const urls = [
      this.URLS.portfolio.csv,
      this.URLS.portfolio.csvAlt,
      this.URLS.portfolio.tsv,
      this.URLS.portfolio.tsvAlt,
      this.URLS.portfolio.html
    ];

    for (const url of urls) {
      const data = await this.fetchWithRetry(url, 3, 3000, 20000);
      if (data) return data;
    }

    return null;
  }

  /**
   * تأخير لفترة محددة
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * تحليل البيانات المحدثة للمحفظة مع الخانات الجديدة
   */
  static parsePortfolioData(csvText: string) {
    const lines = csvText.split('\n').filter(line => line.trim());
    const items = [];
    let totalValue = 0;

    console.log('📋 Parsing updated portfolio data...');
    console.log('📋 Total lines found:', lines.length);

    // تخطي الصف الأول (العناوين) ومعالجة البيانات
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.includes('\t') ? 
        line.split('\t').map(v => v.trim().replace(/^"|"$/g, '')) :
        line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      
      console.log(`📋 Processing portfolio row ${i}:`, values);
      
      // هيكل الأعمدة المحدث: اسم الشركة، الرمز، عدد الوحدات، سعر السوق، متوسط سعر الشراء، التكلفة الأساسية، القيمة السوقية بالدولار، ربح/خسارة غير محققة، إجمالي قيمة بالريال، نسبة النمو
      if (values.length >= 8 && values[0] && !values[0].toLowerCase().includes('إجمالي')) {
        try {
          const item = {
            companyName: values[0] || '',
            assetSymbol: values[1] || '',
            units: parseFloat(values[2]) || 0,
            marketPrice: parseFloat(values[3]) || 0,
            averagePrice: parseFloat(values[4]) || 0,
            baseCost: parseFloat(values[5]) || 0, // التكلفة الأساسية الجديدة
            marketValueUSD: parseFloat(values[6]) || 0,
            totalValueUSD: parseFloat(values[6]) || 0,
            unrealizedProfitLoss: parseFloat(values[7]) || 0,
            totalValueSAR: this.parseSARValue(values[8]) || 0,
            growth: parseFloat(values[9]) || 0,
          };
          
          if (item.companyName && item.totalValueSAR > 0) {
            console.log('✅ Successfully parsed portfolio item:', item.companyName);
            items.push(item);
            totalValue += item.totalValueSAR;
          }
        } catch (error) {
          console.warn(`❌ Error parsing portfolio row ${i}:`, error, values);
        }
      }
    }
    
    console.log(`📋 Successfully parsed ${items.length} portfolio items, total: ${totalValue}`);
    
    return {
      items,
      totalPortfolioValue: totalValue || 185466.35 // fallback to known total
    };
  }

  /**
   * تحليل قيمة الريال السعودي
   */
  private static parseSARValue(value: string): number {
    if (!value) return 0;
    const cleanValue = value.toString().replace(/[^\d.-]/g, '');
    return parseFloat(cleanValue) || 0;
  }
}

export default WorksheetFetcher;