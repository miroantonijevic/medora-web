import * as migration_20260503_134126_init from './20260503_134126_init';
import * as migration_20260503_134619_medora_skeleton from './20260503_134619_medora_skeleton';
import * as migration_20260814_room_groups from './20260814_room_groups';

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
];
