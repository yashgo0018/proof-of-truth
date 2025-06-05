# Proof of Trust

A Web3 application for tracking news sentiment and building trust through blockchain verification on the Flare network.

## 🎯 Overview

Proof of Trust enables transparent, immutable news sentiment tracking by allowing users to vote on news articles and store their sentiment data on the Flare blockchain. The platform promotes community consensus and builds trust through verifiable, on-chain data.

## 🔄 Complete End-to-End Flow

```mermaid
flowchart TD
    Start([User Visits Proof of Trust]) --> ViewLanding{Landing Page}
    
    ViewLanding --> BrowseArticles[Browse Articles - View Today's News - View Historical News]
    ViewLanding --> ConnectWallet[Connect Wallet - Wagmi Integration]
    
    %% Article Browsing Flow
    BrowseArticles --> FilterChoice{Choose Filter}
    FilterChoice -->|Today| TodayArticles[Load Today's Articles - Smart Contract Call]
    FilterChoice -->|Historical| DateSelection[Select Date - Date Picker]
    DateSelection --> HistoricalArticles[Load Historical Articles - Smart Contract Call]
    
    %% Wallet Connection Flow
    ConnectWallet --> WalletCheck{Wallet Connected?}
    WalletCheck -->|No| WalletPrompt[Show Wallet Connection - MetaMask etc]
    WalletPrompt --> WalletConnect[Connect to Flare Coston2 - Network 114]
    WalletConnect --> WalletConnected[Wallet Connected]
    WalletCheck -->|Yes| WalletConnected
    
    %% Smart Contract Integration
    TodayArticles --> ContractRead1[Contract: getTodaysArticles]
    HistoricalArticles --> ContractRead2[Contract: getArticlesByDate]
    ContractRead1 --> DisplayArticles[Display Article Cards - Title Date Sentiment]
    ContractRead2 --> DisplayArticles
    
    %% Article Interaction Flow
    DisplayArticles --> ArticleClick{User Clicks Article}
    WalletConnected --> VotingEnabled[Voting Enabled]
    
    ArticleClick --> ArticleDetails[Show Article Details - Current Sentiment - Vote Counts]
    ArticleDetails --> VoteChoice{User Action}
    
    VoteChoice -->|Vote Positive| PositiveVote[Submit Positive Vote - Sentiment True]
    VoteChoice -->|Vote Negative| NegativeVote[Submit Negative Vote - Sentiment False]
    VoteChoice -->|Add Comment| CommentSubmit[Submit Comment - Text plus Sentiment]
    VoteChoice -->|Just View| BackToList[Back to Article List]
    
    %% Blockchain Transaction Flow
    PositiveVote --> TxSubmit1[Submit Transaction - submitSentiment with true]
    NegativeVote --> TxSubmit2[Submit Transaction - submitSentiment with false]
    CommentSubmit --> TxSubmit3[Submit Transaction - submitSentiment with comment]
    
    TxSubmit1 --> TxConfirm{Transaction Status}
    TxSubmit2 --> TxConfirm
    TxSubmit3 --> TxConfirm
    
    TxConfirm -->|Success| TxSuccess[Vote Recorded on Blockchain - Flare Coston2]
    TxConfirm -->|Failed| TxError[Transaction Failed - Retry Option]
    TxConfirm -->|Pending| TxPending[Waiting for Confirmation - Loading State]
    
    TxSuccess --> UpdateUI[Update Article Display - New Sentiment Counts]
    TxError --> VoteChoice
    TxPending --> TxConfirm
    
    %% Data Flow
    UpdateUI --> RefreshData[Fetch Updated Data - getArticleSentiment call]
    RefreshData --> DisplayUpdated[Show Updated Results - New Vote Counts - User Vote Status]
    
    DisplayUpdated --> BackToList
    BackToList --> BrowseArticles
    
    %% Admin/System Flow
    SystemUpdate[Daily Article Fetch - External News API] -.-> SmartContract[Smart Contract - ArticlesFetcher - Address 0xa692540b]
    SmartContract -.-> FlareNetwork[Flare Coston2 Testnet - Chain ID 114]
    
    %% Error Handling
    ContractRead1 -.->|Error| ErrorState[Loading Error - Retry Button]
    ContractRead2 -.->|Error| ErrorState
    ErrorState -.-> FilterChoice
    
    %% Styling
    classDef userAction fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef blockchain fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef contract fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef error fill:#ffebee,stroke:#b71c1c,stroke-width:2px
    
    class ConnectWallet,VoteChoice,ArticleClick userAction
    class FlareNetwork,TxSubmit1,TxSubmit2,TxSubmit3,TxSuccess blockchain
    class ContractRead1,ContractRead2,SmartContract contract
    class TxError,ErrorState error
```

