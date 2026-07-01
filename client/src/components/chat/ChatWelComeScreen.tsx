import ChatWindowHeader from "./ChatWindowHeader";

const ChatWelComeScreen = () => {
  return (
    <div className='flex h-full min-h-0 w-full flex-col bg-transparent'>
      <ChatWindowHeader />
      <div className='flex flex-1 items-center justify-center rounded-2xl bg-primary-foreground'>
        <div className='text-center'>
          <div className='mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-gradient-chat show-glow pulse-ring'>
            <span className='text-3xl'> 💬 </span>
          </div>
          <h2 className='mb-2 bg-gradient-chat bg-clip-text text-2xl font-bold text-transparent'>
            {"Chào mừng bạn đến với Moji"}
          </h2>
          <p className='text-muted-foreground'>
            {"Chọn một cuộc hội thoại để bắt đầu chat"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatWelComeScreen;
