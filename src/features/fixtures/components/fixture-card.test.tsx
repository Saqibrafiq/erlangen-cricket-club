import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithIntl } from '@/shared/testing/render-with-intl'

import {
  ECC_TEAM,
  makeCompletedFixture,
  makeInnings,
  makeScheduledFixture,
  NCC_TEAM,
} from '../test-factories'
import { FixtureCard } from './fixture-card'

describe('FixtureCard — completed fixture', () => {
  it('names the match in an accessible heading', () => {
    renderWithIntl(<FixtureCard fixture={makeCompletedFixture()} />)

    expect(
      screen.getByRole('heading', { level: 3, name: 'NCC-I v Erlangen Cricket Club I' }),
    ).toBeInTheDocument()
  })

  it('shows both scores with overs for screen readers', () => {
    renderWithIntl(<FixtureCard fixture={makeCompletedFixture()} />)

    const [first, second] = screen.getAllByRole('listitem')
    expect(first).toHaveTextContent('NCC-I236/5')
    expect(second).toHaveTextContent('Erlangen Cricket Club I204/10')
    expect(screen.getByText('19.2 of 20 overs')).toBeInTheDocument()
  })

  it('states the derived result and the club outcome', () => {
    renderWithIntl(<FixtureCard fixture={makeCompletedFixture()} />)

    expect(screen.getByText('NCC-I won by 32 runs')).toBeInTheDocument()
    expect(screen.getByText('Lost')).toBeInTheDocument()
    expect(screen.getByText('Final')).toBeInTheDocument()
  })

  it('uses the singular for a one-wicket margin', () => {
    const fixture = makeCompletedFixture({
      stage: 'league',
      innings: [makeInnings(NCC_TEAM, 150, 10), makeInnings(ECC_TEAM, 151, 9, '19.5')],
    })
    renderWithIntl(<FixtureCard fixture={fixture} />)

    expect(screen.getByText('Erlangen Cricket Club I won by 1 wicket')).toBeInTheDocument()
    expect(screen.queryByText('League')).toBeNull()
  })

  it('marks DLS ties and teams that did not bat', () => {
    const fixture = makeCompletedFixture({
      innings: [makeInnings(NCC_TEAM, 156, 8)],
      result: { kind: 'tie', isDls: true },
    })
    renderWithIntl(<FixtureCard fixture={fixture} />)

    expect(screen.getByText('Match tied (DLS)')).toBeInTheDocument()
    expect(screen.getByText('Did not bat')).toBeInTheDocument()
    expect(screen.getByText('Tied')).toBeInTheDocument()
  })

  it('describes DLS wins, forfeits and no results', () => {
    const { rerender } = renderWithIntl(
      <FixtureCard
        fixture={makeCompletedFixture({
          result: {
            kind: 'win',
            winnerTeamId: NCC_TEAM.id,
            margin: { unit: 'runs', value: 51 },
            isDls: true,
          },
        })}
      />,
    )
    expect(screen.getByText('NCC-I won by 51 runs (DLS)')).toBeInTheDocument()

    rerender(
      <FixtureCard
        fixture={makeCompletedFixture({
          result: { kind: 'win', winnerTeamId: NCC_TEAM.id, margin: null, isDls: true },
        })}
      />,
    )
    expect(screen.getByText('NCC-I won (DLS)')).toBeInTheDocument()

    rerender(
      <FixtureCard
        fixture={makeCompletedFixture({ result: { kind: 'forfeit', winnerTeamId: NCC_TEAM.id } })}
      />,
    )
    expect(screen.getByText('NCC-I awarded the match (forfeit)')).toBeInTheDocument()

    rerender(
      <FixtureCard
        fixture={makeCompletedFixture({ result: { kind: 'no-result' }, clubOutcome: 'no-result' })}
      />,
    )
    expect(screen.getAllByText('No result')).toHaveLength(2)
  })

  it('shows no scores for a forfeit before play', () => {
    const fixture = makeCompletedFixture({
      innings: [],
      result: { kind: 'forfeit', winnerTeamId: NCC_TEAM.id },
    })
    renderWithIntl(<FixtureCard fixture={fixture} />)

    expect(screen.getByText('NCC-I awarded the match (forfeit)')).toBeInTheDocument()
    expect(screen.queryByText('Did not bat')).toBeNull()
  })

  it('can omit the competition when shown under a competition heading', () => {
    renderWithIntl(<FixtureCard fixture={makeCompletedFixture()} showCompetition={false} />)

    expect(screen.queryByText(/BCV T20 Regionalliga Bayern/)).toBeNull()
  })

  it('renders the result in German', () => {
    renderWithIntl(<FixtureCard fixture={makeCompletedFixture()} />, { locale: 'de' })

    expect(screen.getByText('NCC-I gewann mit 32 Runs')).toBeInTheDocument()
    expect(screen.getByText('Niederlage')).toBeInTheDocument()
  })
})

describe('FixtureCard — upcoming fixture', () => {
  it('shows date, start time and venue without scores', () => {
    renderWithIntl(<FixtureCard fixture={makeScheduledFixture()} />)

    expect(screen.getByText('Sat, May 15, 2027')).toHaveAttribute('dateTime', '2027-05-15')
    expect(screen.getByText(/Start 11:00/)).toBeInTheDocument()
    expect(
      screen.getByText('BCV T20 Regionalliga Bayern 2027 · Erlangen Cricket Ground'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Did not bat')).toBeNull()
  })

  it('flags cancelled fixtures', () => {
    renderWithIntl(<FixtureCard fixture={makeScheduledFixture({ status: 'cancelled' })} />)

    expect(screen.getByText('Cancelled')).toBeInTheDocument()
  })
})
