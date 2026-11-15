/* Google Analytics 4 integration — set your GA4 Web Stream Measurement ID here. */
const GA4_MEASUREMENT_ID = ""; // e.g. G-XXXXXXXXXX
(function () {
  if (!/^G-[A-Z0-9]+$/i.test(GA4_MEASUREMENT_ID)) return;
  const storageKey = "pixelcraft-analytics-consent";
  function getChoice() { try { return localStorage.getItem(storageKey); } catch (_) { return null; } }
  function saveChoice(value) { try { localStorage.setItem(storageKey, value); } catch (_) {} }
  function startAnalytics() {
    if (window.__pixelcraftAnalyticsActive) return;
    window.__pixelcraftAnalyticsActive = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA4_MEASUREMENT_ID, { send_page_view: true });
    const tag = document.createElement("script");
    tag.async = true;
    tag.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA4_MEASUREMENT_ID);
    document.head.appendChild(tag);
  }
  function removeBanner() {
    const bar = document.getElementById("analytics-consent-bar");
    if (bar) bar.remove();
  }
  const choice = getChoice();
  if (choice === "accepted") { startAnalytics(); return; }
  if (choice === "declined") return;
  function showBanner() {
    if (document.getElementById("analytics-consent-bar")) return;
    const bar = document.createElement("section");
    bar.id = "analytics-consent-bar";
    bar.setAttribute("aria-label", "Analytics consent");
    bar.style.cssText = "position:fixed;bottom:16px;left:16px;right:16px;max-width:650px;margin:auto;z-index:9999;background:#fff;border:1px solid #dfe5ef;border-radius:14px;box-shadow:0 12px 50px #182d4440;padding:18px;display:flex;flex-wrap:wrap;align-items:center;gap:15px;color:#223047;font:14px/1.5 system-ui,sans-serif";
    const msg = document.createElement("div");
    msg.style.cssText = "flex:1 1 300px";
    msg.innerHTML = "<strong>Help us improve PixelCraft Tools</strong><div>Allow anonymous website usage analytics? Your images stay on your device. <a href='./privacy.html' style='text-decoration:underline'>Privacy policy</a></div>";
    const actions = document.createElement("div");
    actions.style.cssText = "display:flex;gap:10px";
    const decline = document.createElement("button");
    decline.type = "button"; decline.textContent = "Decline";
    decline.style.cssText = "border:1px solid #dfe5ef;border-radius:8px;padding:9px 14px;background:white;cursor:pointer";
    decline.onclick = () => { saveChoice("declined"); removeBanner(); };
    const accept = document.createElement("button");
    accept.type = "button"; accept.textContent = "Accept";
    accept.style.cssText = "border:0;border-radius:8px;padding:9px 14px;background:#5865ef;color:white;cursor:pointer";
    accept.onclick = () => { saveChoice("accepted"); removeBanner(); startAnalytics(); };
    actions.append(decline, accept);bar.append(msg,actions);document.body.appendChild(bar);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", showBanner, {once:true});
  else showBanner();
  window.pixelcraftAnalyticsOptOut = () => { saveChoice("declined"); removeBanner(); location.reload(); };
})();
