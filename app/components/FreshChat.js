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
  const [answerFound, setAnswerFound] = useState(true);
  const CHATBOT_URL = "http://localhost:5000/api";
  const ZENDESK_URL = "http://localhost:8000/api";
  const containerRef = useRef(null);

  const generateResponse = async (message) => {
    //FROM CHATBOT
    try {
      const res = await fetch(`${CHATBOT_URL}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: message }),
      });
      const data = await res.json();
      console.log(data);
      setIsTyping(false);
      if (data.is_answer_found === 0) {
        //Trigger Zendesk agent button
        setAnswerFound(false);
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "admin",
          content: data.response,
          name: "Oyika bot",
          dateTime: new Date().toLocaleString([], {
            dateStyle: "short",
            timeStyle: "short",
          }),
        },
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
      const encodedMobile = encodeURIComponent(email);
      console.log(encodedMobile);
      const res = await fetch(
        `${ZENDESK_URL}/getConversation/${encodedMobile}`
      );
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
            {
              role: "admin",
              content: newMsg.content,
              name: newMsg.senderName,
              dateTime: convertDateFormat(newMsg.dateTime),
            },
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
    console.log(message, userId, conversationId);
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
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: input,
        name: email,
        dateTime: new Date().toLocaleString([], {
          dateStyle: "short",
          timeStyle: "short",
        }),
      },
    ]);
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
    if (email === "") {
      setErrors("Please enter a valid email");
      return;
    }
    setEmailSent(true);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: email, name: email, dateTime: "" },
    ]);
    try {
      const oldConversationId = await getConversationId(email);
      console.log(oldConversationId);
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
        const name = message.author.displayName;
        const contentType = message.content.type;
        const dateTime = convertDateFormat(message.received);
        let content = "";
        if (contentType === "text") {
          content = message.content.text;
        } else {
          content = "Unsupported content type";
        }

        //TODO: Implement other content types
        return { role: role, content: content, name: name, dateTime: dateTime };
      });
      setMessages((prev) => [...prev, ...history]);
    } catch (error) {
      console.error("Get messages Error:", error);
    }
  };

  function convertDateFormat(dateStr) {
    const date = new Date(dateStr);
    const options = {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  }

  useEffect(() => {
    if (conversationId !== "") {
      connectToWebsocket(conversationId);
    }
  }, [connectToWebsocket, conversationId]);

  useEffect(() => {
    if (errors !== "") {
      setMessages((prev) => [
        ...prev,
        { role: "admin", content: errors, name: "System", dateTime: "" },
      ]);
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
    <div className="p-3 h-[87.5%] flex flex-col">
      {/* Card layout*/}
      <div
        ref={containerRef}
        className="p-3 w-full flex flex-col flex-1 bg-white border border-gray-200 rounded-lg shadow space-y-2 overflow-y-auto no-overflow-anchoring"
      >
        <div className="flex flex-col flex-1 justify-between">
          <div>
            <div className="border-b-2 pb-1">
              <span className="text-lg md:text-2xl pl-1 pt-0.5">
                Oyika Chat
              </span>
            </div>
            <div className="pt-1 pb-0 mb-0 text-center text-sm">
              {new Date().toLocaleString([], {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </div>
            {messages.length > 0 ? (
              messages.map((m, index) => (
                <div key={index}>
                  <div
                    className={`rounded-2xl w-fit max-w-[90%] p-2 mt-2  ${
                      m.role === "user" ? "bg-slate-300 ml-auto" : "bg-main"
                    }`}
                  >
                    <span
                      className={`whitespace-pre-wrap ${
                        m.role === "user" ? "text-blue-400" : "text-slate-200"
                      }`}
                    >
                      {m.content}
                    </span>
                  </div>
                  <div
                    className={`w-fit text-xs px-2
                      ${m.role === "user" ? "ml-auto " : ""}
                    `}
                  >
                    {`${m.role === "user" ? "You" : m.name} ${m.dateTime}`}
                  </div>
                </div>
              ))
            ) : (
              <></>
            )}
            {emailSent === false ? (
              <div className="ml-auto border w-[80%] p-2 mt-2 rounded-md border-gray-300">
                <form onSubmit={handleSubmitEmail} className="flex flex-col">
                  <label className="pl-2">Mobile</label>
                  <input
                    required
                    placeholder="+6591234567"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus={true}
                    className="rounded-xl py-1 my-1 pl-2 text-gray-900 focus:outline-0 border-gray-400 border block"
                  />
                  <button
                    onClick={handleSubmitEmail}
                    className="ml-auto border rounded-full bg-main text-slate-200 py-1 px-2"
                  >
                    Send
                  </button>
                </form>
              </div>
            ) : (
              <></>
            )}
            {isTyping && <Typing />}
          </div>

          {isChatbot && !answerFound && (
            <button
              onClick={(e) => {
                setIsChatbot(false);
                setMessages((prev) => [
                  ...prev,
                  {
                    role: "admin",
                    content:
                      "Connecting to live agent... Please type your question again, thank you!",
                    name: "Oyika bot",
                    dateTime: new Date().toLocaleString([], {
                      dateStyle: "short",
                      timeStyle: "short",
                    }),
                  },
                ]);
              }}
              className="hover:bg-slate-200 text-gray-600 px-2 rounded-lg w-fit border border-slate-400 my-1"
            >
              Contact Live Agent
            </button>
          )}
          {!isChatbot && historyExist ? (
            <button
              onClick={handleRestoreHistory}
              className="hover:bg-slate-200 text-gray-600 px-2 mt-1 rounded-lg w-fit border border-gray-300 mb-1 outline-gray-400 "
            >
              Restore history
            </button>
          ) : (
            <></>
          )}
        </div>
      </div>
      <div className="mt-2">
        <form onSubmit={handleSubmit}>
          <input
            value={input}
            disabled={emailSent === false || isTyping}
            placeholder="Type a message..."
            onChange={(e) => setInput(e.target.value)}
            autoFocus={true}
            className="w-full rounded-full px-4 py-1 text-gray-900 focus:outline-0 border disabled:bg-slate-300 placeholder:disabled:text-slate-400"
          />
        </form>
      </div>
    </div>
  );
};

export default FreshChat;
