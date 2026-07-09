const tiers = ['base', 'gold', 'diamond', 'rainbow', 'beskar']

const advanceTier = (tier, amount) => tiers[Math.min(tiers.indexOf(tier) + amount, tiers.length - 1)]

const step = (level, credits, droids) => ({ level, credits, droids })
const req = (id, tier = 'base') => ({ id, tier })

const cycleOne = [
  step(1, 10000, [req('cb'), req('pit'), req('drk-1-probe')]),
  step(2, 150000, [req('bdx-explorer'), req('2bb'), req('bal-core')]),
  step(3, 975000, [req('a-lt'), req('bu-4d'), req('r9', 'gold')]),
  step(4, 2950000, [req('arg', 'gold'), req('b1-security', 'gold'), req('groundmech')]),
  step(5, 5350000, [req('bu-4d', 'gold'), req('hov-r', 'gold'), req('r9', 'diamond')]),
  step(6, 9850000, [req('groundmech', 'gold'), req('arg', 'diamond'), req('a-lt', 'diamond')]),
  step(7, 14500000, [req('bb', 'gold'), req('b1-security', 'diamond'), req('bu-4d', 'diamond')]),
  step(8, 36000000, [req('util-tech', 'gold'), req('lo', 'gold'), req('hov-r', 'diamond')]),
  step(9, 89000000, [req('groundmech', 'rainbow'), req('r6', 'gold'), req('trak-r', 'gold')]),
  step(10, 220000000, [req('lo', 'rainbow'), req('haul-r', 'rainbow'), req('strike-orb', 'gold')]),
  step(11, 425000000, [req('r2', 'gold'), req('b2-super', 'gold'), req('lng-shot', 'rainbow')]),
  step(12, 950000000, [req('proto-roller', 'gold'), req('bb9', 'gold'), req('b2-heavy', 'rainbow')]),
  step(13, 2250000000, [req('mecha-droid', 'gold'), req('r7', 'gold'), req('cyclo-grav', 'gold')]),
  step(14, 5850000000, [req('mono-walker', 'gold'), req('b2-rp', 'rainbow'), req('opti-strike', 'gold')]),
  step(15, 14500000000, [req('snow-mouse', 'gold'), req('ric', 'gold'), req('drft-r', 'gold')]),
  step(16, 42000000000, [req('lep', 'gold'), req('cyclens', 'gold'), req('ig', 'gold')]),
  step(17, 130000000000, [req('loadlifter', 'gold'), req('mo-trak', 'gold'), req('kx', 'gold')]),
  step(18, 325000000000, [req('bb9', 'diamond'), req('r7', 'diamond'), req('mono-walker', 'rainbow')]),
  step(19, 810000000000, [req('b2-rp', 'rainbow'), req('cyclo-grav', 'rainbow'), req('proto-roller', 'rainbow')]),
  step(20, 2000000000000, [req('r7', 'rainbow'), req('opti-strike', 'rainbow'), req('mecha-droid', 'rainbow')]),
  step(21, 3000000000000, [req('bb', 'beskar'), req('orb-walker', 'beskar'), req('groundmech', 'beskar')]),
  step(22, 4500000000000, [req('amp-walker', 'beskar'), req('b1-heavy', 'beskar'), req('proto-roller', 'beskar')]),
  step(23, 6000000000000, [req('opti-strike', 'beskar'), req('mono-walker', 'beskar'), req('r7', 'beskar')]),
  step(24, 9000000000000, [req('bb9', 'beskar'), req('cyclo-grav', 'beskar'), req('mo-trak')]),
  step(25, 13500000000000, [req('b2-rp', 'beskar'), req('ig'), req('drft-r', 'gold')]),
  step(26, 21000000000000, [req('cyclens', 'gold'), req('loadlifter', 'diamond'), req('ric-1200', 'rainbow')]),
  step(27, 32000000000000, [req('kx', 'diamond'), req('tri-tek', 'rainbow'), req('snow-mouse', 'beskar')]),
]

export const superRebirthCycles = [1, 2, 3, 4].map(cycle => ({
  cycle,
  steps: cycleOne.map(item => ({
    ...item,
    droids: item.droids.map(droid => ({ ...droid, tier: advanceTier(droid.tier, cycle - 1) })),
  })),
}))
