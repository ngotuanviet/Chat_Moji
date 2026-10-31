import ChatWindowLayout from "@/components/chat/ChatWindowLayout";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useChatStore } from "@/stores/useChatStore";
import { cn } from "@/lib/utils";

const ChatAppPage = () => {
  const isMobile = useIsMobile();
  const { activeConversationId } = useChatStore();

  const isChatOpenOnMobile = isMobile && Boolean(activeConversationId);

  return (
    <SidebarProvider className='h-svh max-h-svh overflow-hidden'>
      {/* Sidebar container */}
      <div
        className={cn(
          "h-full",
          isMobile
            ? isChatOpenOnMobile
              ? "hidden"
              : "w-full flex-1 flex flex-col"
            : "shrink-0",
        )}
      >
        <AppSidebar
          side='left'
          collapsible={isMobile ? "none" : "offcanvas"}
          className={cn(
            isMobile && "!w-full w-full border-none max-w-none flex-1",
          )}
        />
      </div>

      {/* Main Chat Inset */}
      <SidebarInset
        className={cn(
          "min-h-0 overflow-hidden bg-background",
          isMobile
            ? isChatOpenOnMobile
              ? "flex flex-col w-full h-svh max-h-svh p-0 m-0 rounded-none border-none"
              : "hidden"
            : "p-2 h-[calc(100svh-1rem)] max-h-[calc(100svh-1rem)]",
        )}
      >
        <ChatWindowLayout />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ChatAppPage;
