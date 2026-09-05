# Cashflow

Cashflow is a student-focused personal finance application for recording income and expenses, reviewing current spending, and understanding monthly spending patterns. The project contains an Expo/React Native client and a separate Express/MongoDB API.

> Status: the repository passes its current tests, type checks, lint checks, Expo checks, and Android/iOS/web bundle export. A public backend deployment, production environment value, signed release build, and physical-device release test are still required before distribution.

## 1. Project purpose and screenshots

The app is designed to make daily expense tracking quick: select income or expense, enter an amount, choose a fixed category, and save. It also provides transaction history, dashboard totals, monthly reports, and a configurable local reminder.

<table>
  <tr>
    <td><img src="docs/screenshots/login.png" alt="Cashflow login screen" width="240"></td>
    <td><img src="docs/screenshots/dashboard.png" alt="Cashflow dashboard" width="240"></td>
    <td><img src="docs/screenshots/add.png" alt="Cashflow add transaction screen" width="240"></td>
  </tr>
  <tr>
    <td align="center">Login</td>
    <td align="center">Dashboard</td>
    <td align="center">Add transaction</td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/history.png" alt="Cashflow transaction history" width="240"></td>
    <td><img src="docs/screenshots/reports.png" alt="Cashflow monthly report" width="240"></td>
    <td></td>
  </tr>
  <tr>
    <td align="center">History</td>
    <td align="center">Reports</td>
    <td></td>
  </tr>
</table>

Main capabilities:

- Account registration, login, logout, and saved-session restoration
- JWT-protected API routes
- Per-user transaction ownership
- Income and expense creation, listing, editing, and deletion
- Current balance, current-month totals, and today's expense total
- Monthly expense totals grouped by category and day
- Fixed transaction categories validated on both client and server
- Local daily reminders and notification-tap navigation
- Light and dark interface support

## 2. Technology stack

| Area | Technology |
| --- | --- |
| Mobile | Expo SDK 57, React Native 0.86, React 19, TypeScript |
| Navigation | Expo Router |
| Forms and validation | React Hook Form, Zod |
| API client | Axios |
| Native token storage | Expo SecureStore |
| Notifications | Expo Notifications |
| Charts | React Native Gifted Charts, React Native SVG |
| Server | Node.js 24, Express 5, TypeScript |
| Database | MongoDB, Mongoose 9 |
| Authentication | bcrypt, JSON Web Tokens |
| API protection | Helmet, CORS allowlist support, authentication rate limiting |
| Tests | Node test runner with `tsx`, Jest with `jest-expo` |
| CI and builds | GitHub Actions, EAS Build |

Exact package versions are locked in `server/package-lock.json` and `mobile/package-lock.json`.

## 3. Folder structure

```text
cashflow/
├── .github/
│   └── workflows/
│       └── ci.yml                 # Server and mobile CI jobs
├── docs/
│   └── screenshots/               # README screenshots
├── mobile/
│   ├── __tests__/                 # Mobile unit tests
│   ├── assets/                    # Icons, splash art, and other images
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/            # Login and registration routes
│   │   │   └── (app)/             # Authenticated tab routes
│   │   ├── components/            # Reusable UI and charts
│   │   ├── constants/             # Categories and theme values
│   │   ├── context/               # Authentication state
│   │   ├── hooks/                 # Theme and notification hooks
│   │   ├── services/              # API and domain service functions
│   │   ├── types/                 # Shared API response types
│   │   ├── utils/                 # Money conversion and formatting
│   │   └── validation/            # Mobile form schemas
│   ├── app.json                   # Expo application configuration
│   ├── eas.json                   # Development, preview, and production profiles
│   └── package.json
├── server/
│   ├── src/
│   │   ├── __tests__/             # Server unit tests
│   │   ├── config/                # Environment and database configuration
│   │   ├── constants/             # Shared limits and categories
│   │   ├── controllers/           # Request handlers
│   │   ├── errors/                # Safe application error type
│   │   ├── middleware/            # Authentication, rate limits, error handling
│   │   ├── models/                # Mongoose models
│   │   ├── routes/                # API route definitions
│   │   ├── types/                 # Express type augmentation
│   │   ├── utils/                 # Password, token, money, and timezone helpers
│   │   ├── validation/            # Server request schemas
│   │   ├── app.ts                 # Express application
│   │   └── server.ts              # Database and HTTP server lifecycle
│   └── package.json
├── .gitignore
└── README.md
```

