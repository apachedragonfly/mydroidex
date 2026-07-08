import './style.css'
import { droids, tiers, rarityOrder, typeIcons } from './data.js'
import { economyFor } from './economy.js'

const STORAGE_KEY = 'droidex-collection-v1'
const FILTER_KEY = 'droidex-filters-v1'

const safeParse = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}

let collection = new Set(safeParse(STORAGE_KEY, []))
let filters = { search: '', rarity: 'All', type: 'All', status: 'all', view: 'full', ...safeParse(FILTER_KEY, {}) }
if (!['full', 'compact', 'remaining'].includes(filters.view)) filters.view = 'full'

const app = document.querySelector('#app')
const slotKey = (id, tier) => `${id}:${tier}`
const availableTiers = (droid) => droid.rarity === 'Iconic' ? tiers.slice(0, 1) : tiers
const totalSlots = droids.reduce((sum, droid) => sum + availableTiers(droid).length, 0)
const validSlots = new Set(droids.flatMap(droid => availableTiers(droid).map(tier => slotKey(droid.id, tier.id))))
collection = new Set([...collection].filter(key => validSlots.has(key)))

const droidGlyph = (type) => {
  if (type === 'Astromech') return `<svg viewBox="0 0 92 92" aria-hidden="true"><path d="M29 34a17 17 0 0 1 34 0v5H29z"/><path d="M27 42h38v34H27z"/><path d="m27 49-10 8v24h9M65 49l10 8v24h-9"/><circle class="eye" cx="46" cy="27" r="4"/><path class="line" d="M36 49h20M37 59h8v9h-8zM51 59h6"/></svg>`
  if (type === 'Battle') return `<svg viewBox="0 0 92 92" aria-hidden="true"><path d="M36 13h20l7 13-8 10H37l-8-10z"/><path d="M41 36v8h10v-8M32 44h28v25H32zM32 48 18 66M60 48l14 18M39 69l-5 14M53 69l5 14"/><circle class="eye" cx="51" cy="25" r="3"/></svg>`
  return `<svg viewBox="0 0 92 92" aria-hidden="true"><path d="M30 30h32v40H30zM35 20h22v10H35zM36 70l-6 13M56 70l6 13M30 42l-13 18M62 42l13 18"/><circle class="eye" cx="40" cy="42" r="3"/><circle class="eye" cx="52" cy="42" r="3"/><path class="line" d="M37 54h18M41 61h10"/></svg>`
}

function getVisible() {
  const query = filters.search.trim().toLowerCase()
  return droids.filter(droid => {
    const keys = availableTiers(droid).map(t => slotKey(droid.id, t.id))
    const completed = keys.filter(key => collection.has(key)).length
    const effectiveStatus = filters.view === 'remaining' ? 'missing' : filters.status
    const statusMatch = effectiveStatus === 'all' ||
      (effectiveStatus === 'complete' && completed === keys.length) ||
      (effectiveStatus === 'missing' && completed < keys.length)
    return (!query || `${droid.name} ${droid.rarity} ${droid.type}`.toLowerCase().includes(query)) &&
      (filters.rarity === 'All' || droid.rarity === filters.rarity) &&
      (filters.type === 'All' || droid.type === filters.type) && statusMatch
  })
}

function summary() {
  const collected = collection.size
  const percentage = Math.round(collected / totalSlots * 100)
  const baseComplete = droids.filter(d => collection.has(slotKey(d.id, 'base'))).length
  return { collected, percentage, baseComplete }
}

function bulkKeys(kind, value) {
  return droids.flatMap(droid => {
    if (kind === 'type' && droid.type !== value) return []
    return availableTiers(droid)
      .filter(tier => kind !== 'tier' || tier.id === value)
      .map(tier => slotKey(droid.id, tier.id))
  })
}

function bulkButton(kind, value, label) {
  const keys = bulkKeys(kind, value)
  const completed = keys.filter(key => collection.has(key)).length
  const isComplete = completed === keys.length
  return `<button data-bulk="${kind}" data-value="${value}" ${isComplete ? 'disabled' : ''} aria-label="Select all ${label} entries"><span>${label}</span><b>${completed}/${keys.length}</b></button>`
}

