import React, { useState,useEffect } from 'react';
import Image from "next/image";
import {getGroup, getChannel, createUser, createConversation } from "../utils/api"

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

const FreshChat = ({handleBack, setMessages, messages}) => {
  const [input, setInput] = useState("")
  const [id, setId] = useState(0)
  const [userId, setUserId] = useState("")
  const [conversationId, setConversationId] = useState("")
  const [errors, setErrors] = useState("")
  const [message, setMessage] = useState({})

  useEffect(()=>{
    //Get the groupId(agent) and ChannelId for the conversation
    const fetchData = async () =>{
    const groupId = await getGroup(setErrors)
    const channelId = await getChannel(setErrors)
    setMessage((prev)=>({...prev, groupId: groupId, channelId: channelId}))}
    fetchData().catch(console.error)
  },[])

  const handleSubmit = async (e) =>{
    //submit input (chatbox)
    e.preventDefault();
    setMessages((prev)=>[...prev, {id: id,role:"user", content:input }])
    setId((prev)=> prev +1)
    if (userId === ""){
    //if user is not created, create new user and conversation
    const user = await createUser(setErrors);
    setUserId(user)
    const convoId = await createConversation(setErrors, {userId:user, channelId:message.channelId, groupId:message.groupId, message:input});
    setConversationId(convoId);
    }
    if (errors !== ""){
      //if errors from API, insert error message in messages
      setMessages((prev)=>[...prev, {id: id, role:"admin", content:errors}])
      setId((prev)=>prev+1)
    }
    setInput("");
  }
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
          ? messages.map((m) => (
              <div
                key={m.id}
                className={`rounded-2xl w-fit p-2  ${
                  m.role === "user" ? "bg-slate-300 ml-auto" : "bg-blue-950"
                }`}
              >
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
            autoFocus={true}
            className="w-full rounded-full px-4 py-1 text-gray-900 focus:outline-0"
          />
        </form>
      </div>
    </div>
  );
}

export default FreshChat;