## 4. Local setup

### Requirements

- Node.js 24 or newer
- npm
- MongoDB Atlas or another reachable MongoDB server
- Expo Go for basic development, or a development APK for final native testing
- An Android device/emulator, iOS device/simulator, or modern web browser
- An Expo account for EAS Build or Expo tunnels

### Server

From the repository root:

```powershell
Set-Location server
npm ci
Copy-Item .env.example .env
```

Replace the placeholders in `server/.env`, then validate and start the API:

```powershell
npm run check
npm test
npm run dev
```

The server connects to MongoDB before opening its HTTP port. A successful start prints:

```text
Server listening on http://0.0.0.0:4000
```

Test the health endpoint from the development computer:

```powershell
curl.exe http://localhost:4000/api/health
```

Expected response:

```json
{ "status": "ok" }
```

### Mobile

Open a second terminal at the repository root:

```powershell
Set-Location mobile
npm ci
Copy-Item .env.example .env
npm run typecheck
npm run lint
npm test -- --runInBand
npm start
```

For a physical phone, `localhost` means the phone itself. Use the development computer's active LAN IPv4 address in `mobile/.env`, for example:

```dotenv
EXPO_PUBLIC_API_URL=http://192.168.1.25:4000/api
```

Before opening the app, visit `http://COMPUTER_IP:4000/api/health` in the phone browser. The phone and computer must be on a network that permits communication between devices.

`0.0.0.0` is the server's bind address. It is not an address to use in a browser or mobile environment variable.

## 5. Environment variables

Copy the committed example files. Never put real secrets in an `.env.example` file.

### `server/.env`

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | API port; defaults to `4000` and must be from 1 to 65535. |
| `MONGODB_URI` | Yes | MongoDB connection string. Secret. |
| `JWT_SECRET` | Yes | JWT signing secret with at least 32 UTF-8 bytes. Secret. |
| `TRUST_PROXY_HOPS` | No | Number of trusted reverse proxies; defaults to `0`. Configure this for the chosen host. |
| `CORS_ORIGINS` | No | Comma-separated browser origins. If absent, development CORS is unrestricted. |

Example structure:

```dotenv
PORT=4000
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER_HOST/DATABASE_NAME
JWT_SECRET=REPLACE_WITH_A_RANDOM_SECRET_AT_LEAST_32_BYTES_LONG
TRUST_PROXY_HOPS=0
# CORS_ORIGINS=https://app.example.com
```

### `mobile/.env`

| Variable | Required | Description |
| --- | --- | --- |
| `EXPO_PUBLIC_API_URL` | Yes | Complete API base URL ending in `/api`. |

```dotenv
EXPO_PUBLIC_API_URL=http://COMPUTER_IP:4000/api
```

Variables beginning with `EXPO_PUBLIC_` are compiled into the app and visible to users. Database credentials and JWT secrets must exist only on the server.

EAS values are separate from local `.env` files. Review them with:

```powershell
npx eas-cli@latest env:list --environment development
npx eas-cli@latest env:list --environment preview
npx eas-cli@latest env:list --environment production
```

Preview and production must use a deployed public HTTPS API. Do not use `localhost`, `0.0.0.0`, a private LAN IP, or a placeholder domain in a distributable build.

## 6. Available commands

### Server commands

Run inside `server/`:

| Command | Action |
| --- | --- |
| `npm run dev` | Start the TypeScript server in watch mode. |
| `npm run check` | Type-check without producing output. |
| `npm test` | Run server unit tests. |
| `npm run build` | Compile the server into `dist/`. |
| `npm start` | Run the compiled server. |

