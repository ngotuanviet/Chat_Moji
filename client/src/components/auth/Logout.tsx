import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "../ui/button";
import { useNavigate } from "react-router";
import { LogOut } from "lucide-react";

const Logout = () => {
  const { signOut } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = () => {
    try {
      signOut();
      navigate("/signin");
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Button
      variant='ghost'
      className='w-full justify-start p-0 h-auto hover:bg-transparent'
      onClick={handleLogout}
    >
      <LogOut className='text-destructive' />
      <span className='text-destructive'>Log out</span>
    </Button>
  );
};

export default Logout;
