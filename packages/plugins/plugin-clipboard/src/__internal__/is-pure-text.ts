type UnknownRecord = Record<string, unknown>
export function isPureText(
  content: UnknownRecord | UnknownRecord[] | undefined | null
): boolean {
  if (!content) return false
  if (Array.isArray(content)) {
    if (content.length > 1) return false
    return isPureText(content[0])
  }

  const child = content.content
  if (child) return isPureText(child as UnknownRecord[])

  return content.type === 'text'
}
