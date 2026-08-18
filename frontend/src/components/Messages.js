import React, {
  useEffect,
  useState
} from "react";

import axios from "axios";

import ChatBox from "./ChatBox";

import "../App.css";

function Messages() {

  const user =
    JSON.parse(
      localStorage.getItem("user")
    );

  const [conversations,
    setConversations] =
    useState([]);

  const [selectedChat,
    setSelectedChat] =
    useState(null);

  // 🔄 FETCH CONVERSATIONS
  useEffect(() => {

    fetchConversations();

  }, []);

  const fetchConversations = () => {

    axios.get(
      "http://localhost:5000/api/messages/all"
    )

    .then((res) => {

      // ✅ FILTER USER CHATS
      const myChats =
        res.data.filter(

          (msg) =>

            msg.sender ===
              user.email ||

            msg.receiver ===
              user.email

        );

      // ✅ UNIQUE CHATS
      const uniqueChats =
        Array.from(

          new Map(

            myChats.map((chat) => [

              chat.productId +
              chat.sender +
              chat.receiver,

              chat

            ])

          ).values()

        );

      setConversations(
        uniqueChats
      );

    })

    .catch((err) => {

      console.log(err);

    });

  };

  return (

    <div className="messages-page fade-in">

      {/* 📩 SIDEBAR */}
      <div className="messages-sidebar">

        <div className="messages-header">

          <h2>
            Messages 💬
          </h2>

          <p>
            Your conversations
          </p>

        </div>

        {conversations.length === 0 ? (

          <div className="no-conversation">

            <h3>
              No Conversations Yet
            </h3>

          </div>

        ) : (

          conversations.map((chat) => {

            const otherUser =

              chat.sender ===
              user.email

              ? chat.receiver

              : chat.sender;

            return (

              <div

                key={chat._id}

                className={

                  selectedChat?._id ===
                  chat._id

                  ? "conversation-item active-conversation"

                  : "conversation-item"

                }

                onClick={() =>
                  setSelectedChat(chat)
                }

              >

                {/* 👤 AVATAR */}
                <div className="conversation-avatar">

                  {

                    otherUser
                    ?.charAt(0)
                    .toUpperCase()

                  }

                </div>

                {/* 💬 DETAILS */}
                <div className="conversation-details">

                  <h4>
                    {otherUser}
                  </h4>

                  <p>

                    Product:
                    {" "}

                    {

                      chat.productId
                      ?.slice(0, 8)

                    }

                    ...

                  </p>

                </div>

              </div>

            );

          })

        )}

      </div>

      {/* 💬 CHAT AREA */}
      <div className="messages-chat">

        {selectedChat ? (

          <ChatBox

            product={{
              _id:
                selectedChat.productId
            }}

            ownerEmail={

              selectedChat.sender ===
              user.email

              ? selectedChat.receiver

              : selectedChat.sender

            }

          />

        ) : (

          <div className="empty-chat">

            <div className="empty-chat-box">

              <h1>
                💬
              </h1>

              <h2>
                Select a Conversation
              </h2>

              <p>

                Start chatting with
                product owners and
                renters here.

              </p>

            </div>

          </div>

        )}

      </div>

    </div>

  );

}

export default Messages;