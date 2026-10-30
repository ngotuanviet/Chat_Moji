import ChatWindowLayout from "@/components/chat/ChatWindowLayout";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

const ChatAppPage = () => {
  return (
    <SidebarProvider className='h-svh max-h-svh overflow-hidden'>
      <AppSidebar side='left' />
      <SidebarInset className='p-2 h-[calc(100svh-1rem)] max-h-[calc(100svh-1rem)] min-h-0 overflow-hidden'>
        <ChatWindowLayout />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ChatAppPage;
