import ChatWindowHeader from "./ChatWindowHeader";

const ChatWelComeScreen = () => {
  return (
    <div className='flex h-full min-h-0 w-full flex-col bg-transparent'>
      <ChatWindowHeader />
      <div className='flex flex-1 items-center justify-center rounded-2xl bg-primary-foreground'>
        <div className='text-center'>
          <div className='mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-gradient-chat show-glow pulse-ring'>
            <span className='text-3xl'>{"\uD83D\uDCAC"}</span>
          </div>
          <h2 className='mb-2 bg-gradient-chat bg-clip-text text-2xl font-bold text-transparent'>
            {"Ch\u00e0o m\u1eebng b\u1ea1n \u0111\u1ebfn v\u1edbi Moji"}
          </h2>
          <p className='text-muted-foreground'>
            {"Ch\u1ecdn m\u1ed9t cu\u1ed9c h\u1ed9i tho\u1ea1i \u0111\u1ec3 b\u1eaft \u0111\u1ea7u chat"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatWelComeScreen;
