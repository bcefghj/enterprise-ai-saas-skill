export async function POST(req: Request) {
  try {
    const { messages, conversationId } = await req.json();

    const response = await fetch(
      'https://ai-gateway-intl.eo-edgefunctions7.com',
      {
        method: 'POST',
        headers: {
          'OE-Key': process.env.EDGEONE_AI_GATEWAY_KEY || '',
          'OE-Gateway-Name': process.env.EDGEONE_GATEWAY_NAME || '',
          'OE-AI-Provider': 'minimax',
          'OE-Gateway-Version': '2',
          'Authorization': `Bearer ${process.env.MINIMAX_API_KEY || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'MiniMax-M2.7',
          messages: messages.slice(-10),
          stream: true,
          max_tokens: 2048,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'AI service unavailable' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
