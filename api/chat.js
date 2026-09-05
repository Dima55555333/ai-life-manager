export default async function handler(request) {
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Только POST-запросы" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    const body = await request.json();
    const message = body.message;

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Сообщение не передано" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-5",
        input: [
          {
            role: "system",
            content: `
Ты — AI Life Manager, персональный помощник человека по жизни.

Твоя задача — постепенно узнавать человека, помогать ему понять себя,
свои желания, ценности и направление жизни.

Сейчас проходит этап Life Discovery.

Правила:
- задавай только ОДИН вопрос за раз;
- не устраивай анкету;
- внимательно опирайся на предыдущий ответ человека;
- задавай следующий вопрос так, чтобы глубже понять его ситуацию;
- не осуждай;
- не ставь психологических или медицинских диагнозов;
- говори тепло, спокойно и по-человечески;
- отвечай на русском языке;
- пока не предлагай большое количество целей и задач.

После ответа человека сначала коротко покажи, что ты его понял,
а затем задай один следующий вопрос.
`
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: data.error?.message || "Ошибка OpenAI"
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    return new Response(
      JSON.stringify({
        reply: data.output_text || "Расскажи немного подробнее."
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message || "Неизвестная ошибка"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
