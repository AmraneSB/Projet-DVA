export async function handler(event) {
  try {
    // GET pour test
    if (event.httpMethod === "GET") {
      return {
        statusCode: 200,
        body: JSON.stringify({ ok: true, message: "Function alive 🚀" })
      };
    }

    // POST
    let payload = {};
    if (event.body) {
      try {
        payload = JSON.parse(event.body);
      } catch (err) {
        return {
          statusCode: 400,
          body: JSON.stringify({ ok: false, error: "Invalid JSON body" })
        };
      }
    }

    // Si la clé OpenAI n'existe pas, on renvoie un message générique
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          column: "population", // valeur par défaut pour test
          type: "bar",
          explanation: "Clé OpenAI manquante, voici un exemple de graphique par défaut"
        })
      };
    }

    // Ici, tu mettrais ton vrai code OpenAI
    // Pour l'instant, renvoie une réponse factice sûre
    return {
      statusCode: 200,
      body: JSON.stringify({
        column: "population",
        type: "bar",
        explanation: "Exemple de graphique généré par le chatbot"
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: err.message })
    };
  }
}
