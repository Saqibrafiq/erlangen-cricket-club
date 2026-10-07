import { Skeleton } from '@/shared/ui/skeleton'
import { Container } from '@/shared/ui/container'

// Decorative placeholder only: no text, so no translations are needed here (see arc42 §8.1).
export default function NewsArticleLoading() {
  return (
    <Container width="prose" className="space-y-6 py-10" aria-busy="true">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="aspect-video w-full rounded-2xl" />
      <Skeleton className="h-40 w-full" />
    </Container>
  )
}
