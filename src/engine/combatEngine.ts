import { useGameStore } from '../store/useGameStore';
import { Unit, UnitStatus } from '../types/units';
import { distance } from './validation';
import { getTerrainAt, getTerrainDefenseBonus } from '../data/mapConfig';
import { chance, randFloat } from '../utils/random';

const COMBAT_RANGE = 2.5;

export function processCombat() {
  const state = useGameStore.getState();
  const units = [...state.units];
  let metricsUpdated = false;
  const metricUpdates: Partial<typeof state.metrics> = {};

  for (let i = 0; i < units.length; i++) {
    const attacker = units[i];
    if (attacker.faction !== 'soviet' && attacker.faction !== 'enemy') continue;
    if (attacker.strength <= 0) continue;
    if (attacker.status === 'retreating' || attacker.status === 'comms-lost') continue;

    // Find enemies in range
    const enemies = units.filter(
      (u) =>
        u.faction !== attacker.faction &&
        u.strength > 0 &&
        distance(attacker.position, u.position) <= COMBAT_RANGE
    );

    if (enemies.length === 0) continue;

    // Pick target (closest or weakest)
    const target = enemies.reduce((best, u) =>
      u.strength < best.strength ? u : best
    );

    const combatResult = resolveCombat(attacker, target);

    // Apply damage
    target.strength = Math.max(0, target.strength - combatResult.damageToTarget);
    attacker.strength = Math.max(0, attacker.strength - combatResult.damageToAttacker);

    // Update statuses
    if (target.strength <= 0) {
      target.status = 'command-lost';
      target.strength = 0;
      if (target.faction === 'soviet') {
        metricUpdates.commandIntegrity = (metricUpdates.commandIntegrity ?? state.metrics.commandIntegrity) - 8;
        metricsUpdated = true;
      } else {
        metricUpdates.strategicAdvantage = (metricUpdates.strategicAdvantage ?? state.metrics.strategicAdvantage) + 5;
        metricsUpdated = true;
      }
    } else if (target.strength < 30) {
      target.status = 'disrupted';
      target.morale = Math.max(0, target.morale - 10);
    }

    if (attacker.strength <= 30 && attacker.strength > 0) {
      attacker.status = 'disrupted';
    }

    // Morale effects
    if (combatResult.damageToTarget > combatResult.damageToAttacker) {
      attacker.morale = Math.min(100, attacker.morale + 2);
      target.morale = Math.max(0, target.morale - 3);
    } else {
      attacker.morale = Math.max(0, attacker.morale - 3);
      target.morale = Math.min(100, target.morale + 1);
    }

    // Supply/fuel consumption
    attacker.supply = Math.max(0, attacker.supply - 0.5);
    attacker.fuel = Math.max(0, attacker.fuel - 0.3);
    attacker.ammo = Math.max(0, attacker.ammo - 1);

    if (attacker.ammo < 20) attacker.status = 'low-ammo';
    if (attacker.fuel < 20) attacker.status = 'low-fuel';

    // Detection update
    if (target.detection === 'unknown' && chance(0.3)) {
      target.detection = 'probable';
    } else if (target.detection === 'probable' && chance(0.2)) {
      target.detection = 'confirmed';
    }
  }

  // Update units in store
  useGameStore.setState({ units });

  // Update metrics
  if (metricsUpdated) {
    Object.entries(metricUpdates).forEach(([key, value]) => {
      if (value !== undefined) {
        state.applyMetricDelta(key as keyof typeof state.metrics, value - state.metrics[key as keyof typeof state.metrics]);
      }
    });
  }
}

function resolveCombat(attacker: Unit, defender: Unit) {
  const terrain = getTerrainAt(defender.position.x, defender.position.y);
  const defenseBonus = getTerrainDefenseBonus(terrain);

  const attackPower =
    attacker.strength * 0.4 +
    attacker.morale * 0.2 +
    attacker.readiness * 0.2 +
    attacker.ammo * 0.1 +
    (attacker.commander ? attacker.commander.experience * 0.1 : 0);

  const defensePower =
    defender.strength * 0.4 +
    defender.morale * 0.2 +
    defender.readiness * 0.2 +
    (defender.commander ? defender.commander.experience * 0.1 : 0) +
    defenseBonus * 100;

  const damageToTarget = Math.max(0, randFloat(0, (attackPower - defensePower * 0.3) / 10));
  const damageToAttacker = Math.max(0, randFloat(0, (defensePower - attackPower * 0.3) / 15));

  return { damageToTarget, damageToAttacker };
}
