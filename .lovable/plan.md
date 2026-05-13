# Super Admin Dashboard — Fivesom

Transform the existing Admin panel (currently: Overview, Users, Escrow, Disputes, Ranking) into a full professional super-admin control center matching Fiverr/Upwork-class admin tooling, using the data already available in the database.

## New sidebar structure

```
Dashboard
├── Overview (Analytics)        ✅ exists — enhance
├── Users Management            ✅ exists — enhance
├── Verifications               🆕
├── Orders Management           🆕
├── Live Chats Monitor          🆕
├── Payments                    🆕
├── Withdrawals                 🆕
├── Escrow                      ✅ exists
├── Disputes                    ✅ exists
├── Reviews                     🆕
├── Categories                  🆕
├── Support Tickets             🆕
├── Notifications (Broadcast)   🆕
├── Security Center             🆕
├── Logs & Activity             🆕
├── Ranking                     ✅ exists
└── Settings                    🆕
```

## Pages to build (all read/manage what's already in DB)

1. **AdminVerifications** — list `verification_documents` (pending/approved/rejected) with full profile preview (skills, portfolio, experience, education, software, intro video, sample images via `freelancer_portfolio`). Actions: Approve / Reject / Request Changes (updates `status` + `freelancers.is_verified`).

2. **AdminOrders** — full table of `orders` with filters (active, pending, delivered, cancelled, revision). Drill-in shows buyer, freelancer, gig, amount, deadline, deliveries, requirements. Actions: Cancel, Refund, Force-Complete.

3. **AdminChats** — list all `conversations`; open any to view full message history (`messages`) including attachments. Read-only monitoring with "Open Full Conversation" view. Useful for dispute investigation.

4. **AdminPayments** — read `orders` + `accepted_deliveries` + `wallets`. Cards: Total Revenue, Processing (escrow), Completed, Failed/Cancelled, Refunds. Charts (revenue daily/weekly/monthly).

5. **AdminWithdrawals** — list `withdrawals` requests with user info. Approve / Reject / Hold actions (update status + processed_at).

6. **AdminReviews** — list `gig_reviews` with gig + buyer info. Detect/flag fake/spam (low effort heuristic: very short, duplicate). Delete action.

7. **AdminCategories** — CRUD on `subcategories`. Main 5 categories stay locked (per project memory). Add/Edit/Delete subcategories.

8. **AdminSupport** — unified inbox of `support_tickets`, `buyer_support_tickets`, `freelancer_support_tickets`. Reply (text update), Resolve, Close.

9. **AdminNotifications** — broadcast composer (uses Supabase realtime channel `system:announcements`). Sends a message that the app can subscribe to and toast.

10. **AdminSecurity** — overview of `user_roles`, recently-joined users, suspicious patterns (e.g. profiles without verification, multiple accounts same name), admin action to assign/revoke roles.

11. **AdminLogs** — recent activity feed assembled from latest rows across `orders`, `withdrawals`, `verification_documents`, `disputes`, `accepted_deliveries`, `user_roles` changes — sorted by time. Read-only.

12. **AdminSettings** — platform-level toggles stored in a new `platform_settings` table (single row): platform_fee_percent, withdrawal_min, escrow_hold_days, maintenance_mode, dark_mode_default, homepage_announcement.

13. **AdminOverview (enhanced)** — add live cards (Total Users, Active Orders, Total Revenue, Pending Verifications, Open Disputes, Pending Withdrawals, Open Tickets) + simple charts (Recharts) for revenue and signups (last 30 days).

## Database additions (single migration)

- `platform_settings` table (single-row, admin-managed via RLS).
- `admin_announcements` table (id, title, message, audience, created_by, created_at) with admin-only insert / public select.
- `admin_action_logs` table (id, admin_id, action, target_table, target_id, metadata jsonb, created_at) — populated from frontend admin actions for the Logs page.

All with proper RLS (admin-only write; public read where needed).

## Tech & design

- Keep existing VIP dark gradient shell (`AdminDashboard.tsx`).
- Sidebar: extend `menuItems` with new entries grouped by section labels (Operations, Finance, Trust & Safety, System).
- Each page = `src/pages/admin/Admin<Name>.tsx`, lazy-rendered via the existing tab switch.
- Real-time: Supabase channel subscriptions on each list page so cards/tables update live.
- Charts: Recharts (already installed via shadcn).
- Reuse shadcn `Table`, `Card`, `Badge`, `Dialog`, `Tabs`, `Sheet` components.
- Strictly tokenized colors (no hex except inside the existing admin shell which already uses inline brand gradients).

## Out of scope (note to user)

- AI moderation (spam/scam detection) — needs an LLM edge function; can be added in a follow-up.
- Malware scanning of uploaded files — needs external service.
- Geo-IP / device tracking — requires logging middleware on auth (separate task).
- Two-factor auth logs — requires enabling 2FA in Supabase first.
- File CDN management — Supabase storage UI already covers this.

These are flagged as "Coming soon" placeholders in their respective panels so the structure is in place.

## Delivery order

1. Migration (settings + announcements + action logs tables).
2. Sidebar restructure in `AdminDashboard.tsx`.
3. Build all 13 new admin pages.
4. Enhance `AdminOverview` with new live cards + charts.
5. Wire real-time subscriptions.
