# 📰 ArticlesFetcher Smart Contract

A Flare smart contract that fetches and stores articles data from a Web2 API using the **FDC (Flare Data Connector) Web2Json** attestation system.

## 🚀 Overview

This implementation demonstrates how to use Flare's **Web2Json** attestation type to securely fetch data from external APIs and store it on-chain with cryptographic verification.

### Key Features

- ✅ **Web2Json Integration**: Uses Flare's FDC system to fetch API data
- ✅ **Data Freshness Control**: 1-hour freshness threshold to prevent stale data
- ✅ **Owner Access Control**: Only contract owner can update articles  
- ✅ **Article Counting**: Smart estimation of article count from JSON data
- ✅ **Event Emission**: Tracks all articles updates with events
- ✅ **Gas Optimized**: Efficient storage and retrieval patterns

## 📋 Files Structure

```
contracts/fdcExample/
├── ArticlesFetcher.sol        # Main smart contract
scripts/fdcExample/
├── ArticlesFetcher.ts         # Deployment and interaction script
├── Base.ts                    # Helper functions for FDC operations
```

## 🔧 Contract Interface

### Core Functions

```solidity
// Update articles with verified FDC proof
function updateArticles(IWeb2Json.Proof calldata data) external

// Get complete article data structure
function getLatestArticles() external view returns (ArticleData memory)

// Get raw JSON string
function getArticlesJson() external view returns (string memory)

// Get estimated article count
function getArticlesCount() external view returns (uint256)

// Check if data is still fresh (< 1 hour old)
function isDataFresh() external view returns (bool)

// Transfer contract ownership
function transferOwnership(address newOwner) external
```

### Data Structures

```solidity
struct ArticleData {
    string articlesJson;    // Raw JSON from API
    uint256 timestamp;      // Last update timestamp
    uint256 articleCount;   // Estimated number of articles
}

struct DataTransportObject {
    string articlesData;    // ABI decoded API response
}
```

## 🔗 API Configuration

The contract is configured to fetch data from:
- **API Endpoint**: `http://localhost:5001/api/articles/top`
- **HTTP Method**: `GET`
- **Data Processing**: Raw JSON (no post-processing)
- **ABI Signature**: `{"internalType": "string", "name": "articlesData", "type": "string"}`

## 📦 Installation & Setup

### 1. Install Dependencies

```bash
cd packages/flare-hardhat-starter
bun install
```

### 2. Environment Configuration

Create `.env` file with required variables:

```env
# Private key for development
PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000001

# FDC Testnet Configuration  
WEB2JSON_VERIFIER_URL_TESTNET=https://testnet-verifier-fdc-test.aflabs.org/
VERIFIER_API_KEY_TESTNET=00000000-0000-0000-0000-000000000000
COSTON2_DA_LAYER_URL=https://coston2-api.flare.network/ext/
COSTON2_RPC_URL=https://coston2-api.flare.network/ext/C/rpc
```

### 3. Compile Contracts

```bash
bunx hardhat compile
```

## 🚀 Deployment & Usage

### Local Deployment (Testing)

```bash
# Deploy contract only (no FDC interaction)
DEPLOY_ONLY=true bunx hardhat run scripts/fdcExample/ArticlesFetcher.ts --network hardhat
```

### Testnet Deployment (Full FDC Flow)

```bash
# Complete deployment with FDC attestation
bunx hardhat run scripts/fdcExample/ArticlesFetcher.ts --network coston2
```

## 🔐 How Web2Json Works

### Phase 1: Off-Chain (Attestation Providers)
1. **Request Preparation**: Script prepares attestation request with API URL
2. **Submission to FDC**: Request sent to Flare's attestation providers
3. **HTTP API Calls**: Providers make actual calls to `localhost:5001/api/articles/top`
4. **Proof Generation**: Cryptographic proofs created from API responses

### Phase 2: On-Chain (Smart Contract)
1. **Proof Verification**: Contract validates cryptographic proofs
2. **Data Extraction**: ABI decodes verified API response
3. **State Update**: Stores articles JSON, timestamp, and count
4. **Event Emission**: Emits `ArticlesUpdated` event

