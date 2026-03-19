# Cassanova Casino — Project Documentation

## Overview

Cassanova is a sweepstakes casino platform powered by cryptocurrency. It uses a dual-currency model: **Gold Coins (GC)** for entertainment play and **Sweep Coins (SC)** that are given free and redeemable for crypto prizes. All purchases and redemptions use cryptocurrency.

### Frontend
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript 5
- **Features**: Server-side rendering, responsive design, client-side interactivity

### Backend
- **Framework**: Node.js 20+ with Express 5
- **Database**: MongoDB 8 with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Language**: TypeScript 5

## Dual Currency Model

### Gold Coins (GC)
- Purchased with cryptocurrency (BTC, ETH, USDT, SOL, DOGE, LTC)
- Used for entertainment play only
- No monetary value; cannot be redeemed

### Sweep Coins (SC)
- Given free with every GC purchase and daily bonuses
- Used for prize-eligible play
- Redeemable for cryptocurrency prizes (minimum 100 SC, KYC required)
- Cannot be purchased directly

### Daily Bonus
- 1,000 GC + 0.30 SC every 24 hours
- Available to all registered users
- Tracked via `lastDailyBonus` field on the User model

## Project Structure

```
Cassanova/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # Next.js 15 app directory
│   │   ├── layout.tsx       # Root layout with AuthProvider
│   │   ├── page.tsx         # Homepage
│   │   ├── dashboard/       # User dashboard (GC/SC balances, daily bonus, transactions)
│   │   ├── deposit/         # Buy Gold Coins page
│   │   ├── withdraw/        # Redeem Sweep Coins page
│   │   ├── games/[slug]/    # Game detail pages with GC/SC play toggle
│   │   ├── promotions/[slug]/ # Promotion detail pages
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/          # Header (dual balance display), Footer (crypto logos, disclaimer)
│   │   └── home/            # HeroBanner, JackpotTicker, PromotionsSection
│   ├── lib/
│   │   ├── api.ts           # API client with packages, transactions endpoints
│   │   └── auth-context.tsx # Auth context with formatGC/formatSC helpers
│   └── types/index.ts       # TypeScript interfaces (User, Transaction, CoinPackage, etc.)
│
├── backend/
│   └── src/
│       ├── server.ts        # Express server setup
│       ├── seed.ts          # Coin package seed script
│       ├── models/
│       │   ├── User.ts          # goldCoins, sweepCoins, bonusSweepCoins, cryptoAddresses
│       │   ├── Game.ts          # Game catalog
│       │   ├── CoinPackage.ts   # Purchasable GC bundles with crypto prices
│       │   ├── Promotion.ts     # GC/SC bonus promotions
│       │   └── Transaction.ts   # Dual-currency transaction ledger
│       ├── routes/
│       │   ├── coinpackage.routes.ts  # /api/packages (list, purchase, daily-bonus, redeem)
│       │   ├── transaction.routes.ts  # /api/transactions (history with filters)
│       │   └── ...
│       ├── controllers/
│       │   ├── coinpackage.controller.ts  # getAllPackages, createPackage
│       │   ├── transaction.controller.ts  # purchaseGoldCoins, redeemSweepCoins, claimDailyBonus
│       │   └── ...
│       └── middleware/
│
└── docs/
```

## Database Models

### User Model
| Field | Type | Description |
|-------|------|-------------|
| username | String | Unique username |
| email | String | Unique email |
| password | String | bcrypt-hashed password |
| goldCoins | Number | GC balance (default 0, min 0) |
| sweepCoins | Number | SC balance (default 0, min 0) |
| bonusSweepCoins | Number | Bonus SC balance (default 0, min 0) |
| lastDailyBonus | Date | Timestamp of last daily bonus claim |
| cryptoAddresses | Array | Saved crypto withdrawal addresses |
| vipLevel | String | bronze / silver / gold / platinum |
| kycStatus | String | pending / submitted / verified / rejected |
| responsibleGaming.purchaseLimit | Object | daily / weekly / monthly limits |
| twoFactorEnabled | Boolean | Whether 2FA is active |

### CoinPackage Model
| Field | Type | Description |
|-------|------|-------------|
| name | String | Display name |
| slug | String | URL-safe identifier (unique) |
| goldCoins | Number | GC amount in package |
| bonusSweepCoins | Number | Free SC included |
| priceUSDT | Number | Reference price in USDT |
| cryptoPrices | Array | `{ currency, amount }` per crypto |
| isPopular | Boolean | Highlighted in UI |
| isActive | Boolean | Available for purchase |
| discount | Number | Discount percentage (0-100) |
| sortOrder | Number | Display order |

### Transaction Model
| Field | Type | Description |
|-------|------|-------------|
| userId | ObjectId | Reference to User |
| type | String | gc_purchase, sc_redemption, gc_bet, gc_win, sc_bet, sc_win, sc_bonus, daily_bonus |
| currency | String | GC or SC |
| amount | Number | Transaction amount |
| status | String | pending / completed / failed / cancelled |
| cryptoCurrency | String | BTC, ETH, USDT, SOL, DOGE, LTC |
| cryptoAmount | Number | Amount in crypto |
| cryptoTxHash | String | Blockchain transaction hash |
| walletAddress | String | Crypto wallet address |
| packageId | ObjectId | Reference to CoinPackage |
| gcBefore / gcAfter | Number | GC balance snapshot |
| scBefore / scAfter | Number | SC balance snapshot |