## 🏗️ Architecture Components

### Frontend (Next.js + React)
- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query + Wagmi
- **Web3 Integration**: Wagmi + Viem

### Blockchain Layer
- **Network**: Flare Coston2 Testnet (Chain ID: 114)
- **Smart Contract**: ArticlesFetcher (`0xa692540b8c89A8B4aFF92225B55C01dbD2085D7A`)
- **Wallet Connection**: MetaMask, WalletConnect, etc.

### Smart Contract Functions
```solidity
// Read Functions
getTodaysArticles() → ArticleData[]
getArticlesByDate(uint256 targetDate) → ArticleData[]
getArticleSentiment(uint256 articleId, address user) → ArticleSentimentView
getAvailableDates() → uint256[]

// Write Functions  
submitSentiment(uint256 articleId, bool sentiment, string comment)
```

## 🗃️ Data Structure

### ArticleData
```typescript
type ArticleData = {
  title: string;
  date: string;
  contentLength: bigint;
  publicationCount: bigint;
  overallBias: string;
  publishedTimestamp: bigint;
  id: bigint;
}
```

### ArticleSentimentView
```typescript
type ArticleSentimentView = {
  positiveCount: bigint;
  negativeCount: bigint;
  userHasVoted: boolean;
  userSentiment: boolean;
  userComment: string;
  votingActive: boolean;
}
```

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone git@github.com:yashgo0018/proof-of-truth.git
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Start development server**
   ```bash
   cd packages/webapp
   bun run dev
   ```

4. **Configure MetaMask**
   - Network: Flare Coston2
   - Chain ID: 114
   - RPC URL: `https://coston2-api.flare.network/ext/bc/C/rpc`

## 🔧 Key Features

### 📰 Article Management
- Daily automated article fetching
- Historical article browsing
- Date-based filtering
- Real-time sentiment display

### 🗳️ Sentiment Voting
- Positive/Negative sentiment voting
- Comment submission with votes
- User vote tracking
- Prevents double voting

### 🔗 Blockchain Integration
- Immutable vote storage
- Transparent sentiment data
- Decentralized consensus
- Gas-efficient transactions

### 👤 User Experience
- No-wallet browsing mode
- Seamless wallet connection
- Real-time UI updates
- Error handling & retries

## 🛠️ Technical Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Web3**: Wagmi, Viem, TanStack Query
- **Blockchain**: Flare Network (Coston2 Testnet)
- **Smart Contracts**: Solidity
- **Package Manager**: Bun

## 🔒 Security Considerations

- User vote validation
- Preventing duplicate votes
- Secure wallet integration
- Transaction error handling
- Smart contract interaction safety

## 🌐 Network Configuration

### Flare Coston2 Testnet
- **Chain ID**: 114
- **Currency**: C2FLR (Testnet Flare)
- **RPC URL**: `https://coston2-api.flare.network/ext/bc/C/rpc`
- **Explorer**: `https://coston2-explorer.flare.network`

## 📝 Smart Contract Addresses

- **ArticlesFetcher**: `0xa692540b8c89A8B4aFF92225B55C01dbD2085D7A`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Proof of Trust** - Building trust through transparent, immutable news sentiment tracking powered by Web3 🚀