## 📊 Contract Features

### Access Control
- **Owner-Only Updates**: Only contract owner can call `updateArticles()`
- **Ownership Transfer**: Owner can transfer control to another address
- **Public Read Access**: Anyone can read stored articles data

### Data Freshness
- **1-Hour Threshold**: Prevents updates if data is < 1 hour old
- **Gas Optimization**: Avoids unnecessary updates and saves gas costs
- **Freshness Check**: `isDataFresh()` function for UI integration

### Article Counting
- **Smart Estimation**: Counts JSON objects in array format
- **String Processing**: Handles escaped characters and nested structures
- **Edge Cases**: Graceful handling of malformed JSON

## 🧪 Testing

### Local Testing
```bash
# Test compilation
bunx hardhat compile

# Test deployment locally
DEPLOY_ONLY=true bunx hardhat run scripts/fdcExample/ArticlesFetcher.ts --network hardhat

# Run contract tests (if available)
bunx hardhat test
```

### Integration Testing
```bash
# Test with actual FDC (requires valid API keys)
bunx hardhat run scripts/fdcExample/ArticlesFetcher.ts --network coston2
```

## 🔍 Monitoring & Events

### Events Emitted
```solidity
event ArticlesUpdated(string articlesJson, uint256 timestamp, uint256 articleCount);
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
```

### View Functions for Monitoring
```javascript
// Get current state
const articles = await contract.getLatestArticles();
console.log("Articles:", articles.articlesJson);
console.log("Count:", articles.articleCount.toString());
console.log("Updated:", new Date(articles.timestamp * 1000));

// Check freshness
const isFresh = await contract.isDataFresh();
console.log("Data is fresh:", isFresh);
```

## ⚠️ Important Notes

### Gas Considerations
- **Testnet Gas**: Coston2 requires sufficient gas allowance
- **Local Testing**: Use hardhat network for development
- **Data Size**: Large JSON responses consume more gas

### Security Features
- **Proof Verification**: All data cryptographically verified via FDC
- **Access Control**: Owner-only updates prevent unauthorized changes
- **Freshness Control**: Prevents spam updates and gas waste

### API Requirements
- **Endpoint Availability**: API must be accessible to Flare attestation providers
- **JSON Format**: Response should be valid JSON (preferably array format)
- **CORS**: API should allow cross-origin requests from Flare providers

## 🤝 Integration Examples

### Frontend Integration
```javascript
// Check if update needed
const isFresh = await contract.isDataFresh();
if (!isFresh) {
    // Trigger FDC update workflow
    await updateViaFDC();
}

// Display articles
const articles = await contract.getLatestArticles();
displayArticles(JSON.parse(articles.articlesJson));
```

### Backend Integration
```javascript
// Monitor for updates
contract.on('ArticlesUpdated', (articlesJson, timestamp, articleCount) => {
    console.log('New articles received:', {
        count: articleCount.toString(),
        timestamp: new Date(timestamp * 1000),
        preview: articlesJson.substring(0, 100)
    });
});
```

## 📚 References

- [Flare Web2Json Documentation](https://dev.flare.network/fdc/guides/hardhat/web-2-json)
- [FDC Overview](https://dev.flare.network/fdc/)
- [Flare Testnet Faucet](https://coston2-faucet.towolabs.com/)
- [Coston2 Explorer](https://coston2-explorer.flare.network/)

## ✅ Status

- ✅ **Contract Implemented**: ArticlesFetcher.sol complete
- ✅ **Deployment Script**: Full FDC integration workflow  
- ✅ **Local Testing**: Successfully deploys on hardhat network
- ✅ **Testnet Ready**: Configured for Coston2 deployment
- ⚠️ **API Keys Needed**: Valid Flare testnet keys required for full testing

---

**Created for Flare Hackathon** | **Web2Json + Smart Contract Integration** 🚀 