import * as migration_20261024_125454_baseline from './20261024_125454_baseline';

export const migrations = [
  {
    up: migration_20261024_125454_baseline.up,
    down: migration_20261024_125454_baseline.down,
    name: '20261024_125454_baseline'
  },
];
