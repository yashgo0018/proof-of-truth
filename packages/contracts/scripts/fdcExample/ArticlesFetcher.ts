import { run, web3 } from "hardhat";
import { prepareAttestationRequestBase, submitAttestationRequest, retrieveDataAndProofBaseWithRetry } from "./Base";

const ArticlesFetcher = artifacts.require("ArticlesFetcher");

const { WEB2JSON_VERIFIER_URL_TESTNET, VERIFIER_API_KEY_TESTNET, COSTON2_DA_LAYER_URL } = process.env;

// bunx hardhat run scripts/fdcExample/ArticlesFetcher.ts --network coston2

// Request data for our articles API endpoint - simplified to get first article
const apiUrl = "https://examination-raymond-trial-ae.trycloudflare.com/api/articles/top";
const postProcessJq = `. as $all | $all[0] | {title: .mainArticleTitle, date: .mainArticlePublishedDate, contentLength: (.mainArticleContent | length), publicationCount: (.coveringPublications | length), overallBias: (.overallBiasDistribution | keys[0]), totalArticles: ($all | length)}`;
const httpMethod = "GET";
// Defaults to "Content-Type": "application/json"
const headers = "{}";
const queryParams = "{}";
const body = "{}";
const abiSignature = `{"components": [{"internalType": "string", "name": "title", "type": "string"},{"internalType": "string", "name": "date", "type": "string"},{"internalType": "uint256", "name": "contentLength", "type": "uint256"},{"internalType": "uint256", "name": "publicationCount", "type": "uint256"},{"internalType": "string", "name": "overallBias", "type": "string"},{"internalType": "uint256", "name": "totalArticles", "type": "uint256"}],"name": "articleData","type": "tuple"}`;

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

        // Get the updated article data
        const latestArticle = await articlesFetcher.getLatestArticle();
        const updateTimestamp = await articlesFetcher.getLastUpdateTimestamp();

        console.log("Latest Article Data:");
        console.log("- Title:", latestArticle.title);
        console.log("- Date:", latestArticle.date);
        console.log("- Content Length:", latestArticle.contentLength.toString(), "characters");
        console.log("- Publication Count:", latestArticle.publicationCount.toString());
        console.log("- Overall Bias:", latestArticle.overallBias);
        console.log("- Total Articles Available:", latestArticle.totalArticles.toString());
        console.log("- Last Updated:", new Date(updateTimestamp * 1000).toISOString());

        // Test other getter functions
        console.log("\nContract State:");
        console.log("- Article Title:", await articlesFetcher.getArticleTitle());
        console.log("- Article Date:", await articlesFetcher.getArticleDate());
        console.log("- Content Length:", (await articlesFetcher.getContentLength()).toString());
        console.log("- Publication Count:", (await articlesFetcher.getPublicationCount()).toString());
        console.log("- Overall Bias:", await articlesFetcher.getOverallBias());
        console.log("- Total Articles:", (await articlesFetcher.getTotalArticles()).toString());
        console.log("- Is Data Fresh:", await articlesFetcher.isDataFresh());
        console.log("- Contract Owner:", await articlesFetcher.owner());
    } catch (error: any) {
        console.error("Error updating articles:", error.message);

        // Try to get current state anyway
        const latestArticle = await articlesFetcher.getLatestArticle();
        const updateTimestamp = await articlesFetcher.getLastUpdateTimestamp();

        console.log("Current Article Data:");
        console.log("- Title:", latestArticle.title);
        console.log("- Last Updated:", updateTimestamp.toString());
        console.log("- Total Articles:", latestArticle.totalArticles.toString());
    }
}

async function displayContractInfo(articlesFetcher: any) {
    console.log("=== ArticlesFetcher Contract Info ===");
    console.log("Contract Address:", articlesFetcher.address);
    console.log("Owner:", await articlesFetcher.owner());
    console.log("Freshness Threshold:", "1 hour");

    const latestArticle = await articlesFetcher.getLatestArticle();
    const updateTimestamp = await articlesFetcher.getLastUpdateTimestamp();

    console.log("Current State:");
    console.log("- Latest Title:", latestArticle.title || "(none)");
    console.log("- Last Update:", updateTimestamp.toString());
    console.log("- Total Articles Available:", latestArticle.totalArticles.toString());
    console.log("- Is Data Fresh:", await articlesFetcher.isDataFresh());
    console.log("=====================================\n");
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
    console.log("🏗️  Deploying ArticlesFetcher contract only...\n");
    const articlesFetcher = await deployAndVerifyContract();
    await displayContractInfo(articlesFetcher);

    console.log("📋 Contract Methods Available:");
    console.log("- updateArticles(IWeb2Json.Proof)");
    console.log("- getLatestArticle()");
    console.log("- getArticleTitle()");
    console.log("- getArticleDate()");
    console.log("- getContentLength()");
    console.log("- getPublicationCount()");
    console.log("- getOverallBias()");
    console.log("- getTotalArticles()");
    console.log("- isDataFresh()");
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
