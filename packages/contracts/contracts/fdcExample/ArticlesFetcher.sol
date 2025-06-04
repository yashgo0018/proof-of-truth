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
}

contract ArticlesFetcher {
    ArticleData[3] public topArticles;
    uint256 public totalArticles;
    uint256 public timestamp;
    address public owner;
    uint256 public constant FRESHNESS_THRESHOLD = 24 hours; // Daily updates only
    uint256 public updateCount;

    event ArticlesUpdated(
        uint256 articleCount,
        uint256 timestamp,
        uint256 totalArticles,
        uint256 updateNumber
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
                overallBias: ""
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

        // Update top 3 articles
        topArticles[0] = ArticleData({
            title: dto.title1,
            date: dto.date1,
            contentLength: dto.contentLength1,
            publicationCount: dto.publicationCount1,
            overallBias: dto.overallBias1
        });

        topArticles[1] = ArticleData({
            title: dto.title2,
            date: dto.date2,
            contentLength: dto.contentLength2,
            publicationCount: dto.publicationCount2,
            overallBias: dto.overallBias2
        });

        topArticles[2] = ArticleData({
            title: dto.title3,
            date: dto.date3,
            contentLength: dto.contentLength3,
            publicationCount: dto.publicationCount3,
            overallBias: dto.overallBias3
        });

        totalArticles = dto.totalArticles;
        timestamp = block.timestamp;
        updateCount++;

        emit ArticlesUpdated(3, block.timestamp, dto.totalArticles, updateCount);
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
