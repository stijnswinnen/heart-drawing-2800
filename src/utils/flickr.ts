export interface FlickrEmbed {
  /** Direct image URL (from the <img src> in the embed code, or the plain URL itself) */
  imgSrc: string;
  /** Link back to the Flickr photo page (required by Flickr Terms of Use), if present */
  linkHref: string | null;
  /** Alt text from the embed's <img alt> / title, if present */
  alt: string | null;
}

/**
 * Parses a Flickr embed code (`<a data-flickr-embed="true" href="..."><img src="..."/></a>`)
 * into its parts. Also accepts a plain image URL for backwards compatibility with
 * locations saved before embed codes were required.
 */
export const parseFlickrEmbed = (value: string | null | undefined): FlickrEmbed | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("<")) {
    const imgMatch = trimmed.match(/<img[^>]*\ssrc=["']([^"']+)["'][^>]*>/i);
    const hrefMatch = trimmed.match(/<a[^>]*\shref=["']([^"']+)["'][^>]*>/i);
    const altMatch = trimmed.match(/<img[^>]*\salt=["']([^"']*)["'][^>]*>/i);
    if (!imgMatch) return null;
    return {
      imgSrc: imgMatch[1],
      linkHref: hrefMatch ? hrefMatch[1] : null,
      alt: altMatch ? altMatch[1] : null,
    };
  }

  // Plain URL (legacy data)
  return { imgSrc: trimmed, linkHref: null, alt: null };
};
