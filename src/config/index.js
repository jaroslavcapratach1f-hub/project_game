/**
 * config barrel — re-exports every tuneable module. Prefer importing the
 * specific module you need; this exists for convenience and discoverability.
 *
 * Nothing in src/config/ is final. Files carry DRAFT / REVIEW markers.
 */

export * from './GameConfig.js';
export * from './LayerConfig.js';
export * from './TerrainConfig.js';
export * from './EntityConfig.js';
export * from './InfantryConfig.js';
export * from './ArtilleryConfig.js';
export * from './ProjectileConfig.js';
export * from './EffectsConfig.js';
export * from './FeedbackConfig.js';
export * from './OrdersConfig.js';
export * from './HudConfig.js';
export * from './BaseConfig.js';
export * from './WorldMapConfig.js';
export * from './MenuConfig.js';
export * from './SettingsConfig.js';
export * from './AIConfig.js';
export * from './SquadStateConfig.js';
export * from './SkirmishConfig.js';
export * from './OnslaughtConfig.js';
export * from './ResourceConfig.js';
export * from './MaterialsConfig.js';
export * from './BuildingConfig.js';
export * from './PowerConfig.js';
export * from './StarTiers.js';
export * from './ProgressionConfig.js';
export * from './StatResolution.js';
export * from './CombatConfig.js';
export * from './PersonnelConfig.js';
export * from './UnitStats.js';
export * from './FactionConfig.js';
export * from './OfficerConfig.js';
export * from './EconomyConfig.js';
export * from './ArmoryConfig.js';
export * from './PartsConfig.js';

export * as research from './research/index.js';
export * as equipment from './equipment/index.js';
