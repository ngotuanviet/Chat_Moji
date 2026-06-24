import { useChatStore } from "@/stores/useChatStore";
import DirectMessageCard from "./DirectMessageCard";

function DirectMessageList() {
  const { conversations } = useChatStore();
  if (!Array.isArray(conversations)) return null;
  const directConversations = conversations.filter(
    (convo) => convo.type === "direct",
  );
  return (
    <div className='flex-1 overflow-y-auto p-2 space-y-2'>
      {directConversations.map((convo) => (
        <DirectMessageCard key={convo._id} convo={convo} />
      ))}
    </div>
  );
}

export default DirectMessageList;
