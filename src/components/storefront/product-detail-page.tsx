import { AppointmentDialog } from "./appointment-dialog";
import { OrderDialog } from "./order-dialog";
import { HorizontalDragRail } from "./horizontal-drag-rail";
import { ProductBackButton } from "./product-back-button";
import { ProductGallery } from "./product-gallery";
import { ScrollRevealSection } from "./scroll-reveal-section";
import { ProductCard } from "./product-card";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { accessoryCategoryLabels, formatStorefrontPrice, type BridalSilhouette, type StorefrontCollection, type StorefrontCollectionProduct } from "@/lib/storefront-collections";
import "./storefront.css";

const silhouetteLabels: Record<BridalSilhouette, string> = {
  "a-line": "А-линия",
  mermaid: "Русалка",
  princess: "Принцеса",
  straight: "Прав силует",
};

const silhouetteDescriptions: Record<BridalSilhouette, string> = {
  "a-line": "А-линията следва нежно горната част и се разширява плавно надолу. На пробата ще видите движението на полата и начина, по който силуетът балансира фигурата ви.",
  mermaid: "Силуетът русалка следва линията на тялото и се разгръща под ханша. На пробата ще преценим заедно комфорта, движението и най-подходящото прилягане.",
  princess: "Принцесеният силует подчертава талията и създава мек обем в полата. На пробата ще видите реалното движение и начина, по който конструкцията стои върху вас.",
  straight: "Правият силует следва чиста, издължена линия с леко движение около тялото. На пробата ще преценим дължината, свободата и най-подходящото прилягане.",
};

type ProductDetailPageProps = {
  collection: StorefrontCollection;
  product: StorefrontCollectionProduct;
};

export function ProductDetailPage({ collection, product }: ProductDetailPageProps) {
  const isBridalCollection = collection.slug === "bulchinski-rokli";
  const isAccessoryCollection = collection.kind === "accessories";
  const relatedProducts = collection.products.filter((item) => item.slug !== product.slug).slice(0, 4);
  const silhouette = product.silhouette ? silhouetteLabels[product.silhouette] : "Индивидуален силует";
  const modelDescription = product.silhouette
    ? silhouetteDescriptions[product.silhouette]
    : "По време на пробата ще разгледаме линията, движението и начина, по който моделът стои върху вас.";
  const formattedPrice = formatStorefrontPrice(product.price);
  const category = product.category ? accessoryCategoryLabels[product.category] : "Аксесоари";

  return (
    <main className="storefront storefront-product-page">
      <SiteHeader variant="light" />

      <div className="storefront-product-page__content">
        <section className="storefront-product-detail" aria-labelledby="product-title">
          <aside className="storefront-product-info">
            <ProductBackButton fallbackHref={`/${collection.slug}`} label={collection.title} />
            <p className="storefront-product-info__eyebrow">{collection.eyebrow}</p>
            <h1 id="product-title">{product.name}</h1>

            <dl className="storefront-product-info__facts">
              <div><dt>{isAccessoryCollection ? "Категория" : "Силует"}</dt><dd>{isAccessoryCollection ? category : silhouette}</dd></div>
              <div><dt>{isAccessoryCollection ? "Цена" : "Колекция"}</dt><dd>{isAccessoryCollection ? formattedPrice : collection.title}</dd></div>
              <div><dt>{isAccessoryCollection ? "Плащане" : "Проба"}</dt><dd>{isAccessoryCollection ? "Наложен платеж" : "С предварително записан час"}</dd></div>
            </dl>

            {isAccessoryCollection && formattedPrice ? (
              <OrderDialog
                productSlug={product.slug}
                productName={product.name}
                price={formattedPrice}
                className="storefront-button storefront-button--dark storefront-product-info__appointment"
              >
                Поръчай
              </OrderDialog>
            ) : (
              <AppointmentDialog
                productName={product.name}
                className="storefront-button storefront-button--dark storefront-product-info__appointment"
                ariaLabel={`Запази час за проба на ${product.name}`}
              >
                Запази час за проба
              </AppointmentDialog>
            )}

            <div className="storefront-product-info__details">
              {isAccessoryCollection ? (
                <>
                  <details open>
                    <summary>За аксесоара</summary>
                    <p>Фин детайл, подбран да допълни роклята, без да отнема вниманието от цялостната ви визия.</p>
                  </details>
                  <details>
                    <summary>Как да го съчетаем</summary>
                    <p>В бутика ще го разгледаме заедно с избраната рокля и ще преценим пропорцията, нюанса и начина, по който стои в движение.</p>
                  </details>
                  <details>
                    <summary>Наличност и поръчка</summary>
                    <p>След заявката ще потвърдим наличността, доставката и крайната сума по телефона. Плащането е с наложен платеж при получаване.</p>
                  </details>
                </>
              ) : (
                <>
                  <details open>
                    <summary>За модела</summary>
                    <p>{modelDescription}</p>
                  </details>
                  <details>
                    <summary>Как протича пробата</summary>
                    <p>След заявката ще се свържем с вас, за да потвърдим часа и модела. По време на срещата наш консултант ще ви помогне да сравните силуети, комфорт и възможности за корекции.</p>
                  </details>
                  <details>
                    <summary>Размер и подготовка</summary>
                    <p>{isBridalCollection
                      ? "Не е необходимо сами да определяте булчинския си размер. Носете гладко бельо в телесен цвят и обувки с височина, близка до планираната. Когато изберете роклята, ще вземем точните мерки и ще обсъдим необходимите корекции."
                      : "Не е необходимо сами да определяте размера си. Ако вече сте избрали обувки за повода, носете ги или донесете чифт с подобна височина. Ще вземем точните мерки и ще обсъдим необходимите корекции."}</p>
                  </details>
                </>
              )}
            </div>
          </aside>

          <ProductGallery product={product} />
        </section>

        <ScrollRevealSection className="storefront-product-related" labelledBy="related-title">
          <h2 id="related-title">Още модели за вас</h2>
          <HorizontalDragRail
            className="storefront-product-related__grid"
            ariaLabel="Още модели за вас"
          >
            {relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.slug}
                href={`/${collection.slug}/${relatedProduct.slug}`}
                image={relatedProduct.image}
                alt={relatedProduct.alt}
                eyebrow={collection.title}
                name={relatedProduct.name}
                price={formatStorefrontPrice(relatedProduct.price)}
                sizes="(max-width: 820px) 76vw, 24vw"
              />
            ))}
          </HorizontalDragRail>
        </ScrollRevealSection>
      </div>

      <SiteFooter />
    </main>
  );
}
