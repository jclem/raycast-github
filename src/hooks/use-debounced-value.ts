import {useState, useEffect} from 'react'

export function useDebouncedValue<T>(value: T, timeout = 500): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), timeout)
    return () => clearTimeout(handler)
  }, [timeout, value])

  return debouncedValue
}
