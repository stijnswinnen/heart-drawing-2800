import { Helmet } from "react-helmet-async";

const SITE = "https://2800.love";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "2800.love",
  url: "https://2800.love",
  inLanguage: "nl-BE",
  publisher: {
    "@type": "Person",
    name: "Stijn Swinnen",
    url: "https://2800.love/over",
  },
};

interface SeoProps {
  title: string;
  description?: string;
  path: string;
  ogType?: string;
  ogImage?: string;
  noindex?: boolean;
  jsonLd?: unknown[];
}

const toAbsolute = (url: string) =>
  url.startsWith("http") ? url : `${SITE}${url.startsWith("/") ? "" : "/"}${url}`;

export const Seo = ({
  title,
  description,
  path,
  ogType = "website",
  ogImage = "/og/default.png",
  noindex = false,
  jsonLd = [],
}: SeoProps) => {
  const canonical = `${SITE}${path.startsWith("/") ? path : `/${path}`}`;
  const image = toAbsolute(ogImage);
  const blocks = [websiteJsonLd, ...jsonLd];

  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={canonical} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="nl_BE" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={image} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {blocks.map((block, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(block)}
        </script>
      ))}
    </Helmet>
  );
};

export default Seo;
