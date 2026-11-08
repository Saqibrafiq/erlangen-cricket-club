/** Whether `value` is a database record ID (a positive whole number). */
export function isRecordId(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
}

/** A text field of a submitted form, or `''` when it is missing or a file. */
export function readFormText(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === 'string' ? value : ''
}

/** A record ID field of a submitted form (`id` by default), or `null` when it is not a valid ID. */
export function readFormId(formData: FormData, name = 'id'): number | null {
  const id = Number(readFormText(formData, name))
  return isRecordId(id) ? id : null
}
