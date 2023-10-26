"use client";
import Image from "next/image";
import { useState } from "react";
import ChatWidget from "./components/ChatWidget";

/* Home page contains ChatWindow component which is the container for the whole chat window
   showModal shows/hides the chat window
   messages stores the chat history.   
*/
export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [isChatbot, setIsChatbot] = useState(true);
  const [conversationId, setConversationId] = useState("");
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content: "Need help? Chat with our specialist bot now!",
      name: "Oyika bot",
      dateTime: "",
    },
  ]);

  const handleButton = () => {
    showModal ? hide() : show();
    setShowModal(!showModal);
  };

  const hide = () => {
    window.parent.postMessage("hide", "*");
  };

  const show = () => {
    window.parent.postMessage("show", "*");
  };

  return (
    <div>
      {showModal ? (
        <ChatWidget
          messages={messages}
          setMessages={setMessages}
          email={email}
          setEmail={setEmail}
          conversationId={conversationId}
          setConversationId={setConversationId}
          isChatbot={isChatbot}
          setIsChatbot={setIsChatbot}
          socket={socket}
          setSocket={setSocket}
        />
      ) : (
        <></>
      )}
      <button
        onClick={handleButton}
        id="chatbot-button"
        className={`bg-[#2d549f] hover:bg-blue-600 font-bold rounded-full ${
          !showModal ? "p-2" : "p-3"
        } fixed z-90 bottom-10 right-8`}
      >
        {!showModal ? (
          <Image src="/chat.png" alt="chat icon" width={25} height={25}></Image>
        ) : (
          <Image
            src="/close.png"
            alt="close icon"
            width={15}
            height={15}
          ></Image>
        )}
      </button>
    </div>
  );
}
