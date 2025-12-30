"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { MessageCircle, X, Send } from "lucide-react";
import { sendChatBot } from "../api/api";


export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const lastUserRef = useRef(null);

 

  
  const [messages, setMessages] = useState([
    { role: "bot", content: "안녕하세요! AI 면접 도우미입니다. 무엇을 도와드릴까요?" }
  ]);

  const [input, setInput] = useState("");

   useEffect(() => {
  lastUserRef.current?.scrollIntoView({
    behavior: "smooth",
    block: "end"
  });
}, [messages]);


const handleSend = async () => {
  if (!input.trim()) return;

  const userText = input;

  /* 1️⃣ 사용자 메시지 즉시 추가 */
  setMessages(prev => [
    ...prev,
    { role: "user", content: userText }
  ]);

  setInput("");

  /* 2️⃣ 로딩용 봇 메시지 */
  setMessages(prev => [
    ...prev,
    { role: "bot", content: "🤖 답변 생성 중입니다..." }
  ]);

  try {
    /* 3️⃣ 서버 호출 */
    const res = await sendChatBot(userText);

    const { reply, totalTokens } = res.data;
    console.log(totalTokens);
    

    /* 4️⃣ 로딩 메시지 제거 + 실제 답변 추가 */
    setMessages(prev => [
      ...prev.slice(0, -1),
      { role: "bot", content: reply }
    ]);

    // 필요하면 나중에 토큰 표시 가능
    // console.log("사용 토큰:", totalTokens);

  } catch (error) {
    console.error(error);

    /* 5️⃣ 에러 처리 */
    setMessages(prev => [
      ...prev.slice(0, -1),
      { role: "bot", content: "⚠️ 답변 생성 중 오류가 발생했습니다." }
    ]);
  }
};

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-primary hover:brightness-110 hover:shadow-xl active:scale-95 transition-all duration-200 z-[9999]"
        >
          <MessageCircle className="w-6 h-6" style={{color:"white"}} />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-xl flex flex-col z-[9999]">
          <CardHeader className="flex flex-row items-center justify-between bg-primary rounded-t-lg">
            <CardTitle className="primary font-semibold">AI 면접 도우미</CardTitle>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 primary hover:bg-secondary hover:text-secondary-foreground"
            >
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>

          {/* 메시지 영역 */}
          <CardContent className="flex-1 p-4 overflow-y-auto space-y-3">
  {messages.map((msg, i) => {
    const isLastUser =
      msg.role === "user" &&
      i === [...messages].map(m => m.role).lastIndexOf("user");

    return (
      <div
        key={i}
        ref={isLastUser ? lastUserRef : null}
        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`max-w-[75%] px-4 py-2 rounded-lg text-sm leading-relaxed
          ${msg.role === "user"
            ? "bg-primary primary"
            : "bg-page text-main border"
          }`}
        >
          {msg.content}
        </div>
      </div>
    );
  })}
</CardContent>

          {/* 입력창 */}
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}  // ⬅ onKeyPress X (React19 경고 제거)
                placeholder="메시지를 입력하세요..."
                className="flex-1"
              />
              <Button onClick={handleSend} size="icon" className="primary">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}
