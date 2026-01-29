import { fetchNews } from "../../../../CORE/services/news/index.js";

export const getNews = async (req, res) => {
    try {
        const category = req.query.category || 'Top Stories';
        const categories = req.query.categories;

        const articles = await fetchNews(category, categories);

        res.json({
            success: true,
            data: articles,
            count: articles.length
        });
    } catch (error) {
        console.error('Controller Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch news',
            message: error.message
        });
    }
}







