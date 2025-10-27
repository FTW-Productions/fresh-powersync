// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_colorful_roland_deschain.sql';
import m0001 from './0001_empty_synch.sql';
import m0002 from './0002_spotty_wrecking_crew.sql';
import m0003 from './0003_common_triathlon.sql';
import m0004 from './0004_uneven_adam_warlock.sql';
import m0005 from './0005_shocking_odin.sql';
import m0006 from './0006_minor_trauma.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002,
m0003,
m0004,
m0005,
m0006
    }
  }
  