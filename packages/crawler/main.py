from crawling import pure_crawl_page
import asyncio
from ai import agent
from pydantic import BaseModel

ground_news_url = "https://ground.news"

class ArticleListItem(BaseModel):
    title: str
    date: str
    url: str


class ArticlesList(BaseModel):
    articles: list[ArticleListItem]

class Article(BaseModel):
    title: str
    date: str
    content: str

async def crawl_article(url: str) -> Article:
    article_data = await pure_crawl_page(url)
    run_response = agent.run(f"Understand the following markdown \n\n\n\n {article_data['markdown']} \n\n\n\n extract the title, date and content. Return in a JSON format as `{{title: str, date: mm/dd/yyyy, content: str}}`.")
    response_string = run_response.get_content_as_string()
    response_json = response_string.replace("```json", "").replace("```", "").replace(r"\'", "'").replace(r"\n", " ")
    response_json = Article.model_validate_json(response_json)
    return response_json


async def crawl_articles_list() -> ArticlesList:
    data = await pure_crawl_page(ground_news_url)
    run_response = agent.run(f"Understand the following markdown \n\n\n\n {data['markdown']} \n\n\n\n extract the top 3 newest articles. Return in a JSON format as `{{articles: [{{title: str, date: mm/dd/yyyy, url: str}}]}}`.")
    response_string = run_response.get_content_as_string()
    response_json = response_string.replace("```json", "").replace("```", "").replace(r"\'", "'").replace(r"\n", " ")
    response_json = ArticlesList.model_validate_json(response_json)
    return response_json


async def main():
    articles_list = await crawl_articles_list()
    for article in articles_list.articles:
        response_json = await crawl_article(article.url)
        print(response_json.title)
        print(response_json.date)
        print(response_json.content[:100])
        print("--------------------------------\n\n\n")


if __name__ == "__main__":
    asyncio.run(main())
