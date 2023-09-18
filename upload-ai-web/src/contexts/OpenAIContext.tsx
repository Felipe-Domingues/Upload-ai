import { ReactNode, createContext, useEffect, useState } from 'react'

interface OpenAIContextType {
  openAIKey: string | undefined
  setNewOpenAIKey: (key: string | undefined) => void
}

interface OpenAIContextProviderProps {
  children: ReactNode
}

export const OpenAIContext = createContext({} as OpenAIContextType)

export function OpenAIContextProvider({
  children,
}: OpenAIContextProviderProps) {
  const [openAIKey, setOpenAIKey] = useState<string | undefined>()

  useEffect(() => {
    const storedState = localStorage.getItem('@upload-ai:openai-state-1.0.0')

    if (storedState) {
      setOpenAIKey(storedState)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('@upload-ai:openai-state-1.0.0', openAIKey || '')
  }, [openAIKey])

  function setNewOpenAIKey(key: string | undefined) {
    setOpenAIKey(key)
  }

  return (
    <OpenAIContext.Provider value={{ openAIKey, setNewOpenAIKey }}>
      {children}
    </OpenAIContext.Provider>
  )
}
