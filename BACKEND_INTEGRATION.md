# PayO Admin Portal — Backend Integration Reference
**Last updated against:** `admin_backend_L.zip`

This document is the source of truth for how the frontend and backend talk.
Both teams should refer to this whenever adding or changing any API.

---

## Base URL
- **Dev (local):** `http://localhost:3001`
- **Public (ngrok):** `https://anemia-stove-chief.ngrok-free.dev`

Update in `src/apis/Axios.js` → `API_BASE`.

---

## Authentication
All admin routes require `Authorization: Bearer <token>` header.
Token is stored in `localStorage` as `payo_token` after login.

### POST /api/admin/auth/login
```json
// Request
{ "email": "admin@payo.com", "password": "Admin@123" }

// Response
{
  "success": true,
  "token": "eyJhbGc...",
  "admin": {
    "name": "Super Admin",
    "email": "admin@payo.com",
    "mobile": "9000000000",
    "role": "admin",
    "superAdmin": true
  }
}
```

---

## User Model Fields
```
_id, name, email, mobile, role (user|admin),
kycVerified (Boolean), walletActivated (Boolean),
walletId (ref Wallet), isVerified (Boolean), createdAt
```

## KYC Model Fields
```
_id,
userId          → populated: { _id, name, mobile, email }
fullName        → String | null
aadharFrontUrl  → full URL | null
panCardUrl      → full URL | null
passportUrl     → full URL | null
selfieUrl       → full URL | null
status          → "not_started" | "documents_uploaded" | "under_review" | "approved" | "rejected"
reviewedBy      → populated: { name, email } | null
rejectionReason → String | null
reviewedAt      → Date | null
submissionCount → Number
createdAt, updatedAt
```

### Status → Frontend display mapping
```
not_started        → "Pending"
documents_uploaded → "In Review"
under_review       → "In Review"    ← only this can be approved/rejected
approved           → "Approved"
rejected           → "Failed"
```

## Bank Model Fields
```
_id, userId (ref User), accountHolderName, mobileNumber,
bankName, accountNumber, ifscCode, accountType (Savings|Current),
isTpinCreated (Boolean), createdAt
```

## Wallet Model Fields
```
_id, userId (ref User), balance (Number, default 100),
walletAddress, walletExpiry, qrCode, qrExpiry, qrToken
```

---

## All Admin Endpoints

### Users
| Method | Path | Response |
|--------|------|----------|
| GET | `/api/admin/auth/users` | `{ success, total, verified, pending, users: [{_id, name, email, mobile, kycVerified, createdAt, role}] }` |
| GET | `/api/admin/auth/all-admins` | `{ success, count, admins: [{_id, name, email, mobile, createdAt, role}] }` |
| POST | `/api/admin/auth/create-admin` | Body: `{name, mobile, email, password}` |
| PATCH | `/api/admin/auth/revoke-admin/:userId` | Demotes admin to user |
| PATCH | `/api/admin/auth/change-password` | Body: `{currentPassword, newPassword}` |

### KYC
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/kyc/dashboard-stats` | `{ success, stats: { totalSubmissions, notStarted, docsUploaded, underReview, approved, rejected } }` |
| GET | `/api/admin/kyc/all-submissions` | `{ success, total, page, totalPages, kycs: [...] }` — supports `?status=&page=&limit=` |
| GET | `/api/admin/kyc/pending-reviews` | `{ success, count, kycs: [...] }` — only `under_review`, oldest first |
| GET | `/api/admin/kyc/search-user?query=` | `{ success, count, kycs: [...] }` — search by name/mobile/email |
| GET | `/api/admin/kyc/submission-details/:kycId` | `{ success, kyc: {...full record with userId+reviewedBy populated} }` |
| PATCH | `/api/admin/kyc/approve-verification/:kycId` | No body. Activates wallet. Only for `under_review` records. |
| PATCH | `/api/admin/kyc/reject-verification/:kycId` | Body: `{ reason: "string" }`. Only for `under_review` records. |
| PATCH | `/api/admin/kyc/bulk-approve` | Body: `{ kycIds: ["id1","id2"] }` |
| PATCH | `/api/admin/kyc/bulk-reject` | Body: `{ kycIds: [...], reason: "string" }` |
| DELETE | `/api/admin/kyc/delete-record/:kycId` | Only for rejected records |
| GET | `/api/admin/kyc/audit-log` | `{ success, total, page, totalPages, logs: [...] }` |

---

## Page → Endpoint Mapping

| Frontend Page | Endpoints Used |
|---------------|----------------|
| Login | `POST /api/admin/auth/login` |
| Dashboard | `GET /api/admin/kyc/dashboard-stats` + `GET /api/admin/kyc/all-submissions` |
| KYC Review | `GET /api/admin/kyc/all-submissions`, `GET /api/admin/kyc/submission-details/:id`, `PATCH /approve-verification/:id`, `PATCH /reject-verification/:id` |
| Users | `GET /api/admin/auth/users` ✅ |
| Wallets | `GET /api/admin/kyc/all-submissions` (derived — no wallet admin endpoint yet) |
| Analytics | `GET /api/admin/kyc/dashboard-stats` + `GET /api/admin/kyc/all-submissions` |
| Audit Log | `GET /api/admin/kyc/audit-log` |
| Notifications | `GET /api/admin/kyc/all-submissions` (derived — no notifications admin endpoint yet) |
| AdminProfile | `PATCH /api/admin/auth/change-password` |

---

## ⚠️ Endpoints the frontend needs but backend does NOT have yet

| Frontend page | What it needs | What to build |
|---|---|---|
| **Users → Bank modal** | All users' bank details | `GET /api/admin/bank/all-banks` with `adminAuth` middleware doing `Bank.find({}).populate("userId","name mobile email")` → `{ success, count, banks: [{...bankFields, userId:{name,mobile,email}}] }` |
| **Wallets** | Real wallet balances | `GET /api/admin/wallets/all` doing `Wallet.find({}).populate("userId","name mobile email")` → `{ success, wallets: [{userId, balance, walletAddress}] }` |
| **Wallets** | Toggle wallet on/off | `PATCH /api/admin/wallets/:userId/toggle` |
| **Notifications** | Real admin notifications | `GET /api/admin/notifications` |

### ⚠️ Current bank API limitation
`GET /api/bank/all-banks` uses `auth` middleware and returns only the
currently-authenticated user's banks (`Bank.find({ userId: req.userId })`).
When called with an admin token, the super admin gets `req.userId = "super_admin"`
which matches no bank record → returns empty array.
**This endpoint cannot be used by the admin portal to view all users' bank details.**
The Users page bank modal shows a placeholder until the admin bank endpoint is added.

---

## Document URLs
Backend stores full URLs with protocol:
`https://anemia-stove-chief.ngrok-free.dev/kyc-docs/<userId>/<filename>`
These are directly usable in `<img src={url}>` tags — no need to prepend base URL.
