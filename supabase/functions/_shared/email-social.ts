/**
 * Fivesom email footer social row.
 * Only Facebook, Instagram, TikTok and YouTube, using real brand icons
 * (hosted PNGs so they render in every email client).
 */

export const FIVESOM_SOCIALS = [
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/profile.php?id=61590213487504',
    icon: 'https://img.icons8.com/color/96/facebook-new.png',
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/fivesomofficial/',
    icon: 'https://img.icons8.com/color/96/instagram-new.png',
  },
  {
    name: 'TikTok',
    url: 'https://www.tiktok.com/@fivesomofficial',
    icon: 'https://img.icons8.com/color/96/tiktok.png',
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/@fivesom-net',
    icon: 'https://img.icons8.com/color/96/youtube-play.png',
  },
];

export function socialRow(): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
${FIVESOM_SOCIALS.map(
  (s) => `    <td style="padding:0 6px;">
      <a href="${s.url}" target="_blank" style="text-decoration:none;">
        <img src="${s.icon}" width="32" height="32" alt="${s.name}" title="${s.name}" style="display:block;width:32px;height:32px;border:0;border-radius:8px;" />
      </a>
    </td>`,
).join('\n')}
  </tr></table>`;
}
