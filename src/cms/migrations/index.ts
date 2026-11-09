import * as migration_20261003_184028_initial from './20261003_184028_initial';
import * as migration_20261003_192021_competition_slug from './20261003_192021_competition_slug';
import * as migration_20261003_195239_result_walkover from './20261003_195239_result_walkover';
import * as migration_20261003_203936_legal_pages from './20261003_203936_legal_pages';
import * as migration_20261004_212931_competition_standings from './20261004_212931_competition_standings';
import * as migration_20261007_155104_news from './20261007_155104_news';
import * as migration_20261007_171235_membership_and_contact from './20261007_171235_membership_and_contact';
import * as migration_20261007_175123_journey from './20261007_175123_journey';
import * as migration_20261009_195656_sponsors from './20261009_195656_sponsors';
import * as migration_20261009_210146_players from './20261009_210146_players';
import * as migration_20261010_100051_featured_competitions from './20261010_100051_featured_competitions';
import * as migration_20261010_100420_instagram_feed from './20261010_100420_instagram_feed';
import * as migration_20261010_181911_featured_players from './20261010_181911_featured_players';
import * as migration_20261011_153938_blob_storage_fields from './20261011_153938_blob_storage_fields';
import * as migration_20261103_202652_grounds from './20261103_202652_grounds';
import * as migration_20261103_202710_fixture_venue_to_ground from './20261103_202710_fixture_venue_to_ground';
import * as migration_20261103_220951_ground_club_codes from './20261103_220951_ground_club_codes';
import * as migration_20261103_225430_user_name from './20261103_225430_user_name';
import * as migration_20261105_230129_player_seasons from './20261105_230129_player_seasons';
import * as migration_20261107_120000_merge_fixtures_and_seasons from './20261107_120000_merge_fixtures_and_seasons';
import * as migration_20261108_172207_members_app from './20261108_172207_members_app';
import * as migration_20261109_212911_attendance_corrections from './20261109_212911_attendance_corrections';
import * as migration_20261109_214351_members_app_settings from './20261109_214351_members_app_settings';

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
    name: '20261007_171235_membership_and_contact',
  },
  {
    up: migration_20261007_175123_journey.up,
    down: migration_20261007_175123_journey.down,
    name: '20261007_175123_journey',
  },
  {
    up: migration_20261009_195656_sponsors.up,
    down: migration_20261009_195656_sponsors.down,
    name: '20261009_195656_sponsors',
  },
  {
    up: migration_20261009_210146_players.up,
    down: migration_20261009_210146_players.down,
    name: '20261009_210146_players',
  },
  {
    up: migration_20261010_100051_featured_competitions.up,
    down: migration_20261010_100051_featured_competitions.down,
    name: '20261010_100051_featured_competitions',
  },
  {
    up: migration_20261010_100420_instagram_feed.up,
    down: migration_20261010_100420_instagram_feed.down,
    name: '20261010_100420_instagram_feed',
  },
  {
    up: migration_20261010_181911_featured_players.up,
    down: migration_20261010_181911_featured_players.down,
    name: '20261010_181911_featured_players',
  },
  {
    up: migration_20261011_153938_blob_storage_fields.up,
    down: migration_20261011_153938_blob_storage_fields.down,
    name: '20261011_153938_blob_storage_fields',
  },
  {
    up: migration_20261103_202652_grounds.up,
    down: migration_20261103_202652_grounds.down,
    name: '20261103_202652_grounds',
  },
  {
    up: migration_20261103_202710_fixture_venue_to_ground.up,
    down: migration_20261103_202710_fixture_venue_to_ground.down,
    name: '20261103_202710_fixture_venue_to_ground',
  },
  {
    up: migration_20261103_220951_ground_club_codes.up,
    down: migration_20261103_220951_ground_club_codes.down,
    name: '20261103_220951_ground_club_codes',
  },
  {
    up: migration_20261103_225430_user_name.up,
    down: migration_20261103_225430_user_name.down,
    name: '20261103_225430_user_name',
  },
  {
    up: migration_20261105_230129_player_seasons.up,
    down: migration_20261105_230129_player_seasons.down,
    name: '20261105_230129_player_seasons',
  },
  {
    up: migration_20261107_120000_merge_fixtures_and_seasons.up,
    down: migration_20261107_120000_merge_fixtures_and_seasons.down,
    name: '20261107_120000_merge_fixtures_and_seasons',
  },
  {
    up: migration_20261108_172207_members_app.up,
    down: migration_20261108_172207_members_app.down,
    name: '20261108_172207_members_app',
  },
  {
    up: migration_20261109_212911_attendance_corrections.up,
    down: migration_20261109_212911_attendance_corrections.down,
    name: '20261109_212911_attendance_corrections',
  },
  {
    up: migration_20261109_214351_members_app_settings.up,
    down: migration_20261109_214351_members_app_settings.down,
    name: '20261109_214351_members_app_settings'
  },
];
