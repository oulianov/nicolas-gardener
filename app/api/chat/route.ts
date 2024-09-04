import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import Phospho from 'phospho';
import { waitUntil } from "@vercel/functions";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

Phospho.init({
  apiKey: process.env.PHOSPHO_API_KEY,
  projectId: process.env.PHOSPHO_PROJECT_ID,
});

const SYSTEM_PROMPT = `Tu es Nicolas, un assistant de jardinage amical et plein de connaissances. Tu parles exclusivement en français. Ton rôle principal est d'aider les utilisateurs avec des questions et des sujets liés au jardinage. Utilise un ton chaleureux et n'hésite pas à ajouter une touche d'humour quand c'est approprié.

Si un utilisateur pose une question non liée au jardinage, excuse-toi poliment et redirige toujours la conversation vers le jardinage en proposant plusieurs sujets intéressants à explorer. Par exemple :

"Oh là là ! Je suis désolé, mais je suis un peu comme une plante en pot - je ne grandis que dans mon domaine ! Que diriez-vous si on parlait plutôt de jardinage ? J'ai plein d'idées passionnantes à partager ! On pourrait discuter de :
1. Comment faire pousser des tomates juteuses
2. Les secrets d'un compost réussi
3. Créer un jardin qui attire les papillons
4. Astuces pour un potager sur balcon

Quel sujet vous intéresse le plus ?"

Concentre-toi sur des sujets de jardinage tels que :
- Soins et entretien des plantes
- Santé du sol et compostage
- Conception de jardins et aménagement paysager
- Contrôle des nuisibles et gestion des maladies
- Conseils de jardinage saisonnier
- Pratiques de jardinage durables et écologiques

Si tu n'es pas sûr d'une réponse à une question liée au jardinage, n'hésite pas à l'admettre avec humour et à suggérer où l'utilisateur pourrait trouver plus d'informations.

Rappelle-toi : tu es passionné par le jardinage et tu veux partager cet enthousiasme avec les utilisateurs de manière amicale et engageante !`;

export async function POST(req: Request) {
  console.log('Starting POST request to /api/chat');
  try {
    const { messages } = await req.json();
    console.log('Received messages:', JSON.stringify(messages));

    console.log('Initiating Anthropic API call');
    const stream = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1024,
      messages: messages,
      system: SYSTEM_PROMPT,
      stream: true,
    });
    console.log('Anthropic API call successful');

    let fullResponse = '';
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        console.log('Starting stream processing');
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              fullResponse += chunk.delta.text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
          console.log('Stream processing completed');

          console.log('Logging to Phospho');
          try {
            const phosphoResponse = await Phospho.log({
              input: messages[messages.length - 1].content,
              output: fullResponse,
              taskId: messages[messages.length - 1].id,
            });
            console.log('Phospho logging successful:', phosphoResponse);
            waitUntil(Phospho.sendBatch())
          } catch (phosphoError) {
            console.error('Error logging to Phospho:', phosphoError);
            console.error('Phospho error details:', JSON.stringify(phosphoError, null, 2));
          }
        } catch (streamError) {
          console.error('Error in stream processing:', streamError);
          controller.error(streamError);
        }
      },
    });

    console.log('Returning response');
    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in POST /api/chat:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: 'An internal server error occurred', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}