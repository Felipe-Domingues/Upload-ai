'use client'

import { Label } from '@radix-ui/react-label'
import { Separator } from '@radix-ui/react-separator'
import { FileVideo, Upload } from 'lucide-react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import {
  ChangeEvent,
  FormEvent,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'
import { getFFmpeg } from '@/lib/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import { api } from '@/lib/axios'
import { OpenAIContext } from '@/contexts/OpenAIContext'
import { useToast } from './ui/use-toast'

type Status =
  | 'waiting'
  | 'converting'
  | 'uploading'
  | 'generating'
  | 'success'
  | 'error'

const statusMessages = {
  converting: 'Convertendo...',
  uploading: 'Carregando...',
  generating: 'Transcrevendo...',
  success: 'Sucesso!',
  error: 'ERRO',
}

interface VideoInputFormProps {
  onVideoUploaded: (id: string) => void
}

export function VideoInputForm(props: VideoInputFormProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const promptInputRef = useRef<HTMLTextAreaElement>(null)
  const [status, setStatus] = useState<Status>('waiting')
  const { openAIKey } = useContext(OpenAIContext)
  const { toast } = useToast()

  function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const { files } = event.currentTarget

    if (!files) {
      return
    }

    const selectedFile = files[0]

    setVideoFile(selectedFile)
  }

  async function convertVideoToAudio(video: File) {
    console.log('🏁 Convert started.')

    const ffmpeg = await getFFmpeg()

    await ffmpeg.writeFile('input.mp4', await fetchFile(video))

    // ffmpeg.on('log', (log) => {
    //   console.log(log)
    // })

    ffmpeg.on('progress', (progress) => {
      console.log('⏳ Convert progress: ' + Math.round(progress.progress * 100))
    })

    await ffmpeg.exec([
      '-i',
      'input.mp4',
      '-map',
      '0:a',
      '-b:a',
      '20k',
      '-acodec',
      'libmp3lame',
      'output.mp3',
    ])

    const data = await ffmpeg.readFile('output.mp3')

    const audioFileBlob = new Blob([data], { type: 'audio/mpeg' })
    const audioFile = new File([audioFileBlob], 'audio.mp3', {
      type: 'audio/mpeg',
    })

    console.log('✅ Convert finished!')

    return audioFile
  }

  async function handleUploadVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      if (!openAIKey) {
        toast({
          variant: 'destructive',
          description: 'Chave OpenAI não informada!',
        })

        return
      }

      const prompt = promptInputRef.current?.value

      if (!videoFile) {
        toast({
          variant: 'destructive',
          description: 'Selecione um vídeo para prosseguir.',
        })

        return
      }

      setStatus('converting')

      const audioFile = await convertVideoToAudio(videoFile)

      const data = new FormData()

      data.append('file', audioFile)

      setStatus('uploading')

      const response = await api.post('/videos', data)

      const videoId = response.data.video.id

      setStatus('generating')

      await api.post(`/videos/${videoId}/transcription`, {
        prompt,
        openAIKey,
      })

      setStatus('success')

      props.onVideoUploaded(videoId)
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Erro upload video: ${error.message}`)
      } else {
        console.error('An unknown error occurred while uploading video.')
      }

      setStatus('error')
    }
  }

  const previewURL = useMemo(() => {
    if (!videoFile) {
      return null
    }

    return URL.createObjectURL(videoFile)
  }, [videoFile])

  return (
    <form onSubmit={handleUploadVideo} className="space-y-6">
      <label
        className="relative border flex rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-primary/30"
        htmlFor="video"
      >
        {previewURL ? (
          <video
            src={previewURL}
            controls={false}
            className="pointer-events-none absolute inset-0"
          />
        ) : (
          <>
            <FileVideo className="w-4 h-4" />
            Selecione um vídeo
          </>
        )}
      </label>
      <input
        className="sr-only"
        type="file"
        id="video"
        accept="video/mp4"
        onChange={handleFileSelected}
      />
      <Separator />
      <div className="space-y-2">
        <Label htmlFor="transcription_prompt">Prompt de transcrição</Label>
        <Textarea
          id="transcription_prompt"
          className="h-20 leading-relaxed resize-none"
          placeholder="Inclua palavras chaves mencionadas no vídeo separadas por vírgula (,)"
          ref={promptInputRef}
          disabled={status !== 'waiting'}
        />
      </div>

      <Button
        data-success={status === 'success'}
        data-error={status === 'error'}
        type="submit"
        className={
          'w-full ' +
          (status === 'success'
            ? 'bg-emerald-600'
            : status === 'error' && 'bg-red-700')
        }
        disabled={status !== 'waiting'}
      >
        {status === 'waiting' ? (
          <>
            Carregar vídeo
            <Upload className="w-4 h-4 ml-2" />
          </>
        ) : (
          statusMessages[status]
        )}
      </Button>
    </form>
  )
}
