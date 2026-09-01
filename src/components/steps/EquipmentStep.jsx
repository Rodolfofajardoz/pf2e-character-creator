import { useState } from 'react';
import { WEAPONS, ARMORS, GEAR, STARTING_GOLD, formatGold } from '../../data/equipment';

// How long the "can't afford this" shake/flash lasts before the chip
// settles back to its normal (muted, still-clickable) look.
const DENY_SHAKE_MS = 420;

export default function EquipmentStep({ character, update }) {
  const [deniedId, setDeniedId] = useState(null);

  const weapon = WEAPONS.find((w) => w.id === character.weaponId);
  const armor = ARMORS.find((a) => a.id === character.armorId) || ARMORS[0];
  const gearItems = GEAR.filter((g) => character.gearIds.includes(g.id));

  const gearSpent = gearItems.reduce((sum, g) => sum + g.price, 0);
  const spent = (weapon?.price || 0) + (armor?.price || 0) + gearSpent;
  const remaining = STARTING_GOLD - spent;
  const budgetExcludingWeapon = STARTING_GOLD - (armor?.price || 0) - gearSpent;
  const budgetExcludingArmor = STARTING_GOLD - (weapon?.price || 0) - gearSpent;

  // Rather than disabling an unaffordable chip outright (which silently
  // swallows the click and gives no feedback about *why* nothing
  // happened), it stays clickable but denies the selection with a brief
  // shake + red flash, so picking something you can't afford is obviously
  // rejected instead of looking identical to picking nothing at all.
  function denyShake(id) {
    setDeniedId(id);
    setTimeout(() => setDeniedId((cur) => (cur === id ? null : cur)), DENY_SHAKE_MS);
  }

  function selectWeapon(w) {
    if (character.weaponId !== w.id && w.price > budgetExcludingWeapon) {
      denyShake(w.id);
      return;
    }
    update({ weaponId: w.id });
  }

  function selectArmor(a) {
    if (character.armorId !== a.id && a.price > budgetExcludingArmor) {
      denyShake(a.id);
      return;
    }
    update({ armorId: a.id });
  }

  function toggleGear(id) {
    const item = GEAR.find((g) => g.id === id);
    if (character.gearIds.includes(id)) {
      update({ gearIds: character.gearIds.filter((g) => g !== id) });
    } else if (remaining >= item.price) {
      update({ gearIds: [...character.gearIds, id] });
    } else {
      denyShake(id);
    }
  }

  return (
    <div className="step">
      <h2>Starting Equipment</h2>
      <p className="hint">
        You start with {STARTING_GOLD} gp to spend. Prices are approximate — double-check exact values against the
        Equipment chapter of the rulebook before using them at the table.
      </p>
      <p className="gold-tracker">
        Spent: {formatGold(spent)} · Remaining: <strong>{formatGold(remaining)}</strong>
      </p>

      <section className="sub-section">
        <h3>Weapon</h3>
        <div className="chip-row">
          {WEAPONS.map((w) => {
            const unaffordable = character.weaponId !== w.id && w.price > budgetExcludingWeapon;
            return (
              <button
                key={w.id}
                className={`chip ${character.weaponId === w.id ? 'selected' : ''} ${unaffordable ? 'unaffordable' : ''} ${deniedId === w.id ? 'deny-shake' : ''}`}
                onClick={() => selectWeapon(w)}
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
            const unaffordable = character.armorId !== a.id && a.price > budgetExcludingArmor;
            return (
              <button
                key={a.id}
                className={`chip ${character.armorId === a.id ? 'selected' : ''} ${unaffordable ? 'unaffordable' : ''} ${deniedId === a.id ? 'deny-shake' : ''}`}
                onClick={() => selectArmor(a)}
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
            const unaffordable = !character.gearIds.includes(g.id) && remaining < g.price;
            return (
              <button
                key={g.id}
                className={`chip ${character.gearIds.includes(g.id) ? 'selected' : ''} ${unaffordable ? 'unaffordable' : ''} ${deniedId === g.id ? 'deny-shake' : ''}`}
                onClick={() => toggleGear(g.id)}
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
