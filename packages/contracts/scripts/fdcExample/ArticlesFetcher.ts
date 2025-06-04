import { run, web3 } from "hardhat";
import { prepareAttestationRequestBase, submitAttestationRequest, retrieveDataAndProofBaseWithRetry } from "./Base";

const ArticlesFetcher = artifacts.require("ArticlesFetcher");

const { WEB2JSON_VERIFIER_URL_TESTNET, VERIFIER_API_KEY_TESTNET, COSTON2_DA_LAYER_URL } = process.env;

// bunx hardhat run scripts/fdcExample/ArticlesFetcher.ts --network coston2

// Request data for our articles API endpoint - enhanced to get top 3 articles
const apiUrl = "https://examination-raymond-trial-ae.trycloudflare.com/api/articles/top";
const postProcessJq = `. as $all | {title1: $all[0].mainArticleTitle, date1: $all[0].mainArticlePublishedDate, contentLength1: ($all[0].mainArticleContent | length), publicationCount1: ($all[0].coveringPublications | length), overallBias1: ($all[0].overallBiasDistribution | keys[0]), title2: $all[1].mainArticleTitle, date2: $all[1].mainArticlePublishedDate, contentLength2: ($all[1].mainArticleContent | length), publicationCount2: ($all[1].coveringPublications | length), overallBias2: ($all[1].overallBiasDistribution | keys[0]), title3: $all[2].mainArticleTitle, date3: $all[2].mainArticlePublishedDate, contentLength3: ($all[2].mainArticleContent | length), publicationCount3: ($all[2].coveringPublications | length), overallBias3: ($all[2].overallBiasDistribution | keys[0]), totalArticles: ($all | length)}`;
const httpMethod = "GET";
// Defaults to "Content-Type": "application/json"
const headers = "{}";
const queryParams = "{}";
const body = "{}";
const abiSignature = `{"components": [{"internalType": "string", "name": "title1", "type": "string"},{"internalType": "string", "name": "date1", "type": "string"},{"internalType": "uint256", "name": "contentLength1", "type": "uint256"},{"internalType": "uint256", "name": "publicationCount1", "type": "uint256"},{"internalType": "string", "name": "overallBias1", "type": "string"},{"internalType": "string", "name": "title2", "type": "string"},{"internalType": "string", "name": "date2", "type": "string"},{"internalType": "uint256", "name": "contentLength2", "type": "uint256"},{"internalType": "uint256", "name": "publicationCount2", "type": "uint256"},{"internalType": "string", "name": "overallBias2", "type": "string"},{"internalType": "string", "name": "title3", "type": "string"},{"internalType": "string", "name": "date3", "type": "string"},{"internalType": "uint256", "name": "contentLength3", "type": "uint256"},{"internalType": "uint256", "name": "publicationCount3", "type": "uint256"},{"internalType": "string", "name": "overallBias3", "type": "string"},{"internalType": "uint256", "name": "totalArticles", "type": "uint256"}],"name": "articleData","type": "tuple"}`;

// Configuration constants
const attestationTypeBase = "Web2Json";
const sourceIdBase = "PublicWeb2";
const verifierUrlBase = WEB2JSON_VERIFIER_URL_TESTNET;

async function prepareAttestationRequest(apiUrl: string, postProcessJq: string, abiSignature: string) {
    const requestBody = {
        url: apiUrl,
        httpMethod: httpMethod,
        headers: headers,
        queryParams: queryParams,
        body: body,
        postProcessJq: postProcessJq,
        abiSignature: abiSignature,
    };

    const url = `${verifierUrlBase}Web2Json/prepareRequest`;
    const apiKey = VERIFIER_API_KEY_TESTNET;

    return await prepareAttestationRequestBase(url, apiKey, attestationTypeBase, sourceIdBase, requestBody);
}

async function retrieveDataAndProof(abiEncodedRequest: string, roundId: number) {
    const url = `${COSTON2_DA_LAYER_URL}api/v1/fdc/proof-by-request-round-raw`;
    console.log("Url:", url, "\n");
    return await retrieveDataAndProofBaseWithRetry(url, abiEncodedRequest, roundId);
}

async function deployAndVerifyContract() {
    const args: any[] = [];
    const articlesFetcher: any = await ArticlesFetcher.new(...args);
    try {
        await run("verify:verify", {
            address: articlesFetcher.address,
            constructorArguments: args,
        });
    } catch (e: any) {
        console.log("Verification error (this is normal for local development):", e.message);
    }
    console.log("ArticlesFetcher deployed to", articlesFetcher.address, "\n");
    return articlesFetcher;
}

