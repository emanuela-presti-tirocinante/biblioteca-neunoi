import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import PasswordInput from '../components/PasswordInput';

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
                        <PasswordInput
                            label="Nuova Password"
                            name="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />

                        {/* Confirm Password Field */}
                        <PasswordInput
                            label="Conferma Password"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

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
