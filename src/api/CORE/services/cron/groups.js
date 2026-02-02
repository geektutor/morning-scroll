import cron from 'node-cron';
import axios from 'axios';
import { fetchNews } from '../news/index.js';

const WAHA_URL = 'http://localhost:3001';
const WAHA_API_KEY = '4679e98530e64476968b808d0e488497';

const TARGET_GROUPS = [
    '2348187425208-1584899737@g.us',
    // '120363037509164507@g.us',
];

function getControversialKeywords() {
    return {
        us: ['trump', 'biden', 'democrat', 'republican', 'election', 'impeachment', 'border', 'immigration',
            'abortion', 'gun', 'climate', 'woke', 'supreme court', 'gop', 'kamala', 'putin', 'ukraine',
            'china', 'iran', 'middle east', 'israel', 'palestine', 'migrant', 'sanction', 'tariff'],
        nigeria: ['tinubu', 'atiku', 'obi', 'apc', 'pdp', 'labour party', 'inflation', 'fuel subsidy',
            'naira', 'cbn', 'efcc', 'corruption', 'insecurity', 'bandits', 'bokoharam', 'ipob',
            'secession', 'herdsmen', 'religious', 'lgbt', 'same-sex', 'budget', 'senate', 'asuu',
            'nlc', 'minimum wage', 'petrol', 'electricity'],
        general: ['scandal', 'protest', 'riot', 'strike', 'crisis', 'controversy', 'outrage', 'accusation',
            'investigation', 'lawsuit', 'arrest', 'resignation', 'impeachment', 'leak', 'whistleblower']
    };
}

function isControversialArticle(article) {
    const keywords = getControversialKeywords();
    const title = article.title.toLowerCase();
    const desc = (article.description || '').toLowerCase();
    const content = title + ' ' + desc;

    if (keywords.general.some(keyword => content.includes(keyword))) {
        return true;
    }

    if (content.includes('nigeria') || content.includes('nigerian')) {
        return keywords.nigeria.some(keyword => content.includes(keyword));
    }

    if (content.includes('u.s.') || content.includes('united states') || content.includes('american')) {
        return keywords.us.some(keyword => content.includes(keyword));
    }

    return false;
}

function selectTopStories(articles) {
    const categories = {};

    articles.forEach(article => {
        if (!categories[article.category]) {
            categories[article.category] = { controversial: [], regular: [] };
        }

        if (isControversialArticle(article)) {
            categories[article.category].controversial.push(article);
        } else {
            categories[article.category].regular.push(article);
        }
    });

    const selectedArticles = [];
    const categoryOrder = ["Nigeria", "World News", "Technology", "Sports", "Finance", "Entertainment"];

    categoryOrder.forEach(category => {
        if (categories[category]) {
            const sortedControversial = categories[category].controversial
                .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

            const sortedRegular = categories[category].regular
                .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

            if (sortedControversial.length > 0) {
                selectedArticles.push(sortedControversial[0]);

                if (selectedArticles.length < 8 && sortedControversial.length > 1) {
                    selectedArticles.push(sortedControversial[1]);
                } else if (selectedArticles.length < 8 && sortedRegular.length > 0) {
                    selectedArticles.push(sortedRegular[0]);
                }
            } else if (sortedRegular.length > 0) {
                selectedArticles.push(sortedRegular[0]);

                if (selectedArticles.length < 8 && sortedRegular.length > 1) {
                    selectedArticles.push(sortedRegular[1]);
                }
            }
        }
    });

    return selectedArticles.slice(0, 8);
}

