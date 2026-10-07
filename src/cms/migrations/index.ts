import * as migration_20261003_184028_initial from './20261003_184028_initial';
import * as migration_20261003_192021_competition_slug from './20261003_192021_competition_slug';
import * as migration_20261003_195239_result_walkover from './20261003_195239_result_walkover';
import * as migration_20261003_203936_legal_pages from './20261003_203936_legal_pages';
import * as migration_20261004_212931_competition_standings from './20261004_212931_competition_standings';
import * as migration_20261007_155104_news from './20261007_155104_news';
import * as migration_20261007_171235_membership_and_contact from './20261007_171235_membership_and_contact';

export const migrations = [
  {
    up: migration_20261003_184028_initial.up,
    down: migration_20261003_184028_initial.down,
    name: '20261003_184028_initial',
  },
  {
    up: migration_20261003_192021_competition_slug.up,
    down: migration_20261003_192021_competition_slug.down,
    name: '20261003_192021_competition_slug',
  },
  {
    up: migration_20261003_195239_result_walkover.up,
    down: migration_20261003_195239_result_walkover.down,
    name: '20261003_195239_result_walkover',
  },
  {
    up: migration_20261003_203936_legal_pages.up,
    down: migration_20261003_203936_legal_pages.down,
    name: '20261003_203936_legal_pages',
  },
  {
    up: migration_20261004_212931_competition_standings.up,
    down: migration_20261004_212931_competition_standings.down,
    name: '20261004_212931_competition_standings',
  },
  {
    up: migration_20261007_155104_news.up,
    down: migration_20261007_155104_news.down,
    name: '20261007_155104_news',
  },
  {
    up: migration_20261007_171235_membership_and_contact.up,
    down: migration_20261007_171235_membership_and_contact.down,
    name: '20261007_171235_membership_and_contact'
  },
];
