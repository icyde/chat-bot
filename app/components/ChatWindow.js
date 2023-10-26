import React, { useState } from "react";
import Header from "./Header";
import FreshChat from "./FreshChat";

/* 
ChatWindow contains FreshChat component, which is to communicate with a live agent
showFreshChat enters/hides the chat-box with the live agent
*/

const ChatWindow = ({
  messages,
  setMessages,
  userId,
  setUserId,
  conversationId,
  setConversationId,
}) => {
  const [showFreshChat, setShowFreshChat] = useState(false);
  const handleFirstCardClick = () => {
    setShowFreshChat(!showFreshChat);
  };
  const handleBack = () => {
    handleFirstCardClick();
  };
  return (
    <div
      className={`fixed z-90 bottom-[84px]
     right-8 w-[75vw] h-[80vh] max-w-[405px] max-h-[650px] bg-[#F4F5F7] rounded-lg shadow-lg`}
    >
      <Header></Header>
      <FreshChat
        setMessages={setMessages}
        messages={messages}
        userId={userId}
        setUserId={setUserId}
        setConversationId={setConversationId}
        conversationId={conversationId}
      />
    </div>
  );
};

export default ChatWindow;

// (
//         <div title="body" className="flex align-center justify-center py-12">
//           <button
//             title="card"
//             onClick={handleFirstCardClick}
//             className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100"
//           >
//             <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 ">
//               FreshChat
//             </h5>
//             <p className="font-normal text-gray-700 ">
//               Click Here to chat with our live agents!
//             </p>
//           </button>
//         </div>
//       )
