import { NavLink } from "react-router-dom";
import { FaHome, FaHeart, FaMusic, FaUserShield } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
    const { isAdmin } = useAuth();

    const linkClasses = ({ isActive }) =>
        `flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-semibold transition ${
            isActive
                ? "bg-zinc-800 text-green-500"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
        }`;

    return (
        <aside className="w-64 bg-black text-white p-6 flex flex-col justify-between border-r border-zinc-800 shrink-0 select-none">
            <div>
                {/* Brand Logo / Header */}
                <div className="flex items-center gap-2 mb-8 px-2">
                    <span className="text-3xl font-extrabold text-green-500 tracking-tight">
                        Musicify
                    </span>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-2">
                    <NavLink to="/home" className={linkClasses}>
                        <FaHome className="text-lg" />
                        <span>Home</span>
                    </NavLink>

                    <NavLink to="/liked" className={linkClasses}>
                        <FaHeart className="text-lg" />
                        <span>Liked Songs</span>
                    </NavLink>

                    <NavLink to="/playlist" className={linkClasses}>
                        <FaMusic className="text-lg" />
                        <span>Playlists</span>
                    </NavLink>

                    {isAdmin && (
                        <NavLink to="/admin" className={linkClasses}>
                            <FaUserShield className="text-lg text-yellow-500" />
                            <span className="text-yellow-400">Admin Panel</span>
                        </NavLink>
                    )}
                </nav>
            </div>

            {/* Footer / Helper note */}
            <div className="text-xs text-zinc-600 px-2">
                <p>Musicify Spotify Clone</p>
                <p className="mt-1">Full-Stack MERN Project</p>
            </div>
        </aside>
    );
}

export default Sidebar;
