import React, { useState } from 'react';
import Header from "./Header";
import FreshChat from "./FreshChat"


const ChatWindow = ({messages, setMessages}) => {
  const [showFreshChat, setShowFreshChat] = useState(false)
  const handleFirstCardClick = ()=>{
    setShowFreshChat(!showFreshChat)
  }
  const handleBack = () =>{
    handleFirstCardClick();
  }
  return (
    <div
      className={`fixed z-90 bottom-[84px]
     right-8 w-[405px] h-[650px] bg-[#F4F5F7] rounded-lg shadow-lg`}
    >
      <Header></Header>
      {showFreshChat ? (
        <FreshChat handleBack={handleBack} setMessages={setMessages} messages={messages}/>
      ) : (
        <div title="body" className="flex align-center justify-center py-12">
          <button
            title="card"
            onClick={handleFirstCardClick}
            class="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100"
          >
            <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 ">
              FreshChat
            </h5>
            <p class="font-normal text-gray-700 ">
              Click Here to chat with our live agents!
            </p>
          </button>
        </div>
      )}
    </div>
  );
}

export default ChatWindow;
