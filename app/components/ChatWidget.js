import React, { useState } from "react";
import Header from "./Header";
import ChatWindow from "./ChatWindow";

/* 
ChatWindow contains ChatWindow component, which is to communicate with a live agent
showChatWindow enters/hides the chat-box with the live agent
*/

const ChatWidget = ({
  messages,
  setMessages,
  email,
  setEmail,
  conversationId,
  setConversationId,
  isChatbot,
  setIsChatbot,
  socket,
  setSocket,
}) => {
  return (
    <div
      className={`fixed z-90 bottom-[84px]
     right-8 w-[75vw] h-[80vh] max-w-[405px] max-h-[650px] bg-[#F4F5F7] rounded-lg shadow-lg`}
    >
      <Header></Header>
      <ChatWindow
        setMessages={setMessages}
        messages={messages}
        email={email}
        setEmail={setEmail}
        conversationId={conversationId}
        setConversationId={setConversationId}
        isChatbot={isChatbot}
        setIsChatbot={setIsChatbot}
        socket={socket}
        setSocket={setSocket}
      />
    </div>
  );
};

export default ChatWidget;

// (
//         <div title="body" className="flex align-center justify-center py-12">
//           <button
//             title="card"
//             onClick={handleFirstCardClick}
//             className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100"
//           >
//             <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 ">
//               ChatWindow
//             </h5>
//             <p className="font-normal text-gray-700 ">
//               Click Here to chat with our live agents!
//             </p>
//           </button>
//         </div>
//       )
