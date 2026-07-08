import './style.css'
import { droids, tiers, rarityOrder, typeIcons } from './data.js'

const STORAGE_KEY = 'droidex-collection-v1'
const FILTER_KEY = 'droidex-filters-v1'

const safeParse = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}

let collection = new Set(safeParse(STORAGE_KEY, []))
let filters = { search: '', rarity: 'All', type: 'All', status: 'all', ...safeParse(FILTER_KEY, {}) }

const app = document.querySelector('#app')
const slotKey = (id, tier) => `${id}:${tier}`
const availableTiers = (droid) => droid.rarity === 'Iconic' ? tiers.slice(0, 1) : tiers
const totalSlots = droids.reduce((sum, droid) => sum + availableTiers(droid).length, 0)

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
    const statusMatch = filters.status === 'all' ||
      (filters.status === 'complete' && completed === keys.length) ||
      (filters.status === 'missing' && completed < keys.length)
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

function render() {
  const visible = getVisible()
  const stats = summary()
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

      <section class="database">
        <div class="section-heading"><div><span>DATABASE // 01</span><h2>Droid collection</h2></div><div class="result-count"><b>${visible.length}</b> of ${droids.length} models displayed</div></div>
        <div class="toolbar">
          <label class="search"><span>⌕</span><input id="search" type="search" placeholder="Search designation..." value="${escapeHtml(filters.search)}" autocomplete="off"></label>
          <div class="filter-group" aria-label="Rarity filter">
            ${['All', ...rarityOrder].map(v => `<button data-filter="rarity" data-value="${v}" class="${filters.rarity === v ? 'active' : ''}">${v}</button>`).join('')}
          </div>
          <div class="select-wrap"><select id="type-filter" aria-label="Filter by droid type">${['All', 'Worker', 'Astromech', 'Battle'].map(v => `<option ${filters.type === v ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
          <div class="view-toggle" aria-label="Collection status"><button data-status="all" class="${filters.status === 'all' ? 'active' : ''}">All</button><button data-status="missing" class="${filters.status === 'missing' ? 'active' : ''}">Missing</button><button data-status="complete" class="${filters.status === 'complete' ? 'active' : ''}">Complete</button></div>
        </div>
        <div class="droid-list">
          ${visible.length ? visible.map(droidRow).join('') : `<div class="empty"><b>NO MATCHING UNITS</b><span>Adjust your database filters and scan again.</span><button id="clear-filters">Clear filters</button></div>`}
        </div>
      </section>
    </main>
    <footer><span>DROIDEX // LOCAL ARCHIVE</span><span>UNOFFICIAL FAN-MADE TRACKER · DATA MAY CHANGE WITH GAME UPDATES</span><button id="reset">RESET PROGRESS</button></footer>
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

function formatIncome(value) {
  if (value >= 1000) return `${Number((value / 1000).toFixed(2))}K`
  return String(value)
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c])
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...collection]))
  localStorage.setItem(FILTER_KEY, JSON.stringify(filters))
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
  document.querySelector('#type-filter')?.addEventListener('change', event => { filters.type = event.target.value; save(); render() })
  document.querySelector('#clear-filters')?.addEventListener('click', () => { filters = { search: '', rarity: 'All', type: 'All', status: 'all' }; save(); render() })
  document.querySelector('#reset')?.addEventListener('click', () => {
    if (confirm('Reset all Droidex collection progress? This cannot be undone.')) { collection.clear(); save(); render(); showToast('ARCHIVE PROGRESS RESET') }
  })
}

function showToast(message) {
  requestAnimationFrame(() => { const toast = document.querySelector('.toast'); if (!toast) return; toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2400) })
}

render()
