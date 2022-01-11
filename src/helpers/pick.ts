export function pick<Input, Key extends keyof Input>(
  input: Input,
  keys: Key[],
): Pick<Input, Key> {
  const result: any = {}
  for (const key of keys) {
    result[key] = input[key]
  }
  return result
}
