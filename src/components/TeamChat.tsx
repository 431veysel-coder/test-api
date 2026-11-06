import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  Send,
  Paperclip,
  FileCode,
  Download,
  Bot,
  User,
  Hash,
  Smile,
  CheckCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { TeamMessage } from "../types";

export const TeamChat: React.FC = () => {
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [activeChannel, setActiveChannel] = useState<string>("mobile-builds");
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    size: string;
    type: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const channels = [
    { id: "mobile-builds", name: "mobil-derleme-ci-cd", unread: 2 },
    { id: "architecture", name: "android-mimarisi", unread: 0 },
    { id: "release-logs", name: "play-store-surumleri", unread: 0 },
  ];

  const teamMembers = [
    { name: "Ahmet Yılmaz", role: "Mobile Lead", avatar: "👨‍💻", status: "online" },
    { name: "Zeynep Kaya", role: "DevOps & R8", avatar: "👩‍💻", status: "online" },
    { name: "Can Demir", role: "Backend Bridge", avatar: "🧑‍🚀", status: "idle" },
    { name: "DroidCraft AI Bot", role: "CI/CD Automator", avatar: "⚡", status: "bot" },
  ];

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !attachedFile) return;

    const payload = {
      content: inputText,
      sender: { name: "Ben", avatar: "👤", role: "Mobil Geliştirici" },
      fileAttachment: attachedFile || undefined,
    };

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
        setInputText("");
        setAttachedFile(null);

        // Auto trigger realistic response from CI Bot if mention
        if (payload.content.toLowerCase().includes("derle") || payload.content.toLowerCase().includes("apk")) {
          setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              {
                id: "msg-bot-" + Date.now(),
                sender: { name: "DroidCraft AI Bot", avatar: "⚡", role: "CI/CD Automator", isBot: true },
                content: "Mesajınız algılandı. Bulut derleme motoru kuyruğu incelendi: Worker düğümleri hazır. Derleme Motoru sekmesinden tetikleyebilirsiniz.",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              },
            ]);
          }, 1200);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const simulateAttachApk = () => {
    setAttachedFile({
      name: "release-v2.4.1-signed.apk",
      size: "11.2 MB",
      type: "application/vnd.android.package-archive",
    });
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-100 text-sm md:text-base">
              Ekip İçi Anlık Mesajlaşma & Dosya/Artifact Paylaşımı
            </h2>
            <p className="text-slate-400 text-xs">
              Yazılım ekibiyle anlık kod, APK paketleri, crash logları ve tasarım varlıklarını paylaşın.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>WebSocket / WebRTC Mesh Aktif</span>
        </div>
      </div>

      {/* Main 2-Column Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[640px]">
        {/* Left: Channels & Team Members (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg overflow-y-auto">
          <div className="space-y-4">
            {/* Channels */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Kanallar ({channels.length})
              </span>
              <div className="space-y-1">
                {channels.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChannel(ch.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium transition-all ${
                      activeChannel === ch.id
                        ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Hash className="w-3.5 h-3.5" />
                      <span>{ch.name}</span>
                    </div>
                    {ch.unread > 0 && (
                      <span className="w-4 h-4 rounded-full bg-cyan-500 text-black font-bold text-[10px] flex items-center justify-center">
                        {ch.unread}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Team Members List */}
            <div className="pt-3 border-t border-slate-800/80">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Aktif Ekip Üyeleri ({teamMembers.length})
              </span>
              <div className="space-y-2">
                {teamMembers.map((member, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/40 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <span className="text-base">{member.avatar}</span>
                        <span
                          className={`w-2 h-2 rounded-full absolute -bottom-0.5 -right-0.5 border border-slate-900 ${
                            member.status === "online"
                              ? "bg-emerald-400"
                              : member.status === "bot"
                              ? "bg-cyan-400"
                              : "bg-amber-400"
                          }`}
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200">{member.name}</div>
                        <div className="text-[10px] text-slate-500">{member.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick attach shortcut */}
          <div className="pt-3 border-t border-slate-800/80">
            <button
              onClick={simulateAttachApk}
              className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-cyan-400 hover:bg-slate-800/60 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span>Son APK Paketini Ekle</span>
            </button>
          </div>
        </div>

        {/* Right: Messages Thread & Input (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
          {/* Channel Header */}
          <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <Hash className="w-4 h-4 text-cyan-400" />
              <span>{channels.find((c) => c.id === activeChannel)?.name}</span>
            </div>
            <span className="text-slate-500 text-[11px]">4 Katılımcı</span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => {
              const isMe = msg.sender.name === "Ben";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    isMe ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                      msg.sender.isBot
                        ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300"
                        : "bg-slate-800"
                    }`}
                  >
                    {msg.sender.avatar}
                  </div>

                  <div
                    className={`max-w-[80%] rounded-2xl p-3.5 text-xs shadow-md space-y-1.5 ${
                      isMe
                        ? "bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-tr-none"
                        : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 mb-0.5">
                      <span className="font-semibold text-slate-300">
                        {msg.sender.name} ({msg.sender.role})
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                    {/* File Attachment Card */}
                    {msg.fileAttachment && (
                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2 mt-2">
                        <div className="flex items-center gap-2 truncate">
                          <FileCode className="w-5 h-5 text-cyan-400 shrink-0" />
                          <div className="truncate">
                            <div className="font-semibold text-[11px] text-slate-200 truncate">
                              {msg.fileAttachment.name}
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {msg.fileAttachment.size}
                            </span>
                          </div>
                        </div>

                        <a
                          href="#download-attachment"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
                          title="İndir"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Pending Attached File Banner */}
          {attachedFile && (
            <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-cyan-300">
              <div className="flex items-center gap-2">
                <Paperclip className="w-3.5 h-3.5" />
                <span>Eklendi: {attachedFile.name} ({attachedFile.size})</span>
              </div>
              <button
                onClick={() => setAttachedFile(null)}
                className="text-slate-400 hover:text-white"
              >
                ×
              </button>
            </div>
          )}

          {/* Message Input Box */}
          <div className="p-3 bg-slate-900 border-t border-slate-800">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <button
                type="button"
                onClick={simulateAttachApk}
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
                title="Dosya veya APK Ekle"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Mesajınızı yazın veya @bot çağırın..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />

              <button
                type="submit"
                disabled={!inputText.trim() && !attachedFile}
                className={`p-2.5 rounded-xl font-semibold transition-all ${
                  !inputText.trim() && !attachedFile
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
