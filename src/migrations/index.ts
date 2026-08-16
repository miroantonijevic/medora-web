import * as migration_20260503_134126_init from './20260503_134126_init';
import * as migration_20260503_134619_medora_skeleton from './20260503_134619_medora_skeleton';
import * as migration_20260814_room_groups from './20260814_room_groups';
import * as migration_20260816_140441 from './20260816_140441';

export const migrations = [
  {
    up: migration_20260503_134126_init.up,
    down: migration_20260503_134126_init.down,
    name: '20260503_134126_init',
  },
  {
    up: migration_20260503_134619_medora_skeleton.up,
    down: migration_20260503_134619_medora_skeleton.down,
    name: '20260503_134619_medora_skeleton',
  },
  {
    up: migration_20260814_room_groups.up,
    down: migration_20260814_room_groups.down,
    name: '20260814_room_groups',
  },
  {
    up: migration_20260816_140441.up,
    down: migration_20260816_140441.down,
    name: '20260816_140441'
  },
];
