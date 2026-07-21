# Mobile collection grid toggle QA — 2026-07-21

- Source visual truth: `/var/folders/tn/2g2801x954b6lyymmz_xymr40000gn/T/codex-clipboard-f769f70d-7d51-4c05-b043-07614aa212ac.png` and `/var/folders/tn/2g2801x954b6lyymmz_xymr40000gn/T/codex-clipboard-64eba88f-b180-4ae5-813a-d7be4e253cb2.png`
- Standard-grid implementation: `/private/tmp/emotion-collection-standard-grid-final.png`
- Large-grid implementation: `/private/tmp/emotion-collection-large-grid-mobile.png`
- Combined comparisons: `/private/tmp/collection-standard-grid-comparison.png` and `/private/tmp/collection-large-grid-comparison.png`
- Viewports: 390 × 844 px and 375 × 812 px
- State: collection toolbar with standard and large mobile grid modes

## Full-view and focused comparison evidence

The standard comparison shows the same toolbar-to-two-column catalogue relationship as the KYHA reference. The large comparison confirms that the square control changes the catalogue to one full-width image per row. Both references and implementations show the toolbar and first product region together, so a separate tighter crop is unnecessary.

## Findings

- No actionable P0, P1, or P2 issue remains in the requested mobile catalogue scope.
- Fonts and typography: the storefront typeface and Bulgarian product names remain intact; the toolbar label is a compact 12px uppercase utility style.
- Spacing and layout rhythm: the toolbar uses 16px mobile padding, the standard grid uses two equal columns with an 8px gutter, and the large grid uses one full-width column with a 40px row rhythm.
- Colors and tokens: the controls reuse the existing surface, ink, subtle-text, line, and focus tokens.
- Image quality and asset fidelity: all original CMS product images remain in the Next.js image pipeline with their existing crops; no placeholder or generated image was introduced.
- Copy and content: the live Bulgarian filter label, product count, and dress names remain unchanged.
- Interaction and accessibility: both view controls are semantic buttons, expose `aria-pressed`, have Bulgarian accessible names, and measure 44 × 44px. The selection updates immediately.
- Responsive behavior: standard mode is two columns at both 390px and 375px; large mode is one column. Neither viewport has horizontal overflow.
- Touch presentation: desktop hover overlays remain available, while touch devices show clean product photography without a permanently visible decorative overlay.
- Browser console: no errors were observed.

## Comparison history

- Pass 1: the mobile view controls were hidden and the 420px breakpoint forced a single column, making the requested switch impossible (P1).
- Fix: exposed the existing controls on mobile, restored the two-column default, and added a functional one-column large mode.
- Pass 2: the toolbar label was visually smaller than the reference (P2); it was raised to 12px while preserving fit beside both 44px controls.
- Final comparison: no remaining P0/P1/P2 issue.

## Verification

- ESLint, TypeScript, all 18 tests, and the production build pass.

final result: passed

# Footer design QA

- Source visual truth: `/var/folders/tn/2g2801x954b6lyymmz_xymr40000gn/T/codex-clipboard-769d9545-47d2-4668-8257-62a3acd4f333.png`
- Supplied SVG asset: `/Users/s/.codex/attachments/54780fb9-9b96-44ac-bacf-18716eef15bd/pasted-text.txt`
- Implementation screenshot: `/Users/s/Documents/Emotion CMS/footer-implementation.png`
- Combined comparison: `/Users/s/Documents/Emotion CMS/footer-qa-comparison.png`
- Viewport: 1720 × 868 px
- State: homepage scrolled to the footer, desktop light page surface

## Full-view comparison evidence

The implementation uses the supplied vector at its native 1704:512 ratio. The black footer, asymmetric light curve, and bridal silhouette reproduce the source composition without raster scaling artifacts. The existing CMS brand copy and navigation remain intact.

## Focused region comparison evidence

No separate crop was required because the footer fills both same-size comparison frames and the logo, navigation, curve, silhouette, and lower copyright line remain legible in the full-view comparison.

## Findings

