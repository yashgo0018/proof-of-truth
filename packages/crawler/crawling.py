from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode

async def pure_crawl_page(url: str):
    """Crawl a single page and return the content without any LLM processing"""
    try:
        # Configure browser with proper settings
        browser_config = BrowserConfig(
            headless=True,
            verbose=True,
            java_script_enabled=True
        )
        
        # Configure crawler run with cache bypass to ensure fresh content
        run_config = CrawlerRunConfig(
            cache_mode=CacheMode.BYPASS
        )
        
        async with AsyncWebCrawler(config=browser_config) as crawler:
            result = await crawler.arun(url, config=run_config)
            return {"html": result.html, "markdown": result.markdown}
    except Exception as e:
        print(f"Error in pure_crawl_page for {url}: {str(e)}")
        return None