On Windows, stop a running server before `npm ci`. The running Node process can lock bcrypt's native file and cause an `EPERM ... bcrypt.node` error.

### Mobile commands

Run inside `mobile/`:

| Command | Action |
| --- | --- |
| `npm start` | Start the Expo development server. |
| `npm run android` | Open the project on Android. |
| `npm run ios` | Open the project on iOS; a local simulator requires macOS. |
| `npm run web` | Open the limited web build. |
| `npm run typecheck` | Run the TypeScript compiler without emitting files. |
| `npm run lint` | Run Expo's ESLint configuration. |
| `npm test -- --runInBand` | Run mobile Jest tests once in a single process. |
| `npx expo-doctor` | Validate Expo dependencies and configuration. |

## 7. API endpoints

Local base URL: `http://localhost:4000/api`

Protected endpoints require:

```http
Authorization: Bearer ACCESS_TOKEN
```

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health` | No | API health check |
| `POST` | `/auth/register` | No | Register and receive a token |
| `POST` | `/auth/login` | No | Log in and receive a token |
| `GET` | `/auth/me` | Yes | Load the current safe user profile |
| `POST` | `/transactions` | Yes | Create a transaction |
| `GET` | `/transactions` | Yes | List owned transactions with pagination and filters |
| `PATCH` | `/transactions/:id` | Yes | Update allowed fields on an owned transaction |
| `DELETE` | `/transactions/:id` | Yes | Delete an owned transaction; returns `204` |
| `GET` | `/dashboard/summary` | Yes | Get balance and current-period summary |
| `GET` | `/reports/monthly?month=9&year=2026` | Yes | Get timezone-aware monthly report data |

Registration and login are limited to 20 requests per IP in a 15-minute window. A blocked request returns HTTP `429`.

### Register request

```json
{
  "name": "Nimal",
  "email": "nimal@example.com",
  "password": "long-test-password"
}
```

Successful response: `201 Created`

```json
{
  "token": "...",
  "user": {
    "id": "...",
    "name": "Nimal",
    "email": "nimal@example.com"
  }
}
```

### Create transaction request

```json
{
  "type": "expense",
  "amount": "250.50",
  "category": "Food",
  "description": "Lunch",
  "transactionDate": "2026-09-05T07:30:00.000Z"
}
```

`description` and `transactionDate` are optional. Creation accepts a decimal string in `amount` and converts it to minor units on the server.

### List transaction query

```http
GET /api/transactions?page=1&limit=20&type=expense&month=9&year=2026
```

- `page` defaults to `1`.
- `limit` defaults to `20` and is capped at `100`.
- `type` accepts `income` or `expense`.
- `month` accepts 1 through 12 and requires `year`.

### Update transaction request

PATCH accepts only `type`, `amountMinor`, `category`, `description`, `transactionDate`, and `reviewed`. At least one field is required.

```json
{
  "amountMinor": 25050,
  "reviewed": true
}
```

Malformed transaction IDs return `400`. A valid ID that is missing or owned by another user returns `404`.

Allowed categories are case-sensitive: `Food`, `Transport`, `Boarding`, `Education`, `Mobile/Data`, `Entertainment`, `Health`, `Shopping`, and `Other`.

Expected errors contain a safe message:

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": {
    "formErrors": [],
    "fieldErrors": {}
  }
}
```

## 8. Authentication and money-storage rules

### Authentication

- Registration trims names and lowercases email addresses.
- Passwords require at least 8 characters and are limited to bcrypt's 72-byte UTF-8 boundary.
- Passwords are hashed with bcrypt cost factor 12 and are never stored as plaintext.
- `passwordHash` is excluded from normal Mongoose query results and API output.
- JWTs use `HS256`, expire after one hour, and contain only `userId` plus standard JWT timing claims.
- Tokens do not contain passwords, password hashes, email addresses, or financial data.
- Native clients store the token in SecureStore. The web fallback uses local storage.
- Transaction reads and mutations are always filtered by authenticated `userId`.
- Missing, malformed, expired, or invalid tokens return `401`.