- No actionable P0, P1, or P2 differences.
- Fonts and typography: the existing storefront type system is preserved; hierarchy and contrast remain readable.
- Spacing and layout rhythm: content stays in the upper black area, with sufficient lower clearance for the curve and illustration.
- Colors and tokens: the footer remains `#080808`; the supplied SVG uses the existing `#F7F8FA` page surface and white illustration details.
- Image quality and asset fidelity: the exact supplied SVG is used as a responsive file asset, with no CSS or HTML approximation.
- Copy and content: existing Bulgarian footer content is preserved.
- Responsive state: desktop and 390 px mobile were checked; there is no horizontal overflow. The illustration scales larger on mobile so it remains recognizable.
- Browser console: no runtime errors were observed. Next.js emitted only an LCP heuristic warning because the test opened directly at the footer; the asset remains correctly lazy-loaded below the real homepage fold.

## Comparison history

- Pass 1: no P0/P1/P2 mismatch found. Mobile illustration was initially too small (P3 polish); it was enlarged and rechecked without introducing overflow.

## Open questions

- None.

## Implementation checklist

- [x] Use the supplied SVG as a real asset.
- [x] Reserve footer space for the curved edge.
- [x] Keep content above the decorative layer.
- [x] Verify desktop and mobile rendering.
- [x] Verify horizontal overflow.

## Follow-up polish

- The existing footer copy and logo proportions intentionally remain those of the current storefront rather than replacing them with the mockup's sample content.

final result: passed

## Shared mobile storefront header QA — 2026-07-21

- Source visual truth: the existing compact product header on `/bulchinski-rokli/lincoln`, captured at `/private/tmp/emotion-product-header-mobile.png`
- Implementation screenshot: `/private/tmp/emotion-collection-header-mobile.png`
- Combined focused comparison: `/private/tmp/emotion-header-comparison.png`
- Viewport: 390 × 844 px
- State: initial transparent header and scrolled light-pill state on `/bulchinski-rokli`

### Full-view and focused comparison evidence

The full collection capture confirms that the compact logo remains clear of the model's face and the hero copy remains unobstructed. The focused side-by-side comparison places the existing product header beside the collection header and confirms matching 148px logo size, 14px top inset, 16px side inset, and 32px menu icon.

### Findings

- No actionable P0, P1, or P2 issue remains.
- Fonts and typography: no text styles changed; the exact existing logo asset remains in use at the product-page mobile size.
- Spacing and layout rhythm: the shared header now uses the product header's 14px/16px mobile insets and preserves the existing 8px spacing system.
- Colors and tokens: overlay pages retain the white logo and menu; after scroll, the existing alternate dark logo and translucent surface activate without new raw color values.
- Image quality and asset fidelity: the original responsive logo assets and hero photography are unchanged; no approximation or generated asset is introduced.
- Copy and content: unchanged.
- Interaction and accessibility: the 36px visible menu control retains its existing accessible label and focus behavior; the surrounding header spacing keeps the control visually clear of the image subject.
- Responsive behavior: the shared rule applies to homepage, collection, placeholder, and product routes below 768px. The collection page has no horizontal overflow.
- Runtime: the collection header switches to the existing light pill at scroll, and both checked routes report no browser console errors.

### Comparison history

- Pass 1: collection pages retained the older 200px logo, covering the model's head (P1).
- Fix: promoted the product page's compact 148px logo, 14px/16px insets, and 32px menu icon into the shared mobile header; removed the now-redundant product-only overrides.
- Pass 2: the focused product-versus-collection comparison confirms matching header proportions and an unobstructed face. No P0/P1/P2 issue remains.

### Verification

- ESLint, TypeScript, all 18 tests, and the production build pass.

final result: passed

## Mobile navigation drawer QA — 2026-07-21

- Source visual truth: `/var/folders/tn/2g2801x954b6lyymmz_xymr40000gn/T/codex-clipboard-1de616fa-d71e-4058-bb3c-e246047dddf1.png`
- Implementation screenshot: `/private/tmp/emotion-mobile-drawer-final-smooth.png`
- Combined comparison: `/private/tmp/mobile-menu-comparison-final-smooth.png`
- Viewport: 390 × 844 px, with an additional 375 × 812 px small-phone check
- State: mobile menu fully open on `/bulchinski-rokli/lincoln`

### Full-view and focused comparison evidence

The normalized side-by-side comparison shows the reference menu and the Emotion implementation at the same viewport height. The menu hierarchy, full-screen white surface, separated navigation rows, compact top bar, and bottom appointment action are all legible at full size; no additional crop is required.

