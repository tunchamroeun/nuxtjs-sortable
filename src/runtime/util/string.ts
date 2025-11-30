type CacheFunction = (str: string) => string
type StringTransformer = (str: string) => string

function cached(fn: StringTransformer): CacheFunction {
  const cache: Record<string, string> = Object.create(null)
  return function cachedFn(str: string): string {
    const hit = cache[str]
    return hit || (cache[str] = fn(str))
  }
}

const regex = /-(\w)/g
const camelize: CacheFunction = cached((str: string): string =>
  str.replace(regex, (_, c: string) => c.toUpperCase()),
)

export { camelize }
