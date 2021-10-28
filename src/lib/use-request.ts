import {DebounceSettings, debounce} from 'lodash'
import {
  Dispatch,
  MutableRefObject,
  RefObject,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import {ToastStyle, showToast} from '@raycast/api'

interface BaseRequestOpts<P, R, D extends unknown[]> {
  request: (params: P) => Promise<R>
  requestParams?: (deps: D) => P
  onSuccess: (result: R) => void
  enabled?: (deps: D) => boolean
}

type DebounceRequestOpts<P, R, D extends unknown[]> = BaseRequestOpts<
  P,
  R,
  D
> & {
  debounce: number
  debounceSettings?: DebounceSettings
}

type IntervalRequestOpts<P, R, D extends unknown[]> = BaseRequestOpts<
  P,
  R,
  D
> & {
  refreshInterval: number
  initialLoadingOnly?: boolean
}

type RequestOpts<P, R, D extends unknown[]> =
  | BaseRequestOpts<P, R, D>
  | DebounceRequestOpts<P, R, D>
  | IntervalRequestOpts<P, R, D>

export default function useRequest<P, R, D extends unknown[]>(
  opts: RequestOpts<P, R, D>,
  deps: D
): boolean {
  const [isLoading, setIsLoading] = useState(false)
  const abortControllerRef = useRef<AbortController>(new AbortController())
  const didLoadOnceRef = useRef<boolean>(false)
  const refetchInterval = useRef<NodeJS.Timeout | null>(null)

  const searchFunction = useMemo(() => {
    const baseSearchFunction = buildSearchFunction(
      opts,
      abortControllerRef,
      didLoadOnceRef,
      setIsLoading
    )

    if (isDebounceRequestOpts(opts)) {
      return debounce(baseSearchFunction, opts.debounce, opts.debounceSettings)
    } else {
      return baseSearchFunction
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isIntervalRequestOpts(opts)) {
      searchFunction(deps)

      refetchInterval.current = setInterval(() => {
        searchFunction(deps)
      }, opts.refreshInterval)

      return () => {
        if (refetchInterval.current != null) {
          clearInterval(refetchInterval.current)
        }
      }
    }

    searchFunction(deps)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, searchFunction])

  return isLoading
}

export function useDebouncedRequest<P, R, D extends unknown[]>(
  opts: DebounceRequestOpts<P, R, D>,
  deps: D
): boolean {
  const [isLoading, setIsLoading] = useState(false)
  const abortControllerRef = useRef<AbortController>(new AbortController())

  const searchFunction = useMemo(() => {
    const baseSearchFunction = buildSearchFunction(
      opts,
      abortControllerRef,
      null,
      setIsLoading
    )

    return debounce(baseSearchFunction, opts.debounce, opts.debounceSettings)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    searchFunction(deps)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, searchFunction])

  return isLoading
}

function isDebounceRequestOpts<P, R, D extends unknown[]>(
  opts: RequestOpts<P, R, D>
): opts is DebounceRequestOpts<P, R, D> {
  return 'debounce' in opts
}

function isIntervalRequestOpts<P, R, D extends unknown[]>(
  opts: RequestOpts<P, R, D>
): opts is IntervalRequestOpts<P, R, D> {
  return 'refreshInterval' in opts
}

function buildSearchFunction<P, R, D extends unknown[]>(
  opts: BaseRequestOpts<P, R, D>,
  abortControllerRef: MutableRefObject<AbortController>,
  didLoadOnceRef: MutableRefObject<boolean> | null,
  setIsLoading: Dispatch<SetStateAction<boolean>>
) {
  return async (deps: D) => {
    if (opts.enabled && !opts.enabled(deps)) {
      return
    }

    if (abortControllerRef.current) {
      setIsLoading(false)
      abortControllerRef.current.abort()
    }

    if (shouldStartLoading(opts, didLoadOnceRef)) {
      setIsLoading(true)
    }

    abortControllerRef.current = new AbortController()

    // FIXME: Handle calls with no params.
    const requestParams = opts.requestParams?.(deps) ?? ({} as P)

    try {
      const resp = await opts.request({
        ...requestParams,
        request: {
          controller: abortControllerRef.current.signal
        }
      })

      didLoadOnceRef.current = true

      opts.onSuccess(resp)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showToast(
        ToastStyle.Failure,
        'API Request Error',
        err.response?.data?.errors?.[0]?.message ?? err.message
      )
    } finally {
      setIsLoading(false)
    }
  }
}

function shouldStartLoading<P, R, D extends unknown[]>(
  opts: RequestOpts<P, R, D>,
  didLoadOnceRef: RefObject<boolean> | null
) {
  if (!isIntervalRequestOpts(opts)) {
    return true
  }

  if (!opts.initialLoadingOnly) {
    return true
  }

  if (!didLoadOnceRef || !didLoadOnceRef.current) {
    return true
  }

  return false
}
