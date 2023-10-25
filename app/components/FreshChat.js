import React, { useState, useEffect, useRef, useCallback } from "react";
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

//TODO: Implement persistence(?) on refresh?

const FreshChat = ({ handleBack, setMessages, messages }) => {
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [errors, setErrors] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isChatbot, setIsChatbot] = useState(true);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [historyExist, setHistoryExist] = useState(false);
  const CHATBOT_URL = "http://localhost:5000/api";
  const ZENDESK_URL = "http://localhost:8000/api";
  const containerRef = useRef(null);

  const generateResponse = async (message) => {
    //FROM CHATBOT
    try {
      const res = await fetch(`${ZENDESK_URL}/query`, {
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
        { role: "admin", content: data.latest_response },
      ]);
    } catch (e) {
      setIsTyping(false);
      setErrors(
        "Our chatbot is down at the moment. Please contact our hotline instead."
      );
      console.log(e);
    }
  };

  const getUserId = async (email) => {
    try {
      const res = await fetch(`${ZENDESK_URL}/getUser/${email}`);
      const data = await res.json();
      if (data.errors) {
        return null;
      }
      return data.user.id;
    } catch (error) {
      console.error("Get user Id Error:", error);
    }
  };

  const getConversationId = async (email) => {
    try {
      const res = await fetch(`${ZENDESK_URL}/getConversation/${email}`);
      const data = await res.json();
      if (data.errors) {
        return null;
      }
      return data.conversations[0].id;
    } catch (error) {
      console.error("Get conversation Error:", error);
    }
  };

  const initConversation = async (message) => {
    //FROM ZENDESK
    try {
      const res = await fetch(`${ZENDESK_URL}/initConversation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          content: message,
        }),
      });
      const data = await res.json();
      setConversationId(data.conversationId);
      setUserId(data.userId);
    } catch (e) {
      console.error(e);
      setErrors(
        "Our live chat is down at the moment. Please contact us at our hotline instead."
      );
    }
  };

  const connectToWebsocket = useCallback(
    //TODO: CREATE WEBSOCKET IF CONVERSATIONID EXISTS
    (conversationId) => {
      let ws = new WebSocket(`ws://localhost:8000/ws/${conversationId}`);
      ws.onmessage = (msg) => {
        const newMsg = JSON.parse(msg.data);
        if (
          newMsg.conversationId === conversationId &&
          newMsg.contentType === "text" &&
          newMsg.senderType === "business"
        ) {
          setMessages((prev) => [
            ...prev,
            { role: "admin", content: newMsg.content },
          ]);
        }
      };
      ws.onerror = (error) => {
        console.error(error);
      };
    },
    [setMessages]
  );

  const sendMessage = async (message) => {
    try {
      const res = await fetch(`${ZENDESK_URL}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: message,
          userId: userId,
          conversationId: conversationId,
        }),
      });
      const data = await res.json();
      setConversationId(data.conversationId);
      setUserId(data.userId);
    } catch (e) {
      console.error(e);
      setErrors(
        "Our live chat is down at the moment. Please contact us at our hotline instead."
      );
    }
  };

  const getMessages = async (conversationId) => {
    try {
      const res = await fetch(`${ZENDESK_URL}/getMessages/${conversationId}`);
      return res;
    } catch (error) {
      console.error("Get messages Error:", error);
    }
  };

  const handleSubmit = async (e) => {
    //submit input (chatbox)
    e.preventDefault();
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setInput("");
    if (isChatbot) {
      setIsTyping(true);
      await generateResponse(input);
    } else if (conversationId === "") {
      //initialize conversation
      await initConversation(input);
    } else {
      //send message to agent
      await sendMessage(input);
    }
  };

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    setEmailSent(true);
    setMessages((prev) => [{ role: "user", content: email }]);
    try {
      const oldConversationId = await getConversationId(email);
      if (oldConversationId !== null) {
        setConversationId(oldConversationId);
        const oldUserId = await getUserId(email);
        setUserId(oldUserId);
        setHistoryExist(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRestoreHistory = async (e) => {
    setHistoryExist(false);
    try {
      const data = await getMessages(conversationId);
      const res = await data.json();
      const history = res.messages.map((message) => {
        const role = message.author.type === "user" ? "user" : "admin";
        const contentType = message.content.type;
        let content = "";
        if (contentType === "text") {
          content = message.content.text;
        } else {
          content = "Unsupported content type";
        }

        //TODO: Implement other content types
        return { role: role, content: content };
      });
      setMessages((prev) => [...prev, ...history]);
    } catch (error) {
      console.error("Get messages Error:", error);
    }
  };

  useEffect(() => {
    if (conversationId !== "") {
      connectToWebsocket(conversationId);
    }
  }, [connectToWebsocket, conversationId]);

  useEffect(() => {
    if (errors !== "") {
      setMessages((prev) => [...prev, { role: "admin", content: errors }]);
    }
  }, [errors, setMessages]);

  useEffect(() => {
    if (containerRef && containerRef.current) {
      const element = containerRef.current;
      element.scroll({
        top: element.scrollHeight,
        left: 0,
        behavior: "smooth",
      });
    }
  }, [containerRef, messages]);

  return (
    <div className="p-3 h-[87.5%] flex flex-col ">
      <div
        ref={containerRef}
        className="p-3 w-full flex-auto  bg-white border border-gray-200 rounded-lg shadow space-y-2 overflow-y-auto no-overflow-anchoring"
      >
        <div className="border-b-2 pb-1 flex justify-between">
          <span className="text-lg md:text-2xl pl-1 pt-0.5">Oyika Chat</span>
          {isChatbot && (
            <button
              onClick={(e) => setIsChatbot(false)}
              className="hover:bg-slate-200 text-gray-600 px-2 rounded-lg w-fit outline mb-1 outline-gray-400 "
            >
              Contact Live Agent
            </button>
          )}
          {!isChatbot && historyExist ? (
            <button
              onClick={handleRestoreHistory}
              className="hover:bg-slate-200 text-gray-600 px-2 rounded-lg w-fit outline mb-1 outline-gray-400 "
            >
              Restore history
            </button>
          ) : (
            ""
          )}
        </div>
        {emailSent === false ? (
          <form onSubmit={handleSubmitEmail}>
            <label>Email:</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus={true}
              className="w-[75%] rounded-xl px-4 py-1 text-gray-900 focus:outline-0 border block"
            />
          </form>
        ) : (
          ""
        )}

        {messages.length > 0
          ? messages.map((m, index) => (
              <div
                key={index}
                className={`rounded-2xl w-fit p-2 max-w-[90%] ${
                  m.role === "user" ? "bg-slate-300 ml-auto" : "bg-main"
                }`}
              >
                <span>{m.role === "user" ? "👤" : "🤖"} </span>
                <span
                  className={`whitespace-pre-line ${
                    m.role === "user" ? "text-blue-400" : "text-white"
                  }`}
                >
                  {": " + m.content}
                </span>
              </div>
            ))
          : ""}
        {isTyping && <Typing />}
      </div>
      <div className="mt-2">
        <form onSubmit={handleSubmit}>
          <input
            value={input}
            disabled={emailSent === false}
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
