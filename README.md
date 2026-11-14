# PixelCraft Tools

Six working browser-based image tools: target-KB compression, resize, HEIC to JPG, WebP to PNG, aspect ratio, Discord image compression.

## Preview
Run `python3 -m http.server 8000` in this directory and open http://localhost:8000.

## Publish
Upload the contents of this directory to any static host (Cloudflare Pages, Netlify, Render Static Site). No build command needed; publish directory is `.`.

## Before production
- Replace the placeholder brand and provide a real contact method.
- Configure a custom domain and update the canonical URL.
- Add Search Console and sitemap using the final domain.
- Review privacy/cookie and advertising disclosures before enabling ads.
- Test HEIC conversion in Safari and Chrome; it requires the heic2any CDN.
- SEO: dedicated server-rendered routes and original explanatory content are recommended for every tool; query-string routing here is a functional MVP, not final SEO architecture.
- Compression is best effort; PNG transparency is lost when converting to JPEG.