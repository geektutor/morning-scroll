import { fetchNews } from "../../../../CORE/services/news/index.js";

export const getHighlights = async (req, res) => {
    try {
        const articles = await fetchNews();

        const highlights = articles.slice(0, 10).map(article => ({
            title: article.title,
            author: article.author,
            image: article.image,
            source: article.source,
            url: article.url,
            publishedAt: article.publishedAt
        }));

        res.json({
            success: true,
            data: highlights
        });
    } catch (error) {
        console.error('Highlights Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch highlights'
        });
    }
}