const ChatWindowSkeleton = () => {
  return (
    <div className='flex h-full min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/60 bg-background shadow-md'>
      <div className='h-16 border-b border-border/60 animate-pulse bg-muted/50' />
      <div className='flex-1 animate-pulse bg-muted/20' />
      <div className='h-20 border-t border-border/60 animate-pulse bg-muted/50' />
    </div>
  );
};

export default ChatWindowSkeleton;
