
import { ChatMessage } from "~/components/ChatMessage"
import { Button } from "~/components/ui/button"
import { Textarea } from "~/components/ui/textarea"
import { useState } from "react";
import { Menu } from "lucide-react";
import ollama from "ollama";
import { ThoughtMessage } from "~/components/ThoughtMessage";
import { useParams } from "react-router";
import { db } from "~/lib/dexie";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const chatHistory: Message[] = [
  { role: "assistant", content: "Hello! How can I assist you today?" },
  { role: "user", content: "Can you explain what React is?" },
  {
    role: "assistant",
    content:
      "React is a popular JavaScript library for building user interfaces. It was developed by Facebook and is widely used for creating interactive, efficient, and reusable UI components. React uses a virtual DOM (Document Object Model) to improve performance by minimizing direct manipulation of the actual DOM. It also introduces JSX, a syntax extension that allows you to write HTML-like code within JavaScript.",
  },
];

const ChatPages = () => {
  const [messageInput, setMessageInput] = useState("");
  const [streamedMessage, setStreamedMessage] = useState("");
  const [streamedThought, setStreamedThought] = useState("");

  const params = useParams();

  const handleSubmit = async () => {
    await db.createMessage({
      content: messageInput,
      role: "user",
      thought: "",
      thread_id: params.threadId as string,
    })

    const stream = await ollama.chat({
      model: "deepseek-r1:1.5b",
      messages: [
        {
          role: "user",
          content: messageInput.trim(),
        },
      ],
      stream: true,
    })

    let fullContent = "";
    let fullThought = "";

    //two output mode
    // 1. though output
    // 2. message
    let OutputMode: "think" | "response" = "think";

    for await (const part of stream) {
      const messageContent = part.message.content;

      if (OutputMode === "think") {
        if (!(messageContent.includes("<think>") || messageContent.includes("</think>"))) {
          fullThought += messageContent;
        }
        setStreamedThought(fullThought);

        if (messageContent.includes("</think>")) {
          OutputMode = "response";
        }

      } else {
        fullContent += messageContent;
        setStreamedMessage(fullContent);
      }
    }

    await db.createMessage({
      content : fullContent,
      role: "assistant",
      thought: fullThought,
      thread_id: params.threadId as string,
    })
  };

  return (
    <div className="flex flex-col flex-1">
      <header className="flex items-center px-4 h-16 border-b">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
        >
          <Menu />
        </Button>
        <h1 className="text-xl font-bold ml-4">AI Chat Dashboard</h1>
      </header>
      <main className="flex-1 overflow-auto p-4 w-full">
        <div className="mx-auto space-y-4 pb-20 max-w-screen-md">
          {chatHistory.map((message, index) => (
            <ChatMessage
              key={index}
              role={message.role}
              content={message.content}
            />
          ))}
          {
            !!streamedThought && (
              <ThoughtMessage thought={streamedThought} />
            )
          }
          {
            !!streamedMessage && (
              <ChatMessage
                role="assistant"
                content={streamedMessage}
              />
            )
          }
        </div>
      </main>
      <footer className="border-t p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Textarea
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            className="flex-1"
            placeholder="Type your message here..."
            rows={5}
          />
          <Button onClick={handleSubmit} type="button">
            Send
          </Button>
        </div>
      </footer>
    </div>
  )
}

export default ChatPages
