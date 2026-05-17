import { useEffect, useState } from 'react'

export function useWebSocket<T>(url: string, initial: T[] = []) {
  const [messages, setMessages] = useState<T[]>(initial)
  
  useEffect(() => {
    setMessages(initial)
  }, [initial.length])

  useEffect(() => {
    const ws = new WebSocket(url)
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data) as T
      setMessages(prev => [data, ...prev].slice(0, 100))
    }
    return () => ws.close()
  }, [url])

  return [messages, setMessages] as const
}