function render() {
  const visible = getVisible()
  const stats = summary()
  const visibleMissing = visible.reduce((sum, droid) => sum + availableTiers(droid).filter(tier => !collection.has(slotKey(droid.id, tier.id))).length, 0)
  app.innerHTML = `
    <div class="stars stars-a"></div><div class="stars stars-b"></div>
    <header class="site-header">
      <a class="brand" href="#" aria-label="Droidex home">
        <span class="brand-mark"><i></i><i></i><i></i></span>
        <span><b>DROIDEX</b><small>COLLECTION DATABASE</small></span>
      </a>
      <div class="header-status"><span class="status-light"></span> SYSTEM ONLINE <b>V1.19</b></div>
    </header>
    <main>
      <section class="hero">
        <div class="eyebrow"><span>◆</span> DROID TYCOON ARCHIVE</div>
        <div class="hero-grid">
          <div><h1>Track every droid.<br><em>Complete the Droidex.</em></h1><p>Log every Base, Gold, Diamond, Rainbow, and Beskar unit you collect. Your progress is saved automatically on this device.</p></div>
          <div class="overall" style="--progress:${stats.percentage * 3.6}deg">
            <div><strong>${stats.percentage}<sup>%</sup></strong><span>ARCHIVE COMPLETE</span></div>
          </div>
        </div>
        <div class="stat-strip">
          <div><span>COLLECTED UNITS</span><strong>${stats.collected}<small> / ${totalSlots}</small></strong></div>
          <div><span>BASE DROIDEX</span><strong>${stats.baseComplete}<small> / ${droids.length}</small></strong></div>
          <div><span>UNITS REMAINING</span><strong>${totalSlots - stats.collected}</strong></div>
          <div class="tier-key">${tiers.map(t => `<span class="tier-dot ${t.id}"><i></i>${t.label}</span>`).join('')}</div>
        </div>
      </section>

      <section class="database view-${filters.view}">
        <div class="section-heading"><div><span>DATABASE // 01</span><h2>${filters.view === 'remaining' ? 'Still needed' : 'Droid collection'}</h2></div><div class="result-count">${filters.view === 'remaining' ? `<b>${visibleMissing}</b> variants remaining` : `<b>${visible.length}</b> of ${droids.length} models displayed`}</div></div>
        <div class="toolbar">
          <label class="search"><span>⌕</span><input id="search" type="search" placeholder="Search designation..." value="${escapeHtml(filters.search)}" autocomplete="off"></label>
          <div class="filter-group" aria-label="Rarity filter">
            ${['All', ...rarityOrder].map(v => `<button data-filter="rarity" data-value="${v}" class="${filters.rarity === v ? 'active' : ''}">${v}</button>`).join('')}
          </div>
          <div class="select-wrap"><select id="type-filter" aria-label="Filter by droid type">${['All', 'Worker', 'Astromech', 'Battle'].map(v => `<option ${filters.type === v ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
          <div class="view-toggle" aria-label="Collection status"><button data-status="all" class="${filters.status === 'all' ? 'active' : ''}">All</button><button data-status="missing" class="${filters.status === 'missing' ? 'active' : ''}">Missing</button><button data-status="complete" class="${filters.status === 'complete' ? 'active' : ''}">Complete</button></div>
          <div class="display-toggle" aria-label="Display mode"><button data-view="full" class="${filters.view === 'full' ? 'active' : ''}" aria-pressed="${filters.view === 'full'}" title="Detailed view">▦ <span>Full</span></button><button data-view="compact" class="${filters.view === 'compact' ? 'active' : ''}" aria-pressed="${filters.view === 'compact'}" title="Compact list view">☷ <span>Compact</span></button><button data-view="remaining" class="${filters.view === 'remaining' ? 'active' : ''}" aria-pressed="${filters.view === 'remaining'}" title="Missing Droidex variants">□ <span>Needed</span></button></div>
        </div>
        <div class="bulk-controls" aria-label="Bulk collection macros">
          <div class="bulk-group"><span>VARIANT MACROS</span><div>${tiers.map(tier => bulkButton('tier', tier.id, tier.label)).join('')}</div></div>
          <div class="bulk-group"><span>TYPE MACROS</span><div>${['Worker', 'Astromech', 'Battle'].map(type => bulkButton('type', type, type)).join('')}</div></div>
        </div>
        <div class="droid-list ${filters.view === 'remaining' ? 'remaining-list' : ''}">
          ${visible.length ? visible.map(filters.view === 'remaining' ? remainingRow : droidRow).join('') : `<div class="empty"><b>${filters.view === 'remaining' && collection.size === totalSlots ? 'DROIDEX COMPLETE' : 'NO MATCHING UNITS'}</b><span>${filters.view === 'remaining' && collection.size === totalSlots ? 'Every Droidex variant has been collected.' : 'Adjust your database filters and scan again.'}</span>${collection.size === totalSlots ? '' : '<button id="clear-filters">Clear filters</button>'}</div>`}
        </div>
      </section>
    </main>
    <footer><span class="local-save"><i></i> SAVED LOCALLY ON THIS DEVICE</span><span>UNOFFICIAL FAN-MADE TRACKER · DATA MAY CHANGE WITH GAME UPDATES</span><button id="reset">RESET PROGRESS</button></footer>
    <div class="toast" role="status" aria-live="polite"></div>
  `
  bindEvents()
}

function droidRow(droid) {
  const slots = availableTiers(droid)
  const collected = slots.filter(t => collection.has(slotKey(droid.id, t.id))).length
  return `<article class="droid-row rarity-${droid.rarity.toLowerCase()} ${collected === slots.length ? 'is-complete' : ''}">
    <div class="portrait">${droidGlyph(droid.type)}<span>${String(droid.index + 1).padStart(2, '0')}</span></div>
    <div class="droid-info"><div class="rarity-label">${droid.rarity}</div><h3>${droid.name}</h3><div class="meta"><span>${typeIcons[droid.type]} ${droid.type}</span><span>${droid.income ? formatIncome(droid.income) + ' CR/S' : '15% BONUS'}</span></div></div>
    <div class="tier-checks">
      ${slots.map(t => {
        const key = slotKey(droid.id, t.id), checked = collection.has(key)
        return `<button class="tier-check ${t.id} ${checked ? 'checked' : ''}" data-slot="${key}" aria-pressed="${checked}" aria-label="${droid.name} ${t.label}: ${checked ? 'collected' : 'not collected'}"><span class="check-box">${checked ? '✓' : ''}</span><span class="tier-name">${t.label}</span>${droid.income ? `<small>${formatIncome(droid.income * t.multiplier)}/s</small>` : ''}</button>`
      }).join('')}
    </div>
    <div class="row-progress"><b>${collected}/${slots.length}</b><span><i style="height:${collected / slots.length * 100}%"></i></span></div>
  </article>`
}

function remainingRow(droid) {
  const missing = availableTiers(droid).filter(tier => !collection.has(slotKey(droid.id, tier.id)))
  return `<article class="needed-card rarity-${droid.rarity.toLowerCase()}">
    <div class="needed-head"><div><span>${droid.rarity}</span><h3>${droid.name}</h3></div><small>${typeIcons[droid.type]} ${droid.type}</small></div>
    <div class="needed-tiers">${missing.map(tier => {
      const values = economyFor(droid, tier.id)
      return `<button data-slot="${slotKey(droid.id, tier.id)}" aria-label="Mark ${droid.name} ${tier.label} as collected"><span class="needed-tier ${tier.id}"><i></i>${tier.label}</span><span class="needed-price">${values ? `<b>${formatCredits(values[0])}</b><small>BUY</small>` : '<b>EVENT</b><small>EXCLUSIVE</small>'}</span><span class="needed-price sell">${values ? `<b>${formatCredits(values[1])}</b><small>SELL</small>` : '<b>—</b><small>SELL</small>'}</span><span class="needed-add">＋</span></button>`
    }).join('')}</div>
  </article>`
}

function formatIncome(value) {
  if (value >= 1000) return `${Number((value / 1000).toFixed(2))}K`
  return String(value)
}

function formatCredits(value) {
  if (value >= 1e12) return `${Number((value / 1e12).toFixed(2))}T`
  if (value >= 1e9) return `${Number((value / 1e9).toFixed(2))}B`
  if (value >= 1e6) return `${Number((value / 1e6).toFixed(2))}M`
  if (value >= 1e3) return `${Number((value / 1e3).toFixed(2))}K`
  return String(value)
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c])
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...collection]))
    localStorage.setItem(FILTER_KEY, JSON.stringify(filters))
  } catch { showToast('LOCAL SAVE UNAVAILABLE') }
}

function bindEvents() {
  document.querySelectorAll('[data-slot]').forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.slot
    collection.has(key) ? collection.delete(key) : collection.add(key)
    save(); render()
  }))
  document.querySelector('#search')?.addEventListener('input', event => {
    filters.search = event.target.value; save(); render()
    const input = document.querySelector('#search'); input.focus(); input.setSelectionRange(input.value.length, input.value.length)
  })
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => { filters[button.dataset.filter] = button.dataset.value; save(); render() }))
  document.querySelectorAll('[data-status]').forEach(button => button.addEventListener('click', () => { filters.status = button.dataset.status; save(); render() }))
  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => { filters.view = button.dataset.view; save(); render() }))
  document.querySelectorAll('[data-bulk]').forEach(button => button.addEventListener('click', () => {
    const keys = bulkKeys(button.dataset.bulk, button.dataset.value)
    const added = keys.filter(key => !collection.has(key)).length
    keys.forEach(key => collection.add(key))
    save(); render(); showToast(`${added} DROIDEX ${added === 1 ? 'ENTRY' : 'ENTRIES'} ADDED`)
  }))
  document.querySelector('#type-filter')?.addEventListener('change', event => { filters.type = event.target.value; save(); render() })
  document.querySelector('#clear-filters')?.addEventListener('click', () => { filters = { ...filters, search: '', rarity: 'All', type: 'All', status: 'all' }; save(); render() })
  document.querySelector('#reset')?.addEventListener('click', () => {
    if (confirm('Reset all Droidex collection progress? This cannot be undone.')) { collection.clear(); save(); render(); showToast('ARCHIVE PROGRESS RESET') }
  })
}

function showToast(message) {
  requestAnimationFrame(() => { const toast = document.querySelector('.toast'); if (!toast) return; toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2400) })
}

render()
