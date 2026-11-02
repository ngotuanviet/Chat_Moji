import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "../ui/button";
import { useNavigate } from "react-router";
import { LogOut } from "lucide-react";

const Logout = () => {
  const { signOut } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/signin");
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Button
      variant='ghost'
      className='w-full justify-start p-0 h-auto hover:bg-transparent text-destructive hover:text-destructive'
      onClick={handleLogout}
    >
      <LogOut className='size-4 text-destructive mr-2' />
      <span>Đăng xuất</span>
    </Button>
  );
};

export default Logout;
