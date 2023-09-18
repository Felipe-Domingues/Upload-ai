import { Label } from './ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './ui/select'
import { Separator } from './ui/separator'
import { Slider } from './ui/slider'
import { Wand2 } from 'lucide-react'
import { PromptSelect } from './prompt-select'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { VideoInputForm } from './video-input-form'
import { OpenAIContext } from '@/contexts/OpenAIContext'
import { useCompletion } from 'ai/react'
import { useState, useContext } from 'react'
import { toast } from './ui/use-toast'

export function MainContent() {
  const [temperature, setTemperature] = useState(0.5)
  const [videoId, setVideoId] = useState<string | null>(null)

  const { openAIKey } = useContext(OpenAIContext)

  const {
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    completion,
    isLoading,
  } = useCompletion({
    api: import.meta.env.VITE_BACKEND_URL + '/ai/complete',
    onResponse: (res) => {
      if (res.status === 401) {
        toast({
          variant: 'destructive',
          description: 'Chave OpenAI não informada!',
        })
      }
    },
    headers: {
      'Content-type': 'application/json',
    },
    body: {
      videoId,
      temperature,
      openAIKey: openAIKey || '',
    },
  })

  return (
    <main className="flex-1 p-6 flex gap-6">
      <div className="flex flex-col flex-1 gap-4">
        <div className="grid grid-rows-2 gap-4 flex-1">
          <Textarea
            className="resize-none p-4 leading-relaxed"
            placeholder="Inclua o prompt para a IA..."
            value={input}
            onChange={handleInputChange}
          />
          <Textarea
            className="resize-none p-4 leading-relaxed"
            placeholder="Resultado gerado pela IA..."
            readOnly
            value={completion}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Lembre-se: você pode utilizar a variável{' '}
          <code className="text-orange-600">{'{transcription}'}</code> no seu
          prompt para adicionar o conteúdo da transcrição do vídeo selecionado.
        </p>
      </div>
      <aside className="w-80 space-y-6">
        <VideoInputForm onVideoUploaded={setVideoId} />

        <Separator />
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Prompt</Label>
            <PromptSelect onPromptSelected={setInput} />
          </div>
          <div className="space-y-2">
            <Label>Modelo</Label>
            <Select defaultValue="gpt3.5" disabled>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt3.5">GPT 3.5-turbo 16k</SelectItem>
              </SelectContent>
            </Select>
            <span className="block text-xs text-muted-foreground italic">
              Você poderá customizar essa opção em breve
            </span>
          </div>
          <Separator />
          <div className="space-y-4">
            <Label>Temperatura ({temperature})</Label>
            <Slider
              min={0}
              max={1}
              step={0.1}
              value={[temperature]}
              onValueChange={(value) => setTemperature(value[0])}
            />
            <span className="block text-xs text-muted-foreground italic leading-relaxed">
              Valores mais altos tendem a deixar o resultado mais criativo e com
              possíveis erros.
            </span>
          </div>
          <Separator />
          <Button className="w-full" type="submit" disabled={isLoading}>
            Executar
            <Wand2 className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </aside>
    </main>
  )
}
