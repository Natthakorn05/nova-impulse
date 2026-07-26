/* ============================================================
   icons.js — SVG glyph set for skills, statuses and UI.

   §6 asks for icons in the action menu rather than text buttons.
   These are stroke-based 24x24 glyphs that inherit currentColor,
   so a skill icon can be tinted by its element/class colour
   without needing a separate asset per variant.
   ============================================================ */

window.NI = window.NI || {};

NI.icons = (function () {

  const g = (paths, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra}>${paths}</svg>`;

  const ICONS = {
    /* --- physical --- */
    sword:    g(`<path d="M14.5 3.5 20.5 3.5 20.5 9.5 9 21 3 15 14.5 3.5Z"/><path d="M6 18 3 21"/>`),
    slash:    g(`<path d="M4 20 20 4"/><path d="M8 20 20 8"/><path d="M4 16 16 4"/>`),
    thrust:   g(`<path d="M3 21 21 3"/><path d="M15 3h6v6"/><path d="M8 16l-3 3"/>`),
    cleave:   g(`<path d="M3 6c6 0 12 4 18 12"/><path d="M3 12c5 0 9 3 13 8"/><path d="M20 4l1 4-4-1"/>`),
    hammer:   g(`<path d="M4 20 12 12"/><path d="M10 6h9v6h-9z"/><path d="M10 9H7l-3 3 3 3h3"/>`),
    fist:     g(`<path d="M6 11V7a2 2 0 1 1 4 0v3"/><path d="M10 10V6a2 2 0 1 1 4 0v4"/><path d="M14 10V8a2 2 0 1 1 4 0v6a6 6 0 0 1-12 0v-3"/>`),

    /* --- ranged --- */
    arrow:    g(`<path d="M3 21 21 3"/><path d="M14 3h7v7"/><path d="M12 5l7 7"/>`),
    multishot:g(`<path d="M4 20 20 8"/><path d="M4 15 17 5"/><path d="M4 10 13 4"/><path d="M20 4v6h-6"/>`),
    pierce:   g(`<path d="M2 12h20"/><path d="M17 7l5 5-5 5"/><circle cx="7" cy="12" r="2.5"/>`),
    snipe:    g(`<circle cx="12" cy="12" r="7"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>`),
    trap:     g(`<path d="M5 8 12 4l7 4"/><path d="M5 8v6l7 4 7-4V8"/><path d="M9 12l3 2 3-2"/>`),

    /* --- elemental --- */
    flame:    g(`<path d="M12 22c4 0 6-2.8 6-6 0-4.5-4-6-3.5-10C11 8 9.5 9.5 9.5 12c0-1.5-1-2.5-1.5-3C7 11 6 12.5 6 16c0 3.2 2 6 6 6Z"/>`),
    ice:      g(`<path d="M12 2v20M4 7l16 10M20 7 4 17"/><path d="M12 6l-2-2 2-2 2 2-2 2"/>`),
    bolt:     g(`<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/>`),
    wind:     g(`<path d="M3 8h11a3 3 0 1 0-3-3"/><path d="M3 13h15a3 3 0 1 1-3 3"/><path d="M3 18h8"/>`),
    quake:    g(`<path d="M2 18h4l2-6 3 10 3-14 2 8 2-4h4"/>`),
    nova:     g(`<circle cx="12" cy="12" r="3.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>`),

    /* --- support / defence --- */
    heal:     g(`<path d="M12 5v14M5 12h14"/><circle cx="12" cy="12" r="9" stroke-dasharray="3 3"/>`),
    shield:   g(`<path d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z"/>`),
    guard:    g(`<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z"/><path d="M9 12l2 2 4-4"/>`),
    barrier:  g(`<path d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z" stroke-dasharray="3 2"/><path d="M12 8v8"/>`),
    taunt:    g(`<path d="M4 5h16v10H8l-4 4V5Z"/><path d="M9 10h.01M12 10h.01M15 10h.01"/>`),
    regen:    g(`<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v5h-5"/><path d="M12 8v4l3 2"/>`),

    /* --- status / misc --- */
    poison:   g(`<path d="M12 2c3 4 6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 3-7 6-11Z"/><path d="M10 14h4"/>`),
    crit:     g(`<path d="m12 2 2.6 6.6L21 11l-6.4 2.4L12 20l-2.6-6.6L3 11l6.4-2.4L12 2Z"/>`),
    mark:     g(`<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 1v3M12 20v3M1 12h3M20 12h3"/>`),
    haste:    g(`<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/><path d="M2 7h4M2 12h3M2 17h4"/>`),
    stun:     g(`<path d="M8 6a4 4 0 1 1 8 0c0 2-2 3-2 5"/><path d="M12 17h.01"/><path d="M5 4l2 2M19 4l-2 2"/>`),
    drain:    g(`<path d="M12 21s-7-4.5-7-10a7 7 0 0 1 14 0c0 5.5-7 10-7 10Z"/><path d="M9 11h6"/>`),
    link:     g(`<path d="M9 12a3 3 0 0 1 3-3h3a3 3 0 0 1 0 6h-1"/><path d="M15 12a3 3 0 0 1-3 3H9a3 3 0 0 1 0-6h1"/>`),

    /* --- UI --- */
    up:       g(`<path d="M12 19V5M5 12l7-7 7 7"/>`),
    lock:     g(`<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>`),
    check:    g(`<path d="M20 6 9 17l-5-5"/>`),
    dot:      g(`<circle cx="12" cy="12" r="4" fill="currentColor"/>`),
    hp:       g(`<path d="M12 21s-7-4.5-7-10a7 7 0 0 1 14 0c0 5.5-7 10-7 10Z"/>`),
    mp:       g(`<path d="m12 2 7 10-7 10-7-10 7-10Z"/>`)
  };

  /** Return icon markup, falling back to a neutral dot for unknown keys. */
  function get(key) {
    return ICONS[key] || ICONS.dot;
  }

  return { get, ICONS };
})();
