"use client";
import Image from "next/image";
import ChatWindow from "./ChatWindow"
import { useState } from "react";
import { useChat } from "ai/react";
import mockMessages from "./mockMessages.js"


export default function Home() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const [showModal, setShowModal] = useState(false)
  const handleButton = () => {
    setShowModal(!showModal);
  };

  const mockSubmit = () =>{
    return;
  }
  return (
    <div className="w-screen h-screen">
      {showModal ? (
      <ChatWindow/>) : (
        <></>
      )}
      <button
        onClick={handleButton}
        className="bg-[#2d549f] hover:bg-blue-600 font-bold rounded-full p-2 fixed z-90 bottom-10 right-8"
      >
        <Image src="/chat.png" alt="chat icon" width={25} height={25}></Image>
      </button>
    </div>
  );
}
