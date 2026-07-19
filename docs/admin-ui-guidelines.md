# Admin UI guidelines

Use shadcn/ui, Geist, a neutral light interface, 8px radius, and a black primary action token (`#111111`). Do not use burgundy or red as a brand accent. No gradients, glass effects, decorative animation, oversized headings, or meaningless charts. Desktop padding is 24px; mobile padding is 16px; useful content width is capped near 1440px.

Light and dark themes use the shared semantic color tokens in `globals.css`. Theme selection is managed by `next-themes`, stored under `emotion-cms-theme`, and changed only through the shared `ThemeSwitch` component.

All visible admin copy is Bulgarian. Every field has a visible label, required fields and Bulgarian validation are explicit, destructive actions require confirmation, and feedback includes loading, empty, error, success, and disabled states. Navigation, focus states, and touch targets must work with keyboard, tablet, and phone.

Lists support practical search/filter/sort, URL-persisted filters where useful, thumbnails, clear actions, and scalable pagination. Before changing UI: read this file, check shadcn first, compose existing primitives, and verify desktop/mobile behavior.
