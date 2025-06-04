from crawling import pure_crawl_page
import asyncio
from ai import agent
from pydantic import BaseModel
from typing import List, Optional


ground_news_url = "https://ground.news"

class ArticleListItem(BaseModel):
    title: str
    date: str
    url: str


class ArticlesList(BaseModel):
    articles: list[ArticleListItem]

# Updated Pydantic models for detailed article information
class CoveringPublication(BaseModel):
    publicationName: str
    politicalBias: Optional[str] = None
    articleTitle: str
    publishedDate: Optional[str] = None

class OverallBiasDistribution(BaseModel):
    totalArticles: Optional[int] = None
    leftLeaningCount: Optional[int] = None
    centerCount: Optional[int] = None
    rightLeaningCount: Optional[int] = None
    leftLeaningPercent: Optional[str] = None
    centerPercent: Optional[str] = None
    rightLeaningPercent: Optional[str] = None
    summaryStatement: Optional[str] = None

class DetailedArticleInfo(BaseModel): # Renamed from Article
    mainArticleTitle: str
    mainArticlePublishedDate: Optional[str] = None
    mainArticleUpdatedDate: Optional[str] = None
    mainArticleContent: Optional[str] = None
    coveringPublications: Optional[List[CoveringPublication]] = None
    overallBiasDistribution: Optional[OverallBiasDistribution] = None


async def crawl_article(url: str) -> DetailedArticleInfo:
    article_data = await pure_crawl_page(url)

    prompt_template = """Given the markdown content of a news aggregator webpage, please extract the following specific pieces of information and provide the output as a single JSON object.

Markdown content:
{markdown_content}

Extraction Requirements:

1.  `mainArticleTitle`: Identify the primary headline of the news story. This is typically the largest, most prominent title on the page.
2.  `mainArticlePublishedDate`: Find the initial publication date mentioned for the main story (e.g., "Published X days ago").
3.  `mainArticleUpdatedDate`: Find the last updated date mentioned for the main story (e.g., "Updated X hours ago" or a specific timestamp).
4.  `mainArticleContent`: Extract the main textual content of the primary article.
5.  `coveringPublications`: An array of objects. Locate the section listing multiple articles covering the topic (often titled something like "X Articles"). For each listed article/publication, extract:
    *   `publicationName`: The name of the news source (e.g., "The Hill", "Associated Press News").
    *   `politicalBias`: The bias rating indicated for that publication (e.g., "Center", "Lean Left", "Lean Right").
    *   `articleTitle`: The headline of the article from this specific publication.
    *   `publishedDate`: The date or relative time (e.g., "24 hours ago") this specific publication's article was posted or updated.
6.  `overallBiasDistribution`: An object containing:
    *   `totalArticles`: The total number of articles or news sources mentioned as covering the story.
    *   `leftLeaningCount`: The count of Left-leaning sources.
    *   `centerCount`: The count of Center sources.
    *   `rightLeaningCount`: The count of Right-leaning sources.
    *   `leftLeaningPercent`: The percentage of Left-leaning sources (if available).
    *   `centerPercent`: The percentage of Center sources (if available).
    *   `rightLeaningPercent`: The percentage of Right-leaning sources (if available).
    *   `summaryStatement`: Any direct textual summary related to the bias distribution (e.g., "This is a Blindspot: 0% Right").

Output Format (JSON):
Ensure all extracted text is included as strings. If a piece of information is not found, use `null` for its value or omit the key if appropriate for optional fields. The JSON structure should be:
```json
{{
  "mainArticleTitle": "string",
  "mainArticlePublishedDate": "string | null",
  "mainArticleUpdatedDate": "string | null",
  "mainArticleContent": "string | null",
  "coveringPublications": [
    {{
      "publicationName": "string",
      "politicalBias": "string | null",
      "articleTitle": "string",
      "publishedDate": "string | null"
    }}
    // ... more publications
  ] | null,
  "overallBiasDistribution": {{
    "totalArticles": "integer | null",
    "leftLeaningCount": "integer | null",
    "centerCount": "integer | null",
    "rightLeaningCount": "integer | null",
    "leftLeaningPercent": "string | null",
    "centerPercent": "string | null",
    "rightLeaningPercent": "string | null",
    "summaryStatement": "string | null"
  }} | null
}}
```"""
    prompt = prompt_template.format(markdown_content=article_data['markdown'])
    
    run_response = agent.run(prompt)
    response_string = run_response.get_content_as_string()
    
    response_json_str = response_string.strip()
    if response_json_str.startswith("```json"):
        response_json_str = response_json_str[7:]
    if response_json_str.endswith("```"):
        response_json_str = response_json_str[:-3]
    response_json_str = response_json_str.strip()
    # Pydantic should handle standard JSON escapes like \\n and \\'. 
    # The original .replace(r"\'", "'").replace(r"\\n", " ") might be too aggressive or unnecessary.

    response_data = DetailedArticleInfo.model_validate_json(response_json_str)
    return response_data


