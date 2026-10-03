export function EmptyState({ children }: { children: string }) {
  return (
    <p className="rounded-lg border border-dashed border-border-default p-4 text-text-muted">
      {children}
    </p>
  )
}
