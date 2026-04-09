import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await api.post('/auth/forgot-password', { email });
            setMessage(response.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Si è verificato un errore. Riprova più tardi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-full bg-bg-light pb-10">
            {/* Red Banner */}
            <div className="bg-secondary py-6 text-center">
                <h1 className="text-white text-xl font-black uppercase tracking-widest">
                    Password Dimenticata
                </h1>
            </div>

            <div className="flex-grow px-8 py-10 space-y-6">
                {/* Main Forgot Password Card */}
                <div className="bg-white rounded-xl p-8 shadow-sm flex flex-col space-y-8">
                    <div className="space-y-4 text-center">
                        <h2 className="text-[#646464] text-xl font-black tracking-tight">
                            Recupera Password
                        </h2>
                        <p className="text-gray-500 text-sm font-medium leading-relaxed">
                            Ti invieremo un link per reimpostare la tua password.
                        </p>
                    </div>

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
                                    placeholder="Inserisci la tua email"
                                    className="w-full text-center bg-transparent border-b border-gray-400 px-4 py-1 text-sm focus:outline-none focus:border-primary transition-colors text-gray-700 font-medium"
                                />
                                <span className="text-gray-400 font-light text-2xl absolute right-0 leading-none">]</span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full max-w-[160px] bg-accent py-3.5 rounded-xl text-primary font-black uppercase text-sm tracking-widest shadow-sm hover:shadow-md active:scale-[0.98] transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Invio...' : 'Invio Link'}
                            </button>
                        </div>
                    </form>

                    {message && (
                        <p className="text-green-600 text-[11px] font-bold text-center uppercase tracking-tight bg-green-50 p-2 rounded-lg">
                            {message}
                        </p>
                    )}

                    {error && (
                        <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-tight">
                            {error}
                        </p>
                    )}
                </div>

                {/* Return Action Link */}
                <div className="flex justify-center">
                    <Link
                        to="/login"
                        className="text-secondary font-bold underline text-xs decoration-2 underline-offset-4"
                    >
                        ← Torna al Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