### Promotion Model
| Field | Type | Description |
|-------|------|-------------|
| title | String | Promotion title |
| slug | String | URL-safe identifier |
| type | String | welcome-bonus, purchase-bonus, free-sc, daily-bonus, vip-bonus |
| bonusGoldCoins | Number | GC bonus amount |
| bonusSweepCoins | Number | SC bonus amount |
| bonusPercentage | Number | Percentage bonus on purchase |
| minGCPurchase | Number | Minimum GC purchase to qualify |
| maxBonusSC | Number | Maximum SC bonus cap |
| wageringRequirement | Number | Wagering multiplier |

### Game Model
| Field | Type | Description |
|-------|------|-------------|
| title | String | Game title |
| slug | String | URL-safe identifier |
| provider | String | Game provider name |
| category | String | slots, table-games, live-casino, etc. |
| rtp | Number | Return to Player percentage |
| volatility | String | low / medium / high |
| minBet / maxBet | Number | Bet range (in SC base units) |
| jackpotAmount | Number | Current jackpot (in SC) |

## API Endpoints

### Coin Packages (`/api/packages`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | No | List all active packages |
| POST | `/` | Yes | Create package (admin) |
| POST | `/purchase` | Yes | Purchase GC with crypto |
| POST | `/daily-bonus` | Yes | Claim daily bonus |
| POST | `/redeem` | Yes | Redeem SC for crypto |

### Transactions (`/api/transactions`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Yes | Get transaction history (filter by `type`, `status`, `currency`) |

### Authentication (`/api/auth`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | No | Register new user |
| POST | `/login` | No | Login (supports 2FA) |
| GET | `/verify/:token` | No | Email verification |
| POST | `/forgot-password` | No | Request password reset |
| POST | `/reset-password` | No | Reset password |
| POST | `/2fa/setup` | Yes | Setup 2FA |
| POST | `/2fa/verify` | Yes | Enable 2FA |
| POST | `/2fa/disable` | Yes | Disable 2FA |

### Games (`/api/games`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | No | List games (with filters) |
| GET | `/jackpots` | No | Get jackpot games |
| GET | `/:slug` | No | Get game details |
| POST | `/` | Yes | Create game (admin) |

### Users (`/api/users`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/profile` | Yes | Get user profile |
| PUT | `/profile` | Yes | Update profile |
| PUT | `/responsible-gaming` | Yes | Update gaming limits |
| POST | `/favorites` | Yes | Toggle favorite game |
| POST | `/kyc/upload` | Yes | Upload KYC document |
| GET | `/kyc/documents` | Yes | Get KYC documents |

### Promotions (`/api/promotions`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | No | List promotions |
| GET | `/:slug` | No | Get promotion details |
| POST | `/` | Yes | Create promotion (admin) |

## Frontend Pages

### Public
- **`/`** — Homepage: hero banner (GC + SC offer), game lobby, SC jackpot ticker, promotions
- **`/login`** — Login with optional 2FA
- **`/register`** — Registration form
- **`/games/[slug]`** — Game details with GC/SC play mode toggle, bet amounts in both currencies
- **`/promotions/[slug]`** — Promotion details with GC/SC bonus terms

### Protected
- **`/dashboard`** — GC balance, SC balance, VIP level, daily bonus claim, transaction history with type/currency filters
- **`/deposit`** — Buy Gold Coins: select package, choose crypto, submit purchase
- **`/withdraw`** — Redeem Sweep Coins: enter SC amount, choose crypto, provide wallet address (KYC required)
- **`/favorites`** — Manage favorite games
- **`/kyc`** — Upload verification documents (required for SC redemptions)
- **`/settings`** — Security settings, 2FA management

## Seed Data

Run `npm run seed` in the `backend/` directory to populate coin packages:

| Package | Gold Coins | Free SC | USDT Price | Discount |
|---------|-----------|---------|-----------|----------|
| Starter Pack | 10,000 | 1 | $4.99 | — |
| Bronze Bundle | 50,000 | 5 | $19.99 | — |
| Silver Bundle | 150,000 | 18 | $49.99 | 10% |
| Gold Bundle | 500,000 | 75 | $99.99 | 15% |
| Platinum Bundle | 1,500,000 | 250 | $249.99 | 20% |
| Diamond Bundle | 5,000,000 | 1,000 | $499.99 | 25% |

Each package includes computed crypto prices for BTC, ETH, USDT, SOL, DOGE, and LTC.

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env    # Edit with your MongoDB URI and JWT secret
npm run seed            # Populate coin packages
npm run dev             # Start at http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev             # Start at http://localhost:3000
```

## Legal Disclaimer

This platform operates under a sweepstakes model. Gold Coins are purchased for entertainment and carry no monetary value. Sweep Coins are provided free of charge with Gold Coin purchases and daily bonuses, and may be redeemed for prizes where permitted by law. No purchase is necessary to obtain Sweep Coins. Operators must comply with all applicable laws and regulations.
