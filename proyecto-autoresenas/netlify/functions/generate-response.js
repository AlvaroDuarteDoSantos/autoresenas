exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { review, tone } = JSON.parse(event.body);
    const apiKey = process.env.OPENAI_API_KEY; 

    let systemPrompt = "Eres un experto en atención al cliente. Sé breve y profesional.";
    if(tone === 'luxury') systemPrompt += " Tono elegante y gourmet.";
    if(tone === 'friendly') systemPrompt += " Tono cercano con emojis.";
    if(tone === 'apologetic') systemPrompt += " Tono empático, pide disculpas y ofrece contacto privado.";

    // Usamos 'fetch' nativo para que Netlify no requiera librerías externas
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Redacta una respuesta para: "${review}"` }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || "Error en OpenAI");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: data.choices[0].message.content })
    };
  } catch (error) {
    return { 
        statusCode: 500, 
        body: JSON.stringify({ error: error.message }) 
    };
  }
};