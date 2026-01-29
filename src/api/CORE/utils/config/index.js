export const config = {
    app: {
        port: process.env.PORT || 2345,
        base_url: process.env.BASE_URL || "http://localhost:3000"
    },
    rss_feed: {
        "Nigeria": [
            "https://www.vanguardngr.com/feed/",
            "https://punchng.com/feed/",
            "https://www.premiumtimesng.com/feed",
            "https://guardian.ng/feed/"
        ],
        "Technology": [
            "https://hnrss.org/frontpage",
            "https://www.theverge.com/rss/index.xml",
            "https://techcrunch.com/feed/"
        ],
        "World News": [
            "http://feeds.bbci.co.uk/news/world/rss.xml",
            "https://www.aljazeera.com/xml/rss/all.xml",
            "https://rss.nytimes.com/services/xml/rss/nyt/World.xml"
        ],
        "Finance & Markets": [
            "https://search.cnbc.com/rs/search/view.xml?partnerId=2000&keywords=finance",
            "https://www.ft.com/?format=rss"
        ],
        "Science & Nature": [
            "https://www.quantamagazine.org/feed/",
            "https://feeds.npr.org/1007/rss.xml"
        ]
    }
}