# @roller-money/contracts

This package contains all the smart contracts for the RollerMoney betting platform, consolidated from the `@flare-foundry-starter` and `@roller-money-test` packages.

## Overview

RollerMoney is a decentralized betting platform that allows users to place bets on price ranges for various cryptocurrency assets. The platform uses Flare Network's FTSO v2 for real-time price feeds.

## Core Contracts

### RollerMoney.sol
The main betting contract that handles:
- Placing bets on price ranges
- Resolving bets using Flare FTSO v2 price feeds
- Managing supported assets
- Platform fee collection
- Emergency functions

### Other Contracts
- **Counter.sol**: Basic counter contract for testing
- **HelloWorld.sol**: Simple hello world contract
- **FtsoExample.sol**: Example integration with Flare FTSO v2
- **GuessingGame.sol**: Random number guessing game using Flare RNG
- **FdcTransferEventListener.sol**: Event listener for FDC transfers

## Dependencies

This project uses [Soldeer](https://soldeer.xyz/) for dependency management. Dependencies are defined in `soldeer.lock` and managed through Foundry.

### Current Dependencies:
- **@openzeppelin-contracts**: v5.2.0-rc.1 - Standard contract libraries
- **flare-periphery**: v0.0.22 - Flare Network periphery contracts
- **forge-std**: v1.9.5 - Foundry standard library
- **surl**: v0.0.0 - URL handling utilities

## Setup

1. Install dependencies:
```bash
bun run install-deps
```

2. Build contracts:
```bash
bun run build
```

3. Run tests:
```bash
bun run test
```

## Available Scripts

- `bun run build` - Compile all contracts
- `bun run test` - Run all tests
- `bun run clean` - Clean build artifacts
- `bun run install-deps` - Install Soldeer dependencies
- `bun run update-deps` - Update Soldeer dependencies
- `bun run generate-abis` - Generate ABI files
- `bun run build-and-generate` - Build contracts and generate ABIs
- `bun run deploy:local` - Deploy to local network
- `bun run deploy:sepolia` - Deploy to Sepolia testnet

## Project Structure

```
packages/contracts/
├── src/                    # Contract source files
│   ├── RollerMoney.sol    # Main betting contract
│   ├── fassets/           # F-Assets related contracts
│   ├── fdcExample/        # FDC example contracts
│   └── utils/             # Utility contracts
├── test/                  # Test files
├── script/                # Deployment and utility scripts
├── dependencies/          # Soldeer managed dependencies
├── foundry.toml          # Foundry configuration
├── soldeer.lock          # Dependency lock file
└── remappings.txt        # Import remappings
```

## Configuration

### Foundry Configuration
The project is configured in `foundry.toml` with:
- Solidity version: 0.8.25
- EVM version: Paris
- Optimizer enabled with 200 runs
- Via IR compilation

### Remappings
Import remappings are defined in `remappings.txt`:
- `@openzeppelin-contracts/` → OpenZeppelin contracts
- `flare-periphery/` → Flare periphery contracts
- `forge-std/` → Forge standard library
- `surl/` → SURL utilities

## Deployment

### Local Network
```bash
# Start local anvil node first
anvil

# Deploy contracts
bun run deploy:local
```

### Testnet Deployment
```bash
# Set environment variables
export SEPOLIA_RPC_URL="your_rpc_url"
export PRIVATE_KEY="your_private_key"
export ETHERSCAN_API_KEY="your_api_key"

# Deploy to Sepolia
bun run deploy:sepolia
```

## Environment Variables

Required for deployment:
- `PRIVATE_KEY` - Deployer private key
- `SEPOLIA_RPC_URL` - Sepolia RPC endpoint
- `ETHERSCAN_API_KEY` - Etherscan API key for verification

## Key Features

### RollerMoney Contract
- **Bet Placement**: Users can place bets on price ranges for supported assets
- **Price Feeds**: Uses Flare FTSO v2 for real-time price data
- **Spread Validation**: Enforces maximum 1% spread on price ranges
- **Automatic Resolution**: Bets are resolved after expiry using latest price data
- **Platform Fees**: 5% fee on winning payouts
- **Owner Functions**: Asset management and fee withdrawal

### Constants
- `BET_DURATION`: 60 seconds (1 minute)
- `PLATFORM_FEE_BPS`: 500 basis points (5%)
- `PAYOUT_MULTIPLIER`: 2x for winning bets
- `MAX_SPREAD_BPS`: 100 basis points (1% max spread)

## Testing

Run the test suite:
```bash
bun run test
```

Individual test files:
- `RollerMoney.t.sol` - Main contract tests
- `GuessingGame.t.sol` - Random number game tests
- `HelloWorld.t.sol` - Basic contract tests

## Security Considerations

- Contracts use OpenZeppelin's security patterns
- Price feeds include timestamp validation
- Emergency withdrawal functions for owner
- Reentrancy protection on payouts
- Input validation on all public functions

## License

MIT License - see individual contract files for details.
