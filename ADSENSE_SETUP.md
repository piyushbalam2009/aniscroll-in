# Google AdSense setup for Aniscroll

This branch adds manual ad-slot containers to the home, search, schedule, watchlist, and history pages. Ads are disabled by default.

## Before enabling ads

- Confirm you own or have permission to monetize all content shown on the site. Embedding a third-party anime stream does not establish distribution or monetization rights.
- Apply for Google AdSense and wait for site approval.
- Use only the publisher ID and ad-unit slot IDs generated in your AdSense account.
- Do not serve ads on thin, empty, under-construction, or ad-only pages. This implementation requires a minimum number of real content cards before showing a slot.
- This implementation deliberately places no ad over the video player and does not add a slot to the watch page.

## Configure manual ad units

Edit `js/ads.js`:

1. Set `publisherId` to your actual `ca-pub-...` publisher ID.
2. Set the corresponding `slotIds` values to the numeric slot IDs from AdSense's generated Display ad units.
3. Keep any placement's slot ID empty if you do not have a real ad unit for it.

Current placements:
- `home-feed`: after the Popular anime section, only when at least four poster cards are present.
- `search-results`: after search results, only when at least four poster cards are present.
- `schedule-list`: after the schedule, only when at least three broadcast cards are present.
- `watchlist`: below saved anime, only when at least four cards are present.
- `history`: below history, only when at least four cards are present.

The script loader is injected only when a real publisher ID and at least one matching slot ID are configured. The site must still be approved by Google for ads to serve.

## ads.txt

Do not add a placeholder `ads.txt`. Once AdSense provides your publisher declaration, create `public/ads.txt` with the exact line shown in your account. For a standard AdSense entry the shape is:

```text
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

Replace the placeholder with your real numeric publisher ID (without the `ca-` prefix) and confirm the declaration with AdSense before publishing.
