import { Button } from './ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog'
import { KeyRound } from 'lucide-react'
import { Input } from './ui/input'
import { useContext, useRef } from 'react'
import { OpenAIContext } from '@/contexts/OpenAIContext'

export function OpenAIKeyDialog() {
  const { openAIKey, setNewOpenAIKey } = useContext(OpenAIContext)

  const keyInputRef = useRef<HTMLInputElement>(null)

  function handleSaveKey() {
    const inputValue = keyInputRef.current?.value

    setNewOpenAIKey(inputValue)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <KeyRound className="w-4 h-4 mr-2" /> OpenAI Key
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>OpenAI - Chave API</DialogTitle>
          <DialogDescription className="text-xs">
            A chave é armazenada apenas em seu navegador por razões de
            segurança. Para gerar{' '}
            <a
              href="https://platform.openai.com/account/api-keys"
              target="_blank"
              rel="noreferrer"
              className="text-orange-600"
            >
              clique aqui.
            </a>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col py-4">
          <Input
            ref={keyInputRef}
            id="keyInput"
            value={openAIKey}
            onChange={handleSaveKey}
            placeholder="Insira aqui a chave da OpenAI..."
            className="col-span-3"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
