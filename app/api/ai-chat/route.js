import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `Kamu adalah Ushalli AI, asisten Muslim yang ramah dan berpengetahuan luas.
Kamu membantu pengguna dengan pertanyaan seputar Islam: shalat, doa, Al-Quran, hadis, fiqih, dan ibadah sehari-hari.
Jawab dalam Bahasa Indonesia yang mudah dipahami, hangat, dan penuh kasih sayang.
Sertakan dalil atau referensi Al-Quran/Hadis jika relevan.
Jika tidak tahu jawabannya, sampaikan dengan jujur dan sarankan untuk bertanya kepada ulama.
Tutup jawaban dengan doa atau pesan motivasi singkat jika sesuai konteks.`;

export async function POST(request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Pesan tidak valid' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      stream: true,
      max_tokens: 1024,
      temperature: 0.7,
    });

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              controller.enqueue(encoder.encode(delta));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('AI Chat error:', error);
    return new Response(
      JSON.stringify({ error: 'Terjadi kesalahan, coba lagi nanti.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
