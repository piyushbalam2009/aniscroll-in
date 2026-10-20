/*
 * Aniscroll manual Google AdSense placements.
 *
 * Before enabling:
 * 1. Apply for AdSense and get an approved site.
 * 2. Replace publisherId with your real ca-pub-... ID.
 * 3. Fill each placement's slot ID with a real ad-unit slot ID from AdSense.
 * 4. Keep placements on content-rich pages; never use ads as the only content.
 *
 * All values intentionally start empty. No requests to AdSense are made until
 * real IDs are configured, so this branch does not display fake/test ads.
 */
const publisherId = "";
const slotIds = {
  "home-feed": "",
  "search-results": "",
  "schedule-list": "",
  watchlist: "",
  history: ""
};

const publisherPattern = /^ca-pub-\d{8,}$/;
const slotPattern = /^\d{6,}$/;
let loaderStarted = false;

function configuredSlot(container) {
  const placement = container.dataset.adPlacement;
  const slotId = slotIds[placement];
  return publisherPattern.test(publisherId) && slotPattern.test(slotId || "")
    ? slotId
    : "";
}

function hasEnoughContent(container) {
  const selector = container.dataset.adRequires;
  const minimum = Math.max(1, Number(container.dataset.adMin) || 1);
  if (!selector) return false;

  try {
    const matches = [...document.querySelectorAll(selector)];
    if (matches.length < minimum) return false;
    return !matches.some((node) => node.closest(".empty-state"));
  } catch {
    return false;
  }
}

function ensureLoader() {
  if (loaderStarted) return;
  loaderStarted = true;

  const script = document.createElement("script");
  script.async = true;
  script.crossOrigin = "anonymous";
  script.src =
    "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" +
    encodeURIComponent(publisherId);
  script.onerror = () => {
    loaderStarted = false;
    document.querySelectorAll(".ad-slot").forEach((slot) => {
      slot.classList.remove("ad-slot-ready");
      slot.replaceChildren();
    });
  };
  document.head.appendChild(script);
}

function mountEligibleSlots() {
  const eligible = [...document.querySelectorAll(".ad-slot")].filter(
    (container) =>
      !container.dataset.adInitialized &&
      configuredSlot(container) &&
      hasEnoughContent(container)
  );

  if (!eligible.length) return;
  ensureLoader();

  for (const container of eligible) {
    const slotId = configuredSlot(container);
    if (!slotId) continue;

    const ad = document.createElement("ins");
    ad.className = "adsbygoogle";
    ad.style.display = "block";
    ad.dataset.adClient = publisherId;
    ad.dataset.adSlot = slotId;
    ad.dataset.adFormat = "auto";
    ad.dataset.fullWidthResponsive = "true";

    container.appendChild(ad);
    container.dataset.adInitialized = "true";
    container.classList.add("ad-slot-ready");

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.warn("AdSense slot could not initialize.", error);
      container.classList.remove("ad-slot-ready");
      container.replaceChildren();
      delete container.dataset.adInitialized;
    }
  }
}

function startAds() {
  mountEligibleSlots();

  // Search results, schedules, watchlists and history are populated asynchronously.
  const observer = new MutationObserver(() => mountEligibleSlots());
  observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startAds, { once: true });
} else {
  startAds();
}
