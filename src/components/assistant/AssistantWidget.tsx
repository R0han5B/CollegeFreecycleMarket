"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, Minimize2, SendHorizonal, Sparkles, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AssistantChatMessage } from "@/lib/assistant";
import { useAuthStore } from "@/store/auth-store";

interface LocalAssistantMessage extends AssistantChatMessage {
  id: string;
}

const HISTORY_STORAGE_KEY = "assistant-widget-history";
const WELCOME_STORAGE_KEY = "assistant-widget-welcome-seen";

const quickPrompts = [
  "How do I post an item here?",
  "How can I contact a seller?",
  "Show me what kinds of items I can find.",
  "I need help with my account.",
];

function createMessage(role: "user" | "assistant", content: string): LocalAssistantMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
  };
}

function getInitialAssistantMessage(isAuthenticated: boolean, name?: string | null) {
  const userName = name?.trim() || "there";
  return createMessage(
    "assistant",
    isAuthenticated
      ? `Hey ${userName}, how can I help? I can guide you on browsing items, posting listings, messaging sellers, or finding your way around the marketplace.`
      : "Hey, how can I help? I can explain how the marketplace works, how to browse listings, and what to expect after you sign in."
  );
}

export default function AssistantWidget() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<LocalAssistantMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const isHiddenRoute = useMemo(() => {
    return pathname === "/login" || pathname === "/signup" || pathname.startsWith("/chat/");
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    try {
      const rawHistory = window.localStorage.getItem(HISTORY_STORAGE_KEY);
      if (rawHistory) {
        const parsed = JSON.parse(rawHistory) as LocalAssistantMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch (error) {
      console.error("Failed to read assistant history:", error);
    }

    setMessages([getInitialAssistantMessage(isAuthenticated, user?.name)]);
  }, [mounted, isAuthenticated, user?.name]);

  useEffect(() => {
    if (!mounted || messages.length === 0) {
      return;
    }

    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(messages));
  }, [mounted, messages]);

  useEffect(() => {
    if (!mounted || isHiddenRoute) {
      return;
    }

    const welcomeSeen = window.localStorage.getItem(WELCOME_STORAGE_KEY) === "true";
    if (welcomeSeen) {
      return;
    }

    const revealTimer = window.setTimeout(() => {
      setShowGreeting(true);
    }, 1800);

    const collapseTimer = window.setTimeout(() => {
      setShowGreeting(false);
      window.localStorage.setItem(WELCOME_STORAGE_KEY, "true");
    }, 8200);

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(collapseTimer);
    };
  }, [mounted, isHiddenRoute]);

  useEffect(() => {
    if (!scrollRef.current) {
      return;
    }

    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isOpen]);

  if (!mounted || isHiddenRoute) {
    return null;
  }

  const handleOpen = () => {
    setIsOpen(true);
    setShowGreeting(false);
    window.localStorage.setItem(WELCOME_STORAGE_KEY, "true");

    if (messages.length === 0) {
      setMessages([getInitialAssistantMessage(isAuthenticated, user?.name)]);
    }
  };

  const handleSend = async (presetPrompt?: string) => {
    const content = (presetPrompt ?? input).trim();
    if (!content || sending) {
      return;
    }

    const userMessage = createMessage("user", content);
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setSending(true);
    setIsOpen(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pathname,
          viewer: {
            id: user?.id,
            name: user?.name,
            isAuthenticated,
          },
          messages: nextMessages.map(({ role, content: messageContent }) => ({
            role,
            content: messageContent,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(typeof data?.error === "string" ? data.error : "Assistant request failed.");
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage("assistant", data.message),
      ]);
    } catch (error) {
      const fallbackMessage =
        error instanceof Error ? error.message : "The assistant is unavailable right now.";

      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage(
          "assistant",
          `I hit a snag: ${fallbackMessage} If this keeps happening, check the API key or switch to a different model in the server config.`
        ),
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleReset = () => {
    const next = [getInitialAssistantMessage(isAuthenticated, user?.name)];
    setMessages(next);
    setInput("");
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3 sm:bottom-5 sm:right-5">
      {showGreeting && !isOpen && (
        <div className="pointer-events-auto w-[min(21rem,calc(100vw-2rem))] rounded-[1.75rem] border border-orange-200/90 bg-white/98 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.14)] backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-[0_12px_24px_rgba(249,115,22,0.22)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-slate-900">Hey, how can I help you?</p>
                <p className="text-sm leading-6 text-slate-600">
                  Ask about browsing, posting, messages, or how this marketplace works.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              onClick={() => {
                setShowGreeting(false);
                window.localStorage.setItem(WELCOME_STORAGE_KEY, "true");
              }}
              aria-label="Dismiss assistant greeting"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={handleOpen}>
              Open assistant
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowGreeting(false);
                window.localStorage.setItem(WELCOME_STORAGE_KEY, "true");
              }}
            >
              Maybe later
            </Button>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="pointer-events-auto flex h-[min(34rem,70vh)] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[2rem] border border-slate-200/90 bg-white/98 shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-200/80 bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/18">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Freecycle Buddy</p>
                <p className="text-xs text-orange-50/90">Marketplace help assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-full p-2 text-white/85 transition-colors hover:bg-white/12 hover:text-white"
                onClick={() => setIsOpen(false)}
                aria-label="Minimize assistant"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="rounded-full p-2 text-white/85 transition-colors hover:bg-white/12 hover:text-white"
                onClick={() => {
                  handleReset();
                  setIsOpen(false);
                }}
                aria-label="Close assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-[linear-gradient(180deg,rgba(255,247,237,0.5),rgba(255,255,255,0.95))] px-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-[88%] rounded-[1.5rem] px-4 py-3 text-sm leading-6 shadow-[0_10px_24px_rgba(15,23,42,0.07)]",
                  message.role === "assistant"
                    ? "rounded-bl-md border border-orange-100 bg-white text-slate-700"
                    : "ml-auto rounded-br-md bg-orange-500 text-white"
                )}
              >
                {message.role === "assistant" ? (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                      ol: ({ children }) => <ol className="mb-3 ml-5 list-decimal space-y-1 last:mb-0">{children}</ol>,
                      ul: ({ children }) => <ul className="mb-3 ml-5 list-disc space-y-1 last:mb-0">{children}</ul>,
                      li: ({ children }) => <li>{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
                      a: ({ children, href }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="break-all font-medium text-orange-600 underline underline-offset-2"
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  message.content
                )}
              </div>
            ))}

            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="rounded-full border border-orange-200 bg-orange-50 px-3 py-2 text-left text-xs font-medium text-orange-700 transition-colors hover:bg-orange-100"
                    onClick={() => void handleSend(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {sending && (
              <div className="max-w-[88%] rounded-[1.5rem] rounded-bl-md border border-orange-100 bg-white px-4 py-3 text-sm text-slate-500 shadow-[0_10px_24px_rgba(15,23,42,0.07)]">
                Thinking through that...
              </div>
            )}
          </div>

          <div className="border-t border-slate-200/80 bg-white/96 px-4 py-4">
            <div className="mb-3 flex items-center justify-between gap-3 text-xs text-slate-500">
              <button
                type="button"
                className="font-medium text-orange-600 transition-colors hover:text-orange-700"
                onClick={handleReset}
              >
                Reset chat
              </button>
            </div>
            <div className="flex items-end gap-2">
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void handleSend();
                  }
                }}
                placeholder="Ask about listings, posting, messages, or marketplace help..."
                className="min-h-[3.4rem] resize-none"
                disabled={sending}
              />
              <Button
                size="icon"
                className="h-[3.4rem] w-[3.4rem] rounded-[1.35rem]"
                onClick={() => void handleSend()}
                disabled={sending || input.trim().length === 0}
                aria-label="Send assistant message"
              >
                <SendHorizonal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-[1.75rem] bg-orange-500 text-white shadow-[0_18px_40px_rgba(249,115,22,0.28)] transition-all duration-300 hover:-translate-y-1 hover:bg-orange-600"
        onClick={() => {
          if (isOpen) {
            setIsOpen(false);
            return;
          }

          handleOpen();
        }}
        aria-label={isOpen ? "Close assistant" : "Open assistant"}
      >
        <MessageCircle className="h-7 w-7" />
      </button>
    </div>
  );
}
