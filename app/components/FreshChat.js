import React, { useState, useEffect } from "react";
import Image from "next/image";
import Typing from "./Typing";

/* 
Freshchat - communicate with live agents on freshchat
input: user input from text box
id: message id for mapping
handleSubmit: Submit user message from chatbot to freshchat system
messages: Message history that shows in chat app
message: message template containing groupId, channelId, and input, to create conversation
*/

//TODO: Post request: Create user, submit new message to agent, get and store userID.
//TODO: Set up webhooks to receive messages from agent
//TODO: Implement persistence(?) on refresh?

const FreshChat = ({ handleBack, setMessages, messages }) => {
  const [input, setInput] = useState("");
  const [id, setId] = useState(0);
  const [userId, setUserId] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [errors, setErrors] = useState("");
  const [message, setMessage] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const URL = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api`
    : "http://localhost:3000/api";

  // useEffect(() => {
  //   const eventSource = new EventSource(`/api/webhook`, {
  //     withCredentials: true,
  //   });
  //   eventSource.onopen = () => {
  //     console.log("open");
  //   };
  //   eventSource.onmessage = (e) => {
  //     console.log(e.data);
  //   };
  //   eventSource.onerror = (e) => {
  //     console.log(e);
  //   };

  //   return () => {
  //     eventSource.close();
  //   };
  // }, []);

  const handleSubmit = async (e) => {
    //submit input (chatbox)
    e.preventDefault();
    setIsTyping(true);
    setMessages((prev) => [...prev, { id: id, role: "user", content: input }]);
    setId((prev) => prev + 1);
    setInput("");
    await generateResponse(input);
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const generateResponse = async (message) => {
    try {
      await delay(0);
      const res = await fetch(`${URL}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: message }),
      });
      const data = await res.json();
      setIsTyping(false);
      console.log(data);
      setMessages((prev) => [
        ...prev,
        { id: id, role: "admin", content: data.response },
      ]);
      setId((prev) => prev + 1);
    } catch (e) {
      setIsTyping(false);
      setErrors(
        "Our chatbot is down at the moment. Please contact our hotline instead."
      );
      console.log(e);
    }
  };

  useEffect(() => {
    if (errors !== "") {
      setMessages((prev) => [...prev, { role: "admin", content: errors }]);
    }
  }, [errors, setMessages]);

  return (
    <div className="p-3 h-[87.5%] flex flex-col ">
      <div className="p-3 w-full flex-auto  bg-white border border-gray-200 rounded-lg shadow space-y-2 overflow-y-auto">
        <div className="border-b-2 pb-1 flex">
          <button
            onClick={handleBack}
            className="hover:bg-slate-200 rounded-full p-1 "
          >
            <Image
              src="/arrow-left.png"
              width={20}
              height={20}
              alt="back button"
            ></Image>
          </button>
          <span className="text-lg md:text-2xl pl-1 pt-0.5">Oyika Chatbot</span>
        </div>

        {messages.length > 0
          ? messages.map((m, index) => (
              <div
                key={index}
                className={`rounded-2xl w-fit p-2  ${
                  m.role === "user" ? "bg-slate-300 ml-auto" : "bg-main"
                }`}
              >
                <span>{m.role === "user" ? "👤" : "🤖"} </span>
                <span
                  className={m.role === "user" ? "text-blue-400" : "text-white"}
                >
                  {`: ${m.content}`}
                </span>
              </div>
            ))
          : ""}
        {isTyping && <Typing />}
      </div>
      <div className="mt-4">
        <form onSubmit={handleSubmit}>
          <input
            value={input}
            placeholder="Say something..."
            onChange={(e) => setInput(e.target.value)}
            autoFocus={true}
            className="w-full rounded-full px-4 py-1 text-gray-900 focus:outline-0"
          />
        </form>
      </div>
    </div>
  );
};

export default FreshChat;
