// Verified crafting times in seconds from the community Droidex table.
// null means the source does not currently provide a reliable time.
// Tier order: Base, Gold, Diamond, Rainbow, Beskar.
const craftingTimes = {
  'MOUSE': [33,134,234,301,268],
  'PIT': [33,134,234,335,268],
  'GONK': [37,148,259,370,296],
  'CB': [35,141,246,352,282],
  'R3': [35,141,246,352,282],
  'R5': [35,141,246,352,282],
  'R8': [37,148,259,370,296],
  'IMPERIAL PROBE': [40,162,283,405,324],
  'B1 BATTLE': [38,155,246,387,310],
  'DRK-1 PROBE': [35,141,246,352,282],
  'ID10': [37,148,259,370,296],
  'BDX EXPLORER': [56,225,394,563,450],
  'ARG': [103,414,725,1037,null],
  'SENATE HOVERCAM': [110,442,775,1107,829],
  'BU-4D': [131,527,922,1317,885],
  'BAL-CORE': [70,281,492,703,null],
  'ROLL-R': [84,337,590,844,675],
  '2BB': [59,239,418,598,478],
  'A-LT': [93,372,652,931,745],
  'R4': [117,471,824,1177,942],
  'R9': [124,499,873,1247,998],
  'B1 SECURITY': [145,583,1020,1458,1166],
  'NAV-EX': [61,246,431,615,492],
  'VECT-ARM': [77,309,541,773,619],
  'HOV-R': [138,555,971,1388,1110],
  'GROUNDMECH': [240,962,null,2406,null],
  'LO': [451,1804,3158,4512,3609],
  'AMP WALKER': [1030,4121,7212,10303,null],
  'SEN-TRI': [925,3700,6475,9250,7400],
  'OPTI-POD': [714,2857,5001,null,null],
  'GUNRUNNER': [1188,4753,8318,null,9506],
  'BB': [293,1173,2052,2932,2346],
  'R2': [661,2647,4632,6618,null],
  'R6': [556,2226,3896,null,4452],
  'TRAK-R': [609,null,4264,6090,4873],
  'ORB-WALKER': [345,1383,2421,3459,2767],
  'UTIL-TEC': [398,1594,2789,null,3188],
  'B1 HEAVY': [1083,4332,7581,10830,null],
  'B2 SUPER': [767,3068,5369,null,6136],
  'B2 HEAVY': [872,3489,null,8740,null],
  'STRIKE-ORB': [977,3910,6843,null,7821],
  'HAUL-R': [503,2015,3526,5038,4047],
  'LNG-SHOT': [819,3279,5164,8197,6558],
  'PROTO-ROLLER': [1735,6943,null,17358,13886],
  'MECHA-DROID': [2213,null,15492,22132,17705],
  'MONO-WLKR': [2662,10650,18637,26625,21300],
  'BB9': [2280,null,16180,null,18492],
  'R7': [2662,10650,18637,26625,21300],
  'B2-RP': [2318,9274,16229,null,null],
  'CYCLO-GRAV': [2241,8965,null,22413,16137],
  'OPTI-STRK': [2662,10650,18637,26625,null],
}

const tierIds = ['base', 'gold', 'diamond', 'rainbow', 'beskar']

export const craftTimeFor = (droid, tierId) => {
  const tierIndex = tierIds.indexOf(tierId)
  return craftingTimes[droid.name.toUpperCase()]?.[tierIndex] ?? null
}
