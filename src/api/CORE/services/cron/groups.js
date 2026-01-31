import cron from 'node-cron';
import axios from 'axios';
import { fetchNews } from '../news/index.js';

const WAHA_URL = 'http://localhost:3001';
const WAHA_API_KEY = '4679e98530e64476968b808d0e488497';

const TARGET_GROUPS = [
    '2348187425208-1584899737@g.us',
    '120363037509164507@g.us',
];

function selectTopStories(articles) {
    const categories = {};

    articles.forEach(article => {
        if (!categories[article.category]) {
            categories[article.category] = [];
        }
        categories[article.category].push(article);
    });

    const selectedArticles = [];
    const categoryOrder = ["Nigeria", "World News", "Technology", "Sports", "Finance", "Entertainment"];

    categoryOrder.forEach(category => {
        if (categories[category] && categories[category].length > 0) {
            const categoryArticles = categories[category];
            const sortedByDate = categoryArticles.sort((a, b) =>
                new Date(b.publishedAt) - new Date(a.publishedAt)
            );
            selectedArticles.push(sortedByDate[0]);

            if (categoryArticles.length > 1) {
                const secondArticle = sortedByDate.find(article =>
                    article.source.toLowerCase().includes('vanguard') ||
                    article.source.toLowerCase().includes('cnn') ||
                    article.source.toLowerCase().includes('bbc') ||
                    article.source.toLowerCase().includes('aljazeera') ||
                    article.source.toLowerCase().includes('nytimes')
                ) || sortedByDate[1];

                if (secondArticle && selectedArticles.length < 8) {
                    selectedArticles.push(secondArticle);
                }
            }
        }
    });

    return selectedArticles.slice(0, 8);
}

function formatArticle(article, index) {
    const sourceEmoji = getSourceEmoji(article.source);
    const categoryEmoji = getCategoryEmoji(article.category);

    let formatted = `${index}. ${categoryEmoji} *${article.title}*\n`;

    if (article.source) {
        formatted += `   ${sourceEmoji} _${article.source}_\n`;
    }

    if (article.description && article.description.length > 30) {
        const cleanDescription = article.description.replace(/<[^>]*>/g, '').trim();
        formatted += `   📝 ${cleanDescription.substring(0, 120)}${cleanDescription.length > 120 ? '...' : ''}\n`;
    }

    formatted += `   🔗 ${article.url}\n\n`;

    return formatted;
}

function getSourceEmoji(source) {
    const sourceLower = source.toLowerCase();
    if (sourceLower.includes('vanguard')) return '🇳🇬';
    if (sourceLower.includes('punch')) return '👊';
    if (sourceLower.includes('cnn')) return '🌍';
    if (sourceLower.includes('bbc')) return '🇬🇧';
    if (sourceLower.includes('aljazeera')) return '🌐';
    if (sourceLower.includes('nytimes')) return '🗽';
    if (sourceLower.includes('tech') || sourceLower.includes('verge')) return '💻';
    if (sourceLower.includes('sports') || sourceLower.includes('espn')) return '⚽';
    if (sourceLower.includes('finance') || sourceLower.includes('bloomberg')) return '💰';
    if (sourceLower.includes('entertainment') || sourceLower.includes('hollywood')) return '🎬';
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

async function sendNewsDigest(groupId, timeString, articles) {
    let message = `📰 *TOP STORIES AS AT ${timeString}*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `*Comprehensive News Digest*\n`;
    message += `Curated from 30+ major outlets\n\n`;

    message += `*📊 TODAY'S TOP PICKS:*\n\n`;

    articles.forEach((article, index) => {
        message += formatArticle(article, index + 1);
    });

    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `🌟 *STAY AHEAD OF THE CURVE!* 🌟\n\n`;
    message += `📱 *JOIN OUR EXCLUSIVE CHANNEL:*\n`;
    message += `👉 https://whatsapp.com/channel/0029Vb7lWMxJpe8p7p58KM2l\n`;
    message += `_Get real-time updates before anyone else!_\n\n`;
    message += `🌐 *DIVE DEEPER ON OUR SITE:*\n`;
    message += `👉 https://morningscroll.xyz/\n`;
    message += `_Extended coverage & analysis_\n\n`;
    message += `💎 *WHY MORNING SCROLL?*\n`;
    message += `✓ 24/7 breaking news alerts\n`;
    message += `✓ Multi-source verification\n`;
    message += `✓ Balanced perspectives\n`;
    message += `✓ Zero clickbait, pure facts\n`;
    message += `✓ All categories covered\n\n`;
    message += `🔔 *Turn on notifications!*\n`;
    message += `Share this update → Help others stay informed 📲\n\n`;
    message += `#MorningScroll #NewsAlert #StayInformed #${timeString.replace(/[: ]/g, '')}`;

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
        console.log(`✅ Sent ${articles.length} top stories to ${groupId}`);
    } catch (e) {
        console.error(`❌ Failed to send to ${groupId}:`, e.response ? e.response.status : e.message);
    }
}

async function runNewsJob() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    console.log(`\n⏰ [${now.toLocaleTimeString()}] Fetching top stories...`);

    try {
        const articles = await fetchNews();

        // Get only articles published in the last 6 hours to keep it fresh
        const sixHoursAgo = new Date(now.getTime() - (6 * 60 * 60 * 1000));
        const recentArticles = articles.filter(a => new Date(a.publishedAt) > sixHoursAgo);

        if (recentArticles.length === 0) {
            console.log('📭 No recent articles in the last 6 hours.');
            return;
        }

        const topStories = selectTopStories(recentArticles);

        if (topStories.length === 0) {
            console.log('📭 Could not select top stories from recent articles.');
            return;
        }

        console.log(`📊 Selected ${topStories.length} top stories across categories`);

        for (const groupId of TARGET_GROUPS) {
            await sendNewsDigest(groupId, timeString, topStories);
            await new Promise(r => setTimeout(r, 2000));
        }

    } catch (error) {
        console.error("🔥 Error running news job:", error);
    }
}

// Every 3 hours schedule: 12am, 3am, 6am, 9am, 12pm, 3pm, 6pm, 9pm
cron.schedule('0 0,3,6,9,12,15,18,21 * * *', () => {
    console.log(`🕐 CRON TRIGGERED at ${new Date().toLocaleTimeString()}`);
    runNewsJob();
});

console.log('🚀 Service started.');
console.log(`📡 Targeting ${TARGET_GROUPS.length} groups.`);
console.log('⏱️  Will post top stories every 3 hours: 12am, 3am, 6am, 9am, 12pm, 3pm, 6pm, 9pm');

runNewsJob();