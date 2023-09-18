import { Bot, Github } from 'lucide-react'
import { Button } from './ui/button'
import { OpenAIKeyDialog } from './openai-key-dialog'
import { Separator } from './ui/separator'

export function Header() {
  return (
    <header className="px-6 py-3 flex items-center justify-between border-b">
      <h1 className="text-xl font-bold flex items-center">
        <Bot className="w-7 h-7 text-orange-600 mr-2" />
        upload.ai
      </h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          Desenvolvido com 🤍 no NLW da Rocketseat
        </span>
        <Separator
          orientation="vertical"
          className="h-6 text-muted-foreground"
        />
        <OpenAIKeyDialog />
        <Button variant={'outline'}>
          <Github className="w-4 h-4 mr-2" /> Github
        </Button>
      </div>
    </header>
  )
}