### Findings

- No actionable P0, P1, or P2 issue remains.
- Fonts and typography: the drawer uses the storefront Geist stack, 22px light navigation labels, a 12px uppercase menu label, and the existing 13px CTA style.
- Spacing and layout rhythm: 16px mobile gutters, 64px navigation rows, an 80px top bar, and a 48px CTA follow the existing 8px system.
- Colors and tokens: the drawer reuses the storefront surface, primary text, divider, focus, and primary-action tokens.
- Image quality and asset fidelity: no product imagery is introduced; the drawer intentionally removes the duplicate logo at the user's request rather than approximating the reference logo treatment.
- Copy and content: all seven existing Bulgarian navigation destinations are present, plus the functional `Запази час за проба` link.
- Interaction and accessibility: the drawer is a modal navigation region, locks body scroll, marks closed content inert, moves focus to the close control, restores focus after Escape, and keeps every touch target at least 44px high.
- Motion: the drawer is a viewport-level sibling of the header and animates only with `translateX(-100%) → translateX(0)` over 420ms; no Y-axis translation or diagonal movement remains. Reduced-motion disables the transition.
- Browser checks: 390px and 375px widths have no horizontal overflow, the CTA remains visible, the X is 16px from the right edge, and no application error state is visible.

### Comparison history

- Pass 1: the first implementation was positioned inside the transformed sticky header, offsetting the drawer down and right (P1). The drawer was moved outside the header as a viewport-level sibling.
- Pass 2: the reference-inspired centered logo conflicted with the desired minimal header (P2). It was removed and the close control moved to the right.
- Pass 3: the native details element prevented a reliable slide transition (P1). It was replaced with a controlled button and an always-mounted inert drawer, producing a pure horizontal animation.
- Final comparison: no remaining P0/P1/P2 issue.

### Verification

- Lint, TypeScript, all 18 tests, and the production build pass.

final result: passed

## Mobile product full-bleed header QA — 2026-07-21

- Source visual truth: `/var/folders/tn/2g2801x954b6lyymmz_xymr40000gn/T/codex-clipboard-1ce227e9-ffbd-4b9e-9132-abd343dafa12.png`
- Implementation screenshot: `/private/tmp/emotion-product-full-bleed-header.png`
- Combined comparison: `/private/tmp/product-header-before-after.png`
- Viewport: 390 × 844 px
- State: product page at scroll position 0; scrolled header state also checked at 120px

### Full-view and focused comparison evidence

The combined top-region comparison shows the previous blank header band and oversized logo beside the revised full-bleed product image. The new compact logo remains entirely left of the model's face, while the menu remains visible on the right. No additional focused crop is needed because the logo, face, image edge, and menu are all clearly readable in the combined comparison.

### Findings

- No actionable P0, P1, or P2 issue remains in the requested mobile header region.
- Fonts and typography: no type styles change; the supplied brand logo asset is retained at a smaller 148px width.
- Spacing and layout rhythm: the gallery image begins at the viewport top, the initial product header uses 14px/16px insets, and the former 72px image padding is removed.
- Colors and tokens: the transparent initial header uses the light product image as its surface; the existing dark logo and menu colors keep their contrast.
- Image quality and asset fidelity: the original product photo and supplied logo asset remain unchanged, with no generated or approximated replacement.
- Copy and content: unchanged.
- Interaction state: after scrolling, the existing translucent pill activates, the header radius remains 16px, and the logo transitions to 150px.
- Browser check: image top is within 1px of the viewport edge, no horizontal overflow is present, and no application error state is visible.

### Comparison history

- Pass 1: the 72px image padding created a blank top band and the 200px logo dominated the mobile product header (P2). The image padding was removed and the product-only initial logo reduced to 148px.
- Pass 2: the combined comparison confirms a full-bleed image, clear face, compact branding, and no remaining P0/P1/P2 mismatch.

### Verification

- Lint, TypeScript, all 18 tests, and the production build pass.

final result: passed

## Mobile gallery progress thickness QA — 2026-07-21

