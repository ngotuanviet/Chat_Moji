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
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Button variant='completeGhost' onClick={handleLogout}>
      <LogOut className='text-destructive'></LogOut>
      <span className='text-destructive'>Log out</span>
    </Button>
  );
};

export default Logout;
