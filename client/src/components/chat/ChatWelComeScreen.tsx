import ChatWindowHeader from "./ChatWindowHeader";

const ChatWelComeScreen = () => {
  return (
    <div className='flex h-full min-h-0 w-full flex-col bg-background'>
      <ChatWindowHeader />
      <div className='flex flex-1 items-center justify-center rounded-2xl bg-card/40 m-2 sm:m-4 border border-border/40'>
        <div className='text-center max-w-sm px-4'>
          <div className='mx-auto mb-6 flex size-20 sm:size-24 items-center justify-center rounded-full bg-gradient-chat shadow-lg animate-pulse'>
            <span className='text-3xl sm:text-4xl'>💬</span>
          </div>
          <h2 className='mb-2 bg-gradient-chat bg-clip-text text-xl sm:text-2xl font-bold text-transparent'>
            Chào mừng bạn đến với Moji
          </h2>
          <p className='text-xs sm:text-sm text-muted-foreground'>
            Chọn một cuộc hội thoại từ danh sách bên trái hoặc bắt đầu cuộc trò chuyện mới để kết nối bạn bè.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatWelComeScreen;
