export async function handler(event) {
  try {
    // Autoriser GET pour test
    if (event.httpMethod === "GET") {
      return {
        statusCode: 200,
        body: JSON.stringify({
          ok: true,
          message: "Chatbot function is alive 🚀"
        })
      };
    }

    // POST
    let payload = {};
    if (event.body) {
      payload = JSON.parse(event.body);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        received: payload
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: err.message
      })
    };
  }
}
