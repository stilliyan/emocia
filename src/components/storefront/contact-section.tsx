import Image from "next/image";
import { getStorefrontSettings } from "@/lib/storefront-data";
import { cn } from "@/lib/utils";
import { AppointmentRequestForm } from "./appointment-dialog";

type StorefrontContactSectionProps = {
  id?: string;
  headingId: string;
  className?: string;
};

export async function StorefrontContactSection({ id, headingId, className }: StorefrontContactSectionProps) {
  const settings = await getStorefrontSettings();
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(settings.address)}&z=17&hl=bg&output=embed`;

  return (
    <section id={id} className={cn("storefront-contact", className)} aria-labelledby={headingId}>
      <div className="storefront-contact__copy">
        <p className="storefront-eyebrow">Контакти</p>
        <h2 id={headingId}>Свържете се с нас</h2>
        <AppointmentRequestForm
          source="contact"
          variant="simple-contact"
          className="storefront-contact-form"
          submitLabel="Изпрати запитване"
        />
        <dl>
          <ContactRow label="Адрес" value={settings.address} />
          <ContactRow label="Телефон" value={settings.contact_phone} href={`tel:${settings.contact_phone.replace(/\s/g, "")}`} />
          <ContactRow label="Електронна поща" value={settings.contact_email} href={`mailto:${settings.contact_email}`} />
          <ContactRow label="Работно време" value={settings.working_hours} />
        </dl>
      </div>
      <div className="storefront-contact__map">
        <iframe
          title="Карта до Бутик Емоция във Варна"
          src={mapEmbedUrl}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
        <a href={settings.maps_url} target="_blank" rel="noreferrer">
          <Image
            src="/storefront/boutique-facade.png"
            alt=""
            width={184}
            height={184}
            className="storefront-contact__map-thumbnail"
          />
          <span>Намерете ни в Google Maps</span>
        </a>
      </div>
    </section>
  );
}

function ContactRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return <div><dt>{label}</dt><dd>{href ? <a href={href}>{value}</a> : value}</dd></div>;
}
