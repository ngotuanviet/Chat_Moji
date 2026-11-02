import FriendRequestsItem from "@/components/friendRequest/FriendRequestsItem";
import { Button } from "@/components/ui/button";
import { useFriendStore } from "@/stores/useFriendStore";
import { toast } from "sonner";

const ReceivedRequests = () => {
  const { acceptRequest, declineRequest, loading, receivedList } =
    useFriendStore();

  if (!receivedList || receivedList.length === 0) {
    return (
      <p className='text-sm text-muted-foreground py-4 text-center'>
        Bạn chưa có lời mời kết bạn nào.
      </p>
    );
  }

  const handleAccept = async (requestId: string) => {
    try {
      await acceptRequest(requestId);
      toast.success("Đã đồng ý kết bạn thành công");
    } catch (error) {
      console.error(error);
      toast.error("Không thể chấp nhận lời mời");
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await declineRequest(requestId);
      toast.info("Đã từ chối kết bạn");
    } catch (error) {
      console.error(error);
      toast.error("Không thể từ chối lời mời");
    }
  };

  return (
    <div className='space-y-2.5 mt-3'>
      {receivedList.map((req) => (
        <FriendRequestsItem
          key={req._id}
          requestInfo={req}
          type='received'
          actions={
            <div className='flex items-center gap-2'>
              <Button
                size='sm'
                variant='default'
                onClick={() => handleAccept(req._id)}
                disabled={loading}
                className='text-xs h-8 px-3'
              >
                Chấp nhận
              </Button>
              <Button
                size='sm'
                variant='outline'
                onClick={() => handleDecline(req._id)}
                disabled={loading}
                className='text-xs h-8 px-3 text-destructive border-destructive/30 hover:bg-destructive/10'
              >
                Từ chối
              </Button>
            </div>
          }
        />
      ))}
    </div>
  );
};

export default ReceivedRequests;
