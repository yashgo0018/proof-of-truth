import asyncio
from flask import Flask, jsonify, request
from pydantic import ValidationError

# Assuming main.py contains the necessary functions and models
# We'll need to be careful about how main.py is structured to be importable
# and not auto-run its own asyncio loop if it has one.
from main import (
    crawl_articles_list,
    crawl_article,
    ArticlesList,
    DetailedArticleInfo
)

app = Flask(__name__)

@app.route('/api/articles', methods=['GET'])
async def get_articles_list():
    try:
        articles_list_data = await crawl_articles_list()
        return jsonify(articles_list_data.model_dump())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/articles/top', methods=['GET'])
async def get_top_articles():
    try:
        # crawl_articles_list is already designed to fetch top 3 newest articles
        # based on the prompt in main.py
        articles_list_data = await crawl_articles_list()

        # Get the top 3 newest articles
        top_articles = articles_list_data.articles[:3]

        # Get detailed information for each article
        detailed_articles = []
        for article in top_articles:
            detailed_article_info = await crawl_article(article.url)
            detailed_articles.append(detailed_article_info.model_dump())

        return jsonify(detailed_articles)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/article', methods=['GET'])
async def get_article_detail():
    article_url = request.args.get('url')
    if not article_url:
        return jsonify({"error": "'url' query parameter is required"}), 400
    try:
        detailed_article_info = await crawl_article(article_url)
        return jsonify(detailed_article_info.model_dump())
    except ValidationError as e:
        return jsonify({"error": "Data validation error", "details": e.errors()}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Ensure any top-level asyncio.run in main.py is inside its own
    # if __name__ == '__main__': block to prevent conflicts.
    app.run(debug=True, host='0.0.0.0', port=5001) 