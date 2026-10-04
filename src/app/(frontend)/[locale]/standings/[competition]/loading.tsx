import { StandingsSkeleton } from '@/features/standings'
import { Container } from '@/shared/ui/container'

export default function CompetitionStandingsLoading() {
  return (
    <Container className="py-10">
      <StandingsSkeleton />
    </Container>
  )
}
