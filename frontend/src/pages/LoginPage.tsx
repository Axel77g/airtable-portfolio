import { useState } from "react";
import {useProvider} from "../hook/useProvider.ts";
import {AuthProvider} from "../providers/AuthProvider.ts";
import {useNavigate} from "react-router";
export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [, login] = useProvider(AuthProvider, "login", null, false);
    const [error, setError] = useState("");
    const navigate = useNavigate()
    async function handleLogin() {
        if (!email || !password) return;
        const response = await login(email, password);
        if(response){
            navigate("/admin")
        }else{
            setError("Email ou mot de passe incorrect")
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-md space-y-6">
                <h1 className="text-2xl font-bold text-center">Connexion</h1>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Mot de passe
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="••••••••"
                        />
                    </div>
                    {error && <small className="text-red-500 text-sm">
                        {error}
                    </small>}

                </div>


                <button
                    onClick={handleLogin}
                    className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                    Se connecter
                </button>

            </div>
        </div>
    );
}
