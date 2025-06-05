// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ContractRegistry} from "@flarenetwork/flare-periphery-contracts/coston2/ContractRegistry.sol";
import {IWeb2Json} from "@flarenetwork/flare-periphery-contracts/coston2/IWeb2Json.sol";

struct ArticleData {
    string title;
    string date;
    uint256 contentLength;
    uint256 publicationCount;
    string overallBias;
    uint256 publishedTimestamp; // When the article was published
    uint256 id; // Unique article ID
}

struct SentimentData {
    uint256 positiveCount;
    uint256 negativeCount;
    mapping(address => bool) hasVoted;
    mapping(address => bool) sentiment; // true = positive, false = negative
    mapping(address => string) comments;
    address[] voters;
}

struct ArticleSentimentView {
    uint256 positiveCount;
    uint256 negativeCount;
    bool userHasVoted;
    bool userSentiment;
    string userComment;
    bool votingActive;
}

struct Top3ArticlesData {
    ArticleData article1;
    ArticleData article2;
    ArticleData article3;
    uint256 totalArticles;
}

struct DataTransportObject {
    string title1;
    string date1;
    uint256 contentLength1;
    uint256 publicationCount1;
    string overallBias1;
    string title2;
    string date2;
    uint256 contentLength2;
    uint256 publicationCount2;
    string overallBias2;
    string title3;
    string date3;
    uint256 contentLength3;
    uint256 publicationCount3;
    string overallBias3;
    uint256 totalArticles;
}

interface IArticlesFetcher {
    function updateArticles(IWeb2Json.Proof calldata data) external;
    function getTopArticles() external view returns (Top3ArticlesData memory);
    function getArticleByIndex(uint256 index) external view returns (ArticleData memory);
    function getTotalArticles() external view returns (uint256);
    function submitSentiment(uint256 articleId, bool isPositive, string calldata comment) external;
    function getArticleSentiment(uint256 articleId, address user) external view returns (ArticleSentimentView memory);
    function getArticlesByDate(uint256 targetDate) external view returns (ArticleData[] memory);
}

