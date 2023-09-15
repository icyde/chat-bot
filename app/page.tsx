"use client";
import Image from "next/image";
import ChatWindow from "./components/ChatWindow"
import { useState } from "react";



export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [messages, setMessages] = useState([]);

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
        <ChatWindow messages={messages} setMessages={setMessages} />
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
