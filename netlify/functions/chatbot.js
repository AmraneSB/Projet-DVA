import fetch from "node-fetch";

export async function handler(event) {
  try {
    if (event.httpMethod === "GET") {
      return {
        statusCode: 200,
        body: JSON.stringify({ ok: true, message: "Chatbot function alive 🚀" })
      };
    }

    // Récupération du message et des colonnes depuis le frontend
    let payload = {};
    if (event.body) {
      payload = JSON.parse(event.body);
    }

    const { message, columns } = payload;
    const key = process.env.OPENAI_API_KEY;

    // Si la clé OpenAI n'est pas définie, on renvoie un graphique par défaut
    if (!key) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          column: columns[0] || "population",
          type: "bar",
          explanation: "Clé OpenAI manquante, génération d'un graphique par défaut"
        })
      };
    }

    // Prompt pour OpenAI : force une réponse JSON stricte
    const prompt = `
Tu es un assistant pour créer des graphiques à partir de données.
Colonnes disponibles : ${columns.join(", ")}
Utilisateur demande : "${message}"

Réponds STRICTEMENT en JSON :
{
  "column": "...",
  "type": "bar | pie | line",
  "explanation": "..."
}
`;

    // Appel à l'API OpenAI
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

    // Récupère le contenu JSON renvoyé par l'IA
    const content = data.choices[0].message.content;

    // Retour vers le frontend
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
