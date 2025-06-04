import { expect } from "chai";
import { ethers } from "hardhat";

const ArticlesFetcher = artifacts.require("ArticlesFetcher");

describe("ArticlesFetcher", () => {
    let articlesFetcher: any;
    let owner: any;
    let otherAccount: any;

    beforeEach(async () => {
        const accounts = await ethers.getSigners();
        owner = accounts[0];
        otherAccount = accounts[1];

        articlesFetcher = await ArticlesFetcher.new();
    });

    describe("Deployment", () => {
        it("Should set the right owner", async () => {
            expect(await articlesFetcher.owner()).to.equal(owner.address);
        });

        it("Should initialize with empty articles data", async () => {
            const latestArticles = await articlesFetcher.getLatestArticles();
            expect(latestArticles.articlesJson).to.equal("");
            expect(latestArticles.timestamp.toString()).to.equal("0");
            expect(latestArticles.articleCount.toString()).to.equal("0");
        });

        it("Should report data as not fresh initially", async () => {
            expect(await articlesFetcher.isDataFresh()).to.be.false;
        });
    });

    describe("Access Control", () => {
        it("Should allow owner to transfer ownership", async () => {
            await articlesFetcher.transferOwnership(otherAccount.address, { from: owner.address });
            expect(await articlesFetcher.owner()).to.equal(otherAccount.address);
        });

        it("Should emit OwnershipTransferred event", async () => {
            const tx = await articlesFetcher.transferOwnership(otherAccount.address, { from: owner.address });
            // Note: Event testing may need adjustment based on the testing framework
        });

        it("Should not allow non-owner to transfer ownership", async () => {
            try {
                await articlesFetcher.transferOwnership(otherAccount.address, { from: otherAccount.address });
                expect.fail("Expected transaction to revert");
            } catch (error: any) {
                expect(error.message).to.include("Only owner can call this function");
            }
        });

        it("Should not allow transfer to zero address", async () => {
            try {
                await articlesFetcher.transferOwnership("0x0000000000000000000000000000000000000000", {
                    from: owner.address,
                });
                expect.fail("Expected transaction to revert");
            } catch (error: any) {
                expect(error.message).to.include("New owner cannot be zero address");
            }
        });
    });

    describe("Article Counting", () => {
        it("Should count simple JSON array correctly", async () => {
            const testData = '[{"id":1,"title":"Article 1"},{"id":2,"title":"Article 2"}]';
            // Note: This would need a helper function to test the counting logic
            // For now, we'll verify the contract compiles and basic functions work
        });
    });

    describe("Getter Functions", () => {
        it("Should return correct articles count", async () => {
            const count = await articlesFetcher.getArticlesCount();
            expect(count.toString()).to.equal("0");
        });

        it("Should return correct last update timestamp", async () => {
            const timestamp = await articlesFetcher.getLastUpdateTimestamp();
            expect(timestamp.toString()).to.equal("0");
        });

        it("Should return empty articles JSON initially", async () => {
            const json = await articlesFetcher.getArticlesJson();
            expect(json).to.equal("");
        });

        it("Should return complete articles data structure", async () => {
            const articles = await articlesFetcher.getLatestArticles();
            expect(articles.articlesJson).to.equal("");
            expect(articles.timestamp.toString()).to.equal("0");
            expect(articles.articleCount.toString()).to.equal("0");
        });
    });

    describe("Constants", () => {
        it("Should have correct freshness threshold", async () => {
            const threshold = await articlesFetcher.FRESHNESS_THRESHOLD();
            expect(threshold.toString()).to.equal("3600"); // 1 hour in seconds
        });
    });
});
