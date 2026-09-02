import { useState } from 'react';
import Collapsible from '../Collapsible';
import { GlossaryTerm } from '../../context/InspectContext';
import { getGlossaryTerm } from '../../data/glossary';
import {
  WEAPONS,
  WEAPON_CATEGORY_LABELS,
  AMMUNITION,
  ARMORS,
  ARMOR_CATEGORY_LABELS,
  SHIELDS,
  GEAR,
  STARTING_GOLD,
  formatGold,
  countOwned,
  addOne,
  removeOne,
  totalSpent,
  groupPurchases,
} from '../../data/equipment';

// How long the "can't afford this" shake/flash lasts before the row
// settles back to normal.
const DENY_SHAKE_MS = 420;

// Splits a catalog (WEAPONS or ARMORS) into one array per `category`
// value, used to render "Simple Weapons" / "Martial Weapons" etc. as
// separate shop sections instead of one long undifferentiated list.
// `order` picks the display order; defaults to categoryLabels' own key
// order when the data's natural order already reads fine (weapons).
function groupByCategory(items, categoryLabels, order = Object.keys(categoryLabels)) {
  return order.map((cat) => ({
    key: cat,
    label: categoryLabels[cat],
    items: items.filter((i) => i.category === cat),
  }));
}

// The letter after a weapon's dice (e.g. "1d4 P") is its damage type —
// wrapped here in a GlossaryTerm instead of shown bare, per an explicit
// request that new players shouldn't need to already know what "P" means.
const DAMAGE_TYPE_IDS = { P: 'piercing', S: 'slashing', B: 'bludgeoning' };
const DAMAGE_TYPE_LABELS = { P: 'Piercing', S: 'Slashing', B: 'Bludgeoning' };

function DamageLine({ damage }) {
  const m = damage.match(/^(.+?)\s+([PSB])(\s*\(ranged\))?$/);
  if (!m) return <span className="shop-row-meta">{damage}</span>;
  const [, dice, letter, ranged] = m;
  return (
    <span className="shop-row-meta">
      {dice} <GlossaryTerm id={DAMAGE_TYPE_IDS[letter]}>{DAMAGE_TYPE_LABELS[letter]}</GlossaryTerm>
      {ranged || ''}
    </span>
  );
}

// A trait's display string often carries a variable value the rules text
// itself doesn't change with (Thrown 10 ft. vs Thrown 20 ft., Deadly d8 vs
// Deadly d10) -- strip that trailing number/die/damage-letter to get the
// glossary id, so every value of a given trait resolves to one definition.
function traitGlossaryId(trait) {
  return trait
    .replace(/\s+(\d+\s*ft\.?|\d*d\d+|[A-Z])$/, '')
    .toLowerCase()
    .replace(/\s+/g, '-');
}

// One filter chip per *base* trait (Thrown, not "Thrown 10 ft."/"Thrown 20
// ft."/"Thrown 30 ft." separately) — built from the same traitGlossaryId
// normalization the trait tags themselves already use, so picking "Thrown"
// matches a weapon carrying any range variant of it. Computed once at
// module scope since WEAPONS is static; label comes from the glossary term
// itself so the chip reads "Thrown" rather than the raw id "thrown".
const WEAPON_TRAIT_OPTIONS = Array.from(new Set(WEAPONS.flatMap((w) => (w.traits || []).map(traitGlossaryId))))
  .map((id) => ({ id, label: getGlossaryTerm(id)?.term || id }))
  .sort((a, b) => a.label.localeCompare(b.label));

function TraitTags({ traits }) {
  if (!traits || traits.length === 0) return null;
  return (
    <div className="shop-row-traits">
      {traits.map((t) => (
        <span key={t} className="trait-tag">
          <GlossaryTerm id={traitGlossaryId(t)}>{t}</GlossaryTerm>
        </span>
      ))}
    </div>
  );
}

