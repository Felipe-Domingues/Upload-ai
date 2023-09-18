import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { streamToResponse, OpenAIStream } from 'ai'
import 'dotenv/config'
import OpenAI from 'openai'

export async function generateAICompletionRoute(app: FastifyInstance) {
  app.post('/ai/complete', async (req, reply) => {
    const bodySchema = z.object({
      videoId: z.string().uuid(),
      prompt: z.string(),
      temperature: z.number().min(0).max(1).default(0.5),
      openAIKey: z.string(),
    })

    const { videoId, prompt, temperature, openAIKey } = bodySchema.parse(
      req.body,
    )

    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId,
      },
    })

    if (!openAIKey) {
      return reply.status(401).send({ error: 'openAIKey is invalid.' })
    }

    if (!video.transcription) {
      return reply
        .status(400)
        .send({ error: 'Video transcription was not generated yet.' })
    }

    const promptMessage = prompt.replace('{transcription}', video.transcription)

    const openai = new OpenAI({
      apiKey: openAIKey,
    })
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-16k',
      temperature,
      messages: [{ role: 'user', content: promptMessage }],
      stream: true,
    })

    const stream = OpenAIStream(response)

    const originURL = process.env.FRONTEND_URL ? process.env.FRONTEND_URL : ''

    streamToResponse(stream, reply.raw, {
      headers: {
        'Access-Control-Allow-Origin': originURL,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
    })
  })
}
