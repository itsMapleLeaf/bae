/* eslint-disable import/no-unused-modules */
export function debounce<Args extends unknown[]>(
  periodMs: number,
  callback: (...args: Args) => void,
) {
  let timeoutId: NodeJS.Timeout | undefined
  return (...args: Args) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(callback, periodMs, ...args)
  }
}

export function throttle<Args extends unknown[]>(
  periodMs: number,
  callback: (...args: Args) => void,
) {
  let timeoutId: NodeJS.Timeout | undefined
  let nextArgs: Args | undefined
  return (...args: Args) => {
    nextArgs = args
    timeoutId ??= setTimeout(() => {
      timeoutId = undefined
      callback(...nextArgs!)
    }, periodMs)
  }
}

export async function retryCount<Result>(
  count: number,
  callback: () => Result | Promise<Result>,
): Promise<Result> {
  let lastError: unknown
  for (let index = 0; index < count; index++) {
    try {
      return await callback()
    } catch (error) {
      lastError = error
    }
  }
  throw lastError
}

export async function firstResolved<
  Callbacks extends [...Array<() => Promise<unknown>>],
>(callbacks: Callbacks): Promise<Awaited<ReturnType<Callbacks[number]>>> {
  let firstError: unknown
  for (const callback of callbacks) {
    try {
      return (await callback()) as Awaited<ReturnType<Callbacks[number]>>
    } catch (error) {
      firstError ??= error
    }
  }
  throw firstError
}

export function createEffect<Args extends unknown[]>(
  callback: (...args: Args) => (() => void) | undefined | void,
) {
  let cleanup: (() => void) | undefined | void
  return function run(...args: Args) {
    cleanup?.()
    cleanup = callback(...args)
  }
}
