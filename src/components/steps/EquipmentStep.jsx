import { useState } from 'react';
import { WEAPONS, ARMORS, GEAR, STARTING_GOLD, formatGold } from '../../data/equipment';

// How long the "can't afford this" shake/flash lasts before the chip
// settles back to its normal (muted, still-clickable) look.
const DENY_SHAKE_MS = 420;

export default function EquipmentStep({ character, update }) {
  const [deniedId, setDeniedId] = useState(null);

  // It's a shop: buying is unrestricted (as many weapons, armor, or gear
  // as the budget allows), same toggle-on/toggle-off model for all three
  // categories. Which one you're actually wearing/wielding is a separate
  // "equip" concern this step doesn't handle — see useComputedCharacter,
  // which treats the first purchased weapon/armor as worn for AC/Strike
  // math until a real equip system exists.
  const weaponItems = WEAPONS.filter((w) => character.weaponIds.includes(w.id));
  const armorItems = ARMORS.filter((a) => character.armorIds.includes(a.id));
  const gearItems = GEAR.filter((g) => character.gearIds.includes(g.id));

  const spent =
    weaponItems.reduce((sum, w) => sum + w.price, 0) +
    armorItems.reduce((sum, a) => sum + a.price, 0) +
    gearItems.reduce((sum, g) => sum + g.price, 0);
  const remaining = STARTING_GOLD - spent;

  // Rather than disabling an unaffordable chip outright (which silently
  // swallows the click and gives no feedback about *why* nothing
  // happened), it stays clickable but denies the purchase with a brief
  // shake + red flash, so picking something you can't afford is obviously
  // rejected instead of looking identical to picking nothing at all.
  function denyShake(id) {
    setDeniedId(id);
    setTimeout(() => setDeniedId((cur) => (cur === id ? null : cur)), DENY_SHAKE_MS);
  }

  function toggle(listKey, id, item) {
    const current = character[listKey];
    if (current.includes(id)) {
      update({ [listKey]: current.filter((x) => x !== id) });
    } else if (remaining >= item.price) {
      update({ [listKey]: [...current, id] });
    } else {
      denyShake(id);
    }
  }

  return (
    <div className="step">
      <h2>Starting Equipment</h2>
      <p className="hint">
        You start with {STARTING_GOLD} gp to spend. Buy anything you can afford — a shop doesn't care how many
        weapons or suits of armor you walk out with, only what you actually wear or wield is a separate matter.
        Prices are approximate — double-check exact values against the Equipment chapter of the rulebook before
        using them at the table.
      </p>
      <p className="gold-tracker">
        Spent: {formatGold(spent)} · Remaining: <strong>{formatGold(remaining)}</strong>
      </p>

      <section className="sub-section">
        <h3>Weapon</h3>
        <div className="chip-row">
          {WEAPONS.map((w) => {
            const owned = character.weaponIds.includes(w.id);
            const unaffordable = !owned && w.price > remaining;
            return (
              <button
                key={w.id}
                className={`chip ${owned ? 'selected' : ''} ${unaffordable ? 'unaffordable' : ''} ${deniedId === w.id ? 'deny-shake' : ''}`}
                onClick={() => toggle('weaponIds', w.id, w)}
              >
                {w.name} ({w.damage}) — {formatGold(w.price)}
              </button>
            );
          })}
        </div>
      </section>

      <section className="sub-section">
        <h3>Armor</h3>
        <div className="chip-row">
          {ARMORS.map((a) => {
            const owned = character.armorIds.includes(a.id);
            const unaffordable = !owned && a.price > remaining;
            return (
              <button
                key={a.id}
                className={`chip ${owned ? 'selected' : ''} ${unaffordable ? 'unaffordable' : ''} ${deniedId === a.id ? 'deny-shake' : ''}`}
                onClick={() => toggle('armorIds', a.id, a)}
              >
                {a.name} (AC +{a.acBonus}) — {formatGold(a.price)}
              </button>
            );
          })}
        </div>
      </section>

      <section className="sub-section">
        <h3>Adventuring Gear</h3>
        <div className="chip-row">
          {GEAR.map((g) => {
            const owned = character.gearIds.includes(g.id);
            const unaffordable = !owned && g.price > remaining;
            return (
              <button
                key={g.id}
                className={`chip ${owned ? 'selected' : ''} ${unaffordable ? 'unaffordable' : ''} ${deniedId === g.id ? 'deny-shake' : ''}`}
                onClick={() => toggle('gearIds', g.id, g)}
              >
                {g.name} — {formatGold(g.price)}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
