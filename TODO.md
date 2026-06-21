# TODO - Restaurant Website (Frontend + Backend/Admin)

- [x] Inspect existing `my-app` frontend structure and ensure routing/entry points

- [x] Add backend server: `my-app/server/index.js`


- [x] Add backend endpoints: `/api/menu`, `/api/orders`, `/api/admin/orders`

- [x] Add backend dev script integration (serve backend alongside Vite)

- [x] Update Vite config to proxy `/api/*` to backend in dev


- [ ] Implement frontend restaurant UI in `my-app/src/App.jsx`
- [ ] Implement `my-app/src/components/Menu.jsx` (fetch menu + add to cart)
- [ ] Implement `my-app/src/components/Cart.jsx` (manage cart + place order)
- [ ] Implement `my-app/src/pages/AdminDashboard.jsx` (admin auth + fetch orders)
- [ ] Add minimal shared API helper (optional)
- [ ] Remove/ignore duplicate frontend files if they conflict (only within `my-app/`)
- [ ] Verify: run `npm run dev` and confirm UI loads + API calls succeed
- [ ] Verify: admin token flow works

