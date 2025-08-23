import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔄 Starting news fetch from Google News...');
    
    // Use gnews on the server side
    const gnews = require('gnews');
    
    // Fetch multiple news categories related to compliance and security with more recent focus
    const searchQueries = [
      'compliance today',
      'cybersecurity breaking news',
      'data privacy latest',
      'GDPR news today',
      'web accessibility updates',
      'information security breaking',
      'regulatory compliance latest',
      'data protection today',
      'compliance technology',
      'cybersecurity threats today',
      'privacy laws breaking',
      'compliance automation'
    ];
    
    console.log(`📰 Fetching news for ${searchQueries.length} queries...`);
    
    // Fetch news for each query with more recent focus
    const newsPromises = searchQueries.map(async (query: string) => {
      try {
        console.log(`🔍 Searching for: ${query}`);
        // Get more articles per query and focus on recent news
        const articles = await gnews.search(query, { 
          n: 5, 
          language: 'en',
          country: 'us',
          period: '1d' // Focus on last 24 hours
        });
        console.log(`✅ Found ${articles.length} articles for: ${query}`);
        return articles.map((article: any) => ({
          title: article.title,
          link: article.link,
          pubDate: article.pubDate,
          source: article.source || 'Google News',
          description: article.description || '',
          query: query
        }));
      } catch (err) {
        console.error(`❌ Error fetching news for ${query}:`, err);
        return [];
      }
    });
    
    const results = await Promise.all(newsPromises);
    
    // Combine and deduplicate articles
    const allArticles = results.flat();
    console.log(`📊 Total articles found: ${allArticles.length}`);
    
    const uniqueArticles = allArticles.filter((article: any, index: number, self: any[]) => 
      index === self.findIndex((a: any) => a.link === article.link)
    );
    console.log(`🔗 Unique articles after deduplication: ${uniqueArticles.length}`);
    
    // Sort by date (most recent first) and filter out very old articles
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentArticles = uniqueArticles
      .filter((article: any) => {
        if (!article.title || !article.link || !article.pubDate) return false;
        
        // Parse the publication date
        const pubDate = new Date(article.pubDate);
        return pubDate >= oneWeekAgo; // Only include articles from last week
      })
      .sort((a: any, b: any) => {
        // Sort by date (most recent first)
        const dateA = new Date(a.pubDate);
        const dateB = new Date(b.pubDate);
        return dateB.getTime() - dateA.getTime();
      });
    
    console.log(`📅 Recent articles (last week): ${recentArticles.length}`);
    
    // Transform and limit to 25 articles (more for pagination testing)
    const transformedNews = recentArticles
      .slice(0, 25)
      .map((article: any) => ({
        title: article.title,
        link: article.link,
        pubDate: article.pubDate,
        source: article.source,
        description: article.description
      }));
    
    console.log(`🎯 Final news count: ${transformedNews.length}`);
    
    // If we don't have enough recent articles, try getting some from headlines
    if (transformedNews.length < 8) {
      try {
        console.log('📰 Fetching additional headlines...');
        const headlines = await gnews.headlines({ 
          n: 10, 
          language: 'en',
          country: 'us'
        });
        
        const headlineArticles = headlines
          .filter((article: any) => {
            // Filter for compliance/security related headlines
            const title = article.title.toLowerCase();
            const keywords = ['compliance', 'security', 'privacy', 'gdpr', 'cyber', 'data', 'regulation', 'audit'];
            return keywords.some(keyword => title.includes(keyword));
          })
          .map((article: any) => ({
            title: article.title,
            link: article.link,
            pubDate: article.pubDate,
            source: article.source || 'Google News',
            description: article.description || ''
          }));
        
        // Combine with existing articles and deduplicate
        const combinedArticles = [...transformedNews, ...headlineArticles];
        const finalArticles = combinedArticles.filter((article, index, self) => 
          index === self.findIndex(a => a.link === article.link)
        );
        
        const finalNews = finalArticles
          .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
          .slice(0, 15);
        
        console.log(`🎯 Final news count with headlines: ${finalNews.length}`);
        
        return NextResponse.json({ 
          success: true, 
          news: finalNews,
          count: finalNews.length 
        });
      } catch (headlineError) {
        console.error('❌ Error fetching headlines:', headlineError);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      news: transformedNews,
      count: transformedNews.length 
    });
    
  } catch (error) {
    console.error('❌ Error in news API route:', error);
    
    // Return fallback data with more recent timestamps
    const fallbackNews = [
      {
        title: "Breaking: New AI-Powered Compliance Tools Revolutionize Website Security",
        link: "https://techcrunch.com/2024/01/ai-compliance-tools/",
        pubDate: new Date().toISOString(),
        source: "TechCrunch",
        description: "New AI-driven compliance scanning tools are transforming how businesses ensure website security and regulatory compliance."
      },
      {
        title: "Latest: GDPR Compliance Updates for 2024 - New Requirements",
        link: "https://www.zdnet.com/article/gdpr-updates-2024/",
        pubDate: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        source: "ZDNet",
        description: "Stay updated with the latest GDPR compliance requirements and implementation strategies for 2024."
      },
      {
        title: "Breaking: New WCAG 3.0 Guidelines Released Today",
        link: "https://www.w3.org/WAI/WCAG3/",
        pubDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        source: "W3C",
        description: "The new WCAG 3.0 guidelines bring significant improvements to web accessibility standards."
      },
      {
        title: "Latest: Cybersecurity Trends - What to Expect in 2024",
        link: "https://www.securityweek.com/cybersecurity-trends-2024/",
        pubDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        source: "SecurityWeek",
        description: "Explore the top cybersecurity trends and threats that organizations should prepare for in 2024."
      },
      {
        title: "Breaking: Compliance Automation - Reducing Manual Audit Workload",
        link: "https://www.complianceweek.com/automation/",
        pubDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        source: "Compliance Week",
        description: "How automation is streamlining compliance processes and reducing manual audit workloads."
      },
      {
        title: "Latest: Data Privacy Laws - Global Regulatory Landscape Update",
        link: "https://www.iapp.org/news/global-privacy-laws/",
        pubDate: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        source: "IAPP",
        description: "An overview of the evolving global data privacy regulatory landscape and its impact on businesses."
      }
    ];
    
    console.log('⚠️ Using fallback news data due to error');
    
    return NextResponse.json({ 
      success: false, 
      news: fallbackNews,
      count: fallbackNews.length,
      error: 'Using fallback data due to API error'
    });
  }
} 