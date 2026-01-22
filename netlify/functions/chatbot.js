import fetch from "node-fetch";

export async function handler(event) {
  const { message, columns } = JSON.parse(event.body);

  const prompt = `
Tu es un assistant de visualisation de données.

Colonnes disponibles :
${columns.join(", ")}

Demande utilisateur :
"${message}"

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
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await response.json();
  const content = data.choices[0].message.content;

  return {
    statusCode: 200,
    body: content
  };
}
