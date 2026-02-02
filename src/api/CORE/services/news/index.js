import Parser from 'rss-parser';
import { config } from '../../utils/config/index.js';



export async function fetchNews(category = 'Top Stories', categories = null) {
    const parser = new Parser({
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/rss+xml, application/xml, text/xml; q=0.1'
        },
        timeout: 15000
    });

    const categoriesToFetch = categories ? categories.split(',') : [category];
    let feedsToFetch = [];

    if (category === 'Top Stories' && !categories) {
        Object.entries(config.rss_feed).forEach(([catName, urls]) => {
            urls.forEach(url => {
                feedsToFetch.push({ url, category: catName });
            });
        });
    } else {
        categoriesToFetch.forEach(cat => {
            const feeds = config.rss_feed[cat] || [];
            feeds.forEach(url => {
                feedsToFetch.push({ url, category: cat });
            });
        });
    }

    const feedPromises = feedsToFetch.map(async ({ url, category: articleCategory }) => {
        try {
            const feed = await parser.parseURL(url);
            const items = feed.items || [];

            const filteredItems = items.filter(item => {
                if (!item) return false;

                let pubDate;
                try {
                    pubDate = new Date(item.isoDate || item.pubDate || '');
                    if (isNaN(pubDate.getTime())) return false;
                } catch {
                    return false;
                }

                const currentYear = new Date().getFullYear();
                const articleYear = pubDate.getFullYear();

                if (articleYear < currentYear - 1) return false;

                if (url.includes('cnn.com') || url.includes('cnn')) {
                    const title = (item.title || '').toLowerCase();
                    if (title.includes('34 years ago') ||
                        title.includes('1990') ||
                        title.includes('1989') ||
                        title.includes('decades ago') ||
                        title.includes('years ago') && title.match(/\d+\s+years\s+ago/)) {
                        const match = title.match(/(\d+)\s+years\s+ago/);
                        if (match && parseInt(match[1]) > 5) return false;
                    }

                    if (pubDate.getFullYear() < 2020) return false;
                }

                return true;
            });

            return filteredItems.map(item => ({
                id: item.guid || item.link || Math.random().toString(),
                title: item.title || 'No Title',
                description: item.contentSnippet || item.content || '',
                category: articleCategory,
                image: extractImage(item),
                author: item.creator || item.author || 'Unknown',
                publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
                url: item.link || '#',
                source: feed.title || 'Unknown Source'
            }));
        } catch (e) {
            return [];
        }
    });

    const results = await Promise.all(feedPromises);
    const allArticles = results.flat();

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const freshArticles = allArticles.filter(article => {
        try {
            const articleDate = new Date(article.publishedAt);
            return articleDate > twentyFourHoursAgo;
        } catch {
            return false;
        }
    });

    const uniqueArticles = deduplicateArticles(freshArticles);

    const groupedBySource = {};
    uniqueArticles.forEach(article => {
        if (!groupedBySource[article.source]) {
            groupedBySource[article.source] = [];
        }
        groupedBySource[article.source].push(article);
    });

    Object.values(groupedBySource).forEach(group => {
        group.sort((a, b) => {
            try {
                return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
            } catch {
                return 0;
            }
        });
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

    return mixedArticles;
}

function extractImage(item) {
    if (item.enclosure && item.enclosure.url) return item.enclosure.url;

    const mediaContent = item['media:content'];
    if (mediaContent && mediaContent.$ && mediaContent.$.url) return mediaContent.$.url;

    if (item['media:thumbnail'] && item['media:thumbnail'].$) {
        return item['media:thumbnail'].$.url;
    }

    const content = item.content || item.contentSnippet || '';
    const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
    if (imgMatch) return imgMatch[1];

    return `https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop`;
}

function deduplicateArticles(articles) {
    const seen = new Set();
    return articles.filter(article => {
        const key = `${(article.title || '').toLowerCase().trim()}_${article.source}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}