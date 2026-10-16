
import ollama from "ollama";
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

    const response = await ollama.chat({
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
