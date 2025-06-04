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
    uint256 totalArticles;
}

struct DataTransportObject {
    string title;
    string date;
    uint256 contentLength;
    uint256 publicationCount;
    string overallBias;
    uint256 totalArticles;
}

interface IArticlesFetcher {
    function updateArticles(IWeb2Json.Proof calldata data) external;
    function getLatestArticle() external view returns (ArticleData memory);
    function getTotalArticles() external view returns (uint256);
}

contract ArticlesFetcher {
    ArticleData public latestArticle;
    uint256 public timestamp;
    address public owner;
    uint256 public constant FRESHNESS_THRESHOLD = 1 hours;

    event ArticlesUpdated(
        string title,
        uint256 timestamp,
        uint256 totalArticles
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
            "Data is still fresh, update not needed"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
        timestamp = 0;
        latestArticle = ArticleData({
            title: "",
            date: "",
            contentLength: 0,
            publicationCount: 0,
            overallBias: "",
            totalArticles: 0
        });
    }

    function updateArticles(
        IWeb2Json.Proof calldata data
    ) public onlyOwner onlyFreshData {
        require(isWeb2JsonProofValid(data), "Invalid proof");

        DataTransportObject memory dto = abi.decode(
            data.data.responseBody.abiEncodedData,
            (DataTransportObject)
        );

        latestArticle = ArticleData({
            title: dto.title,
            date: dto.date,
            contentLength: dto.contentLength,
            publicationCount: dto.publicationCount,
            overallBias: dto.overallBias,
            totalArticles: dto.totalArticles
        });
        timestamp = block.timestamp;

        emit ArticlesUpdated(dto.title, block.timestamp, dto.totalArticles);
    }

    function getLatestArticle() public view returns (ArticleData memory) {
        return latestArticle;
    }

    function getArticleTitle() public view returns (string memory) {
        return latestArticle.title;
    }

    function getArticleDate() public view returns (string memory) {
        return latestArticle.date;
    }

    function getContentLength() public view returns (uint256) {
        return latestArticle.contentLength;
    }

    function getPublicationCount() public view returns (uint256) {
        return latestArticle.publicationCount;
    }

    function getOverallBias() public view returns (string memory) {
        return latestArticle.overallBias;
    }

    function getTotalArticles() public view returns (uint256) {
        return latestArticle.totalArticles;
    }

    function getLastUpdateTimestamp() public view returns (uint256) {
        return timestamp;
    }

    function isDataFresh() public view returns (bool) {
        return block.timestamp < timestamp + FRESHNESS_THRESHOLD;
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
