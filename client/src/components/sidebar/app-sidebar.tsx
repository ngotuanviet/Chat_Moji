import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";
import CreateNewChat from "../chat/CreateNewChat";
import NewGroupChatModal from "../chat/NewGroupChatModal";
import GroupChatList from "../chat/GroupChatList";
import AddFriendModal from "../chat/AddFriendModal";
import DirectMessageList from "../chat/DirectMessageList";
import { useThemeStore } from "@/stores/useThemeStore";
import { NavUser } from "./nav-user";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import ConversationSkeleton from "@/components/skeleton/ConversationSkeleton";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isDark, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();
  const { convoLoading } = useChatStore();

  return (
    <Sidebar variant='inset' {...props}>
      <SidebarHeader className='pt-[max(0.5rem,env(safe-area-inset-top))]'>
        <div className='flex items-center justify-between rounded-xl bg-gradient-primary px-3 py-2.5 shadow-xs'>
          <h1 className='text-lg font-bold text-white tracking-wide'>
            Moji
          </h1>
          <div className='flex items-center gap-1.5'>
            <Sun className='size-3.5 text-white/80' />
            <Switch
              checked={isDark}
              onCheckedChange={toggleTheme}
              className='data-[state=checked]:bg-background/80'
              aria-label='Chuyển đổi giao diện sáng tối'
            />
            <Moon className='size-3.5 text-white/80' />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className='beautiful-scrollbar'>
        <SidebarGroup>
          <SidebarGroupContent>
            <CreateNewChat />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <div className='flex items-center justify-between'>
            <SidebarGroupLabel className='uppercase font-semibold text-xs tracking-wider'>
              Nhóm chat
            </SidebarGroupLabel>
            <NewGroupChatModal />
          </div>

          <SidebarGroupContent>
            {convoLoading ? <ConversationSkeleton /> : <GroupChatList />}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <div className='flex items-center justify-between'>
            <SidebarGroupLabel className='uppercase font-semibold text-xs tracking-wider'>
              Bạn bè
            </SidebarGroupLabel>
            <AddFriendModal />
          </div>

          <SidebarGroupContent>
            {convoLoading ? <ConversationSkeleton /> : <DirectMessageList />}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className='pb-[max(0.5rem,env(safe-area-inset-bottom))]'>
        {user && <NavUser user={user} />}
      </SidebarFooter>
    </Sidebar>
  );
}
