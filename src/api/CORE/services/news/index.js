import Parser from 'rss-parser';
import { config } from '../../utils/config/index.js';

// const FEED_CONFIG = {
//     "Nigeria": [
//         "https://www.vanguardngr.com/feed/",
//         "https://punchng.com/feed/",
//         "https://www.premiumtimesng.com/feed",
//         "https://guardian.ng/feed/"
//     ],
//     "Technology": [
//         "https://hnrss.org/frontpage",
//         "https://www.theverge.com/rss/index.xml",
//         "https://techcrunch.com/feed/"
//     ],
//     "World News": [
//         "http://feeds.bbci.co.uk/news/world/rss.xml",
//         "https://www.aljazeera.com/xml/rss/all.xml",
//         "https://rss.nytimes.com/services/xml/rss/nyt/World.xml"
//     ],
//     "Finance & Markets": [
//         "https://search.cnbc.com/rs/search/view.xml?partnerId=2000&keywords=finance",
//         "https://www.ft.com/?format=rss"
//     ],
//     "Science & Nature": [
//         "https://www.quantamagazine.org/feed/",
//         "https://feeds.npr.org/1007/rss.xml"
//     ]
// };

export async function fetchNews(category = 'Top Stories', categories = null) {
    const parser = new Parser();
    const categoriesToFetch = categories ? categories.split(',') : [category];

    let allArticles = [];
    let feedsToFetch = [];

    categoriesToFetch.forEach(cat => {
        const feeds = config.rss_feed[cat] || (cat === 'Top Stories' ? config.rss_feed["Nigeria"] : []);
        feeds.forEach(url => {
            feedsToFetch.push({ url, category: cat });
        });
    });

    if (feedsToFetch.length === 0) {
        config.rss_feed["Nigeria"].forEach(url => {
            feedsToFetch.push({ url, category: 'Top Stories' });
        });
    }

    const feedPromises = feedsToFetch.map(async ({ url, category: articleCategory }) => {
        try {
            const feed = await parser.parseURL(url);
            return feed.items.map(item => ({
                id: item.guid || item.link || Math.random().toString(),
                title: item.title,
                description: item.contentSnippet || item.content || '',
                category: articleCategory,
                image: extractImage(item),
                author: item.creator || item.author || 'Unknown',
                publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
                url: item.link,
                source: feed.title || 'Unknown Source'
            }));
        } catch (e) {
            console.error(`Error fetching feed ${url}:`, e);
            return [];
        }
    });

    const results = await Promise.all(feedPromises);
    allArticles = results.flat();

    const freshArticles = filterByMorningWindow(allArticles, 24);
    const uniqueArticles = deduplicateArticles(freshArticles);

    const groupedBySource = {};
    uniqueArticles.forEach(article => {
        if (!groupedBySource[article.source]) {
            groupedBySource[article.source] = [];
        }
        groupedBySource[article.source].push(article);
    });

    Object.values(groupedBySource).forEach(group => {
        group.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    });

    const mixedArticles = [];
    let hasMore = true;
    let index = 0;
    const sources = Object.keys(groupedBySource);

    while (hasMore) {
        hasMore = false;
        sources.forEach(source => {
            if (groupedBySource[source][index]) {
                mixedArticles.push(groupedBySource[source][index]);
                hasMore = true;
            }
        });
        index++;
    }

    if (mixedArticles.length > 0) {
        mixedArticles[0].isHero = true;
    }

    return mixedArticles;
}

function extractImage(item) {
    if (item.enclosure && item.enclosure.url) return item.enclosure.url;

    const mediaContent = item['media:content'];
    if (mediaContent && mediaContent.$ && mediaContent.$.url) return mediaContent.$.url;

    const content = item.content || item.contentSnippet || '';
    const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch) return imgMatch[1];

    return `https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop`;
}

function filterByMorningWindow(articles, hours) {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);
    return articles.filter(article => new Date(article.publishedAt) > cutoffTime);
}

function deduplicateArticles(articles) {
    const seen = new Set();
    return articles.filter(article => {
        const key = `${article.title.toLowerCase()}_${article.source}`;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

