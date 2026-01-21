import fetch from "node-fetch";

export async function handler(event) {
  try {
    // GET pour test rapide
    if (event.httpMethod === "GET") {
      return {
        statusCode: 200,
        body: JSON.stringify({ ok: true, message: "Chatbot function alive 🚀" })
      };
    }

    // POST
    let payload = {};
    if (event.body) {
      try {
        payload = JSON.parse(event.body);
      } catch {
        return {
          statusCode: 400,
          body: JSON.stringify({ ok: false, error: "Invalid JSON body" })
        };
      }
    }

    const { message, columns } = payload;
    const key = process.env.OPENAI_API_KEY;

    // Si pas de clé, renvoyer un graphique par défaut
    if (!key) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          column: columns[0] || "population",
          type: "bar",
          explanation: "Clé OpenAI manquante, exemple de graphique"
        })
      };
    }

    // Prompt pour OpenAI
    const prompt = `
Tu es un assistant pour créer des graphiques à partir de données CSV/Excel.
Colonnes disponibles : ${columns.join(", ")}
Utilisateur demande : "${message}"

Réponds STRICTEMENT en JSON :
{
  "column": "...",
  "type": "bar | pie | line",
  "explanation": "..."
}
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Retour JSON vers frontend
    return {
      statusCode: 200,
      body: content
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: err.message })
    };
  }
}
