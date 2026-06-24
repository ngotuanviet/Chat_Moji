import ChatWindowLayout from "@/components/chat/ChatWindowLayout";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

const ChatAppPage = () => {
  return (
    <SidebarProvider>
      <AppSidebar side='left' />
      <SidebarInset className='p-2 h-screen'>
        <ChatWindowLayout />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ChatAppPage;
