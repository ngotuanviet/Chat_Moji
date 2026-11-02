"use client";

import { Bell, ChevronsUpDown, LogOut, UserIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useState } from "react";
import { useNavigate } from "react-router";
import FriendRequestsDialog from "@/components/friendRequest/FriendRequestsDialog";
import ProfileDialog from "@/components/profile/ProfileDialog";
import { useAuthStore } from "@/stores/useAuthStore";
import type { User } from "@/types/user";

export function NavUser({ user }: { user: User }) {
  const { isMobile } = useSidebar();
  const { signOut } = useAuthStore();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [friendRequestOpen, setFriendRequestOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/signin");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size='lg'
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer'
              >
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                  <AvatarFallback className='rounded-lg bg-primary text-primary-foreground font-semibold'>
                    {user.displayName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>
                    {user.displayName}
                  </span>
                  <span className='truncate text-xs text-muted-foreground'>@{user.username}</span>
                </div>
                <ChevronsUpDown className='ml-auto size-4 text-muted-foreground' />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
              side={isMobile ? "bottom" : "right"}
              align='end'
              sideOffset={4}
            >
              <DropdownMenuLabel className='p-0 font-normal'>
                <div className='flex items-center gap-2 px-2 py-1.5 text-left text-sm'>
                  <Avatar className='h-8 w-8 rounded-lg'>
                    <AvatarImage src={user.avatarUrl} alt={user.username} />
                    <AvatarFallback className='rounded-lg bg-primary text-primary-foreground font-semibold'>
                      {user.displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className='grid flex-1 text-left text-sm leading-tight'>
                    <span className='truncate font-semibold'>
                      {user.displayName}
                    </span>
                    <span className='truncate text-xs text-muted-foreground'>@{user.username}</span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setProfileOpen(true)} className='cursor-pointer'>
                  <UserIcon className='size-4 text-muted-foreground' />
                  <span>Tài khoản</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFriendRequestOpen(true)} className='cursor-pointer'>
                  <Bell className='size-4 text-muted-foreground' />
                  <span>Thông báo</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className='cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10'
              >
                <LogOut className='size-4 text-destructive' />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <FriendRequestsDialog
        open={friendRequestOpen}
        setOpen={setFriendRequestOpen}
      />
      <ProfileDialog open={profileOpen} setOpen={setProfileOpen} />
    </>
  );
}