function ShopRow({ item, qty, remaining, deniedId, onAdd, onRemove }) {
  const unaffordable = item.price > remaining;
  return (
    <div className={`shop-row ${deniedId === item.id ? 'deny-shake' : ''}`}>
      <div className="shop-row-info">
        <span className="shop-row-name">{item.name}</span>
        {item.damage && <DamageLine damage={item.damage} />}
        {item.acBonus !== undefined && item.category !== undefined && (
          <span className="shop-row-meta">AC +{item.acBonus}</span>
        )}
        {item.hardness !== undefined && (
          <span className="shop-row-meta">
            Hardness {item.hardness}, HP {item.hp} (BT {item.bt}){item.speedPenalty ? `, ${item.speedPenalty} Speed` : ''}
          </span>
        )}
        <TraitTags traits={item.traits} />
        <span className="shop-row-price">{formatGold(item.price)}</span>
      </div>
      <div className="shop-row-stepper">
        <button type="button" className="stepper-btn" onClick={() => onRemove(item.id)} disabled={qty === 0} aria-label={`Remove one ${item.name}`}>
          −
        </button>
        <span className="stepper-qty">{qty}</span>
        <button
          type="button"
          className={`stepper-btn ${unaffordable ? 'unaffordable' : ''}`}
          onClick={() => onAdd(item)}
          aria-label={`Add one ${item.name}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

// h4 (not h3) since these nest one level under a .shop-group's h3 — see
// the Weapons/Armor groups below. Sections rendered directly under the
// step (Shields, Adventuring Gear) don't have that parent, but keeping
// the heading level consistent everywhere is simpler than branching it.
function ShopSection({ title, items, ownedIds, remaining, deniedId, onAdd, onRemove }) {
  if (items.length === 0) return null;
  return (
    <section className="sub-section shop-subsection">
      <h4>{title}</h4>
      <div className="shop-grid">
        {items.map((item) => (
          <ShopRow
            key={item.id}
            item={item}
            qty={countOwned(ownedIds, item.id)}
            remaining={remaining}
            deniedId={deniedId}
            onAdd={onAdd}
            onRemove={onRemove}
          />
        ))}
      </div>
    </section>
  );
}

// Groups multiple ShopSections under one bigger, collapsible heading —
// "Weapons" containing Simple/Martial/Ammunition, "Armor" containing
// Heavy/Medium/Light/Unarmored, and (with no subsections of their own)
// Shields and Adventuring Gear — so the four catalogs read as organized,
// collapsible categories instead of one long scroll you have to page past
// to reach whichever one you're actually shopping in.
function ShopGroup({ title, children }) {
  return (
    <Collapsible title={title} className="shop-group">
      {children}
    </Collapsible>
  );
}

export default function EquipmentStep({ character, update }) {
  const [deniedId, setDeniedId] = useState(null);

  const spent =
    totalSpent(character.weaponIds, WEAPONS) +
    totalSpent(character.ammoIds, AMMUNITION) +
    totalSpent(character.armorIds, ARMORS) +
    totalSpent(character.shieldIds, SHIELDS) +
    totalSpent(character.gearIds, GEAR);
  const remaining = STARTING_GOLD - spent;

  function denyShake(id) {
    setDeniedId(id);
    setTimeout(() => setDeniedId((cur) => (cur === id ? null : cur)), DENY_SHAKE_MS);
  }

  // One add/remove pair per list, all sharing the same shape: buying
  // pushes one more instance of the id (denying with a shake if it's not
  // affordable), selling pops one instance (always allowed — you already
  // own it). `listKey` is the character field name (weaponIds, gearIds...).
  function makeHandlers(listKey) {
    return {
      onAdd: (item) => {
        if (item.price > remaining) {
          denyShake(item.id);
          return;
        }
        update({ [listKey]: addOne(character[listKey], item.id) });
      },
      onRemove: (id) => update({ [listKey]: removeOne(character[listKey], id) }),
    };
  }

  const weaponHandlers = makeHandlers('weaponIds');
  const ammoHandlers = makeHandlers('ammoIds');
  const armorHandlers = makeHandlers('armorIds');
  const shieldHandlers = makeHandlers('shieldIds');
  const gearHandlers = makeHandlers('gearIds');

  const [weaponTraitFilters, setWeaponTraitFilters] = useState([]);
  function toggleWeaponTraitFilter(id) {
    setWeaponTraitFilters((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }

  // Ammunition isn't filtered by weapon trait -- it doesn't carry combat
  // traits of its own, so it stays visible regardless of the selection.
  // No useMemo: WEAPONS is under 50 entries, cheap to re-filter every render.
  const weaponGroupsAll = groupByCategory(WEAPONS, WEAPON_CATEGORY_LABELS);
  const weaponGroups =
    weaponTraitFilters.length === 0
      ? weaponGroupsAll
      : weaponGroupsAll.map((g) => ({
          ...g,
          items: g.items.filter((item) => (item.traits || []).some((t) => weaponTraitFilters.includes(traitGlossaryId(t)))),
        }));
  // Heaviest-to-lightest — most players think "what tier of armor" before
  // "what's cheap," so leading with Heavy reads better than the ascending
  // none→light→medium→heavy order the data itself happens to be in.
  const armorGroups = groupByCategory(ARMORS, ARMOR_CATEGORY_LABELS, ['heavy', 'medium', 'light', 'none']);

  const receipt = [
    ...groupPurchases(character.weaponIds, WEAPONS),
    ...groupPurchases(character.ammoIds, AMMUNITION),
    ...groupPurchases(character.armorIds, ARMORS),
    ...groupPurchases(character.shieldIds, SHIELDS),
    ...groupPurchases(character.gearIds, GEAR),
  ];

  return (
    <div className="step">
      <h2>Starting Equipment</h2>
      <p className="hint">
        You start with {STARTING_GOLD} gp to spend. Buy anything you can afford, in whatever quantity you want — a
        shop doesn't care how many weapons, arrows, or torches you walk out with, only what you actually wear or
        wield is a separate matter. Prices are approximate — double-check exact values against the Equipment
        chapter of the rulebook before using them at the table.
      </p>
      <p className="coin-reference">1 gp = 10 sp = 100 cp</p>
      <p className="gold-tracker">
        Spent: {formatGold(spent)} · Remaining: <strong>{formatGold(remaining)}</strong>
      </p>

      <ShopGroup title="Weapons">
        <div className="spell-trait-filter-row">
          <span className="spell-trait-filter-label">
            Filter by trait{weaponTraitFilters.length > 0 ? ` (${weaponTraitFilters.length})` : ''}:
          </span>
          {WEAPON_TRAIT_OPTIONS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`chip small ${weaponTraitFilters.includes(t.id) ? 'selected' : ''}`}
              onClick={() => toggleWeaponTraitFilter(t.id)}
            >
              <GlossaryTerm id={t.id}>{t.label}</GlossaryTerm>
            </button>
          ))}
          {weaponTraitFilters.length > 0 && (
            <button type="button" className="chip small ghost" onClick={() => setWeaponTraitFilters([])}>
              Clear
            </button>
          )}
        </div>
        {weaponGroups.every((g) => g.items.length === 0) && (
          <p className="hint">No weapons match that filter.</p>
        )}
        {weaponGroups.map((g) => (
          <ShopSection
            key={g.key}
            title={g.label}
            items={g.items}
            ownedIds={character.weaponIds}
            remaining={remaining}
            deniedId={deniedId}
            {...weaponHandlers}
          />
        ))}
        <ShopSection
          title="Ammunition"
          items={AMMUNITION}
          ownedIds={character.ammoIds}
          remaining={remaining}
          deniedId={deniedId}
          {...ammoHandlers}
        />
      </ShopGroup>

      <ShopGroup title="Armor">
        {armorGroups.map((g) => (
          <ShopSection
            key={g.key}
            title={g.label}
            items={g.items}
            ownedIds={character.armorIds}
            remaining={remaining}
            deniedId={deniedId}
            {...armorHandlers}
          />
        ))}
      </ShopGroup>

      {/* Shields and Adventuring Gear don't have book subcategories the
          way Weapons/Armor do, so it's a single flat shop-grid directly
          inside the ShopGroup rather than a ShopSection under it — that
          combo would just repeat the same title twice. */}
      <ShopGroup title="Shields">
        <div className="shop-grid">
          {SHIELDS.map((item) => (
            <ShopRow
              key={item.id}
              item={item}
              qty={countOwned(character.shieldIds, item.id)}
              remaining={remaining}
              deniedId={deniedId}
              {...shieldHandlers}
            />
          ))}
        </div>
      </ShopGroup>

      <ShopGroup title="Adventuring Gear">
        <div className="shop-grid">
          {GEAR.map((item) => (
            <ShopRow
              key={item.id}
              item={item}
              qty={countOwned(character.gearIds, item.id)}
              remaining={remaining}
              deniedId={deniedId}
              {...gearHandlers}
            />
          ))}
        </div>
      </ShopGroup>

      <section className="sub-section">
        <h3>Your Purchases</h3>
        {receipt.length === 0 ? (
          <p className="hint">Nothing bought yet.</p>
        ) : (
          <div className="receipt-table">
            <div className="receipt-row receipt-header">
              <span>Item</span>
              <span>Qty</span>
              <span>Price</span>
              <span>Total</span>
            </div>
            {receipt.map(({ item, qty, lineTotal }) => (
              <div className="receipt-row" key={item.id}>
                <span>{item.name}</span>
                <span>{qty}</span>
                <span>{formatGold(item.price)}</span>
                <span>{formatGold(lineTotal)}</span>
              </div>
            ))}
            <div className="receipt-row receipt-total">
              <span>Grand total</span>
              <span></span>
              <span></span>
              <span>{formatGold(spent)}</span>
            </div>
            <div className="receipt-row receipt-total">
              <span>Remaining</span>
              <span></span>
              <span></span>
              <span>{formatGold(remaining)}</span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
