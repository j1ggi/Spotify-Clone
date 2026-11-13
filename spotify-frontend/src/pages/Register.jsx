import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";

function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim() || !email.trim() || !password.trim()) {
            toast.warn("All fields are required");
            return;
        }

        if (password.length < 6) {
            toast.warn("Password must be at least 6 characters long");
            return;
        }

        try {
            setLoading(true);
            const res = await api.post("/auth/register", {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password: password.trim()
            });

            toast.success(res.data?.message || "Registration successful! Please log in.");
            navigate("/");
        } catch (err) {
            const errorMsg =
                err.response?.data?.message ||
                err.response?.data?.mess ||
                "Registration failed. Please try again.";
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
                        Sign up to start listening for free
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                            What should we call you? (Name)
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Enter your name"
                            className="w-full p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 transition text-sm"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                            What's your email?
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
                            Create a password (min 6 characters)
                        </label>
                        <input
                            type="password"
                            required
                            placeholder="Create a password"
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
                        {loading ? "Creating account..." : "Sign Up"}
                    </button>
                </form>

                <p className="text-zinc-400 text-center text-sm mt-8 border-t border-zinc-800 pt-6">
                    Already have an account?
                    <Link
                        to="/"
                        className="text-white hover:text-green-500 font-semibold ml-1.5 transition underline"
                    >
                        Log in here
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
