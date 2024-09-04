import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { message } = await req.json()
  
  // TODO: Implement actual API call to Claude 3.5 sonnet
  // For now, we'll just return a mock response
  const response = "Désolé, je suis encore en développement. Voici votre message: " + message

  return NextResponse.json({ response })
}