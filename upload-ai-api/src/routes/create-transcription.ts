import { FastifyInstance } from 'fastify'
import { createReadStream } from 'node:fs'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import OpenAI from 'openai'

export async function createTranscriptionRoute(app: FastifyInstance) {
  app.post('/videos/:videoId/transcription', async (req) => {
    const paramsSchema = z.object({
      videoId: z.string().uuid(),
    })
    const { videoId } = paramsSchema.parse(req.params)

    const bodySchema = z.object({
      prompt: z.string(),
      openAIKey: z.string(),
    })
    const { prompt, openAIKey } = bodySchema.parse(req.body)

    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId,
      },
    })

    const videoPath = video.path
    const audioReadStream = createReadStream(videoPath)

    const openai = new OpenAI({
      apiKey: openAIKey,
    })
    const response = await openai.audio.transcriptions.create({
      file: audioReadStream,
      model: 'whisper-1',
      language: 'pt',
      response_format: 'json',
      temperature: 0,
      prompt,
    })

    const transcription = response.text

    await prisma.video.update({
      where: {
        id: videoId,
      },
      data: {
        transcription,
      },
    })

    return { transcription }
  })
}
