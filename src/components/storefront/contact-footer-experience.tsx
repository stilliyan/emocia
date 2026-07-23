import { StorefrontContactSection } from "./contact-section";
import { SiteFooter } from "./site-footer";

export function StorefrontContactFooterExperience() {
  return (
    <div className="storefront-content-stack storefront-contact-footer">
      <div className="storefront-contact-footer__foreground">
        <StorefrontContactSection id="контакти" headingId="contact-title" />
      </div>
      <SiteFooter />
    </div>
  );
}
