
"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
};

const conversationsStorageKey = "my-ai-conversations";
const activeConversationStorageKey = "my-ai-active-conversation";

const personalities = {
  Helpful: "You are a helpful, friendly AI assistant.",
  Coder: "You are an expert programming assistant. Give accurate code and explain your solutions.",
  Creative: "You are a creative thinker. Explore original ideas and interesting possibilities.",
  Tutor: "You are a patient tutor. Explain concepts step by step and adapt to the learner.",
  Professional: "You are a professional, clear, and concise assistant.",
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const activeConversationIdRef = useRef<string | null>(null);
  const [storageReady, setStorageReady] = useState(false);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("qwen3");
  const [personality, setPersonality] =
    useState<keyof typeof personalities>("Helpful");
  const [instructions, setInstructions] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [detail, setDetail] = useState("Balanced");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(conversationsStorageKey);
        const parsed: unknown = saved ? JSON.parse(saved) : [];
        if (
          !Array.isArray(parsed) ||
          !parsed.every(
            (conversation) =>
              typeof conversation.id === "string" &&
              typeof conversation.title === "string" &&
              Array.isArray(conversation.messages) &&
              conversation.messages.every(
                (message: Message) =>
                  (message.role === "user" || message.role === "assistant") &&
                  typeof message.content === "string"
              ) &&
              typeof conversation.updatedAt === "number"
          )
        ) {
          throw new Error("Saved conversation data is invalid.");
        }

        const savedActiveId = window.localStorage.getItem(activeConversationStorageKey);
        const active = parsed.find(
          (conversation: Conversation) => conversation.id === savedActiveId
        );
        setConversations(parsed as Conversation[]);
        if (active) {
          activeConversationIdRef.current = active.id;
          setActiveConversationId(active.id);
          setMessages(active.messages);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? `Could not load saved conversations: ${err.message}`
            : "Could not load saved conversations."
        );
      } finally {
        setStorageReady(true);
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      window.localStorage.setItem(
        conversationsStorageKey,
        JSON.stringify(conversations)
      );
      if (activeConversationId) {
        window.localStorage.setItem(activeConversationStorageKey, activeConversationId);
      } else {
        window.localStorage.removeItem(activeConversationStorageKey);
      }
    } catch (err) {
      const message = err instanceof Error
        ? `Could not save conversations: ${err.message}`
        : "Could not save conversations.";
      window.setTimeout(() => setError(message), 0);
    }
  }, [activeConversationId, conversations, storageReady]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const conversationId =
      activeConversationIdRef.current ?? crypto.randomUUID();
    const updated: Message[] = [
      ...messages,
      { role: "user", content: text },
    ];

    setMessages(updated);
    activeConversationIdRef.current = conversationId;
    setActiveConversationId(conversationId);
    setConversations((current) => {
      const existing = current.find((conversation) => conversation.id === conversationId);
      const conversation: Conversation = {
        id: conversationId,
        title: existing?.title ?? (text.length > 48 ? `${text.slice(0, 48)}…` : text),
        messages: updated,
        updatedAt: Date.now(),
      };
      return existing
        ? current.map((entry) => entry.id === conversationId ? conversation : entry)
        : [conversation, ...current];
    });
    setInput("");
    setLoading(true);
    setError("");

    const system = [
      personalities[personality],
      `Answer length: ${detail}.`,
      instructions,
    ]
      .filter(Boolean)
      .join("\n\n");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated,
          model,
          system,
          temperature,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request failed.");
      }

      const completed: Message[] = [
        ...updated,
        { role: "assistant", content: data.message.content },
      ];
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === conversationId
            ? { ...conversation, messages: completed, updatedAt: Date.now() }
            : conversation
        )
      );
      if (activeConversationIdRef.current === conversationId) {
        setMessages(completed);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  function newChat() {
    setMessages([]);
    activeConversationIdRef.current = null;
    setActiveConversationId(null);
    setInput("");
    setError("");
  }

  function openConversation(conversation: Conversation) {
    activeConversationIdRef.current = conversation.id;
    setActiveConversationId(conversation.id);
    setMessages(conversation.messages);
    setInput("");
    setError("");
  }

  function deleteConversation(id: string) {
    const remaining = conversations.filter((conversation) => conversation.id !== id);
    setConversations(remaining);
    if (activeConversationId === id) {
      const next = remaining[0];
      activeConversationIdRef.current = next?.id ?? null;
      setActiveConversationId(next?.id ?? null);
      setMessages(next?.messages ?? []);
      setInput("");
    }
  }

  return (
    <main className="min-h-screen bg-[#0b0d12] text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-56 shrink-0 flex-col border-r border-white/10 bg-[#0e1016] p-4 sm:flex">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#702633] text-lg font-semibold">
              A
            </div>
            <div>
              <h1 className="font-semibold">My AI</h1>
              <p className="text-xs text-zinc-500">Local intelligence</p>
            </div>
          </div>

          <button
            onClick={newChat}
            className="rounded-xl border border-white/10 bg-white/5 p-3 text-left text-sm transition hover:bg-white/10"
          >
            + New conversation
          </button>

          <div className="mt-5 min-h-0 flex-1 overflow-y-auto">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Conversations
            </p>
            {conversations.length === 0 ? (
              <p className="px-2 py-2 text-xs text-zinc-600">No saved chats yet</p>
            ) : (
              <div className="space-y-1">
                {[...conversations]
                  .sort((a, b) => b.updatedAt - a.updatedAt)
                  .map((conversation) => (
                    <div key={conversation.id} className="group flex items-center gap-1">
                      <button
                        onClick={() => openConversation(conversation)}
                        className={`min-w-0 flex-1 truncate rounded-lg px-2 py-2 text-left text-sm ${
                          activeConversationId === conversation.id
                            ? "bg-white/10 text-zinc-100"
                            : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                        }`}
                      >
                        {conversation.title}
                      </button>
                      <button
                        onClick={() => deleteConversation(conversation.id)}
                        aria-label={`Delete ${conversation.title}`}
                        className="rounded-md px-2 py-1 text-zinc-600 opacity-0 hover:bg-white/10 hover:text-zinc-200 group-hover:opacity-100 focus:opacity-100"
                      >
                        ×
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="mt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Assistant
            </p>
            <label className="mb-2 block text-sm text-zinc-300">
              Model name
            </label>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/20 p-2.5 text-sm outline-none focus:border-[#9d3f4e]"
              placeholder="qwen3"
            />
            <p className="mt-2 text-xs text-zinc-500">
              Use an installed Ollama model name.
            </p>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm text-zinc-300">
              Personality
            </label>
            <select
              value={personality}
              onChange={(e) =>
                setPersonality(
                  e.target.value as keyof typeof personalities
                )
              }
              className="w-full rounded-lg border border-white/10 bg-[#171923] p-2.5 text-sm"
            >
              {Object.keys(personalities).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex justify-between text-sm">
              <label>Creativity</label>
              <span className="text-[#d997a1]">
                {temperature.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.1"
              value={temperature}
              onChange={(e) =>
                setTemperature(Number(e.target.value))
              }
              className="w-full accent-[#8d2939]"
            />
            <div className="mt-1 flex justify-between text-xs text-zinc-500">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm text-zinc-300">
              Answer length
            </label>
            <select
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#171923] p-2.5 text-sm"
            >
              <option>Concise</option>
              <option>Balanced</option>
              <option>Detailed</option>
            </select>
          </div>

          <div className="mt-auto pt-8 text-xs text-zinc-500">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-400" />
            Powered by your local Ollama
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-white/10 px-5 py-3 sm:px-8">
            <div>
              <h2 className="font-medium">Chat</h2>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5"
            >
              {showSettings ? "Hide instructions" : "Instructions"}
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-8">
            {messages.length === 0 ? (
              <div className="mx-auto mt-24 max-w-xl text-center">
                <h3 className="text-2xl font-medium tracking-tight">
                  What can I help with?
                </h3>
                <p className="mt-2 text-sm text-zinc-500">
                  Ask a question or start with an example.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {[
                    "Help me write an introduction.",
                    "Explain neural networks simply.",
                    "Help plan a small software project.",
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setInput(prompt)}
                      className="rounded-full border border-white/10 px-3 py-2 text-xs text-zinc-400 transition hover:border-[#8d2939]/70 hover:text-zinc-100"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-3xl space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`rounded-2xl p-4 sm:p-5 ${
                      message.role === "user"
                        ? "ml-6 bg-[#702633]/25 sm:ml-16"
                        : "mr-2 border border-white/[0.07] bg-white/[0.025] sm:mr-10"
                    }`}
                  >
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      {message.role === "user" ? "You" : personality}
                    </p>
                    <div className="whitespace-pre-wrap break-words text-sm leading-7 sm:text-base">
                      {message.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="animate-pulse text-sm text-[#d997a1]">
                    Thinking...
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="mx-auto mt-5 max-w-3xl rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </div>
            )}
          </div>

          <div className="border-t border-white/10 bg-[#0b0d12] p-4 sm:px-8 sm:py-5">
            <div className="mx-auto max-w-3xl">
              {showSettings && (
                <div className="mb-3">
                  <label className="mb-2 block text-xs text-zinc-500">
                    Additional instructions
                  </label>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={2}
                    placeholder="E.g. explain your reasoning clearly, use examples, or prefer Python..."
                    className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm outline-none focus:border-[#9d3f4e]"
                  />
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void sendMessage();
                }}
                className="flex items-end gap-3 rounded-2xl border border-white/10 bg-[#14161e] p-2 focus-within:border-[#9d3f4e]/70"
              >
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void sendMessage();
                    }
                  }}
                  placeholder="Message your AI..."
                  rows={1}
                  className="max-h-40 min-w-0 flex-1 resize-y bg-transparent p-3 text-sm outline-none placeholder:text-zinc-600"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="rounded-xl bg-[#702633] px-5 py-3 text-sm font-medium transition hover:bg-[#873342] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading ? "..." : "Send ↑"}
                </button>
              </form>
              <p className="mt-3 text-center text-xs text-zinc-600">
                This AI doesnæt make mistakes (trust, trust).
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
