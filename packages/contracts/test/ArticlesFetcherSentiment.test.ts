import { expect } from "chai";
import { ethers } from "hardhat";
import { ArticlesFetcher } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("ArticlesFetcher with Sentiment", function () {
    let articlesFetcher: ArticlesFetcher;
    let owner: HardhatEthersSigner;
    let voter1: HardhatEthersSigner;
    let voter2: HardhatEthersSigner;

    beforeEach(async function () {
        [owner, voter1, voter2] = await ethers.getSigners();

        const ArticlesFetcherFactory = await ethers.getContractFactory("ArticlesFetcher");
        articlesFetcher = await ArticlesFetcherFactory.deploy();
        await articlesFetcher.waitForDeployment();
    });

    describe("Basic functionality", function () {
        it("Should deploy with correct initial state", async function () {
            expect(await articlesFetcher.owner()).to.equal(owner.address);
            expect(await articlesFetcher.updateCount()).to.equal(0);
            expect(await articlesFetcher.getTotalArticles()).to.equal(0);
        });

        it("Should have the correct constants", async function () {
            expect(await articlesFetcher.FRESHNESS_THRESHOLD()).to.equal(24 * 60 * 60); // 24 hours
            expect(await articlesFetcher.VOTING_WINDOW()).to.equal(24 * 60 * 60); // 24 hours
        });
    });

    describe("Date functionality", function () {
        it("Should get current date correctly", async function () {
            const currentDate = await articlesFetcher.getCurrentDate();
            const expectedDate = Math.floor(Date.now() / 1000 / (24 * 60 * 60));

            // Should be close to expected date (within 1 day)
            expect(Number(currentDate)).to.be.closeTo(expectedDate, 1);
        });

        it("Should track available dates", async function () {
            const availableDates = await articlesFetcher.getAvailableDates();
            expect(availableDates).to.have.length(0);
        });
    });

    describe("Article retrieval", function () {
        it("Should return empty arrays for non-existent dates", async function () {
            const articles = await articlesFetcher.getArticlesByDate(12345);
            expect(articles).to.have.length(0);
        });

        it("Should return empty array for today's articles initially", async function () {
            const todaysArticles = await articlesFetcher.getTodaysArticles();
            expect(todaysArticles).to.have.length(0);
        });
    });

    describe("Ownership", function () {
        it("Should transfer ownership correctly", async function () {
            await expect(articlesFetcher.transferOwnership(voter1.address))
                .to.emit(articlesFetcher, "OwnershipTransferred")
                .withArgs(owner.address, voter1.address);

            expect(await articlesFetcher.owner()).to.equal(voter1.address);
        });

        it("Should reject zero address for ownership transfer", async function () {
            await expect(articlesFetcher.transferOwnership(ethers.ZeroAddress)).to.be.revertedWith(
                "New owner cannot be zero address"
            );
        });

        it("Should reject non-owner trying to transfer ownership", async function () {
            await expect(articlesFetcher.connect(voter1).transferOwnership(voter2.address)).to.be.revertedWith(
                "Only owner can call this function"
            );
        });
    });

    describe("Data freshness", function () {
        it("Should allow update when never updated", async function () {
            expect(await articlesFetcher.isDataFresh()).to.equal(false);
            expect(await articlesFetcher.getTimeUntilNextUpdate()).to.equal(0);
        });
    });

    describe("Article ID validation", function () {
        it("Should reject invalid article IDs", async function () {
            await expect(articlesFetcher.getArticleById(999)).to.be.revertedWith("Invalid article ID");

            await expect(articlesFetcher.getArticleSentiment(999, voter1.address)).to.be.revertedWith(
                "Invalid article ID"
            );
        });
    });

    describe("Sentiment functionality", function () {
        it("Should reject sentiment submission for non-existent articles", async function () {
            await expect(articlesFetcher.connect(voter1).submitSentiment(999, true, "Great news!")).to.be.revertedWith(
                "Invalid article ID"
            );
        });
    });

    describe("Contract interface", function () {
        it("Should implement all required view functions", async function () {
            // Test that all view functions exist and don't revert
            await articlesFetcher.getTotalArticles();
            await articlesFetcher.getLastUpdateTimestamp();
            await articlesFetcher.getUpdateCount();
            await articlesFetcher.isDataFresh();
            await articlesFetcher.getTimeUntilNextUpdate();
            await articlesFetcher.getCurrentDate();
            await articlesFetcher.getAvailableDates();
            await articlesFetcher.getTodaysArticles();
        });

        it("Should have correct function selectors for interface compatibility", async function () {
            const iface = articlesFetcher.interface;

            // Check that key functions exist
            expect(iface.getFunction("submitSentiment")).to.not.be.null;
            expect(iface.getFunction("getArticleSentiment")).to.not.be.null;
            expect(iface.getFunction("getArticlesByDate")).to.not.be.null;
            expect(iface.getFunction("getTodaysArticles")).to.not.be.null;
        });
    });
});
