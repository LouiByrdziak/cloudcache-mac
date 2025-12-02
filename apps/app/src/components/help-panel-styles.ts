/**
 * Help Panel Styles
 *
 * CSS for the right-side sliding help panel with visualizations.
 * Extracted from preview-v3-chunky-toggles-clean-sidebar.html lines 287-441
 *
 * See: .cursor/rules/cloud-preview-design.mdc
 */

export const helpPanelStyles = `
/* ===========================================
   INFO BUTTON
   =========================================== */
.card__info {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--icon);
  cursor: pointer;
  font-size: 14px;
  transition: all 150ms var(--ease);
  flex-shrink: 0;
  margin-right: 8px;
}

.card__info:hover {
  background: var(--brand);
  border-color: var(--brand);
  color: #fff;
}

.card.active {
  border-color: var(--brand);
  box-shadow: 0 0 0 1px var(--brand);
}

/* ===========================================
   BACKDROP & PANELS
   =========================================== */
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  opacity: 0;
  visibility: hidden;
  transition: opacity 200ms var(--ease);
  z-index: 300;
}

.backdrop.active { opacity: 1; visibility: visible; }

.panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  max-width: 460px;
  height: 100vh;
  background: var(--bg-surface);
  border-left: 1px solid var(--border);
  z-index: 400;
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 300ms var(--ease);
}

.panel.active { transform: translateX(0); }

.panel__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-secondary);
}

.panel__icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--brand), var(--brand-light));
  border-radius: 8px;
  font-size: 18px;
}

.panel__title { flex: 1; font-size: 16px; font-weight: 600; }

.panel__close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--icon);
  cursor: pointer;
}

.panel__close:hover { background: rgba(229,28,0,0.15); color: var(--text-critical); }

.panel__body { flex: 1; overflow-y: auto; padding: 16px; }
.panel__stack { display: flex; flex-direction: column; gap: 16px; }

.panel__label { font-size: 10px; font-weight: 600; color: var(--brand-text); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
.panel__text { font-size: 14px; line-height: 1.55; color: var(--text-secondary); }
.panel__text strong { color: var(--text); }
.panel__text em { color: #36d399; font-style: normal; font-weight: 500; }

/* ===========================================
   CALLOUT
   =========================================== */
.callout { background: var(--bg-secondary); border: 1px solid var(--border); border-left: 3px solid var(--brand); border-radius: 6px; padding: 10px 12px; }
.callout__title { font-size: 13px; font-weight: 600; color: var(--brand-text); margin-bottom: 4px; }
.callout p { font-size: 13px; color: var(--text-secondary); margin: 0; }

/* ===========================================
   VISUAL CONTAINER
   =========================================== */
.visual { background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 8px; padding: 14px; }
.visual__label { font-size: 10px; font-weight: 500; color: var(--text-dim); text-transform: uppercase; text-align: center; margin-bottom: 12px; }

/* ===========================================
   STATS GRID
   =========================================== */
.stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.stat { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 6px; padding: 10px; text-align: center; }
.stat__value { font-size: 18px; font-weight: 700; color: var(--brand-text); }
.stat__label { font-size: 10px; color: var(--text-dim); text-transform: uppercase; }

/* ===========================================
   TIMELINE
   =========================================== */
.timeline { display: flex; flex-direction: column; gap: 8px; }
.timeline__row { display: flex; flex-direction: column; gap: 2px; }
.timeline__label { font-size: 11px; color: var(--text-dim); }
.timeline__bar { height: 20px; border-radius: 4px; display: flex; overflow: hidden; }
.timeline__seg { display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 600; color: #fff; }
.timeline__seg--block { background: #e51c00; }
.timeline__seg--delay { background: var(--border); color: var(--text-dim); }
.timeline__seg--fast { background: var(--brand); }
.timeline__seg--defer { background: rgba(244,129,32,0.2); color: var(--brand-text); }
.timeline__time { font-size: 11px; font-weight: 600; text-align: right; margin-top: 2px; }
.timeline__time--slow { color: var(--text-critical); }
.timeline__time--fast { color: var(--brand-text); }

/* ===========================================
   CODE COMPARE
   =========================================== */
.code-compare { display: flex; flex-direction: column; gap: 8px; }
.code-label { font-size: 11px; color: var(--text-dim); margin-bottom: 2px; }
.code { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 6px; padding: 10px; font: 11px/1.5 var(--mono); overflow-x: auto; }
.code--before { border-left: 3px solid var(--text-critical); }
.code--after { border-left: 3px solid var(--brand); }
.code .kw { color: #c792ea; }
.code .str { color: #c3e88d; }
.code .cmt { color: #546e7a; }
.code .prop { color: #82aaff; }
.code .val { color: #f78c6c; }

/* ===========================================
   SIZE BARS
   =========================================== */
.size-bars { display: flex; flex-direction: column; gap: 10px; }
.size-bar__row { display: flex; flex-direction: column; gap: 2px; }
.size-bar__label { font-size: 11px; color: var(--text-dim); display: flex; justify-content: space-between; }
.size-bar { height: 20px; border-radius: 4px; }
.size-bar--orig { background: var(--border); width: 100%; }
.size-bar--comp { background: var(--brand); }
.size-bar--gzip { background: var(--text-dim); }
.size-savings { text-align: center; padding: 8px; background: rgba(244,129,32,0.1); border: 1px solid var(--brand); border-radius: 4px; }
.size-savings__val { font-size: 18px; font-weight: 700; color: var(--brand-text); }
.size-savings__label { font-size: 11px; color: var(--text-secondary); }

/* ===========================================
   SEQUENCE DIAGRAM
   =========================================== */
.sequence { display: flex; flex-direction: column; gap: 6px; }
.seq-row { display: flex; align-items: center; gap: 8px; padding: 8px; background: var(--bg-surface); border-radius: 4px; border: 1px solid var(--border); }
.seq-row--hl { border-color: var(--brand); background: rgba(244,129,32,0.05); }
.seq-step { width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; background: var(--brand); border-radius: 50%; font-size: 10px; font-weight: 700; color: #fff; }
.seq-content { flex: 1; }
.seq-title { font-size: 13px; font-weight: 600; }
.seq-desc { font-size: 11px; color: var(--text-secondary); }
.seq-time { font-size: 11px; color: var(--brand-text); font-weight: 500; }

/* ===========================================
   BROWSER MOCKUP
   =========================================== */
.browser { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 6px; overflow: hidden; }
.browser__bar { display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: var(--bg-secondary); border-bottom: 1px solid var(--border); }
.browser__dots { display: flex; gap: 4px; }
.browser__dots span { width: 8px; height: 8px; border-radius: 50%; }
.browser__dots span:nth-child(1) { background: #ff5f57; }
.browser__dots span:nth-child(2) { background: #ffbd2e; }
.browser__dots span:nth-child(3) { background: #28c840; }
.browser__url { flex: 1; background: var(--bg); padding: 2px 8px; border-radius: 4px; font: 10px var(--mono); color: var(--text-dim); }
.browser__content { padding: 10px; display: flex; flex-direction: column; gap: 6px; }

/* ===========================================
   SKELETON LOADERS
   =========================================== */
.skel { background: var(--border); border-radius: 3px; animation: pulse 1.5s ease-in-out infinite; }
.skel--h { width: 30%; height: 8px; background: var(--brand); }
.skel--nav { width: 50%; height: 6px; }
.skel--hero { width: 100%; height: 24px; }
.skel--text { width: 70%; height: 5px; }

@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }

/* ===========================================
   BANNER
   =========================================== */
.banner { display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: rgba(244,129,32,0.1); border: 1px solid var(--brand); border-radius: 4px; font-size: 12px; font-weight: 500; color: var(--brand-text); }
.banner__icon { width: 16px; height: 16px; background: var(--brand); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 9px; }
`;

