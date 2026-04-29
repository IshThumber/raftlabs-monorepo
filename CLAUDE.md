# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QuickBite — a food ordering app with a React frontend and Express backend. The backend serves a static menu and manages orders in memory (no database). The frontend lets users browse the menu, add items to a cart, place orders, and track order status.

## Commands

### Backend (port 3001)

```bash
cd backend
npm run dev          # Start with nodemon (auto-reload)
npm start            # Start without auto-reload
npm test             # Run Jest tests (supertest integration tests)
```

### Frontend (port 5173)

```bash
cd frontend
npm run dev          # Vite dev server
npm run build        # Production build
npm test             # Vitest run
npm run test:watch   # Vitest in watch mode
```

## Architecture

### Backend (`backend/`)

- **Entry point**: `server.js` — starts Express on port 3001.
- **App setup**: `src/app.js` — wires CORS, JSON parsing, health check, routes, 404/500 handlers.
- **Routes**: `src/routes/menu.js` (GET /api/menu, GET /api/menu/:id) and `src/routes/orders.js` (POST/GET /api/orders, GET /api/orders/:id, PATCH /api/orders/:id/status).
- **In-memory store**: `src/store/orders.js` — plain array with add/getAll/getById. Data is lost on restart.
- **Static data**: `src/data/menu.js` — hardcoded array of 10 menu items with id, name, price, category, image (emoji).
- **Validation middleware**: `src/middleware/validate.js` — validates order POST body (customerName required, items must be non-empty array, each item needs menuItemId + positive quantity).
- **Tests**: `tests/menu.test.js` and `tests/orders.test.js` — integration tests using supertest against the Express app.

### Frontend (`frontend/`)

- **Entry**: `src/main.jsx` → renders `<App />` into `#root`.
- **Routing**: `src/App.jsx` — view-based routing (no React Router). `OrderContext.view` toggles between `"menu"` and `"status"` views.
- **State management**:
  - `context/CartContext.jsx` — useReducer-based cart (ADD_ITEM, REMOVE_ITEM, SET_QTY, CLEAR). Exposes `items`, `totalItems`, `totalPrice`.
  - `context/OrderContext.jsx` — manages `activeOrder` (full order object), `view` state, SSE stream lifecycle, and `placeOrder`/`resetToMenu` actions.
- **Pages**:
  - `pages/MenuPage.jsx` — fetches menu from backend, renders category filter tabs, menu grid with skeleton loading, error state with retry.
  - `pages/OrderStatusPage.jsx` — renders live order status stepper (4 steps: Order Received → Preparing → Out for Delivery → Delivered) with SSE-powered live updates, order details, and item list.
- **Components**:
  - `components/MenuCard.jsx` — menu item card with image, description, price, category badge, and "Add to cart" button (shows count when in cart).
  - `components/CartDrawer.jsx` — animated slide-out drawer with quantity +/- controls, per-item remove, item images, and checkout CTA.
  - `components/CheckoutModal.jsx` — form with client-side validation (name, address, phone), order summary, and API error display.
- **Styling**: Tailwind CSS v3 with a custom brand color palette (`brand-50` through `brand-600`, `cream`, `ink`).
- **Tests**: Vitest + @testing-library/react. Setup in `src/setupTests.js`, configured in `vite.config.js`.
- **API base URL**: Configured via `VITE_API_URL` env var (see `frontend/.env.example`). Falls back to empty string (relative URLs) when not set, which works with the Vite dev proxy. Set to the deployed backend URL for production builds.

## API Contract

| Method | Path                   | Description                                                                                                    |
| ------ | ---------------------- | -------------------------------------------------------------------------------------------------------------- |
| GET    | /api/menu              | List all menu items. Optional `?category=` query param filters by category.                                    |
| GET    | /api/menu/:id          | Get single menu item                                                                                           |
| POST   | /api/orders            | Create order `{ customerName, address, phone, items: [{ itemId, quantity }] }`. Prices calculated server-side. |
| GET    | /api/orders/:id        | Get single order                                                                                               |
| PATCH  | /api/orders/:id/status | Advance status one step (Order Received → Preparing → Out for Delivery → Delivered)                            |
| GET    | /api/orders/:id/stream | SSE stream for real-time status updates                                                                        |

## Key Notes

- The backend has no database — orders live in memory and are lost on restart.
- The Vite dev server proxies `/api` to `localhost:3001`. For production, set `VITE_API_URL` to the deployed backend URL.
- Menu items use Unsplash image URLs (no local image assets).
- Order status uses SSE for real-time updates (no polling). The backend auto-advances status every 7 seconds.
