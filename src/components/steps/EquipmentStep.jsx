import { WEAPONS, ARMORS, GEAR, STARTING_GOLD, formatGold } from '../../data/equipment';

export default function EquipmentStep({ character, update }) {
  const weapon = WEAPONS.find((w) => w.id === character.weaponId);
  const armor = ARMORS.find((a) => a.id === character.armorId) || ARMORS[0];
  const gearItems = GEAR.filter((g) => character.gearIds.includes(g.id));

  const spent = (weapon?.price || 0) + (armor?.price || 0) + gearItems.reduce((sum, g) => sum + g.price, 0);
  const remaining = STARTING_GOLD - spent;

  function toggleGear(id) {
    const item = GEAR.find((g) => g.id === id);
    if (character.gearIds.includes(id)) {
      update({ gearIds: character.gearIds.filter((g) => g !== id) });
    } else if (remaining >= item.price) {
      update({ gearIds: [...character.gearIds, id] });
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
          {WEAPONS.map((w) => (
            <button
              key={w.id}
              className={`chip ${character.weaponId === w.id ? 'selected' : ''}`}
              onClick={() => update({ weaponId: w.id })}
            >
              {w.name} ({w.damage}) — {formatGold(w.price)}
            </button>
          ))}
        </div>
      </section>

      <section className="sub-section">
        <h3>Armor</h3>
        <div className="chip-row">
          {ARMORS.map((a) => (
            <button
              key={a.id}
              className={`chip ${character.armorId === a.id ? 'selected' : ''}`}
              onClick={() => update({ armorId: a.id })}
            >
              {a.name} (AC +{a.acBonus}) — {formatGold(a.price)}
            </button>
          ))}
        </div>
      </section>

      <section className="sub-section">
        <h3>Adventuring Gear</h3>
        <div className="chip-row">
          {GEAR.map((g) => (
            <button
              key={g.id}
              className={`chip ${character.gearIds.includes(g.id) ? 'selected' : ''}`}
              onClick={() => toggleGear(g.id)}
              disabled={!character.gearIds.includes(g.id) && remaining < g.price}
            >
              {g.name} — {formatGold(g.price)}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
