import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setError('Link non valido o scaduto');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!token) {
            setError('Link non valido o scaduto');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Le password non coincidono');
            return;
        }

        if (newPassword.length < 6) {
            setError('La password deve essere di almeno 6 caratteri');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            await api.post('/auth/reset-password', { token, newPassword });
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Link non valido o scaduto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-full bg-bg-light pb-10">
            {/* Red Banner */}
            <div className="bg-secondary py-6 text-center">
                <h1 className="text-white text-xl font-black uppercase tracking-widest">
                    NUOVA PASSWORD
                </h1>
            </div>

            <div className="flex-grow px-8 py-10 space-y-6">
                <div className="bg-white rounded-xl p-8 shadow-sm flex flex-col space-y-8">
                    <div className="space-y-4 text-center">
                        <h2 className="text-[#646464] text-xl font-black tracking-tight">
                            Reimposta la tua password
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col space-y-8">
                        {/* New Password Field */}
                        <div className="flex flex-col items-center space-y-3">
                            <label className="text-primary font-black text-sm uppercase tracking-wide">
                                NUOVA PASSWORD
                            </label>
                            <div className="relative w-full max-w-[240px] flex items-center">
                                <span className="text-gray-400 font-light text-2xl absolute left-0 leading-none">[</span>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="w-full text-center bg-transparent border-b border-gray-400 px-4 py-1 text-sm focus:outline-none focus:border-primary transition-colors text-gray-700 font-medium"
                                />
                                <span className="text-gray-400 font-light text-2xl absolute right-0 leading-none">]</span>
                            </div>
                        </div>

                        {/* Confirm Password Field */}
                        <div className="flex flex-col items-center space-y-3">
                            <label className="text-primary font-black text-sm uppercase tracking-wide">
                                CONFERMA PASSWORD
                            </label>
                            <div className="relative w-full max-w-[240px] flex items-center">
                                <span className="text-gray-400 font-light text-2xl absolute left-0 leading-none">[</span>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full text-center bg-transparent border-b border-gray-400 px-4 py-1 text-sm focus:outline-none focus:border-primary transition-colors text-gray-700 font-medium"
                                />
                                <span className="text-gray-400 font-light text-2xl absolute right-0 leading-none">]</span>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center">
                            <button
                                type="submit"
                                disabled={loading || !token || success}
                                className={`w-full max-w-[160px] bg-accent py-3.5 rounded-xl text-primary font-black uppercase text-sm tracking-widest shadow-sm hover:shadow-md active:scale-[0.98] transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'SALVATAGGIO...' : 'SALVA'}
                            </button>
                        </div>
                    </form>

                    {success && (
                        <p className="text-green-600 text-[11px] font-bold text-center uppercase tracking-tight bg-green-50 p-2 rounded-lg">
                            Password aggiornata! Reindirizzamento al login...
                        </p>
                    )}

                    {error && (
                        <p className="text-red-500 text-[10px] font-bold text-center uppercase tracking-tight">
                            {error}
                        </p>
                    )}
                </div>

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

export default ResetPassword;