### Money

- Money is stored and calculated as integer `amountMinor` values.
- `250.50 LKR` becomes `25050` minor units.
- Decimal input is parsed as text rather than by multiplying a JavaScript floating-point value.
- Blank, zero, negative, non-numeric, infinite, over-precision, unsafe, and excessively large values are rejected.
- The maximum transaction is `10,000,000,000` minor units, or `100,000,000.00 LKR`.
- Formatted strings such as `LKR 1,000.00` are display values only and must not be used in calculations.

User defaults are currency `LKR`, timezone `Asia/Colombo`, and reminder time `21:00`.

## 9. Testing and CI

Run the complete local check before every release candidate:

```powershell
# Server
Set-Location server
npm ci
npm run check
npm test
npm run build

# Mobile
Set-Location ..\mobile
npm ci
npx expo-doctor
npm run typecheck
npm run lint
npm test -- --runInBand
```

The GitHub Actions workflow in `.github/workflows/ci.yml` runs these server and mobile checks for pushes and pull requests targeting `main`.

Current automated coverage includes:

- Decimal money conversion, formatting, limits, and invalid input
- Registration normalization and unknown-field rejection
- bcrypt hashing cost and password comparison
- Password UTF-8 byte boundary
- IANA timezone validation
- JWT payload contents and verification
- Mobile authentication and transaction form validation

The test suite is not a substitute for integration or end-to-end testing. Before release, manually test registration, login, session restoration, transaction CRUD, cross-user ownership protection, reports, logout, offline behavior, notification permission, foreground notifications, and notification-tap navigation.

## 10. Android build instructions

### Verify first

```powershell
Set-Location mobile
npx expo-doctor
npm run typecheck
npm run lint
npm test -- --runInBand
```

### Configure EAS

```powershell
npx eas-cli@latest login
npx eas-cli@latest project:info
```

Set a real `EXPO_PUBLIC_API_URL` for each build environment used by `eas.json`. The development profile creates an APK with a development client, preview creates an internal test build, and production creates the store build.

### Development APK

```powershell
npx eas-cli@latest build --platform android --profile development
npx expo start --dev-client
```

Use this build for final local-notification and native-module testing.

### Internal preview

```powershell
npx eas-cli@latest build --platform android --profile preview
```

Install the artifact on physical devices and complete the release checklist before production.

### Production

```powershell
npx eas-cli@latest build --platform android --profile production
```

The production profile automatically increments the Android version code. Building successfully does not publish the app; Google Play Console setup, listing content, privacy disclosures, signing review, testing tracks, and submission are separate steps.

## 11. Known limitations

- A public HTTPS backend and production EAS API value are not configured in this repository.
- Unit tests exist, but database-backed integration tests, UI tests, and end-to-end tests do not.
- The remaining npm audit warnings are transitive Expo/tooling advisories. `npm audit fix --force` proposes incompatible downgrades and must not be used without an Expo SDK migration.
- Full notification behavior must be verified in a development or release build. Expo Go and web are not final notification test environments.
- Reminders are local to one device and are not synchronized with the server.
- Access tokens expire after one hour. There is no refresh-token flow, email verification, password reset, or account recovery.
- Web token storage uses browser local storage and has weaker protection than native SecureStore.
- Transaction creation accepts decimal `amount`, while PATCH accepts integer `amountMinor`; this asymmetry should be standardized in a future API version.
- The add and edit interfaces display the transaction time but do not yet provide a full date/time picker.
- Currency conversion and multi-currency accounts are not implemented.
- iOS has been bundle-checked but not manually tested or submitted.
- Store privacy policy, data-safety form, final listing assets, and production monitoring remain external release work.

## License

The server package currently declares ISC. Add a root license that clearly covers the complete repository before public distribution.
