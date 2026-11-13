import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { FaUserCircle } from "react-icons/fa";

function Navbar({ title = "Explore Music", children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.info("Logged out successfully");
        navigate("/");
    };

    return (
        <header className="bg-zinc-900/80 backdrop-blur sticky top-0 z-10 px-8 py-4 flex items-center justify-between border-b border-zinc-800">
            <div className="flex items-center gap-6 flex-1">
                <h2 className="text-white text-xl font-bold">{title}</h2>
                {children}
            </div>

            <div className="flex items-center gap-4">
                {/* User Info */}
                <div className="flex items-center gap-2 text-zinc-300">
                    <FaUserCircle className="text-2xl text-green-500" />
                    <span className="text-sm font-semibold">{user?.name || "User"}</span>
                    {user?.role === "admin" && (
                        <span className="text-xs bg-yellow-600/40 text-yellow-300 px-2 py-0.5 rounded font-mono uppercase">
                            Admin
                        </span>
                    )}
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="bg-zinc-800 hover:bg-red-600 hover:text-white text-zinc-300 px-4 py-1.5 rounded-full text-sm font-semibold transition"
                >
                    Logout
                </button>
            </div>
        </header>
    );
}

export default Navbar;