- Source visual truth: `/var/folders/tn/2g2801x954b6lyymmz_xymr40000gn/T/codex-clipboard-5ecd36fd-fb85-4509-bd9a-57abf5747f69.png`
- Implementation screenshot: `/private/tmp/emotion-mobile-progress-3px.png`
- Combined focused comparison: `/private/tmp/mobile-progress-before-after.png`
- Viewport: 390 × 844 px
- State: first slide of the mobile product gallery

### Evidence and findings

- The full-view screenshot confirms that the gallery, counter, product image, and information hierarchy remain unchanged.
- The focused before/after comparison confirms that the progress track is reduced from 5px to 3px while its active quarter-width segment remains aligned with `1 / 4`.
- Fonts and typography: unchanged.
- Spacing and layout rhythm: only the progress track height changes; no horizontal overflow is introduced.
- Colors and tokens: the existing primary text token and translucent track remain unchanged.
- Image quality: the product image and crop remain unchanged.
- Copy and content: unchanged.
- Browser check: computed progress height is `3px`, active width is `97.5px` at 390px, and no application error state is visible.
- No actionable P0, P1, or P2 issue remains.

### Verification

- Lint, TypeScript, and all 18 tests pass.

final result: passed

## Mobile product information hierarchy QA — 2026-07-21

- Source visual truth: `/var/folders/tn/2g2801x954b6lyymmz_xymr40000gn/T/codex-clipboard-3f686255-1f73-489f-8854-320ac1e2a242.png`
- Implementation screenshot: `/private/tmp/emotion-mobile-info-no-back.png`
- Combined focused comparison: `/private/tmp/mobile-info-before-after.png`
- Viewport: 390 × 844 px
- State: first product image, information section immediately below the mobile gallery

### Full-view comparison evidence

The complete implementation screenshot confirms that the full-width gallery still transitions directly into the product content, with no horizontal overflow or broken image state.

### Focused region comparison evidence

The combined before/after crop shows the former mobile back row on the left and the revised product hierarchy on the right. The collection eyebrow, dress name, divider, and product facts now occupy the same early content area previously consumed by the back row.

### Findings

- No actionable P0, P1, or P2 mismatch remains in the requested mobile information region.
- Fonts and typography: the existing light product-name weight, regular hierarchy labels, sizes, and storefront typeface remain unchanged.
- Spacing and layout rhythm: mobile information padding is reduced from 40px to 24px; the back link is hidden only below 768px, while desktop navigation remains unchanged.
- Colors and tokens: all existing storefront text, divider, and surface tokens are preserved.
- Image quality: the product gallery image and crop are untouched by this change.
- Copy and content: the collection, dress name, silhouette, collection, and appointment information remain present and move higher in the reading order.
- Runtime checks: the mobile back link computes to `display: none`, the page has no horizontal overflow, and no application error state is visible.

### Comparison history

- Pass 1: the back row consumed the first mobile content block and delayed important product information (P2). It was hidden at the mobile breakpoint and the information padding was tightened.
- Pass 2: the combined focused comparison confirms the dress name and facts now begin immediately after the gallery with no remaining P0/P1/P2 issue.

### Verification

- Lint, TypeScript, 18 tests, and the production build pass.

final result: passed
## Product detail layout QA — 2026-07-21

- Source: user-provided desktop screenshot of `/bulchinski-rokli/nia`.
- Checked target layouts: desktop at 1440×1000 and mobile at 390×844.
- Verified in the responsive CSS: product gallery stays on the left and the sticky product information stays on the right on desktop; below 820px both return to a single-column flow without fixed widths.
- Spacing follows the existing 8px rhythm, and the appointment button is compact on desktop while remaining full-width and easy to tap on mobile.
- Known limitation: the automated in-app browser screenshot connection was unavailable during this pass, so final visual verification relied on the supplied screenshot, responsive code inspection, HTTP availability, and the project checks.
## Product gallery grid QA — 2026-07-21

### Source

- Reference screenshot: `/var/folders/tn/2g2801x954b6lyymmz_xymr40000gn/T/codex-clipboard-ff7241db-95e0-4736-9d77-ce176f36b778.png`
- Requested state: one image per row on mobile; two equal columns on desktop; no image spanning the full gallery width.

### Implementation

