import React, { useState } from 'react';
import Image from "next/image";


const FreshChat = ({handleBack}) => {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([])
  const [id, setId] = useState(0)
  const handleSubmit = (e) =>{
    e.preventDefault();
    setMessages((prev)=>[...prev, {id: id,role:"user", content:input }])
    setInput("");
    setId((prev)=> prev +1)
  }

  return (
    <div className="p-6 h-full flex flex-col ">
      <div className="p-3 w-full h-5/6 bg-white border border-gray-200 rounded-lg shadow space-y-2 overflow-y-auto">
        <div className="border-b-2 pb-1 flex">
          <button onClick={handleBack} className="hover:bg-slate-200 rounded-full p-1 ">
            <Image
              src="/arrow-left.png"
              width={20}
              height={20}
              className=""
            ></Image>
          </button>
          <span className="text-xl pl-1 pt-0.5">Oyika Chatbot</span>
        </div>

        {messages.length > 0
          ? messages.map((m) => (
              <div key={m.id}>
                <span>{m.role === "user" ? "👤" : "🤖"}: </span>
                <span className={m.role === "user" ? "text-blue-400" : ""}>
                  {m.content}
                </span>
              </div>
            ))
          : ""}
      </div>
      <div className="mt-4">
        <form onSubmit={handleSubmit}>
          <input
            value={input}
            placeholder="Say something..."
            onChange={(e) => setInput(e.target.value)}
            className="w-full rounded-full px-4 py-1 text-gray-900 focus:outline-0 "
          />
        </form>
      </div>
    </div>
  );
}

export default FreshChat;
