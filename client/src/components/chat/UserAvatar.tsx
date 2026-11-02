import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface IUserAvatarProps {
  type: "sidebar" | "chat" | "profile";
  name: string;
  avatarUrl?: string;
  className?: string;
}

const UserAvatar = ({ type, name, avatarUrl, className }: IUserAvatarProps) => {
  const safeName = name?.trim() || "Moji";
  const bgColor = !avatarUrl ? "bg-gradient-primary text-white" : "bg-muted text-foreground";

  return (
    <Avatar
      className={cn(
        className ?? "",
        type === "sidebar" && "size-11 sm:size-12 text-sm sm:text-base",
        type === "chat" && "size-8 text-xs sm:text-sm",
        type === "profile" && "size-20 sm:size-24 text-2xl sm:text-3xl shadow-md",
      )}
    >
      <AvatarImage src={avatarUrl} alt={safeName} />
      <AvatarFallback className={cn(bgColor, "font-semibold uppercase select-none")}>
        {safeName.charAt(0)}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
