<div align="center">

# Cassanova Casino

### Sweepstakes Casino Platform — Crypto-Powered

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[Features](#-key-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## About

**Cassanova** is a sweepstakes casino platform powered by cryptocurrency. Players purchase Gold Coins (GC) with crypto and receive free Sweep Coins (SC) with every purchase. Gold Coins are used for entertainment play; Sweep Coins can be redeemed for crypto prizes.

Built with Next.js 15, React 19, Express 5, and MongoDB 8.

> **Disclaimer**: This platform operates under a sweepstakes model. No real-money gambling. Gold Coins have no monetary value. Sweep Coins are provided free and redeemable for prizes where permitted by law. Operators must ensure compliance with all applicable regulations.

## Key Features

### Dual Currency System
- **Gold Coins (GC)**: Purchased with cryptocurrency, used for entertainment play
- **Sweep Coins (SC)**: Given free with GC purchases and daily bonuses, redeemable for crypto prizes
- **Daily Bonus**: Claim 1,000 GC + 0.30 SC every 24 hours
- **Coin Packages**: Tiered bundles from Starter (10K GC) to Diamond (5M GC)

### Cryptocurrency Integration
- **Supported Currencies**: BTC, ETH, USDT, SOL, DOGE, LTC
- **Purchase Flow**: Select a coin package, choose a crypto currency, submit payment
- **Redemption Flow**: Convert SC to crypto prizes (minimum 100 SC, KYC required)

### Frontend Experience
- **Modern UI/UX**: Dark theme with gold/crimson accents, built with Tailwind CSS
- **Game Lobby**: Browse, filter, and search game collections with GC/SC play modes
- **Game Detail Pages**: RTP, volatility, min/max bets shown in both GC and SC
- **Live Jackpot Ticker**: Progressive jackpot displays in SC
- **User Dashboard**: Dual balance display, daily bonus claim, transaction history
- **Responsive Design**: Desktop, tablet, and mobile

### Authentication & Security
- **JWT Authentication**: Secure session management
- **Two-Factor Authentication**: TOTP-based 2FA with QR code setup
- **Email Verification**: Complete flow with resend
- **Password Reset**: Forgot/reset password functionality
- **KYC Verification**: Document upload required for SC redemptions
- **Password Hashing**: bcryptjs

### Casino Features
- **Game Catalog**: Comprehensive database with metadata and categories
- **Favorite Games**: Save and manage favorites
- **Promotions Engine**: GC/SC bonus promotions with eligibility rules
- **VIP System**: Bronze, Silver, Gold, Platinum tiers
- **Responsible Gaming**: Purchase limits, loss limits, session time limits, self-exclusion
- **Transaction History**: Full audit trail with type and currency filters

## Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript 5

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express 5
- **Database**: MongoDB 8 with Mongoose
- **Authentication**: JSON Web Tokens (JWT)
- **Security**: bcryptjs, CORS
- **Language**: TypeScript 5

## Quick Start

### Prerequisites
- Node.js 20 or higher
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/GizzZmo/Cassanova.git
cd Cassanova
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

3. **Seed Coin Packages**
```bash
cd backend
npm run seed
```

4. **Setup Frontend** (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```

5. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure

```
Cassanova/
├── frontend/              # Next.js frontend application
│   ├── app/              # Next.js 15 app directory
│   │   ├── layout.tsx    # Root layout with AuthProvider
│   │   ├── page.tsx      # Homepage
│   │   ├── login/        # Login page
│   │   ├── register/     # Registration page
│   │   ├── dashboard/    # User dashboard (protected)
│   │   ├── deposit/      # Buy Gold Coins (protected)
│   │   ├── withdraw/     # Redeem Sweep Coins (protected)
│   │   ├── games/        # Game pages
│   │   │   └── [slug]/   # Dynamic game detail pages
│   │   ├── promotions/   # Promotion pages
│   │   │   └── [slug]/   # Dynamic promotion detail pages
│   │   └── globals.css   # Global styles
│   ├── components/       # React components
│   │   ├── layout/       # Header, Footer
│   │   └── home/         # Homepage sections
│   ├── lib/              # Utility libraries
│   │   ├── api.ts        # API client
│   │   └── auth-context.tsx  # Authentication context
│   ├── types/            # TypeScript type definitions
│   └── public/           # Static assets
│
├── backend/              # Express backend API
│   └── src/
│       ├── server.ts     # Express server
│       ├── seed.ts       # Database seed script
│       ├── models/       # Mongoose models
│       │   ├── User.ts
│       │   ├── Game.ts
│       │   ├── CoinPackage.ts
│       │   ├── Promotion.ts
│       │   └── Transaction.ts
│       ├── routes/       # API routes
│       │   ├── auth.routes.ts
│       │   ├── game.routes.ts
│       │   ├── coinpackage.routes.ts
│       │   ├── promotion.routes.ts
│       │   ├── transaction.routes.ts
│       │   └── user.routes.ts
│       ├── controllers/  # Request handlers
│       │   ├── auth.controller.ts
│       │   ├── game.controller.ts
│       │   ├── coinpackage.controller.ts
│       │   ├── promotion.controller.ts
│       │   ├── transaction.controller.ts
│       │   └── user.controller.ts
│       └── middleware/   # Authentication middleware
│
└── docs/                 # Documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — User login (supports 2FA)
- `GET /api/auth/verify/:token` — Email verification
- `POST /api/auth/resend-verification` — Resend verification email
- `POST /api/auth/forgot-password` — Request password reset
- `POST /api/auth/reset-password` — Reset password with token
- `POST /api/auth/2fa/setup` — Setup two-factor authentication
- `POST /api/auth/2fa/verify` — Verify and enable 2FA
- `POST /api/auth/2fa/disable` — Disable 2FA
- `GET /api/auth/2fa/status` — Get 2FA status

### Coin Packages
- `GET /api/packages` — List active coin packages
- `POST /api/packages` — Create package (admin, auth required)
- `POST /api/packages/purchase` — Purchase GC with crypto (auth required)
- `POST /api/packages/daily-bonus` — Claim daily bonus (auth required)
- `POST /api/packages/redeem` — Redeem SC for crypto (auth required)

### Games
- `GET /api/games` — List all games (with filters)
- `GET /api/games/jackpots` — Get jackpot games
- `GET /api/games/:slug` — Get game details
- `POST /api/games` — Create game (admin, auth required)

### Users
- `GET /api/users/profile` — Get user profile
- `PUT /api/users/profile` — Update profile
- `PUT /api/users/responsible-gaming` — Update gaming limits
- `POST /api/users/favorites` — Toggle favorite game
- `POST /api/users/kyc/upload` — Upload KYC document
- `GET /api/users/kyc/documents` — Get KYC documents

### Promotions
- `GET /api/promotions` — List all promotions
- `GET /api/promotions/:slug` — Get promotion details
- `POST /api/promotions` — Create promotion (admin, auth required)

### Transactions
- `GET /api/transactions` — Get transaction history (supports `type`, `status`, `currency` filters)

## Frontend Routes

### Public Routes
- `/` — Homepage with game lobby, jackpot ticker, and promotions
- `/login` — User login
- `/register` — User registration
- `/forgot-password` — Request password reset
- `/reset-password` — Reset password with token
- `/verify-email` — Email verification
- `/games/[slug]` — Game detail pages
- `/promotions/[slug]` — Promotion detail pages

### Protected Routes (Require Authentication)
- `/dashboard` — Account overview, dual balances, daily bonus, transactions
- `/favorites` — Manage favorite games
- `/kyc` — KYC document upload and verification
- `/settings` — Security settings and 2FA
- `/deposit` — Buy Gold Coins with crypto
- `/withdraw` — Redeem Sweep Coins for crypto prizes

## Coin Packages (Seed Data)

| Package | Gold Coins | Free SC | Price (USDT) | Discount |
|---------|-----------|---------|-------------|----------|
| Starter Pack | 10,000 | 1 | $4.99 | — |
| Bronze Bundle | 50,000 | 5 | $19.99 | — |
| Silver Bundle | 150,000 | 18 | $49.99 | 10% |
| Gold Bundle | 500,000 | 75 | $99.99 | 15% |
| Platinum Bundle | 1,500,000 | 250 | $249.99 | 20% |
| Diamond Bundle | 5,000,000 | 1,000 | $499.99 | 25% |

## Security

- JWT-based authentication
- Password hashing with bcryptjs
- CORS protection
- Input validation
- KYC verification required for SC redemptions
- 2FA with TOTP
- Server-side balance validation for all transactions

## Roadmap

### Completed
- [x] Dual currency system (GC + SC)
- [x] Cryptocurrency purchase and redemption flows
- [x] Coin package model and seed data
- [x] Daily bonus system
- [x] Complete authentication (login, register, 2FA, email verify, password reset)
- [x] User dashboard with dual balances and transaction history
- [x] Game lobby with GC/SC play mode toggle
- [x] KYC verification interface
- [x] Promotions system with GC/SC bonuses
- [x] VIP tier system
- [x] Responsible gaming settings

### Upcoming
- [ ] Real crypto wallet/payment integration (NOWPayments, CoinGate, etc.)
- [ ] Custom slot engine integration
- [ ] Third-party game provider integration
- [ ] Admin dashboard
- [ ] Live chat support
- [ ] WebSocket real-time balance updates
- [ ] Multi-language support (i18n)
- [ ] Mobile app

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

**Sweepstakes Model**: This platform uses a sweepstakes model. Gold Coins are purchased for entertainment and have no cash value. Sweep Coins are provided free of charge and may be redeemed for prizes where permitted. Operators must comply with all applicable laws and obtain necessary licenses.

## Authors

- **GizzZmo** — [GizzZmo](https://github.com/GizzZmo)

---

<div align="center">

Made with care by [GizzZmo](https://github.com/GizzZmo)

</div>
