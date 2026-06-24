import { useChatStore } from "@/stores/useChatStore";
import GroupChatCard from "./GroupChatCard";
function GroupChatList() {
  const { conversations } = useChatStore();
  if (!Array.isArray(conversations)) return null;

  const groupConversations = conversations.filter(
    (convo) => convo.type === "group",
  );
  return (
    <div className='flex-1 overflow-y-auto p-2 space-y-2'>
      {groupConversations.map((convo) => (
        <GroupChatCard key={convo._id} convo={convo} />
      ))}
    </div>
  );
}

export default GroupChatList;