async function interactWithContract(articlesFetcher: any, proof: any) {
    console.log("Proof hex:", proof.response_hex, "\n");

    // Get the response type for decoding
    const IWeb2JsonVerification = await artifacts.require("IWeb2JsonVerification");
    const responseType = IWeb2JsonVerification._json.abi[0].inputs[0].components[1];
    console.log("Response type:", responseType, "\n");

    const decodedResponse = web3.eth.abi.decodeParameter(responseType, proof.response_hex);
    console.log("Decoded proof:", decodedResponse, "\n");

    try {
        const transaction = await articlesFetcher.updateArticles({
            merkleProof: proof.proof,
            data: decodedResponse,
        });
        console.log("Transaction:", transaction.tx, "\n");

        // Get the updated articles data
        const topArticles = await articlesFetcher.getTopArticles();
        const updateTimestamp = await articlesFetcher.getLastUpdateTimestamp();
        const updateCount = await articlesFetcher.getUpdateCount();

        console.log("🗞️  TOP 3 ARTICLES UPDATED:");
        console.log("═══════════════════════════════════════");

        console.log("\n📰 ARTICLE #1:");
        console.log("- Title:", topArticles.article1.title);
        console.log("- Date:", topArticles.article1.date);
        console.log("- Content Length:", topArticles.article1.contentLength.toString(), "characters");
        console.log("- Publication Count:", topArticles.article1.publicationCount.toString());
        console.log("- Overall Bias:", topArticles.article1.overallBias);

        console.log("\n📰 ARTICLE #2:");
        console.log("- Title:", topArticles.article2.title);
        console.log("- Date:", topArticles.article2.date);
        console.log("- Content Length:", topArticles.article2.contentLength.toString(), "characters");
        console.log("- Publication Count:", topArticles.article2.publicationCount.toString());
        console.log("- Overall Bias:", topArticles.article2.overallBias);

        console.log("\n📰 ARTICLE #3:");
        console.log("- Title:", topArticles.article3.title);
        console.log("- Date:", topArticles.article3.date);
        console.log("- Content Length:", topArticles.article3.contentLength.toString(), "characters");
        console.log("- Publication Count:", topArticles.article3.publicationCount.toString());
        console.log("- Overall Bias:", topArticles.article3.overallBias);

        console.log("\n📊 SUMMARY:");
        console.log("- Total Articles Available:", topArticles.totalArticles.toString());
        console.log("- Last Updated:", new Date(updateTimestamp * 1000).toISOString());
        console.log("- Update Number:", updateCount.toString());
        console.log(
            "- Next Update Available:",
            (await articlesFetcher.isDataFresh())
                ? "In " + Math.floor((await articlesFetcher.getTimeUntilNextUpdate()).toString() / 3600) + " hours"
                : "Now"
        );

        // Test individual getter functions
        console.log("\n🔍 CONTRACT STATE VERIFICATION:");
        console.log("- Article 1 Title:", await articlesFetcher.getArticleTitle(0));
        console.log("- Article 2 Title:", await articlesFetcher.getArticleTitle(1));
        console.log("- Article 3 Title:", await articlesFetcher.getArticleTitle(2));
        console.log("- Total Articles:", (await articlesFetcher.getTotalArticles()).toString());
        console.log("- Update Count:", (await articlesFetcher.getUpdateCount()).toString());
        console.log("- Is Data Fresh:", await articlesFetcher.isDataFresh());
        console.log("- Contract Owner:", await articlesFetcher.owner());
    } catch (error: any) {
        console.error("Error updating articles:", error.message);

        // Try to get current state anyway
        const topArticles = await articlesFetcher.getTopArticles();
        const updateTimestamp = await articlesFetcher.getLastUpdateTimestamp();
        const updateCount = await articlesFetcher.getUpdateCount();

        console.log("Current Articles Data:");
        console.log("- Article 1 Title:", topArticles.article1.title);
        console.log("- Article 2 Title:", topArticles.article2.title);
        console.log("- Article 3 Title:", topArticles.article3.title);
        console.log("- Last Updated:", updateTimestamp.toString());
        console.log("- Update Count:", updateCount.toString());
        console.log("- Total Articles:", topArticles.totalArticles.toString());
    }
}

