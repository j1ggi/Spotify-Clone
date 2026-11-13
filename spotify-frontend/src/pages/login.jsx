import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            toast.warn("Please enter both email and password");
            return;
        }

        try {
            setLoading(true);
            const res = await api.post("/auth/login", {
                email: email.trim().toLowerCase(),
                password: password.trim()
            });

            // Store in AuthContext & localStorage
            login(res.data.token, res.data.user);

            toast.success("Welcome back to Musicify!");
            navigate("/home");
        } catch (err) {
            const errorMsg =
                err.response?.data?.message ||
                err.response?.data?.mess ||
                "Login failed. Please check credentials.";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-zinc-800 p-8 sm:p-10 rounded-2xl w-full max-w-md shadow-2xl">
                {/* Logo & Headline */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl text-green-500 font-extrabold tracking-tight mb-2">
                        Musicify
                    </h1>
                    <p className="text-zinc-400 text-sm">
                        Log in to continue listening
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                            Email address
                        </label>
                        <input
                            type="email"
                            required
                            placeholder="name@domain.com"
                            className="w-full p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition text-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            placeholder="Your password"
                            className="w-full p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3.5 rounded-full transition duration-200 mt-2 disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Log In"}
                    </button>
                </form>

                <p className="text-zinc-400 text-center text-sm mt-8 border-t border-zinc-800 pt-6">
                    Don't have an account?
                    <Link
                        to="/register"
                        className="text-white hover:text-green-500 font-semibold ml-1.5 transition underline"
                    >
                        Sign up for Musicify
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