- Route: `http://localhost:3000/bulchinski-rokli/nia`
- Updated: `src/components/storefront/storefront.css`
- Desktop: two-column gallery with a 12px gap and uniform 3:4 image tiles.
- Mobile up to 768px: one-column gallery with an 8px gap and uniform 4:5 image tiles.

### Verification

- Confirmed no gallery variant keeps `grid-column: 1 / -1`.
- Confirmed the product route is included in the production build.
- Lint, TypeScript, tests, and production build pass.
- Compared the responsive layout rules against the supplied screenshot and requested state.
- final result: passed

## Mobile product gallery QA — 2026-07-21

- Source visual truth: `/private/tmp/kyha-preston-mobile-reference.png`
- Implementation screenshot: `/private/tmp/emotion-lincoln-mobile-gallery.png`
- Combined comparison: `/private/tmp/mobile-gallery-comparison.png`
- Viewport: 390 × 844 px
- State: first gallery slide at the top of `/bulchinski-rokli/lincoln`

### Findings

- No actionable P0, P1, or P2 differences inside the requested mobile gallery scope.
- Fonts and typography: the existing Emotion storefront type system is preserved; the compact image counter uses the same primary text color and a regular 13px label.
- Spacing and layout: the gallery is edge-to-edge, uses the measured KYHA gallery ratio, and places the counter and progress track at the bottom edge without covering the dress.
- Colors and tokens: the image surface and progress indicator reuse the storefront's neutral background and primary text token.
- Image quality: the existing optimized Next.js image pipeline is preserved. The current CMS product model exposes one source image, so the four prepared gallery views intentionally reuse it with the existing crops until multiple assets are available.
- Copy and content: existing Bulgarian product content and navigation remain unchanged.

### Interaction QA

- Native touch scrolling and mouse drag both use horizontal snapping.
- Dragging from the first to the second image updates `1 / 4` to `2 / 4` and moves the progress segment by one quarter.
- A drag does not open the lightbox; a subsequent tap does open it.
- The existing fullscreen dialog, Escape handling, focus restoration, and desktop two-column gallery remain available.
- No horizontal body overflow was found at 359 × 674 or 390 × 844 px.
- Lint, TypeScript, 18 tests, and the production build pass.

### Comparison history

- Pass 1: the image subject overlapped the mobile header (P1); fixed with mobile gallery image clearance while keeping the section full-width.
- Pass 1: the initial mouse drag did not reliably advance a slide (P1); fixed with an explicit threshold and snap destination.
- Pass 1: click suppression could outlive the drag (P2); limited it to the drag's synthetic click and retested the lightbox.
- Pass 2: the same-size combined comparison showed no remaining P0/P1/P2 gallery mismatch.

### Open questions

- None.

final result: passed

## Mobile collection hero spacing QA — 2026-07-21

- Source visual truth: `/var/folders/tn/2g2801x954b6lyymmz_xymr40000gn/T/codex-clipboard-1ef798a8-9453-4d66-9e32-90192a44f1cf.png`
- Implementation screenshot: `/private/tmp/emotion-mobile-hero-spacing-8px.png`
- Combined focused comparison: `/private/tmp/emotion-hero-spacing-comparison.png`
- Viewport: 390 × 844 px
- State: top of `/bulchinski-rokli`, mobile collection hero

### Evidence and findings

- The focused comparison confirms that the collection eyebrow and title now form one compact text group instead of appearing as separate blocks.
- Fonts and typography: family, size, weight, line height, tracking, and wrapping are unchanged.
- Spacing and layout rhythm: the mobile-only gap is exactly 8px; the copy block's bottom position and side gutters are unchanged.
- Colors and tokens: the existing white hero typography and image veil remain unchanged.
- Image quality and asset fidelity: the hero photograph, crop, and responsive image pipeline are untouched.
- Copy and content: unchanged.
- Responsive behavior: desktop retains its existing 14px spacing, mobile has no horizontal overflow, and the title stays on one line at 390px.
- No actionable P0, P1, or P2 issue remains.

### Comparison history

- Pass 1: the eyebrow-to-title spacing read as two disconnected groups on mobile (P2).
- Fix: reduced only the mobile paragraph margin to one 8px spacing step.
- Pass 2: the focused comparison confirms a tighter hierarchy with no collateral layout shift.

### Verification

- ESLint, TypeScript, all 18 tests, and the production build pass.

final result: passed
