
import { Ollama } from "ollama";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      messages,
      model = "qwen3",
      system = "You are a helpful AI assistant.",
      temperature = 0.7,
    } = body;

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages must be an array." },
        { status: 400 }
      );
    }

    const accessClientId = process.env.OLLAMA_CLOUD_ACCESS_CLIENT_ID;
    const accessClientSecret = process.env.OLLAMA_CLOUD_ACCESS_CLIENT_SECRET;
    if (Boolean(accessClientId) !== Boolean(accessClientSecret)) {
      return NextResponse.json(
        { error: "Both Cloudflare Access service token values must be configured." },
        { status: 500 }
      );
    }

    const ollamaClient = new Ollama({
      host: process.env.OLLAMA_HOST || "http://127.0.0.1:11434",
      ...(accessClientId && accessClientSecret
        ? {
            headers: {
              "CF-Access-Client-Id": accessClientId,
              "CF-Access-Client-Secret": accessClientSecret,
            },
          }
        : {}),
    });
    const response = await ollamaClient.chat({
      model,
      messages: [
        { role: "system", content: system },
        ...messages,
      ],
      options: { temperature },
      stream: false,
    });

    return NextResponse.json({
      message: response.message,
    });
  } catch (error) {
    console.error("Ollama error:", error);

    return NextResponse.json(
      { error: "Could not connect to Ollama. Check that it is running and the model is installed." },
      { status: 500 }
    );
  }
}
