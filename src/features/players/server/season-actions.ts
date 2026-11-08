'use server'

import type { PlayerSeason } from '@/payload-types'
import { isRecordId, readFormId } from '@/shared/lib/form-data'
import { getEditor } from '@/features/auth'

import {
  BATTING_FIELDS,
  BOWLING_COUNT_FIELDS,
  type BattingInput,
  type BowlingInput,
  parseSeasonForm,
  type SeasonInput,
} from '../domain/season-form'
import type {
  DeleteSeasonResult,
  EditorResult,
  SaveSeasonResult,
  SeasonDraft,
  SeasonEditorData,
} from '../editor-types'

/*
 * Editing actions for a player's season records. Server actions are public endpoints, so each one
 * checks the session itself and writes as that user with Payload's access control on
 * (`overrideAccess: false`), like the player actions.
 */

type BattingGroup = NonNullable<PlayerSeason['batting']>
type BowlingGroup = NonNullable<PlayerSeason['bowling']>
function toBattingInput(group: BattingGroup | null | undefined): BattingInput | null {
  if (group?.matches === null || group?.matches === undefined) return null
  const counts = Object.fromEntries(BATTING_FIELDS.map((field) => [field, group[field] ?? 0]))
  return {
    ...(counts as Omit<BattingInput, 'isHighestScoreNotOut'>),
    isHighestScoreNotOut: group.isHighestScoreNotOut ?? false,
  }
}

function toBowlingInput(group: BowlingGroup | null | undefined): BowlingInput | null {
  if (group?.matches === null || group?.matches === undefined) return null
  const counts = Object.fromEntries(BOWLING_COUNT_FIELDS.map((field) => [field, group[field] ?? 0]))
  return {
    ...(counts as Omit<BowlingInput, 'overs'>),
    overs: group.overs ?? '0',
  }
}

function toDraft(doc: PlayerSeason): SeasonDraft {
  return {
    id: doc.id,
    season: doc.season,
    competition: doc.competition,
    format: doc.format,
    teamId: typeof doc.team === 'object' && doc.team ? doc.team.id : (doc.team ?? null),
    batting: toBattingInput(doc.batting),
    bowling: toBowlingInput(doc.bowling),
  }
}

/** The stored record; an empty group means the player did not bat (or bowl) that season. */
function toData(playerId: number, input: SeasonInput) {
  return {
    player: playerId,
    season: input.season,
    competition: input.competition,
    format: input.format,
    team: input.teamId,
    batting: input.batting ?? {},
    bowling: input.bowling ?? {},
  }
}

export async function getSeasonEditorDataAction(
  playerId: number,
  seasonId: number | null,
): Promise<EditorResult<SeasonEditorData>> {
  const editor = await getEditor()
  if (!editor) {
    return { status: 'unauthorized' }
  }
  const { payload, user } = editor
  try {
    const [{ docs: teams }, season] = await Promise.all([
      payload.find({
        collection: 'teams',
        where: { isClubTeam: { equals: true } },
        sort: 'name',
        depth: 0,
        pagination: false,
        user,
        overrideAccess: false,
      }),
      seasonId === null
        ? null
        : payload.findByID({
            collection: 'player-seasons',
            id: seasonId,
            depth: 0,
            user,
            overrideAccess: false,
          }),
    ])
    if (season && season.player !== playerId) {
      return { status: 'error' }
    }
    return {
      status: 'ok',
      data: {
        draft: season ? toDraft(season) : null,
        teams: teams.map(({ id, name, shortName }) => ({ id, name, shortName })),
      },
    }
  } catch (error) {
    payload.logger.error({ err: error }, 'Could not load the season editor')
    return { status: 'error' }
  }
}

export async function saveSeasonAction(formData: FormData): Promise<SaveSeasonResult> {
  const editor = await getEditor()
  if (!editor) {
    return { status: 'unauthorized' }
  }
  const playerId = readFormId(formData, 'playerId')
  if (playerId === null) {
    return { status: 'error' }
  }
  const parsed = parseSeasonForm(formData)
  if (!parsed.success) {
    return { status: 'invalid', fieldErrors: parsed.fieldErrors }
  }

  const { payload, user } = editor
  const id = readFormId(formData, 'id')
  try {
    // One record per player, season, competition, format and team (also a unique index).
    const { docs: clashes } = await payload.find({
      collection: 'player-seasons',
      where: {
        and: [
          { player: { equals: playerId } },
          { season: { equals: parsed.data.season } },
          { competition: { equals: parsed.data.competition } },
          { format: { equals: parsed.data.format } },
          parsed.data.teamId === null
            ? { team: { exists: false } }
            : { team: { equals: parsed.data.teamId } },
          ...(id === null ? [] : [{ id: { not_equals: id } }]),
        ],
      },
      limit: 1,
      depth: 0,
      user,
      overrideAccess: false,
    })
    if (clashes.length > 0) {
      return { status: 'invalid', fieldErrors: { season: 'duplicateSeason' } }
    }

    const data = toData(playerId, parsed.data)
    if (id === null) {
      await payload.create({ collection: 'player-seasons', data, user, overrideAccess: false })
    } else {
      await payload.update({ collection: 'player-seasons', id, data, user, overrideAccess: false })
    }
    return { status: 'saved' }
  } catch (error) {
    payload.logger.error({ err: error }, 'Could not save the season')
    return { status: 'error' }
  }
}

export async function deleteSeasonAction(id: number): Promise<DeleteSeasonResult> {
  const editor = await getEditor()
  if (!editor) {
    return { status: 'unauthorized' }
  }
  if (!isRecordId(id)) {
    return { status: 'error' }
  }
  const { payload, user } = editor
  try {
    await payload.delete({ collection: 'player-seasons', id, user, overrideAccess: false })
    return { status: 'deleted' }
  } catch (error) {
    payload.logger.error({ err: error }, 'Could not delete the season')
    return { status: 'error' }
  }
}
