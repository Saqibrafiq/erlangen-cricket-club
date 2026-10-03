export type JsonLdProps = {
  data: Record<string, unknown>
}

/** Renders schema.org structured data. `<` is escaped so CMS content cannot close the script tag. */
export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
