import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

/*
 * No SQL: the fixtures branch (grounds) and main (user name, player seasons) were built in
 * parallel, and their migrations already make every change. This migration only records the
 * combined schema snapshot (the .json next to it), so the next `migrate:create` compares against
 * both and does not try to create grounds or player seasons again.
 */

export async function up(_args: MigrateUpArgs): Promise<void> {
  // Nothing to change; see above.
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Nothing to undo; see above.
}