async def crawl_articles_list() -> ArticlesList:
    data = await pure_crawl_page(ground_news_url)
    run_response = agent.run(f"Understand the following markdown \\n\\n\\n\\n {data['markdown']} \\n\\n\\n\\n extract the top 3 newest articles. Return in a JSON format as `{{articles: [{{title: str, date: mm/dd/yyyy, url: str}}]}}`.")
    response_string = run_response.get_content_as_string()
    response_json_str = response_string.strip()
    if response_json_str.startswith("```json"):
        response_json_str = response_json_str[7:]
    if response_json_str.endswith("```"):
        response_json_str = response_json_str[:-3]
    response_json_str = response_json_str.strip()
    
    articles_data = ArticlesList.model_validate_json(response_json_str)
    return articles_data


async def main():
    articles_list_data = await crawl_articles_list()
    for article_item in articles_list_data.articles:
        print(f"Crawling article: {article_item.title} from {article_item.url}")
        detailed_info = await crawl_article(article_item.url)
        
        print(f"\\n--- Extracted Detailed Info for: {detailed_info.mainArticleTitle} ---")
        print(f"Published: {detailed_info.mainArticlePublishedDate}")
        print(f"Updated: {detailed_info.mainArticleUpdatedDate}")
        
        if detailed_info.mainArticleContent:
            print(f"\\nContent Snippet: {detailed_info.mainArticleContent[:200].strip()}...")
        
        if detailed_info.coveringPublications:
            print("\\nCovering Publications:")
            for pub in detailed_info.coveringPublications[:3]: # Print first 3 as example
                print(f"  - Publication: {pub.publicationName}")
                print(f"    Bias: {pub.politicalBias if pub.politicalBias else 'N/A'}")
                print(f"    Article Title: {pub.articleTitle}")
                print(f"    Published: {pub.publishedDate if pub.publishedDate else 'N/A'}")
        
        if detailed_info.overallBiasDistribution:
            dist = detailed_info.overallBiasDistribution
            print("\\nOverall Bias Distribution:")
            if dist.totalArticles is not None:
                print(f"  Total Articles: {dist.totalArticles}")
            if dist.summaryStatement:
                print(f"  Summary: {dist.summaryStatement}")
            counts = []
            if dist.leftLeaningCount is not None:
                counts.append(f"Left: {dist.leftLeaningCount}")
            if dist.centerCount is not None:
                counts.append(f"Center: {dist.centerCount}")
            if dist.rightLeaningCount is not None:
                counts.append(f"Right: {dist.rightLeaningCount}")
            if counts:
                print(f"  Counts: {', '.join(counts)}")
            
            percents = []
            if dist.leftLeaningPercent is not None:
                percents.append(f"Left: {dist.leftLeaningPercent}%")
            if dist.centerPercent is not None:
                percents.append(f"Center: {dist.centerPercent}%")
            if dist.rightLeaningPercent is not None:
                percents.append(f"Right: {dist.rightLeaningPercent}%")
            if percents:
                 print(f"  Percentages: {', '.join(percents)}")

        print("--------------------------------\\n\\n\\n")


if __name__ == "__main__":
    asyncio.run(main())
