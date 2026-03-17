import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import PasswordInput from '../components/PasswordInput';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Email o password errati');
        }
    };

    return (
        <div className="flex flex-col min-h-full bg-bg-light pb-10">
            {/* Red Banner */}
            <div className="bg-secondary py-6 text-center">
                <h1 className="text-white text-xl font-black uppercase tracking-widest">
                    LOGIN
                </h1>
            </div>

            <div className="flex-grow px-8 py-10 space-y-6">
                {/* Main Login Card */}
                <div className="bg-white rounded-xl p-8 shadow-sm flex flex-col space-y-8">
                    <h2 className="text-[#646464] text-center text-xl font-black tracking-tight mb-2">
                        Accedi al tuo Account
                    </h2>

                    <form onSubmit={handleSubmit} className="flex flex-col space-y-8">
                        {/* Email Field */}
                        <div className="flex flex-col items-center space-y-3">
                            <label className="text-primary font-black text-sm uppercase tracking-wide">
                                Email
                            </label>
                            <div className="relative w-full max-w-[240px] flex items-center">
                                <span className="text-gray-400 font-light text-2xl absolute left-0 leading-none">[</span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full text-center bg-transparent border-b border-gray-400 px-4 py-1 text-sm focus:outline-none focus:border-primary transition-colors text-gray-700 font-medium"
                                />
                                <span className="text-gray-400 font-light text-2xl absolute right-0 leading-none">]</span>
                            </div>
                        </div>

                        {/* Password Field */}
                        <PasswordInput
                            label="Password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        {/* Remember Me */}
                        <div className="flex items-center justify-center space-x-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setRememberMe(!rememberMe)}
                                className={`w-3.5 h-3.5 border-2 ${rememberMe ? 'bg-accent border-accent' : 'border-accent'} rounded-sm flex items-center justify-center transition-colors`}
                            >
                                {rememberMe && (
                                    <svg viewBox="0 0 24 24" fill="none" className="w-2.5 h-2.5 text-primary stroke-[4px] stroke-primary">
                                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </button>
                            <span className="text-[#646464] text-xs font-bold leading-none">Ricordami</span>
                        </div>

                        {/* Login Button */}
                        <div className="flex justify-center">
                            <button
                                type="submit"
                                className="w-full max-w-[160px] bg-accent py-3.5 rounded-xl text-primary font-black uppercase text-sm tracking-widest shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
                            >
                                Accedi
                            </button>
                        </div>
                    </form>

                    {error && (
                        <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-tight">
                            {error}
                        </p>
                    )}
                </div>

                {/* Secondary Actions Card */}
                <div className="bg-white rounded-xl p-8 shadow-sm flex flex-col items-center space-y-6">
                    <Link
                        to="/forgot-password"
                        className="text-primary font-black text-xs uppercase underline tracking-wide decoration-2 underline-offset-4"
                    >
                        Password dimenticata?
                    </Link>

                    <div className="flex flex-col items-center space-y-4 pt-4 w-full">
                        <p className="text-[#646464] font-black text-xs uppercase tracking-wide">
                            Non hai un account?
                        </p>
                        <Link
                            to="/register"
                            className="w-full max-w-[160px] text-center bg-accent py-3.5 rounded-xl text-primary font-black uppercase text-sm tracking-widest shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
                        >
                            Registrati
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
