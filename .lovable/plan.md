# Plan — VIP, Withdraw Bank, Blue Tick

Codsigaagu wuxuu leeyahay 3 qaybood waaweyn. Waan kala saari doonaa si fudud.

## 1. VIP Membership — Gig Limits + Auto-Expiry

**Golden VIP** → max **2 active VIP gigs**. **Platinum VIP** → max **3 active VIP gigs**.

Database:
- Ku dar `gigs.is_vip boolean default false` + `gigs.vip_boost_until timestamptz`.
- Trigger marka gig la sameeyo/la cusbooneysiyo `is_vip=true`:
  - Hubi user-ku VIP active yahay (`freelancers.vip_tier` iyo `vip_expires_at > now()`).
  - Tiri active VIP gigs (`status='active' AND is_vip=true`). Limit: golden=2, platinum=3. Hadii la dhaafo → `RAISE EXCEPTION`.
- Cron/function `expire_vip_memberships()` waa jirtaa — ku dar: marka VIP dhammaado, dhammaan `gigs.is_vip` → false, badge auto-baxo.

UI:
- `Vip.tsx` plan cards: "Allowed 2 Active VIP Gigs" / "Allowed 3 Active VIP Gigs", price-ka oo cad.
- `CreateGig` / `FreelancerGigs`: toggle "Mark as VIP Gig" (kaliya VIP users-ka u muuqda), counter "X / 2 VIP gigs used".
- `VipBadge` hore u jirta — sii adeegso (gig cards, profile, search, messages).

Admin (`AdminVip.tsx`):
- Ku dar columns: VIP type, Start date, Expire date, **Active VIP gigs count** (live query).

Notifications:
- Marka VIP expire gareeyo → `system_messages` (news/support convo) loo diro user-ka. (Email-ka waxay u baahan tahay edge function — waan u sameyn doonaa hook fudud Resend/Lovable Emails — laakiin marka hore in-app notification.)

## 2. Withdraw — Free-text Bank Name

- `FreelancerWithdraw.tsx`: ka saar dropdown-ka bank names → ku beddel `Input` field (Bank Name, free text, validation: 2–60 chars).
- Save sida hore (withdrawals table → `bank_name` column).
- `AdminWithdrawals.tsx`: dhammaan banking details si cad u muuji (Bank Name, Account #, Account holder, Amount, User) + **Copy button** halkii field.

## 3. Blue Tick Verification (Cusub)

**Eligibility (auto-check):**
- ≥ 5 completed orders
- account verified (`is_verified=true` ama doc verification)
- active 30 days kii dambe (`profiles.last_seen`)
- avg rating ≥ 4.0

Hadii buuxiyo → button "Apply for Blue Verification" ka muuqo `FreelancerVerify` page.

**Database:**
```sql
CREATE TABLE public.blue_tick_applications (
  id uuid PK, user_id uuid, freelancer_id uuid,
  reason text, experience text, portfolio_links text[],
  status text default 'pending', -- pending|approved|rejected
  reviewed_by uuid, reviewed_at timestamptz, admin_notes text,
  created_at, updated_at
);
ALTER TABLE freelancers ADD COLUMN has_blue_tick boolean default false,
  blue_tick_granted_at timestamptz, blue_tick_removed_at timestamptz;
```
RLS: user sees own, admin sees all + can update. GRANTs included.

**UI:**
- `FreelancerVerify.tsx`: new "Blue Verification" section — eligibility checklist + Apply form (Why deserve / Experience / Portfolio links).
- New `BlueTickBadge` component (blue checkmark, distinct from existing `VerifiedBadge`).
- Display in: gig cards, search results, About seller, profile page, reviews, message header, freelancer profile export.

**Admin:**
- New page `AdminBlueTick.tsx` (tab in AdminDashboard): list applications with user profile, completed orders, reviews, last active, verification status, portfolio, gig quality, reports/disputes history.
- Buttons: **Approve** / **Reject** / **Remove Tick** (instant revoke for fake/scam).

## Technical notes

- All new DB changes in one migration with GRANTs + RLS.
- Tick logic gated server-side (admin RPC `admin_grant_blue_tick`, `admin_revoke_blue_tick`).
- VIP gig limit enforced by DB trigger (cannot be bypassed from client).
- Email sending: in-app notification first; if you want real email I'll wire Lovable Emails after.

Hadii ogolaato, waxaan bilaabayaa migration-ka + code changes.
