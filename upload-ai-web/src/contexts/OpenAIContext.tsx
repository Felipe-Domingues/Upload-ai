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
      // const decryptedKey = AES.decrypt(storedState, 'c7195820f148')
      const decryptedKey = atob(storedState)
      if (decryptedKey) {
        setOpenAIKey(decryptedKey)
      }
    }
  }, [])

  useEffect(() => {
    if (openAIKey) {
      // const encryptedKey = AES.encrypt(openAIKey, 'c7195820f148').toString()
      const encryptedKey = btoa(openAIKey)

      localStorage.setItem('@upload-ai:openai-state-1.0.0', encryptedKey || '')
    }
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
