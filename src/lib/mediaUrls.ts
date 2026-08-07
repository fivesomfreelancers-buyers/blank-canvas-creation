// Permanent, host-independent media URLs (Supabase Storage public bucket).
// These absolute URLs keep working on Lovable hosting, Netlify, custom domains,
// after rebuilds and cache clears — unlike host-relative CDN asset paths.

const BASE =
  'https://afjcjjelgppctsnmtbek.supabase.co/storage/v1/object/public/gig-media/tutorials';

const asset = (file: string) => ({ url: `${BASE}/${file}` });

export const createGigTutorialMp4 = asset('create-gig-tutorial.mp4');
export const accountMp4 = asset('docs-account.mp4');
export const buyerAcceptMp4 = asset('docs-buyer-accept.mp4');
export const disputeMp4 = asset('docs-dispute.mp4');
export const docsCommunityPng = asset('docs-community.png');
export const docsIntroPng = asset('docs-intro.png');
export const docsLevelsPng = asset('docs-levels.png');
export const docsPaymentPng = asset('docs-payment.png');
export const docsProfilePng = asset('docs-profile.png');
export const docsSupportPng = asset('docs-support.png');
export const escrowPng = asset('docs-escrow.png');
export const gigMp4 = asset('docs-gig.mp4');
export const howWorksPng = asset('docs-how-works.png');
export const messagingMp4 = asset('docs-messaging.mp4');
export const orderingMp4 = asset('docs-ordering.mp4');
export const ordersMp4 = asset('docs-orders.mp4');
export const reviewsPng = asset('docs-reviews.png');
export const securityPng = asset('docs-security.png');
export const withdrawMoneyMp4 = asset('docs-withdraw-money.mp4');
export const verifyAccountTutorialMp4 = asset('verify-account-tutorial.mp4');
export const withdrawTutorialMp4 = asset('withdraw-tutorial.mp4');
