import { useState, useRef, useEffect } from "react";

import { Bot, User } from "lucide-react";

export default function Chat({ paperId }: { paperId: string }) {
  const [chatInteractions, setChatInteractions] = useState([
    {
      message:
        "Hi! I am Scholar AI chatbot. Ask me any questions related to this paper.",
      isBot: true,
    },
  ]);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fieldSetRef = useRef<HTMLFieldSetElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const handleChatQuestion = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();

      if (fieldSetRef.current !== null) {
        fieldSetRef.current.disabled = true;
      }

      setChatInteractions((previousInteractions) => [
        ...previousInteractions,
        { isBot: false, message: chatInputRef.current!.value },
        { isBot: true, message: "Loading" },
      ]);

      const res = await fetch("/api/askQuestion", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          question: chatInputRef.current!.value,
          paperId,
        }),
      });

      if (!res.ok)
        throw new Error("Something went wrong! Please try again later.");

      const aiMsg = await res.json();

      setChatInteractions((previousInteractions) => {
        const updatedChatInteractions = previousInteractions.map((msg, i) => {
          if (i === previousInteractions.length - 1) {
            return { ...msg, message: aiMsg?.msg };
          } else {
            return msg;
          }
        });
        return updatedChatInteractions;
      });

      chatInputRef.current!.value = "";

      if (fieldSetRef.current !== null) {
        fieldSetRef.current.disabled = false;
        // chatInputRef.current?.focus();
      }
    } catch (err) {
      let message: string;
      if (err instanceof Error) message = err.message;
      else message = String(err);
      setChatInteractions((previousInteractions) => {
        const updatedChatInteractions = previousInteractions.map((msg, i) => {
          if (i === previousInteractions.length - 1) {
            return {
              ...msg,
              message,
            };
          } else {
            return msg;
          }
        });
        return updatedChatInteractions;
      });
      if (fieldSetRef.current !== null) {
        fieldSetRef.current.disabled = false;
        // chatInputRef.current?.focus();
      }
    }
  };

  useEffect(() => {
    if (chatInteractions.length === 1) return;

    const scrollingElement = chatContainerRef?.current?.parentElement;
    // scrollingElement.scrollTop = scrollingElement.scrollHeight;
    scrollingElement?.scrollTo({
      top: scrollingElement.scrollHeight,
      behavior: "smooth",
    });
  }, [chatInteractions]);

  return (
    <div
      className="flex-1 max-sm:flex-none flex flex-col relative rounded-md text-sm"
      ref={chatContainerRef}
    >
      <div className="flex-1 flex flex-col gap-4 p-2">
        {chatInteractions.map((chat, i) => {
          return (
            <div
              key={i}
              className={`flex items-start gap-2 first:bg-gray-300 p-2 rounded-md ${
                chat.isBot ? "border" : ""
              }`}
            >
              {chat.isBot ? (
                <span>
                  <Bot size={20} />
                </span>
              ) : (
                <span>
                  <User size={20} />
                </span>
              )}
              {chat.message === "Loading" ? (
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="4" cy="12" r="3" fill="currentColor">
                      <animate
                        id="svgSpinners3DotsFade0"
                        fill="freeze"
                        attributeName="opacity"
                        begin="0;svgSpinners3DotsFade1.end-0.25s"
                        dur="0.75s"
                        values="1;.2"
                      />
                    </circle>
                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      fill="currentColor"
                      opacity=".4"
                    >
                      <animate
                        fill="freeze"
                        attributeName="opacity"
                        begin="svgSpinners3DotsFade0.begin+0.15s"
                        dur="0.75s"
                        values="1;.2"
                      />
                    </circle>
                    <circle
                      cx="20"
                      cy="12"
                      r="3"
                      fill="currentColor"
                      opacity=".3"
                    >
                      <animate
                        id="svgSpinners3DotsFade1"
                        fill="freeze"
                        attributeName="opacity"
                        begin="svgSpinners3DotsFade0.begin+0.3s"
                        dur="0.75s"
                        values="1;.2"
                      />
                    </circle>
                  </svg>
                </div>
              ) : (
                <p>{chat.message}</p>
              )}
            </div>
          );
        })}
      </div>
      <form
        className="sticky bottom-0 right-0 left-0 flex p-4 bg-[#eee]"
        onSubmit={handleChatQuestion}
      >
        <fieldset className="w-full flex" ref={fieldSetRef}>
          <input
            id="read-only"
            type="text"
            className="opacity-0 absolute -z-10"
            readOnly
          />
          <input
            id="question"
            type="text"
            placeholder="Ask any question about the paper"
            className="w-full rounded-md mr-2 px-2 disabled:bg-[#fff] disabled:opacity-50"
            ref={chatInputRef}
            required
          />

          <button
            type="submit"
            className="bg-[#121212] text-white rounded-md px-6 py-2 disabled:opacity-50"
          >
            Ask
          </button>
        </fieldset>
      </form>
    </div>
  );
}