contract ArticlesFetcher {
    ArticleData[3] public topArticles;
    mapping(uint256 => SentimentData) private articleSentiments; // articleId => sentiment data
    mapping(uint256 => ArticleData[]) private articlesByDate; // date => articles
    mapping(uint256 => bool) private dateExists; // track which dates have articles
    uint256[] private availableDates; // array of dates with articles
    
    uint256 public totalArticles;
    uint256 public timestamp;
    address public owner;
    uint256 public constant FRESHNESS_THRESHOLD = 24 hours; // Daily updates only
    uint256 public constant VOTING_WINDOW = 24 hours; // 24 hours to vote after publication
    uint256 public updateCount;
    uint256 private nextArticleId = 1;

    event ArticlesUpdated(
        uint256 articleCount,
        uint256 timestamp,
        uint256 totalArticles,
        uint256 updateNumber
    );
    
    event SentimentSubmitted(
        uint256 indexed articleId,
        address indexed voter,
        bool isPositive,
        string comment,
        uint256 timestamp
    );
    
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyFreshData() {
        require(
            block.timestamp >= timestamp + FRESHNESS_THRESHOLD,
            "Data is still fresh, update not needed - daily updates only"
        );
        _;
    }

    modifier validArticleId(uint256 articleId) {
        require(articleId > 0 && articleId < nextArticleId, "Invalid article ID");
        _;
    }

    constructor() {
        owner = msg.sender;
        timestamp = 0;
        totalArticles = 0;
        updateCount = 0;
        
        // Initialize empty articles
        for (uint256 i = 0; i < 3; i++) {
            topArticles[i] = ArticleData({
                title: "",
                date: "",
                contentLength: 0,
                publicationCount: 0,
                overallBias: "",
                publishedTimestamp: 0,
                id: 0
            });
        }
    }

    function updateArticles(
        IWeb2Json.Proof calldata data
    ) public onlyOwner onlyFreshData {
        require(isWeb2JsonProofValid(data), "Invalid proof");

        DataTransportObject memory dto = abi.decode(
            data.data.responseBody.abiEncodedData,
            (DataTransportObject)
        );

        uint256 currentDate = getCurrentDate();
        ArticleData[] storage dailyArticles = articlesByDate[currentDate];
        
        // Clear previous articles for today
        delete articlesByDate[currentDate];
        
        // Update top 3 articles with unique IDs
        for (uint256 i = 0; i < 3; i++) {
            uint256 articleId = nextArticleId++;
            ArticleData memory article;
            
            if (i == 0) {
                article = ArticleData({
                    title: dto.title1,
                    date: dto.date1,
                    contentLength: dto.contentLength1,
                    publicationCount: dto.publicationCount1,
                    overallBias: dto.overallBias1,
                    publishedTimestamp: block.timestamp,
                    id: articleId
                });
            } else if (i == 1) {
                article = ArticleData({
                    title: dto.title2,
                    date: dto.date2,
                    contentLength: dto.contentLength2,
                    publicationCount: dto.publicationCount2,
                    overallBias: dto.overallBias2,
                    publishedTimestamp: block.timestamp,
                    id: articleId
                });
            } else {
                article = ArticleData({
                    title: dto.title3,
                    date: dto.date3,
                    contentLength: dto.contentLength3,
                    publicationCount: dto.publicationCount3,
                    overallBias: dto.overallBias3,
                    publishedTimestamp: block.timestamp,
                    id: articleId
                });
            }
            
            topArticles[i] = article;
            articlesByDate[currentDate].push(article);
        }

        // Track this date if it's new
        if (!dateExists[currentDate]) {
            dateExists[currentDate] = true;
            availableDates.push(currentDate);
        }

        totalArticles = dto.totalArticles;
        timestamp = block.timestamp;
        updateCount++;

        emit ArticlesUpdated(3, block.timestamp, dto.totalArticles, updateCount);
    }

    function submitSentiment(
        uint256 articleId, 
        bool isPositive, 
        string calldata comment
    ) external validArticleId(articleId) {
        SentimentData storage sentiment = articleSentiments[articleId];
        
        require(!sentiment.hasVoted[msg.sender], "Already voted on this article");
        
        // Find the article to check voting window
        ArticleData memory article = getArticleById(articleId);
        require(
            block.timestamp <= article.publishedTimestamp + VOTING_WINDOW,
            "Voting period has ended for this article"
        );

        sentiment.hasVoted[msg.sender] = true;
        sentiment.sentiment[msg.sender] = isPositive;
        sentiment.comments[msg.sender] = comment;
        sentiment.voters.push(msg.sender);

        if (isPositive) {
            sentiment.positiveCount++;
        } else {
            sentiment.negativeCount++;
        }

        emit SentimentSubmitted(articleId, msg.sender, isPositive, comment, block.timestamp);
    }

    function getArticleSentiment(
        uint256 articleId, 
        address user
    ) external view validArticleId(articleId) returns (ArticleSentimentView memory) {
        SentimentData storage sentiment = articleSentiments[articleId];
        ArticleData memory article = getArticleById(articleId);
        
        bool votingActive = block.timestamp <= article.publishedTimestamp + VOTING_WINDOW;
        
        return ArticleSentimentView({
            positiveCount: sentiment.positiveCount,
            negativeCount: sentiment.negativeCount,
            userHasVoted: sentiment.hasVoted[user],
            userSentiment: sentiment.sentiment[user],
            userComment: sentiment.comments[user],
            votingActive: votingActive
        });
    }

    function getArticleById(uint256 articleId) public view validArticleId(articleId) returns (ArticleData memory) {
        // Search through all articles to find the one with matching ID
        for (uint256 i = 0; i < 3; i++) {
            if (topArticles[i].id == articleId) {
                return topArticles[i];
            }
        }
        
        // Search through historical articles
        for (uint256 d = 0; d < availableDates.length; d++) {
            ArticleData[] storage dailyArticles = articlesByDate[availableDates[d]];
            for (uint256 i = 0; i < dailyArticles.length; i++) {
                if (dailyArticles[i].id == articleId) {
                    return dailyArticles[i];
                }
            }
        }
        
        revert("Article not found");
    }

    function getArticlesByDate(uint256 targetDate) external view returns (ArticleData[] memory) {
        return articlesByDate[targetDate];
    }

    function getTodaysArticles() external view returns (ArticleData[] memory) {
        uint256 today = getCurrentDate();
        return articlesByDate[today];
    }

    function getAvailableDates() external view returns (uint256[] memory) {
        return availableDates;
    }

    function getCurrentDate() public view returns (uint256) {
        return block.timestamp / 1 days;
    }

    function getTopArticles() public view returns (Top3ArticlesData memory) {
        return Top3ArticlesData({
            article1: topArticles[0],
            article2: topArticles[1],
            article3: topArticles[2],
            totalArticles: totalArticles
        });
    }

    function getArticleByIndex(uint256 index) public view returns (ArticleData memory) {
        require(index < 3, "Index out of bounds - only 3 articles stored");
        return topArticles[index];
    }

    function getAllArticles() public view returns (ArticleData[3] memory) {
        return topArticles;
    }

    function getArticleTitle(uint256 index) public view returns (string memory) {
        require(index < 3, "Index out of bounds");
        return topArticles[index].title;
    }

    function getArticleDate(uint256 index) public view returns (string memory) {
        require(index < 3, "Index out of bounds");
        return topArticles[index].date;
    }

    function getContentLength(uint256 index) public view returns (uint256) {
        require(index < 3, "Index out of bounds");
        return topArticles[index].contentLength;
    }

    function getPublicationCount(uint256 index) public view returns (uint256) {
        require(index < 3, "Index out of bounds");
        return topArticles[index].publicationCount;
    }

    function getOverallBias(uint256 index) public view returns (string memory) {
        require(index < 3, "Index out of bounds");
        return topArticles[index].overallBias;
    }

    function getTotalArticles() public view returns (uint256) {
        return totalArticles;
    }

    function getLastUpdateTimestamp() public view returns (uint256) {
        return timestamp;
    }

    function getUpdateCount() public view returns (uint256) {
        return updateCount;
    }

    function isDataFresh() public view returns (bool) {
        return block.timestamp < timestamp + FRESHNESS_THRESHOLD;
    }

    function getTimeUntilNextUpdate() public view returns (uint256) {
        if (timestamp == 0) return 0; // Never updated, can update immediately
        
        uint256 nextUpdateTime = timestamp + FRESHNESS_THRESHOLD;
        if (block.timestamp >= nextUpdateTime) {
            return 0; // Can update now
        }
        
        return nextUpdateTime - block.timestamp;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        address previousOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(previousOwner, newOwner);
    }

    // ABI signature hack for easier testing and development
    function abiSignatureHack(DataTransportObject calldata dto) public pure {}

    function isWeb2JsonProofValid(
        IWeb2Json.Proof calldata _proof
    ) private view returns (bool) {
        return ContractRegistry.getFdcVerification().verifyJsonApi(_proof);
    }
}
