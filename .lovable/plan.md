# SomAdz — Custom Ad Placement System

Nidaam cusub oo Admin-ku ku maamulo xayeysiisyo (sawir/video) kuwaas oo kaliya kasoo muuqda **2 booska ay leedahay ansax**:
1. **Dashboard Welcome Banner** (buyer + freelancer dashboards)
2. **Gigs Price Section** (gudaha `GigDetails` pricing card)

## 1. Database (Supabase)

Migration cusub:

```sql
-- Ads storage bucket (public read for served creatives)
-- created via storage_create_bucket tool: name='somadz-media', public=true

CREATE TABLE public.somadz_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  placement text NOT NULL CHECK (placement IN ('dashboard_banner','gig_price')),
  media_url text NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('image','video')),
  -- crop / zoom transform (applied in preview + on live render)
  focal_x numeric NOT NULL DEFAULT 50,   -- 0..100 %
  focal_y numeric NOT NULL DEFAULT 50,
  zoom numeric NOT NULL DEFAULT 1,        -- 1..3
  -- CTA button
  cta_text text,
  cta_url text,
  cta_style text DEFAULT 'solid',        -- solid|outline|ghost
  cta_color text DEFAULT '#00A3FF',
  cta_size text DEFAULT 'md',            -- sm|md|lg
  cta_position text DEFAULT 'bottom-right', -- bottom-right|bottom-left|bottom-center|top-right|top-left
  -- targeting
  audience text NOT NULL DEFAULT 'all' CHECK (audience IN ('all','buyers','freelancers')),
  is_active boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.somadz_ads TO anon, authenticated;
GRANT ALL ON public.somadz_ads TO service_role;

ALTER TABLE public.somadz_ads ENABLE ROW LEVEL SECURITY;

-- Public can read only active ads (audience filter is client-side + hook)
CREATE POLICY "public read active ads" ON public.somadz_ads
  FOR SELECT USING (is_active = true);

-- Admin full control
CREATE POLICY "admin manage ads" ON public.somadz_ads
  FOR ALL USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_somadz_updated BEFORE UPDATE ON public.somadz_ads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

Storage bucket `somadz-media` (public) + RLS on `storage.objects` so only admins can insert/update/delete.

## 2. Frontend

### New shared components
- `src/components/ads/SomAdSlot.tsx` — reads active ad for a placement + audience, renders image/video with `object-fit: cover`, `object-position: focal_x% focal_y%`, `transform: scale(zoom)`, plus the CTA button in the chosen position/style/color/size. If no ad → renders `children` (fallback).
- `src/hooks/useSomAd.ts` — fetches active ad for `(placement, audience)` with realtime subscription.

### Mount points
- **Dashboard banner**: wrap the "Welcome back" gradient banner in `BuyerDashboard.tsx` and `FreelancerDashboard.tsx` with `<SomAdSlot placement="dashboard_banner" audience={role}>...existing banner...</SomAdSlot>`. Aspect matches current banner (≈ 1200×160).
- **Gig price slot**: inside `GigDetails.tsx` pricing card, above/below the price row, `<SomAdSlot placement="gig_price" audience="all" className="h-24" />`. Horizontal rectangle ~600×100.

Clicking the media OR the CTA opens `cta_url` in new tab (`rel="noopener"`).

### Admin page — `src/pages/admin/AdminSomAdz.tsx`
List existing ads + "New Ad" wizard:
1. **Placement select** (radio: Dashboard Banner / Gig Price). Chosen placement sets the preview frame to the exact target aspect ratio with guide lines (like the YouTube banner reference — safe-area outlines).
2. **Upload media** (image jpg/png/webp OR mp4) → uploads to `somadz-media` bucket, returns public URL.
3. **Crop/Zoom editor**: preview frame with the media inside; drag = pan (updates `focal_x/y`), slider = zoom. WYSIWYG — exact same transform used on live slot.
4. **CTA settings**: text, URL, style, color picker, size, position.
5. **Audience**: All / Buyers / Freelancers.
6. **Active toggle** + Save.

Only one active ad per (placement) shows at a time — pick most recent active.

Register in `AdminDashboard.tsx` menu under a new group "Marketing" with key `somadz`, icon `Megaphone`/`Image`, and route in the `renderContent` switch.

## 3. Safety
- Ads render only through `SomAdSlot`; grep guard: no other component references `somadz_ads`.
- Audience filter enforced in hook (buyer role never sees freelancer-targeted ad, etc.).
- Deactivating an ad instantly removes it via realtime.

## Technical notes
- Focal-point crop preserves aspect and never leaves empty space (media always covers frame → satisfies "waa inuusan ka yaraan ama ka bixin frame-ka").
- CTA position uses absolute positioning inside the slot with Tailwind utility mapping.
- Video ads: `autoPlay muted loop playsInline`, no controls, click-through to CTA URL.

Hadii ogolaato, waan bilaabaa migration + code.
