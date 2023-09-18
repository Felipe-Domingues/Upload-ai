import { Header } from './components/page-header'
import { OpenAIContextProvider } from './contexts/OpenAIContext'
import { Toaster } from './components/ui/toaster'
import { MainContent } from './components/main-content'

export function App() {
  return (
    <>
      <OpenAIContextProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <MainContent />
        </div>
      </OpenAIContextProvider>
      <Toaster />
    </>
  )
}
