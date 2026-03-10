import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Registration = () => {
    const [nome, setNome] = useState('');
    const [cognome, setCognome] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError('Le password non coincidono');
        }

        try {
            await register(nome, cognome, email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registrazione fallita');
        }
    };

    return (
        <div className="flex flex-col min-h-full bg-bg-light pb-10">
            {/* Red Banner */}
            <div className="bg-secondary py-6 text-center">
                <h1 className="text-white text-xl font-black uppercase tracking-widest">
                    REGISTRATI
                </h1>
            </div>

            <div className="flex-grow px-8 py-10">
                {/* Registration Form Card */}
                <div className="bg-white rounded-xl p-8 shadow-sm flex flex-col space-y-8">
                    <h2 className="text-[#646464] text-left text-xl font-black tracking-tight mb-2">
                        Crea il tuo Account
                    </h2>

                    <form onSubmit={handleSubmit} className="flex flex-col space-y-8">
                        {/* Nome Field */}
                        <div className="flex flex-col items-center space-y-3">
                            <label className="text-primary font-black text-sm uppercase tracking-wide w-full text-center">
                                Nome
                            </label>
                            <div className="relative w-full max-w-[240px] flex items-center">
                                <span className="text-gray-400 font-light text-2xl absolute left-0 leading-none">[</span>
                                <input
                                    type="text"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    required
                                    className="w-full text-center bg-transparent border-b border-gray-400 px-4 py-1 text-sm focus:outline-none focus:border-primary transition-colors text-gray-700 font-medium"
                                />
                                <span className="text-gray-400 font-light text-2xl absolute right-0 leading-none">]</span>
                            </div>
                        </div>

                        {/* Cognome Field */}
                        <div className="flex flex-col items-center space-y-3">
                            <label className="text-primary font-black text-sm uppercase tracking-wide w-full text-center">
                                Cognome
                            </label>
                            <div className="relative w-full max-w-[240px] flex items-center">
                                <span className="text-gray-400 font-light text-2xl absolute left-0 leading-none">[</span>
                                <input
                                    type="text"
                                    value={cognome}
                                    onChange={(e) => setCognome(e.target.value)}
                                    required
                                    className="w-full text-center bg-transparent border-b border-gray-400 px-4 py-1 text-sm focus:outline-none focus:border-primary transition-colors text-gray-700 font-medium"
                                />
                                <span className="text-gray-400 font-light text-2xl absolute right-0 leading-none">]</span>
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="flex flex-col items-center space-y-3">
                            <label className="text-primary font-black text-sm uppercase tracking-wide w-full text-center">
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
                        <div className="flex flex-col items-center space-y-3">
                            <label className="text-primary font-black text-sm uppercase tracking-wide w-full text-center">
                                Password
                            </label>
                            <div className="relative w-full max-w-[240px] flex items-center justify-center">
                                <span className="text-gray-400 font-light text-2xl absolute left-0 leading-none">[</span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full text-center bg-transparent border-b border-gray-400 px-4 py-1 text-sm focus:outline-none focus:border-primary transition-colors text-gray-700 font-medium"
                                />
                                <span className="text-gray-400 font-light text-2xl absolute right-0 leading-none">]</span>

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute -right-8 text-gray-400 hover:text-primary transition-colors focus:outline-none"
                                    title={showPassword ? "Nascondi password" : "Mostra password"}
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div className="flex flex-col items-center space-y-3">
                            <label className="text-primary font-black text-sm uppercase tracking-wide w-full text-center">
                                Conferma password
                            </label>
                            <div className="relative w-full max-w-[240px] flex items-center justify-center">
                                <span className="text-gray-400 font-light text-2xl absolute left-0 leading-none">[</span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full text-center bg-transparent border-b border-gray-400 px-4 py-1 text-sm focus:outline-none focus:border-primary transition-colors text-gray-700 font-medium"
                                />
                                <span className="text-gray-400 font-light text-2xl absolute right-0 leading-none">]</span>

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute -right-8 text-gray-400 hover:text-primary transition-colors focus:outline-none"
                                    title={showPassword ? "Nascondi password" : "Mostra password"}
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 10c0 0 3 5 8 5s8-5 8-5" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 12.5L5 15.5m4.5-2l-0.5 3.5m5.5-3.5l0.5 3.5 m3.5-1.5L20 15" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-tight">
                                {error}
                            </p>
                        )}

                        {/* Register Button */}
                        <div className="flex justify-center pt-4">
                            <button
                                type="submit"
                                className="w-full max-w-[160px] bg-accent py-3.5 rounded-xl text-primary font-black uppercase text-sm tracking-widest shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
                            >
                                Registrati
                            </button>
                        </div>
                    </form>

                    {/* Secondary Action: Login */}
                    <div className="flex flex-col items-center space-y-4 pt-6 w-full">
                        <p className="text-[#646464] font-black text-xs uppercase tracking-wide">
                            Hai già un account?
                        </p>
                        <Link
                            to="/login"
                            className="w-full max-w-[160px] text-center bg-accent py-3.5 rounded-xl text-primary font-black uppercase text-sm tracking-widest shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
                        >
                            Accedi
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Registration;
