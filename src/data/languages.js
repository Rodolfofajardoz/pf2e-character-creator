// Verified against AoN's remaster "Languages" rules page (Player Core pg. 89
// — note this table changed from the Core Rulebook version: Fey and Sakvroth
// are now Common, Sylvan and Undercommon are gone from that list, and several
// outsider/elemental languages were renamed (Celestial->Empyrean,
// Infernal->Diabolic, Abyssal->Chthonian, Terran->Petran, Ignan->Pyric,
// Auran->Sussuran, Aquan->Thalassic), plus Kholo, Muan and Talican are new.
export const COMMON_LANGUAGES = [
  'Common', 'Draconic', 'Dwarven', 'Elven', 'Fey', 'Gnomish', 'Goblin',
  'Halfling', 'Jotun', 'Orcish', 'Sakvroth',
];

// Uncommon languages need GM approval per the rules ("Regional languages are
// uncommon, but characters from that region have access to choose them...
// ask your GM if there's a language you want to select that isn't on these
// lists"). Shown in the picker anyway (per explicit request) but flagged.
export const UNCOMMON_LANGUAGES = [
  'Aklo', 'Chthonian', 'Diabolic', 'Empyrean', 'Kholo', 'Necril', 'Petran',
  'Pyric', 'Shadowtongue', 'Sussuran', 'Thalassic', 'Muan', 'Talican',
];
