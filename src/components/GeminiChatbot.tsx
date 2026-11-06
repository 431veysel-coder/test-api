import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Sparkles,
  Zap,
  Shield,
  Cpu,
  Layers,
  Copy,
  Check,
  RotateCcw,
  Terminal,
  FolderGit2,
  Cloud,
} from "lucide-react";
import { ChatMessage } from "../types";

interface GeminiChatbotProps {
  onNavigateTab?: (tab: string) => void;
}

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({ onNavigateTab }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-1",
      role: "model",
      content:
        "Merhaba! Ben DroidCraft Çok Sağlayıcılı AI Mobil Mühendisiyim. Android 15 (API 35), NDK C++, Jetpack Compose, Gradle 8.7, modül sentezleme, GitHub hibrit derleme ve APK üretimi konularında size yardımcı olabilirim. Nasıl bir mobil uygulama üretmek istersiniz?",
      timestamp: "10:00",
      modelUsed: "gemini-3.8-flash",
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("architect");
  const [selectedProvider, setSelectedProvider] = useState<"gemini" | "claude" | "openai" | "deepseek" | "ollama">("gemini");
  const [selectedModel, setSelectedModel] = useState<string>("gemini-3.8-flash");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const providers = [
    { id: "gemini", name: "Google Gemini", badge: "Doğrudan Entegre (Yerel SDK)", color: "text-cyan-400" },
    { id: "claude", name: "Anthropic Claude", badge: "Claude 3.5 Sonnet Profili", color: "text-amber-400" },
    { id: "openai", name: "OpenAI GPT-4o", badge: "GPT-4o Kod Motoru Profili", color: "text-emerald-400" },
    { id: "deepseek", name: "DeepSeek V3", badge: "DeepSeek R1/V3 Profili", color: "text-indigo-400" },
    { id: "ollama", name: "Ollama (Yerel LLM)", badge: "localhost:11434 Proxy", color: "text-rose-400" },
  ];

  const roles = [
    {
      id: "architect",
      name: "Mobil Sistem Mimarı",
      desc: "Kotlin 2.0, Compose, Clean Architecture, Hilt",
      icon: Layers,
      defaultModel: "gemini-3.8-flash",
    },
    {
      id: "compiler",
      name: "Derleme & ProGuard Uzmanı",
      desc: "Gradle, R8 kuralları, DEX küçültme, AAPT2",
      icon: Cpu,
      defaultModel: "gemini-4-argon",
    },
    {
      id: "ui_engineer",
      name: "UI/UX & Modül Mühendisi",
      desc: "Animasyonlar, Material You, Dokunmatik",
      icon: Sparkles,
      defaultModel: "gemini-3.8-flash",
    },
    {
      id: "security_officer",
      name: "Keystore & Güvenlik Subayı",
      desc: "V2/V3/V4 imzalama, Play Integrity, Şifreleme",
      icon: Shield,
      defaultModel: "gemini-4-argon",
    },
  ];

  const models = [
    {
      id: "gemini-4-argon",
      name: "gemini-4-argon",
      badge: "Derin Mantık & Kod",
      desc: "Karmaşık görevler (ProGuard, NDK, mimari)",
    },
    {
      id: "gemini-3.8-flash",
      name: "gemini-3.8-flash",
      badge: "Genel Görevler",
      desc: "Hızlı, dengeli ve kapsamlı analiz",
    },
    {
      id: "gemini-3.1-flash-lite",
      name: "gemini-3.1-flash-lite",
      badge: "Ultra Hızlı",
      desc: "Kısa açıklamalar ve hızlı yanıtlar",
    },
  ];

  const quickPrompts = [
    "Android 15 için ProGuard / R8 kural örneği ver",
    "CameraX ile 60 FPS video kaydı için Kotlin kodunu yaz",
    "DEX 64K metod limitini aşmadan APK boyutunu nasıl %40 küçültürüm?",
    "V2 ve V3 APK imzalama farkı nedir?",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const promptText = (textToSend || input).trim();
    if (!promptText || isLoading) return;

    const userMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      role: "user",
      content: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Build conversation history for multi-turn chat
      const chatHistory = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatHistory,
          role: selectedRole,
          model: selectedModel,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Sunucu yanıt vermedi.");
      }

      const botReply: ChatMessage = {
        id: "msg-" + Date.now(),
        role: "model",
        content: data.reply || "Yanıt oluşturuldu.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: data.modelUsed || selectedModel,
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err: any) {
      const errorReply: ChatMessage = {
        id: "msg-err-" + Date.now(),
        role: "model",
        content: `Hata oluştu: ${err.message}. Lütfen Secrets panelinde geçerli bir GEMINI_API_KEY bulunduğundan emin olun.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: selectedModel,
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: "initial-new",
        role: "model",
        content: "Sohbet sıfırlandı. Yeni bir mobil mimari sorusu ile başlayabilirsiniz.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: selectedModel,
      },
    ]);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Control Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Role & Model Configuration (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-cyan-400" />
              <h2 className="font-bold text-slate-100 text-sm">
                Asistan Rolü & Model Ayarları
              </h2>
            </div>
            <button
              onClick={clearChat}
              className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
              title="Sohbeti Sıfırla"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Provider Profile Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Yapay Zeka Sağlayıcısı:</span>
              <span className="text-[10px] text-cyan-400 font-mono">Çoklu Sağlayıcı</span>
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {providers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProvider(p.id as any)}
                  className={`w-full p-2 rounded-xl border text-left transition-all flex items-center justify-between text-xs ${
                    selectedProvider === p.id
                      ? "border-cyan-500 bg-cyan-950/40 text-white shadow-sm"
                      : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <span className={`font-bold ${p.color}`}>{p.name}</span>
                  <span className="text-[9px] font-mono text-slate-400">{p.badge}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Model Selector (Strictly: gemini-4-argon, gemini-3.8-flash, gemini-3.1-flash-lite) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Yapay Zeka Modeli (Model Selector):
            </label>
            <div className="space-y-1.5">
              {models.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all ${
                    selectedModel === m.id
                      ? "border-cyan-500 bg-cyan-950/40 text-white shadow-md shadow-cyan-500/10"
                      : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs">{m.name}</span>
                    <span
                      className={`text-[10px] font-sans px-1.5 py-0.5 rounded ${
                        selectedModel === m.id
                          ? "bg-cyan-900/60 text-cyan-300"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {m.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Role Selector (System Instructions) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Asistan Rolü (System Instruction):
            </label>
            <div className="space-y-1.5">
              {roles.map((r) => {
                const Icon = r.icon;
                const isSelected = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedRole(r.id);
                      setSelectedModel(r.defaultModel);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-950/30 text-white shadow-md"
                        : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? "bg-indigo-500/20 text-indigo-400"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-slate-200">{r.name}</div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{r.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Hızlı İstek Şablonları:
            </span>
            <div className="space-y-1">
              {quickPrompts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="w-full text-left p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800/70 border border-slate-800/70 text-[11px] text-slate-300 transition-colors truncate"
                >
                  ⚡ {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Scrollable Chat Thread & Input (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col h-[680px] shadow-2xl overflow-hidden">
          {/* Chat Window Header */}
          <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-slate-200">
                {roles.find((r) => r.id === selectedRole)?.name}
              </span>
              <span className="text-slate-500">•</span>
              <span className="font-mono text-cyan-400 text-[11px]">
                {selectedModel}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Multi-Turn Aktif</span>
            </div>
          </div>

          {/* Scrollable Messages Thread */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    isUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                      isUser
                        ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/30"
                        : "bg-indigo-600/30 border border-indigo-500/40 text-indigo-300"
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-md space-y-1 relative group ${
                      isUser
                        ? "bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-tr-none"
                        : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 text-[10px] text-slate-400 mb-1">
                      <span>{isUser ? "Siz" : "Gemini Asistanı"}</span>
                      <div className="flex items-center gap-1.5">
                        {msg.modelUsed && (
                          <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-slate-950/60 text-cyan-300">
                            {msg.modelUsed}
                          </span>
                        )}
                        <span>{msg.timestamp}</span>
                        <button
                          onClick={() => copyMessage(msg.id, msg.content)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-white"
                          title="Kopyala"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="whitespace-pre-wrap leading-relaxed font-sans">
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-400 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] font-mono text-cyan-300 ml-1">
                    {selectedModel} düşünüyor...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-2">
            {onNavigateTab && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                <span className="text-slate-500 font-mono text-[10px] shrink-0">Hızlı Geçiş:</span>
                <button
                  type="button"
                  onClick={() => onNavigateTab("build")}
                  className="px-2 py-0.5 rounded bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/40 shrink-0 transition-colors flex items-center gap-1"
                >
                  <Cpu className="w-3 h-3" /> Derleme Motoru
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab("github")}
                  className="px-2 py-0.5 rounded bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-800/40 shrink-0 transition-colors flex items-center gap-1"
                >
                  <FolderGit2 className="w-3 h-3" /> GitHub Hibrit
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab("debian")}
                  className="px-2 py-0.5 rounded bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800/40 shrink-0 transition-colors flex items-center gap-1"
                >
                  <Terminal className="w-3 h-3" /> Linux OS (Debian/Ubuntu)
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab("firebase")}
                  className="px-2 py-0.5 rounded bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/40 shrink-0 transition-colors flex items-center gap-1"
                >
                  <Cloud className="w-3 h-3" /> Firebase & DB
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab("mcp")}
                  className="px-2 py-0.5 rounded bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-800/40 shrink-0 transition-colors flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" /> MCP & Ajanlar
                </button>
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Android mimarisi, Gradle hatası veya NDK hakkında soru sorun..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={`p-2.5 rounded-xl font-semibold transition-all ${
                  isLoading || !input.trim()
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-md shadow-cyan-500/20 active:scale-95"
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
