# QuickBite 🍔

A full-stack food ordering app built with **React + Vite** (frontend) and **Express.js** (backend), deployed as a monorepo.

**Live:** [raftlabs-monorepo.vercel.app](https://raftlabs-monorepo.vercel.app)  
**API:** [raftlabs-monorepo.onrender.com](https://raftlabs-monorepo.onrender.com)

---

## Features

- Browse a menu with category filtering
- Add/remove items from a persistent cart
- Place orders with name, address, and phone validation
- Real-time order status tracking via **Server-Sent Events (SSE)**
- Server-side price calculation — client can never spoof costs

---

## Tech Stack

| Layer      | Technology                                                      |
| ---------- | --------------------------------------------------------------- |
| Frontend   | React 18, Vite, Tailwind CSS                                    |
| Backend    | Node.js, Express 4                                              |
| Real-time  | Server-Sent Events (SSE)                                        |
| Testing    | Vitest + Testing Library (frontend), Jest + Supertest (backend) |
| Deployment | Vercel (frontend) + Render (backend)                            |

---

## Project Structure

```tree
raftlabs/
├── frontend/          # React + Vite SPA
│   ├── src/
│   │   ├── components/    # MenuCard, CartDrawer, CheckoutModal, OrderStepper
│   │   ├── context/       # CartContext, OrderContext
│   │   └── pages/         # MenuPage, OrderStatusPage
│   └── vite.config.js     # Dev proxy: /api → localhost:3001
│
├── backend/           # Express REST API
│   ├── src/
│   │   ├── app.js         # Express setup: CORS, rate-limiting, routes, error handler
│   │   ├── server.js      # Entry: app.listen(3001)
│   │   ├── routes/
│   │   │   ├── menu.js    # GET /api/menu, GET /api/menu/:id
│   │   │   └── orders.js  # POST/GET /api/orders, PATCH status, GET SSE stream
│   │   ├── store/
│   │   │   └── orders.js  # In-memory store + SSE client registry + status timer
│   │   └── middleware/
│   │       └── validate.js  # Joi-style request validation
│   └── tests/             # Supertest integration tests
│
├── vercel.json        # Vercel config: build frontend, proxy /api/* to Render
└── CLAUDE.md          # AI assistant context
```

---

## API Reference

| Method  | Path                     | Description                                                                    |
| ------- | ------------------------ | ------------------------------------------------------------------------------ |
| `GET`   | `/api/menu`              | All menu items. Optional `?category=` filter                                   |
| `GET`   | `/api/menu/:id`          | Single menu item                                                               |
| `POST`  | `/api/orders`            | Create order `{ customerName, address, phone, items: [{ itemId, quantity }] }` |
| `GET`   | `/api/orders/:id`        | Get order by ID                                                                |
| `PATCH` | `/api/orders/:id/status` | Advance status one step                                                        |
| `GET`   | `/api/orders/:id/stream` | SSE stream — pushes status updates in real time                                |

Order status progression: `Order Received → Preparing → Out for Delivery → Delivered`

---

## Running Locally

**Prerequisites:** Node.js 18+

```bash
# 1. Backend
cd backend
npm install
npm run dev          # http://localhost:3001

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev          # http://localhost:5173
```

The Vite dev server proxies `/api` to `localhost:3001` — no CORS config needed locally.

---

## Running Tests

```bash
# Backend (Jest + Supertest)
cd backend && npm test

# Frontend (Vitest + Testing Library)
cd frontend && npm test
```

---

## Architecture Decisions

**SSE over WebSockets** — order status is unidirectional (server → client). SSE is natively supported by browsers, requires no extra dependencies, and auto-reconnects.

**`app.js` / `server.js` split** — `app.js` exports the Express app without binding to a port, enabling clean Supertest integration tests that don't leave sockets open.

**In-memory store** — zero-config for the assessment scope. The store exposes a `_reset()` helper that test suites call in `beforeEach` for isolation.

**Server-side pricing** — `POST /api/orders` looks up prices from the authoritative `menu.js` catalogue and ignores any price the client sends. Prevents cost spoofing.

**Context API over Redux** — the app has two slices of shared state (cart, active order). Context + `useReducer` is the right-sized tool; Redux would be over-engineering.

---

## Deployment

| Service    | Role                                            | URL                                                    |
| ---------- | ----------------------------------------------- | ------------------------------------------------------ |
| **Vercel** | Hosts the React SPA, proxies `/api/*` to Render | [vercel.app](raftlabs-monorepo-kv2v.vercel.app)        |
| **Render** | Runs the persistent Express server + SSE        | [onrender.com](https://raftlabs-monorepo.onrender.com) |

Vercel rewrites proxy all `/api/*` requests to Render, so the browser sees a single origin — no CORS headers required on the frontend.

> **Note:** Render free tier spins down after 15 min of inactivity. First request after idle may take ~30s.
