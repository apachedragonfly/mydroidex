import './style.css'
import { droids, tiers, rarityOrder, typeIcons, incomeFor } from './data.js'
import { economyFor } from './economy.js'
import { superRebirthCycles } from './superRebirth.js'

const STORAGE_KEY = 'droidex-collection-v1'
const FILTER_KEY = 'droidex-filters-v1'
const CYCLE_TRACKER_KEY = 'droidex-cycle-tracker-v1'
const EXPORT_VERSION = 1

const safeParse = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}

let collection = new Set(safeParse(STORAGE_KEY, []))
let filters = { search: '', rarity: 'All', type: 'All', status: 'all', view: 'full', ...safeParse(FILTER_KEY, {}) }
if (!['full', 'compact', 'remaining'].includes(filters.view)) filters.view = 'full'
let cycleTracker = { cycle: 1, credits: '', completed: [], droids: [], ...safeParse(CYCLE_TRACKER_KEY, {}) }
if (!superRebirthCycles.some(cycle => cycle.cycle === cycleTracker.cycle)) cycleTracker.cycle = 1
if (!Array.isArray(cycleTracker.completed)) cycleTracker.completed = []
if (!Array.isArray(cycleTracker.droids)) cycleTracker.droids = []
if (typeof cycleTracker.credits !== 'string') cycleTracker.credits = ''

const app = document.querySelector('#app')
const slotKey = (id, tier) => `${id}:${tier}`
const rebirthStepKey = (cycle, level) => `${cycle}:${level}`
const availableTiers = (droid) => droid.rarity === 'Iconic' ? tiers.slice(0, 1) : tiers
const searchText = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const droidById = new Map(droids.map(droid => [droid.id, droid]))
const totalSlots = droids.reduce((sum, droid) => sum + availableTiers(droid).length, 0)
const validSlots = new Set(droids.flatMap(droid => availableTiers(droid).map(tier => slotKey(droid.id, tier.id))))
collection = new Set([...collection].filter(key => validSlots.has(key)))
const validCycleSlots = new Set(superRebirthCycles.flatMap(cycle => cycle.steps.flatMap(step => step.droids.map(droid => slotKey(droid.id, droid.tier)))))
cycleTracker.droids = cycleTracker.droids.filter(key => validCycleSlots.has(key))

const droidGlyph = (type) => {
  if (type === 'Astromech') return `<svg viewBox="0 0 92 92" aria-hidden="true"><path d="M29 34a17 17 0 0 1 34 0v5H29z"/><path d="M27 42h38v34H27z"/><path d="m27 49-10 8v24h9M65 49l10 8v24h-9"/><circle class="eye" cx="46" cy="27" r="4"/><path class="line" d="M36 49h20M37 59h8v9h-8zM51 59h6"/></svg>`
  if (type === 'Battle') return `<svg viewBox="0 0 92 92" aria-hidden="true"><path d="M36 13h20l7 13-8 10H37l-8-10z"/><path d="M41 36v8h10v-8M32 44h28v25H32zM32 48 18 66M60 48l14 18M39 69l-5 14M53 69l5 14"/><circle class="eye" cx="51" cy="25" r="3"/></svg>`
  return `<svg viewBox="0 0 92 92" aria-hidden="true"><path d="M30 30h32v40H30zM35 20h22v10H35zM36 70l-6 13M56 70l6 13M30 42l-13 18M62 42l13 18"/><circle class="eye" cx="40" cy="42" r="3"/><circle class="eye" cx="52" cy="42" r="3"/><path class="line" d="M37 54h18M41 61h10"/></svg>`
}

