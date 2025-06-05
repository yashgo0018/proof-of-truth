# 🗞️ News Sentiment Tracker

A Web3 application for tracking community sentiment on daily news articles, built on the Flare blockchain.

## ✨ Features

- **📰 Daily News**: Automatically fetched top 3 news articles stored on-chain
- **🗳️ Sentiment Voting**: Vote positive/negative with optional comments
- **⏰ Time-Based Voting**: 24-hour voting window after article publication
- **📊 Real-time Results**: Live sentiment breakdown with vote counts
- **📅 Historical View**: Browse past articles and their final sentiment
- **🔗 Web3 Integration**: Wallet connection with Flare Coston2 testnet
- **🌙 Modern UI**: Responsive design with dark/light mode support

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) package manager
- MetaMask or compatible Web3 wallet
- Flare Coston2 testnet setup in your wallet

### Installation

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Start development server:**
   ```bash
   bun run dev
   ```

3. **Open in browser:**
   ```
   http://localhost:3000
   ```

### Wallet Setup

1. **Add Flare Coston2 testnet to MetaMask:**
   - Network Name: `Flare Testnet Coston2`
   - RPC URL: `https://coston2-api.flare.network/ext/bc/C/rpc`
   - Chain ID: `114`
   - Currency Symbol: `C2FLR`
   - Block Explorer: `https://coston2-explorer.flare.network`

2. **Get testnet tokens:**
   - Visit [Flare Faucet](https://faucet.flare.network/)
   - Request C2FLR tokens for testing

## 🎯 How to Use

### 1. **Connect Wallet**
- Click "Connect Wallet" in the top right
- Select your wallet (MetaMask, etc.)
- Ensure you're on Flare Coston2 testnet

### 2. **View Today's News**
- See today's top 3 articles automatically fetched from the API
- View article details: headline, sources, bias rating, publication time

### 3. **Vote on Sentiment**
- Click "Positive" or "Negative" for any article
- Optionally add a comment (up to 500 characters)
- Submit your sentiment to the blockchain

### 4. **View Results**
- See real-time sentiment breakdown
- View total votes and percentage split
- Check voting time remaining

### 5. **Browse History**
- Click "Past News" filter
- Select a date from the dropdown
- View historical articles and their final sentiment (read-only)

## 🏗️ Technical Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Web3**: Wagmi + Viem for blockchain interactions
- **Styling**: Tailwind CSS v4 with custom design system
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Package Manager**: Bun

## 📱 User Interface

### Main Features

- **Header**: Wallet connection and app branding
- **Stats Cards**: Today's article count, available dates, network info
- **Filter Controls**: Toggle between "Today" and "Past" news
- **Article Cards**: Individual articles with sentiment voting
- **Loading States**: Skeleton loading for better UX
- **Error Handling**: Clear error messages and recovery options

### Responsive Design

- **Mobile-first**: Optimized for mobile devices
- **Tablet Support**: Adapted layouts for medium screens
- **Desktop**: Full-featured desktop experience
- **Dark Mode**: Automatic system theme detection

## 🔗 Smart Contract Integration

The webapp connects to the `ArticlesFetcher` smart contract on Flare Coston2:

### Contract Address
```
0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### Key Functions Used

- `getTodaysArticles()` - Fetch today's articles
- `getArticlesByDate(date)` - Fetch articles for specific date
- `getArticleSentiment(articleId, user)` - Get sentiment data
- `submitSentiment(articleId, isPositive, comment)` - Submit vote
- `getAvailableDates()` - Get all dates with articles

## 🛠️ Development

### Project Structure

```
packages/webapp/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── layout.tsx       # Root layout with providers
│   │   ├── page.tsx         # Main homepage
│   │   └── globals.css      # Global styles
│   ├── components/          # React components
│   │   ├── ArticleCard.tsx  # Individual article display
│   │   └── WalletConnect.tsx# Wallet connection UI
│   ├── hooks/               # Custom React hooks
│   │   └── useArticles.ts   # Contract interaction hooks
│   └── lib/                 # Utilities and configuration
│       ├── config.ts        # Wagmi config and contract ABI
│       └── utils.ts         # Helper functions
├── package.json
├── tsconfig.json
└── README.md
```

### Environment Variables

No environment variables required for the frontend. All configuration is in `src/lib/config.ts`.

### Building for Production

```bash
bun run build
```

## 🧪 Testing

The application includes comprehensive error handling and loading states:

- **Network Errors**: Handles RPC failures gracefully
- **Transaction Errors**: Clear error messages for failed transactions
- **Loading States**: Skeleton loading during data fetching
- **Empty States**: Helpful messages when no data available

## 🔐 Security Considerations

- **Wallet Security**: Only read operations without wallet connection
- **Input Validation**: Comment length limits and XSS protection
- **Rate Limiting**: Blockchain-enforced voting restrictions
- **Time Validation**: Voting window enforcement

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🐛 Troubleshooting

### Common Issues

1. **Wallet not connecting**
   - Ensure MetaMask is installed
   - Check you're on Flare Coston2 testnet
   - Refresh the page and try again

2. **Transactions failing**
   - Check you have sufficient C2FLR tokens
   - Verify you're within the 24-hour voting window
   - Ensure you haven't already voted on this article

3. **Articles not loading**
   - Check your internet connection
   - Verify the contract address is correct
   - Try refreshing the page

### Getting Help

- Check the browser console for error messages
- Verify your wallet is properly connected
- Ensure you're on the correct network (Coston2)

---

Built with ❤️ on Flare Blockchain
