import FriendRequestsItem from "@/components/friendRequest/FriendRequestsItem";
import { useFriendStore } from "@/stores/useFriendStore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SentRequests = () => {
  const { sendList, cancelRequest, loading } = useFriendStore();
  const handleCancel = async (requestId: string) => {
    try {
      await cancelRequest(requestId);
      toast.info("Đã huỷ lời mời kết bạn");
    } catch {
      toast.error("Không thể huỷ lời mời. Vui lòng thử lại.");
    }
  };
  if (!sendList || sendList.length === 0) {
    return (
      <p className='text-sm text-muted-foreground'>
        Bạn chưa gửi lời mời kết bạn nào.
      </p>
    );
  }

  return (
    <div className='space-y-3 mt-4'>
      {sendList.map((req) => (
        <FriendRequestsItem
          key={req._id}
          requestInfo={req}
          type='sent'
          actions={
            <Button
              size='sm'
              variant='outline'
              disabled={loading}
              onClick={() => handleCancel(req._id)}
            >
              Huỷ lời mời
            </Button>
          }
        />
      ))}
    </div>
  );
};

export default SentRequests;