function getVisible() {
  const query = searchText(filters.search)
  return droids.filter(droid => {
    const keys = availableTiers(droid).map(t => slotKey(droid.id, t.id))
    const completed = keys.filter(key => collection.has(key)).length
    const effectiveStatus = filters.view === 'remaining' ? 'missing' : filters.status
    const statusMatch = effectiveStatus === 'all' ||
      (effectiveStatus === 'complete' && completed === keys.length) ||
      (effectiveStatus === 'missing' && completed < keys.length)
    return (!query || searchText(`${droid.name} ${droid.rarity} ${droid.type}`).includes(query)) &&
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

function currentSuperCycle() {
  return superRebirthCycles.find(cycle => cycle.cycle === cycleTracker.cycle) ?? superRebirthCycles[0]
}

function creditValue() {
  const raw = cycleTracker.credits.trim().toLowerCase().replace(/,/g, '')
  const match = raw.match(/^(\d+(?:\.\d+)?)\s*([kmbt])?$/)
  if (!match) return 0
  const multipliers = { k: 1e3, m: 1e6, b: 1e9, t: 1e12 }
  return Number(match[1]) * (multipliers[match[2]] ?? 1)
}

function rebirthStepStatus(cycle, step) {
  const ownedDroids = step.droids.filter(droid => cycleTracker.droids.includes(slotKey(droid.id, droid.tier))).length
  const creditsReady = creditValue() >= step.credits
  const droidsReady = ownedDroids === step.droids.length
  const completed = cycleTracker.completed.includes(rebirthStepKey(cycle.cycle, step.level))
  return { ownedDroids, creditsReady, droidsReady, completed, ready: creditsReady && droidsReady }
}

function superRebirthSummary(cycle) {
  return cycle.steps.reduce((stats, step) => {
    const status = rebirthStepStatus(cycle, step)
    stats.done += status.completed ? 1 : 0
    stats.ready += !status.completed && status.ready ? 1 : 0
    stats.missing += status.completed || status.ready ? 0 : 1
    stats.credits += step.credits
    return stats
  }, { done: 0, ready: 0, missing: 0, credits: 0 })
}

function currentRoute() {
  return location.hash === '#cycle-tracker' ? 'cycle-tracker' : 'droidex'
}

function renderHeader(route) {
  return `<header class="site-header">
    <a class="brand" href="#droidex" aria-label="Droidex home">
      <span class="brand-mark"><i></i><i></i><i></i></span>
      <span><b>DROIDEX</b><small>HISTORY DATABASE</small></span>
    </a>
    <div class="header-tools">
      <nav class="top-nav" aria-label="Primary navigation">
        <a href="#droidex" class="${route === 'droidex' ? 'active' : ''}" aria-current="${route === 'droidex' ? 'page' : 'false'}">Droidex</a>
        <a href="#cycle-tracker" class="${route === 'cycle-tracker' ? 'active' : ''}" aria-current="${route === 'cycle-tracker' ? 'page' : 'false'}">Cycle Tracker</a>
      </nav>
      ${route === 'droidex' ? `<div class="transfer-actions" aria-label="Transfer Droidex checklist">
        <button id="export-checklist">EXPORT</button>
        <button id="import-checklist-button">IMPORT</button>
        <input id="import-checklist" type="file" accept="application/json,.json">
      </div>` : ''}
      <div class="header-status"><span class="status-light"></span> SYSTEM ONLINE <b>V1.19</b></div>
    </div>
  </header>`
}

function droidexPage() {
  const visible = getVisible()
  const stats = summary()
  const visibleMissing = visible.reduce((sum, droid) => sum + availableTiers(droid).filter(tier => !collection.has(slotKey(droid.id, tier.id))).length, 0)
  return `
      <section class="hero">
        <div class="eyebrow"><span>◆</span> DROID TYCOON ARCHIVE</div>
        <div class="hero-grid">
          <div><h1>Track every droid.<br><em>Made in history.</em></h1><p>Log every Base, Gold, Diamond, Rainbow, and Beskar unit you have made for the Droidex history record. Your progress is saved automatically on this device.</p></div>
          <div class="overall" style="--progress:${stats.percentage * 3.6}deg">
            <div><strong>${stats.percentage}<sup>%</sup></strong><span>HISTORY COMPLETE</span></div>
          </div>
        </div>
        <div class="stat-strip">
          <div><span>MADE UNITS</span><strong>${stats.collected}<small> / ${totalSlots}</small></strong></div>
          <div><span>BASE DROIDEX</span><strong>${stats.baseComplete}<small> / ${droids.length}</small></strong></div>
          <div><span>HISTORY REMAINING</span><strong>${totalSlots - stats.collected}</strong></div>
          <div class="tier-key">${tiers.map(t => `<span class="tier-dot ${t.id}"><i></i>${t.label}</span>`).join('')}</div>
        </div>
      </section>

      <section class="database view-${filters.view}">
        <div class="section-heading"><div><span>DATABASE // 01</span><h2>${filters.view === 'remaining' ? 'Still needed' : 'Droid history'}</h2></div><div class="result-count">${filters.view === 'remaining' ? `<b>${visibleMissing}</b> variants remaining` : `<b>${visible.length}</b> of ${droids.length} models displayed`}</div></div>
        <div class="toolbar">
          <label class="search"><span>⌕</span><input id="search" type="search" placeholder="Search designation..." value="${escapeHtml(filters.search)}" autocomplete="off"></label>
          <div class="filter-group" aria-label="Rarity filter">
            ${['All', ...rarityOrder].map(v => `<button data-filter="rarity" data-value="${v}" class="${filters.rarity === v ? 'active' : ''}">${v}</button>`).join('')}
          </div>
          <div class="select-wrap"><select id="type-filter" aria-label="Filter by droid type">${['All', 'Worker', 'Astromech', 'Battle'].map(v => `<option ${filters.type === v ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
          <div class="view-toggle" aria-label="History status"><button data-status="all" class="${filters.status === 'all' ? 'active' : ''}">All</button><button data-status="missing" class="${filters.status === 'missing' ? 'active' : ''}">Missing</button><button data-status="complete" class="${filters.status === 'complete' ? 'active' : ''}">Complete</button></div>
          <div class="display-toggle" aria-label="Display mode"><button data-view="full" class="${filters.view === 'full' ? 'active' : ''}" aria-pressed="${filters.view === 'full'}" title="Detailed view">▦ <span>Full</span></button><button data-view="compact" class="${filters.view === 'compact' ? 'active' : ''}" aria-pressed="${filters.view === 'compact'}" title="Compact list view">☷ <span>Compact</span></button><button data-view="remaining" class="${filters.view === 'remaining' ? 'active' : ''}" aria-pressed="${filters.view === 'remaining'}" title="Missing Droidex variants">□ <span>Needed</span></button></div>
        </div>
        <div class="bulk-controls" aria-label="Bulk history macros">
          <div class="bulk-group"><span>VARIANT MACROS</span><div>${tiers.map(tier => bulkButton('tier', tier.id, tier.label)).join('')}</div></div>
          <div class="bulk-group"><span>TYPE MACROS</span><div>${['Worker', 'Astromech', 'Battle'].map(type => bulkButton('type', type, type)).join('')}</div></div>
        </div>
        <div class="droid-list ${filters.view === 'remaining' ? 'remaining-list' : ''}">
          ${visible.length ? visible.map(filters.view === 'remaining' ? remainingRow : droidRow).join('') : `<div class="empty"><b>${filters.view === 'remaining' && collection.size === totalSlots ? 'DROIDEX HISTORY COMPLETE' : 'NO MATCHING UNITS'}</b><span>${filters.view === 'remaining' && collection.size === totalSlots ? 'Every Droidex variant has been made.' : 'Adjust your database filters and scan again.'}</span>${collection.size === totalSlots ? '' : '<button id="clear-filters">Clear filters</button>'}</div>`}
        </div>
      </section>
  `
}

function cycleTrackerPage() {
  return `<section class="cycle-page">
    <div class="cycle-page-hero">
      <div class="eyebrow"><span>></span> SEPARATE TRACKER</div>
      <h1>Cycle Tracker</h1>
      <p>Track Super Rebirth cycle requirements separately from Droidex history. Checking a required droid here only updates this cycle tracker.</p>
    </div>
    ${superRebirthTracker()}
  </section>`
}

function render() {
  const route = currentRoute()
  app.innerHTML = `
    <div class="stars stars-a"></div><div class="stars stars-b"></div>
    ${renderHeader(route)}
    <main>
      ${route === 'cycle-tracker' ? cycleTrackerPage() : droidexPage()}
    </main>
    <footer><span class="local-save"><i></i> SAVED LOCALLY ON THIS DEVICE</span><span>${route === 'cycle-tracker' ? 'CYCLE TRACKER DATA IS STORED SEPARATELY FROM DROIDEX HISTORY' : 'UNOFFICIAL FAN-MADE HISTORY TRACKER · DATA MAY CHANGE WITH GAME UPDATES'}</span><button id="${route === 'cycle-tracker' ? 'reset-cycle-tracker' : 'reset'}">${route === 'cycle-tracker' ? 'RESET CYCLE TRACKER' : 'RESET HISTORY'}</button></footer>
    <div class="toast" role="status" aria-live="polite"></div>
  `
  bindEvents()
}

function superRebirthTracker() {
  const cycle = currentSuperCycle()
  const stats = superRebirthSummary(cycle)
  return `<section class="super-rebirth">
    <div class="section-heading rebirth-heading">
      <div><span>SUPER REBIRTH // JUL 8 2026</span><h2>Cycle ${cycle.cycle} tracker</h2></div>
      <div class="result-count"><b>${stats.done}</b> done <b>${stats.ready}</b> ready <b>${stats.missing}</b> pending</div>
    </div>
    <div class="rebirth-control-bar">
      <div class="cycle-tabs" aria-label="Super Rebirth cycle">
        ${superRebirthCycles.map(item => `<button data-super-cycle="${item.cycle}" class="${item.cycle === cycle.cycle ? 'active' : ''}" aria-pressed="${item.cycle === cycle.cycle}">Cycle ${item.cycle}</button>`).join('')}
      </div>
      <label class="credit-input"><span>CREDITS</span><input id="rebirth-credits" inputmode="decimal" placeholder="0, 15M, 2.5B" value="${escapeHtml(cycleTracker.credits)}"></label>
      <div class="rebirth-total"><span>CYCLE COST</span><b>${formatCredits(stats.credits)}</b></div>
    </div>
    <div class="rebirth-grid">
      ${cycle.steps.map(step => superRebirthStep(cycle, step)).join('')}
    </div>
  </section>`
}

function superRebirthStep(cycle, step) {
  const status = rebirthStepStatus(cycle, step)
  const state = status.completed ? 'done' : status.ready ? 'ready' : 'missing'
  return `<article class="rebirth-card ${state}">
    <div class="rebirth-card-head">
      <div><span>REBIRTH ${step.level}</span><strong>${formatCredits(step.credits)} CR</strong></div>
      <button data-rebirth-step="${rebirthStepKey(cycle.cycle, step.level)}" class="${status.completed ? 'checked' : ''}" aria-pressed="${status.completed}">${status.completed ? 'DONE' : status.ready ? 'READY' : 'MARK'}</button>
    </div>
    <div class="rebirth-readiness"><span>${status.ownedDroids}/${step.droids.length} droids</span><span>${status.creditsReady ? 'credits ready' : `${formatCredits(Math.max(step.credits - creditValue(), 0))} CR short`}</span></div>
    <div class="rebirth-droids">
      ${step.droids.map(droid => rebirthDroidRequirement(droid)).join('')}
    </div>
  </article>`
}

function rebirthDroidRequirement(requirement) {
  const droid = droidById.get(requirement.id)
  const key = slotKey(requirement.id, requirement.tier)
  const owned = cycleTracker.droids.includes(key)
  const tier = tiers.find(item => item.id === requirement.tier)
  const label = droid?.name ?? requirement.id
  return `<button data-cycle-slot="${key}" class="rebirth-droid ${requirement.tier} ${owned ? 'owned' : ''}" aria-pressed="${owned}" aria-label="${label} ${tier?.label ?? requirement.tier}: ${owned ? 'ready in cycle tracker' : 'not ready in cycle tracker'}"><i></i><span>${label}</span><b>${tier?.label ?? requirement.tier}</b></button>`
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
        const income = incomeFor(droid, t.id)
        return `<button class="tier-check ${t.id} ${checked ? 'checked' : ''}" data-slot="${key}" aria-pressed="${checked}" aria-label="${droid.name} ${t.label}: ${checked ? 'made' : 'not made'}"><span class="check-box">${checked ? '✓' : ''}</span><span class="tier-name">${t.label}</span>${income ? `<small>${formatIncome(income)}/s</small>` : ''}</button>`
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
      return `<button data-slot="${slotKey(droid.id, tier.id)}" aria-label="Mark ${droid.name} ${tier.label} as made"><span class="needed-tier ${tier.id}"><i></i>${tier.label}</span><span class="needed-price">${values ? `<b>${formatCredits(values[0])}</b><small>BUY</small>` : '<b>EVENT</b><small>EXCLUSIVE</small>'}</span><span class="needed-price sell">${values ? `<b>${formatCredits(values[1])}</b><small>SELL</small>` : '<b>—</b><small>SELL</small>'}</span><span class="needed-add">＋</span></button>`
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
    localStorage.setItem(CYCLE_TRACKER_KEY, JSON.stringify(cycleTracker))
  } catch { showToast('LOCAL SAVE UNAVAILABLE') }
}

function downloadExport(payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = exportFilename()
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

function exportFilename() {
  return `droidex-checklist-${new Date().toISOString().slice(0, 10)}.json`
}

async function exportChecklist() {
  const payload = {
    app: 'droidex-checklist',
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    rosterSize: droids.length,
    totalSlots,
    collected: [...collection].sort(),
    filters,
  }
  const file = new File([JSON.stringify(payload, null, 2)], exportFilename(), { type: 'application/json' })

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Droidex checklist' })
      showToast('CHECKLIST EXPORTED')
      return
    } catch (error) {
      if (error?.name === 'AbortError') return
    }
  }

  downloadExport(payload)
  showToast('CHECKLIST EXPORTED')
}

function importPayload(payload) {
  const slots = Array.isArray(payload) ? payload : payload?.collected
  if (!Array.isArray(slots)) throw new Error('Missing Droidex history checklist data')

  const imported = new Set(slots.filter(key => typeof key === 'string' && validSlots.has(key)))
  if (slots.length > 0 && imported.size === 0) throw new Error('No valid Droidex entries found')

  collection = imported
  if (payload?.filters && typeof payload.filters === 'object') {
    filters = {
      ...filters,
      search: typeof payload.filters.search === 'string' ? payload.filters.search : filters.search,
      rarity: ['All', ...rarityOrder].includes(payload.filters.rarity) ? payload.filters.rarity : filters.rarity,
      type: ['All', 'Worker', 'Astromech', 'Battle'].includes(payload.filters.type) ? payload.filters.type : filters.type,
      status: ['all', 'missing', 'complete'].includes(payload.filters.status) ? payload.filters.status : filters.status,
      view: ['full', 'compact', 'remaining'].includes(payload.filters.view) ? payload.filters.view : filters.view,
    }
  }
  save()
  render()
  showToast(`${collection.size} DROIDEX HISTORY ENTRIES IMPORTED`)
}

async function importChecklist(file) {
  if (!file) return
  try {
    const payload = JSON.parse(await file.text())
    if (collection.size && !confirm('Importing will replace current Droidex history progress. Continue?')) return
    importPayload(payload)
  } catch (error) {
    showToast('IMPORT FAILED: INVALID CHECKLIST FILE')
    console.error(error)
  }
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
  document.querySelectorAll('[data-super-cycle]').forEach(button => button.addEventListener('click', () => { cycleTracker.cycle = Number(button.dataset.superCycle); save(); render() }))
  document.querySelectorAll('[data-rebirth-step]').forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.rebirthStep
    if (cycleTracker.completed.includes(key)) cycleTracker.completed = cycleTracker.completed.filter(item => item !== key)
    else cycleTracker.completed = [...cycleTracker.completed, key]
    save(); render()
  }))
  document.querySelectorAll('[data-cycle-slot]').forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.cycleSlot
    if (cycleTracker.droids.includes(key)) cycleTracker.droids = cycleTracker.droids.filter(item => item !== key)
    else cycleTracker.droids = [...cycleTracker.droids, key]
    save(); render()
  }))
  document.querySelectorAll('[data-bulk]').forEach(button => button.addEventListener('click', () => {
    const keys = bulkKeys(button.dataset.bulk, button.dataset.value)
    const added = keys.filter(key => !collection.has(key)).length
    keys.forEach(key => collection.add(key))
    save(); render(); showToast(`${added} DROIDEX HISTORY ${added === 1 ? 'ENTRY' : 'ENTRIES'} ADDED`)
  }))
  document.querySelector('#type-filter')?.addEventListener('change', event => { filters.type = event.target.value; save(); render() })
  document.querySelector('#rebirth-credits')?.addEventListener('input', event => {
    cycleTracker.credits = event.target.value; save(); render()
    const input = document.querySelector('#rebirth-credits'); input.focus(); input.setSelectionRange(input.value.length, input.value.length)
  })
  document.querySelector('#clear-filters')?.addEventListener('click', () => { filters = { ...filters, search: '', rarity: 'All', type: 'All', status: 'all' }; save(); render() })
  document.querySelector('#export-checklist')?.addEventListener('click', exportChecklist)
  document.querySelector('#import-checklist-button')?.addEventListener('click', () => document.querySelector('#import-checklist')?.click())
  document.querySelector('#import-checklist')?.addEventListener('change', event => {
    importChecklist(event.target.files?.[0])
    event.target.value = ''
  })
  document.querySelector('#reset')?.addEventListener('click', () => {
    if (confirm('Reset all Droidex history progress? This cannot be undone.')) { collection.clear(); save(); render(); showToast('HISTORY PROGRESS RESET') }
  })
  document.querySelector('#reset-cycle-tracker')?.addEventListener('click', () => {
    if (confirm('Reset cycle tracker progress? Droidex history will not be changed.')) {
      cycleTracker = { cycle: 1, credits: '', completed: [], droids: [] }
      save(); render(); showToast('CYCLE TRACKER RESET')
    }
  })
}

function showToast(message) {
  requestAnimationFrame(() => { const toast = document.querySelector('.toast'); if (!toast) return; toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2400) })
}

window.addEventListener('hashchange', render)
render()
