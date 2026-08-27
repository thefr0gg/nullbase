"use client";

import { useEffect } from "react";

/**
 * Google AdSense publisher ID (ca-pub-...).
 * This is the account associated with the site: nullbase.
 */
export const ADSENSE_CLIENT = "ca-pub-2968783374193615";

/**
 * The ad unit slot ID (data-ad-slot) for this specific ad placement.
 *
 * ⚠️ Create this once in your AdSense dashboard
 *    ("Content" → "Ad units" → create a *responsive* ad unit), then paste the
 *    generated 10+ digit slot value here. Until this is a real slot the ad
 *    simply won't fill (AdSense will render a reserved/blank space).
 */
export const ADSENSE_SLOT = "0000000000000000";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

/**
 * A single, responsive AdSense ad unit.
 *
 * Intended to be rendered exactly once per page (right after the article body,
 * before the next-page footer) so it never interrupts reading. The layout is
 * responsible for loading the `adsbygoogle.js` loader script; this component
 * only registers the ad after its DOM node mounts so the loader picks it up.
 */
export function AdUnit() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      // AdSense occasionally throws if the slot was already processed or the
      // loader script hasn't finished loading yet — fail silently, never crash.
      console.error("AdSense: failed to load ad unit", error);
    }
  }, []);

  return (
    <div className="my-8 overflow-hidden">
      <p className="mb-2 text-right text-[11px] font-medium uppercase tracking-wide text-text-secondary">
        Advertisement
      </p>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={ADSENSE_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}