function formatArticle(article, index) {
    const sourceEmoji = getSourceEmoji(article.source);
    const categoryEmoji = getCategoryEmoji(article.category);
    const isControversial = isControversialArticle(article);
    const controversialTag = isControversial ? ' 🔥' : '';

    let formatted = `${index}. ${categoryEmoji} *${article.title}*${controversialTag}\n`;

    if (article.source) {
        formatted += `   ${sourceEmoji} _${article.source}_\n`;
    }

    if (isControversial) {
        formatted += `   ⚠️ _Hot Topic_\n`;
    }

    if (article.description && article.description.length > 30) {
        const cleanDescription = article.description.replace(/<[^>]*>/g, '').trim();
        formatted += `   📝 ${cleanDescription.substring(0, 100)}${cleanDescription.length > 100 ? '...' : ''}\n`;
    }

    const date = new Date(article.publishedAt);
    const now = new Date();
    const hoursDiff = Math.floor((now - date) / (1000 * 60 * 60));

    let timeText;
    if (hoursDiff < 1) {
        timeText = 'Just now';
    } else if (hoursDiff < 24) {
        timeText = `${hoursDiff}h ago`;
    } else {
        timeText = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    formatted += `   🕐 ${timeText}\n`;
    formatted += `   🔗 ${article.url}\n\n`;

    return formatted;
}

function getSourceEmoji(source) {
    const sourceLower = (source || '').toLowerCase();
    if (sourceLower.includes('vanguard')) return '🇳🇬';
    if (sourceLower.includes('punch')) return '👊';
    if (sourceLower.includes('cnn')) return '🇺🇸';
    if (sourceLower.includes('bbc')) return '🇬🇧';
    if (sourceLower.includes('aljazeera')) return '🌐';
    if (sourceLower.includes('nytimes')) return '🗽';
    if (sourceLower.includes('fox')) return '🦊';
    if (sourceLower.includes('politico')) return '🏛️';
    if (sourceLower.includes('bloomberg')) return '💹';
    if (sourceLower.includes('techcrunch')) return '🚀';
    if (sourceLower.includes('espn')) return '⚽';
    if (sourceLower.includes('hollywood')) return '🎬';
    return '📰';
}

function getCategoryEmoji(category) {
    switch (category) {
        case 'Nigeria': return '🇳🇬';
        case 'World News': return '🌍';
        case 'Technology': return '💻';
        case 'Sports': return '⚽';
        case 'Finance': return '💰';
        case 'Entertainment': return '🎬';
        default: return '📰';
    }
}

async function sendNewsDigest(groupId, timeString, articles, period) {
    const periodText = period === 'morning' ? 'MORNING' : 'EVENING';
    const greeting = period === 'morning' ? '🌅 Good Morning!' : '🌇 Good Evening!';
    const controversialCount = articles.filter(isControversialArticle).length;

    let message = `${greeting}\n\n`;
    message += `📰 *${periodText} NEWS HIGHLIGHTS*\n`;
    message += `⏰ ${timeString} • ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}\n\n`;

    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    if (controversialCount > 0) {
        message += `🔥 *Today's Top Stories* (${controversialCount} hot topics)\n\n`;
    } else {
        message += `📊 *Today's Top Stories*\n\n`;
    }

    articles.forEach((article, index) => {
        message += formatArticle(article, index + 1);
    });

    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

    if (controversialCount > 0) {
        message += `⚠️ *Hot Topics Today:* ${controversialCount} stories generating significant discussion\n`;
        message += `Get balanced perspectives from multiple sources.\n\n`;
    }

    message += `📱 *Get More News:*\n`;
    message += `👉 https://morningscroll.xyz/\n\n`;
    message += `🔔 *Stay informed. Think critically.*\n`;
    message += `#NewsHighlights #${period === 'morning' ? 'MorningBrief' : 'EveningUpdate'} #StayInformed`;

    const axiosConfig = {
        headers: {
            'X-Api-Key': WAHA_API_KEY,
            'Content-Type': 'application/json'
        }
    };

    try {
        await axios.post(`${WAHA_URL}/api/sendText`, {
            chatId: groupId,
            text: message,
            session: "default"
        }, axiosConfig);
        console.log(`✅ Sent ${period} highlights to ${groupId}`);
    } catch (e) {
        console.error(`❌ Failed to send to ${groupId}:`, e.response ? e.response.status : e.message);
    }
}

async function runNewsJob(period) {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    console.log(`\n⏰ [${now.toLocaleTimeString()}] Fetching ${period} news highlights...`);

    try {
        const articles = await fetchNews();

        const cutoffHours = period === 'morning' ? 12 : 6;
        const cutoffTime = new Date(now.getTime() - (cutoffHours * 60 * 60 * 1000));

        const recentArticles = articles.filter(a => {
            try {
                const articleDate = new Date(a.publishedAt);
                return articleDate > cutoffTime && articleDate.getFullYear() > 2000;
            } catch {
                return false;
            }
        });

        if (recentArticles.length === 0) {
            console.log(`📭 No recent articles in the last ${cutoffHours} hours.`);
            return;
        }

        const topStories = selectTopStories(recentArticles);

        if (topStories.length === 0) {
            console.log('📭 Could not select top stories.');
            return;
        }

        const controversialCount = topStories.filter(isControversialArticle).length;
        console.log(`📊 Selected ${topStories.length} stories (${controversialCount} controversial)`);

        for (const groupId of TARGET_GROUPS) {
            await sendNewsDigest(groupId, timeString, topStories, period);
            await new Promise(r => setTimeout(r, 2000));
        }

    } catch (error) {
        console.error("🔥 Error running news job:", error);
    }
}

cron.schedule('0 6 * * *', () => {
    const nigeriaTime = new Date().toLocaleString('en-US', { timeZone: 'Africa/Lagos', hour12: false });
    console.log(`🌅 MORNING CRON TRIGGERED at ${nigeriaTime}`);
    runNewsJob('morning');
}, {
    scheduled: true,
    timezone: "Africa/Lagos"
});

cron.schedule('0 18 * * *', () => {
    const nigeriaTime = new Date().toLocaleString('en-US', { timeZone: 'Africa/Lagos', hour12: false });
    console.log(`🌇 EVENING CRON TRIGGERED at ${nigeriaTime}`);
    runNewsJob('evening');
}, {
    scheduled: true,
    timezone: "Africa/Lagos"
});

console.log('🚀 News Highlights Service started.');
console.log(`📡 Targeting ${TARGET_GROUPS.length} groups.`);
console.log('⏱️  Will post news highlights at 6 AM and 6 PM Nigeria Time');

setTimeout(() => {
    const now = new Date();
    const nigeriaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
    const hours = nigeriaTime.getHours();

    if (hours === 6 || hours === 18) {
        const period = hours === 6 ? 'morning' : 'evening';
        console.log(`⏰ Running initial ${period} job...`);
        runNewsJob(period);
    }
}, 5000);