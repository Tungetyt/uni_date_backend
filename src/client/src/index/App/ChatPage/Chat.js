import React, { useContext, useEffect, useState } from "react";
import {
  Avatar,
  ChatContainer,
  ConversationHeader,
  MainContainer,
  Message,
  MessageInput,
  MessageList,
} from "@chatscope/chat-ui-kit-react";
import { createMessage, getMessages } from "../../shared/api";
import { LoadingContext } from "../../shared/loadingContext";
import { MatchesContext } from "../../shared/matchesContext";
import PlaceHolder from "../shared/Missing_avatar.svg";
import { socket } from "../../shared/socket";
import { UserContext } from "../../shared/userContext";
import {IncomingMessagesContext} from "../../shared/incomingMessagesContext";

const Chat = ({ passiveSideUserId }) => {
  const [isLoading, setIsLoading] = useContext(LoadingContext);
  const [matches, setMatches] = useContext(MatchesContext);
  const [user] = useContext(UserContext);

  const [incomingMessages, setIncomingMessages] = useContext(IncomingMessagesContext);
  // useEffect(() => {
  //   let mounted = true;
  //   socket.on("private_chat", function (newIncomingMessage) {
  //     alert("test", newIncomingMessage);
  //
  //     setIncomingMessages((prevIncomingMessages) => {
  //       return [...prevIncomingMessages, newIncomingMessage];
  //     });
  //   });
  //   return () => {
  //     mounted = false;
  //   };
  // }, []);

  useEffect(() => {
      setIncomingMessages((prevIncomingMessages) => {
        return prevIncomingMessages.filter(im => im.senderUserId !== passiveSideUserId);
      });
  }, []);

    useEffect(() => {
    let mounted = true;

    // if (checkIfProfilesAlreadyFetched()) {
    //     return;
    // }

    setIsLoading(true);

    getMessages(passiveSideUserId)
      .then((res) => {
        const { data } = res;
        if (!data) {
          return;
        }

        const index = matches.findIndex((p) => p.id === passiveSideUserId);
        matches[index].messages = data;
        setMatches(matches);
      })
      .catch((e) => {})
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);
  const [outgoingMessages, setOutgoingMessages] = useState([]);

  const handleSend = (content) => {
    createMessage(passiveSideUserId, content)
      .then(() => {
        socket.emit("private_chat", {
          senderUserId: user.id,
          passiveSideUserId,
          content,
        });
        setOutgoingMessages((prevOutgoingMessages) => {
          return [
            ...prevOutgoingMessages,
            {
              content,
              createdAt: new Date().toISOString(),
              senderUserId: user.id,
            },
          ];
        });
      })
      .catch((e) => {});
  };
  const theMatch = matches.find((m) => m.id === passiveSideUserId);
  console.log('passiveSideUserId',passiveSideUserId)
  console.log("incomingMessages.filter(im => im.senderUserId === passiveSideUserId)", incomingMessages.filter(im => im.senderUserId === passiveSideUserId));
  return (
    <div style={{ position: "relative", height: "500px" }}>
      <MainContainer responsive>
        <ChatContainer>
          <ConversationHeader>
            {theMatch.avatar ? (
              <Avatar
                src={URL.createObjectURL(theMatch.avatar)}
                name={theMatch.userName || ""}
              />
            ) : (
              <Avatar src={PlaceHolder} name={theMatch.userName || ""} />
            )}
            <ConversationHeader.Content userName={theMatch.userName} />
          </ConversationHeader>
          <MessageList>
            {theMatch &&
              theMatch.messages &&
              Array.isArray(theMatch.messages) &&
              theMatch.messages.length > 0 &&
              [
                  ...theMatch.messages,
                ...incomingMessages.filter(im => im.senderUserId === passiveSideUserId),
                ...outgoingMessages
              ]
                .sort(
                  (a, b) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
                )
                .map((msg, i) => {
                  return (
                    <Message
                      key={i}
                      model={{
                        message: msg.content,
                        // sentTime: "just now",
                        direction:
                          msg.senderUserId === passiveSideUserId
                            ? "incoming"
                            : "outgoing",
                      }}
                    />
                  );
                })}
          </MessageList>
          <MessageInput
            attachButton={false}
            fancyScroll={true}
            placeholder="Type message here"
            onSend={handleSend}
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
};

export default Chat;
