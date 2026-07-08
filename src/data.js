export const tiers = [
  { id: 'base', label: 'Base', short: 'B', multiplier: 1 },
  { id: 'gold', label: 'Gold', short: 'G', multiplier: 2 },
  { id: 'diamond', label: 'Diamond', short: 'D', multiplier: 4 },
  { id: 'rainbow', label: 'Rainbow', short: 'R', multiplier: 8 },
  { id: 'beskar', label: 'Beskar', short: 'BK', multiplier: 12 },
]

const rows = [
  ['Mouse', 'Common', 'Worker', 2], ['Pit', 'Common', 'Worker', 2],
  ['Gonk', 'Common', 'Worker', 4], ['CB', 'Common', 'Astromech', 3],
  ['R3', 'Common', 'Astromech', 3], ['R5', 'Common', 'Astromech', 3],
  ['R8', 'Common', 'Astromech', 4], ['Imperial Probe', 'Common', 'Battle', 6],
  ['B1 Battle', 'Common', 'Battle', 5], ['DRK-1 Probe', 'Common', 'Battle', 3],
  ['ID10', 'Common', 'Battle', 4],
  ['BDX Explorer', 'Rare', 'Worker', 15], ['ARG', 'Rare', 'Worker', 42],
  ['Senate Hovercam', 'Rare', 'Worker', 46], ['BU-4D', 'Rare', 'Worker', 58],
  ['Bal-Core', 'Rare', 'Worker', 23], ['Roll-R', 'Rare', 'Worker', 31],
  ['2BB', 'Rare', 'Astromech', 17], ['A-LT', 'Rare', 'Astromech', 36],
  ['R4', 'Rare', 'Astromech', 50], ['R9', 'Rare', 'Astromech', 54],
  ['B1 Security', 'Rare', 'Battle', 66], ['NAV-EX', 'Rare', 'Battle', 18],
  ['Vect-Arm', 'Rare', 'Battle', 27], ['HOV-R', 'Rare', 'Battle', 62],
  ['Groundmech', 'Epic', 'Worker', 120], ['LO', 'Epic', 'Worker', 240],
  ['AMP Walker', 'Epic', 'Worker', 570], ['Sen-Tri', 'Epic', 'Worker', 510],
  ['Opti-Pod', 'Epic', 'Worker', 390], ['Gunrunner', 'Epic', 'Worker', 660],
  ['BB', 'Epic', 'Astromech', 150], ['R2', 'Epic', 'Astromech', 360],
  ['R6', 'Epic', 'Astromech', 300], ['Trak-R', 'Epic', 'Astromech', 360],
  ['Orb-Walker', 'Epic', 'Astromech', 180], ['Util-Tech', 'Epic', 'Astromech', 210],
  ['B1 Heavy', 'Epic', 'Battle', 630], ['B2 Super', 'Epic', 'Battle', 420],
  ['B2 Heavy', 'Epic', 'Battle', 480], ['Strike-Orb', 'Epic', 'Battle', 540],
  ['Haul-R', 'Epic', 'Battle', 270], ['LNG-Shot', 'Epic', 'Battle', 450],
  ['Proto-Roller', 'Legendary', 'Worker', 972], ['Mecha-Droid', 'Legendary', 'Worker', 1240],
  ['Mono-Walker', 'Legendary', 'Worker', 1500], ['BB9', 'Legendary', 'Astromech', 1300],
  ['R7', 'Legendary', 'Astromech', 1500], ['B2-RP', 'Legendary', 'Battle', 1300],
  ['Cyclo-Grav', 'Legendary', 'Battle', 1260], ['Opti-Strike', 'Legendary', 'Battle', 1500],
  ['Snow Mouse', 'Mythic', 'Worker', 4400], ['RIC', 'Mythic', 'Worker', 5100],
  ['RIC-1200', 'Mythic', 'Worker', 5800], ['LEP', 'Mythic', 'Worker', 6500],
  ['Loadlifter', 'Mythic', 'Worker', 7200], ['DRFT-R', 'Mythic', 'Astromech', 5800],
  ['MO-TRAK', 'Mythic', 'Astromech', 7200], ['TRI-TEK', 'Mythic', 'Astromech', 6500],
  ['CYCLENS', 'Mythic', 'Astromech', 4400], ['KX', 'Mythic', 'Battle', 7200],
  ['IG', 'Mythic', 'Battle', 5800],
  ['C-3PO', 'Iconic', 'Worker', null], ['R2-D2', 'Iconic', 'Astromech', null],
  ['DJ R-3X', 'Iconic', 'Worker', null], ['CB-23', 'Iconic', 'Astromech', null],
  ['BB8', 'Iconic', 'Astromech', null], ['Mister Bones', 'Iconic', 'Battle', null],
  ['IG-11 Marshal', 'Iconic', 'Battle', null],
]

export const droids = rows.map(([name, rarity, type, income], index) => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), name, rarity, type, income, index,
}))

export const rarityOrder = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Iconic']
export const typeIcons = { Worker: '⌁', Astromech: '◉', Battle: '⌖' }
