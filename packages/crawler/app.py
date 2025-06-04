import asyncio
from flask import Flask, jsonify, request
from pydantic import ValidationError
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
    logger.info(f"🚨 /api/articles called at {datetime.now()}")
    logger.info(f"User-Agent: {request.headers.get('User-Agent', 'Unknown')}")
    logger.info(f"Request IP: {request.remote_addr}")
    
    try:
        articles_list_data = await crawl_articles_list()
        return jsonify(articles_list_data.model_dump())
    except Exception as e:
        logger.error(f"❌ Error in /api/articles: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
detailed_articles = []

@app.route('/api/articles/top', methods=['GET'])
async def get_top_articles():
    logger.info(f"🚨 API CALL RECEIVED at /api/articles/top - {datetime.now()}")
    logger.info(f"User-Agent: {request.headers.get('User-Agent', 'Unknown')}")
    logger.info(f"Request IP: {request.remote_addr}")
    logger.info(f"Headers: {dict(request.headers)}")
    
    if len(detailed_articles) >= 3:
        return jsonify(detailed_articles)

    try:
        # crawl_articles_list is already designed to fetch top 3 newest articles
        # based on the prompt in main.py
        articles_list_data = await crawl_articles_list()

        # Get the top 3 newest articles
        top_articles = articles_list_data.articles[:3]

        # Get detailed information for each article
        for article in top_articles:
            detailed_article_info = await crawl_article(article.url)
            detailed_articles.append(detailed_article_info.model_dump())

        logger.info(f"✅ Returning {len(detailed_articles)} articles")
        logger.info(f"Response size: {len(str(detailed_articles))} characters")
        
        return jsonify(detailed_articles)
    except ValidationError as e:
        return jsonify({"error": "Data validation error", "details": e.errors()}), 400
    except Exception as e:
        logger.error(f"❌ Error in /api/articles/top: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/article', methods=['GET'])
async def get_article_detail():
    logger.info(f"🚨 /api/article called at {datetime.now()}")
    
    article_url = request.args.get('url')
    if not article_url:
        return jsonify({"error": "'url' query parameter is required"}), 400
    try:
        detailed_article_info = await crawl_article(article_url)
        return jsonify(detailed_article_info.model_dump())
    except ValidationError as e:
        return jsonify({"error": "Data validation error", "details": e.errors()}), 400
    except Exception as e:
        logger.error(f"❌ Error in /api/article: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Add a simple health check endpoint to test connectivity
@app.route('/health', methods=['GET'])
def health_check():
    logger.info(f"🏥 Health check called at {datetime.now()}")
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

if __name__ == '__main__':
    # Ensure any top-level asyncio.run in main.py is inside its own
    # if __name__ == '__main__': block to prevent conflicts.
    logger.info("🚀 Starting crawler API server...")
    app.run(debug=True, host='0.0.0.0', port=5001) 