async function displayContractInfo(articlesFetcher: any) {
    console.log("=== Enhanced ArticlesFetcher Contract Info ===");
    console.log("Contract Address:", articlesFetcher.address);
    console.log("Owner:", await articlesFetcher.owner());
    console.log("Freshness Threshold:", "24 hours (daily updates only)");

    const topArticles = await articlesFetcher.getTopArticles();
    const updateTimestamp = await articlesFetcher.getLastUpdateTimestamp();
    const updateCount = await articlesFetcher.getUpdateCount();
    const timeUntilNext = await articlesFetcher.getTimeUntilNextUpdate();

    console.log("Current State:");
    console.log("- Stored Articles:", "Top 3 articles");
    console.log("- Article 1 Title:", topArticles.article1.title || "(none)");
    console.log("- Article 2 Title:", topArticles.article2.title || "(none)");
    console.log("- Article 3 Title:", topArticles.article3.title || "(none)");
    console.log("- Last Update:", updateTimestamp.toString());
    console.log("- Update Count:", updateCount.toString());
    console.log("- Total Articles Available:", topArticles.totalArticles.toString());
    console.log("- Is Data Fresh:", await articlesFetcher.isDataFresh());

    if (timeUntilNext > 0) {
        const hoursUntilNext = Math.floor(timeUntilNext / 3600);
        const minutesUntilNext = Math.floor((timeUntilNext % 3600) / 60);
        console.log("- Next Update Available In:", `${hoursUntilNext}h ${minutesUntilNext}m`);
    } else {
        console.log("- Next Update Available:", "Now");
    }

    console.log("===================================================\n");
}

async function main() {
    console.log("🚀 Starting ArticlesFetcher deployment and testing...\n");

    // Step 1: Prepare attestation request
    console.log("📝 Step 1: Preparing attestation request...");
    const data = await prepareAttestationRequest(apiUrl, postProcessJq, abiSignature);
    console.log("✅ Attestation request prepared\n");

    // Step 2: Submit request to FDC
    console.log("📤 Step 2: Submitting request to FDC...");
    console.log(data);
    const abiEncodedRequest = data.abiEncodedRequest;

    const roundId = await submitAttestationRequest(abiEncodedRequest);
    console.log("✅ Request submitted to FDC\n");

    // Step 3: Deploy contract
    console.log("🏗️  Step 3: Deploying ArticlesFetcher contract...");
    const articlesFetcher: any = await deployAndVerifyContract();
    await displayContractInfo(articlesFetcher);

    // Step 4: Retrieve proof and interact
    console.log("⏳ Step 4: Waiting for proof and updating contract...");
    const proof = await retrieveDataAndProof(abiEncodedRequest, roundId);

    console.log("🔄 Step 5: Updating articles with proof...");
    await interactWithContract(articlesFetcher, proof);

    console.log("🎉 ArticlesFetcher deployment and testing completed successfully!");
}

// Alternative function for just deploying the contract without FDC interaction
async function deployOnly() {
    console.log("🏗️  Deploying Enhanced ArticlesFetcher contract only...\n");
    const articlesFetcher = await deployAndVerifyContract();
    await displayContractInfo(articlesFetcher);

    console.log("📋 Enhanced Contract Methods Available:");
    console.log("Core Functions:");
    console.log("- updateArticles(IWeb2Json.Proof) - Updates top 3 articles (daily only)");
    console.log("- getTopArticles() - Returns all 3 articles in one call");
    console.log("- getAllArticles() - Returns array of 3 articles");
    console.log("- getArticleByIndex(uint256) - Get specific article (0, 1, or 2)");
    console.log("\nIndividual Article Getters (require index 0-2):");
    console.log("- getArticleTitle(uint256)");
    console.log("- getArticleDate(uint256)");
    console.log("- getContentLength(uint256)");
    console.log("- getPublicationCount(uint256)");
    console.log("- getOverallBias(uint256)");
    console.log("\nState & Control:");
    console.log("- getTotalArticles() - Total articles available in API");
    console.log("- getUpdateCount() - Number of successful updates");
    console.log("- getTimeUntilNextUpdate() - Seconds until next update allowed");
    console.log("- isDataFresh() - Whether within 24-hour freshness window");
    console.log("- transferOwnership(address)");

    return articlesFetcher;
}

// Run the main function or deploy only based on environment
if (process.env.DEPLOY_ONLY === "true") {
    void deployOnly().then(() => {
        process.exit(0);
    });
} else {
    void main().then(() => {
        process.exit(0);
    });
}
