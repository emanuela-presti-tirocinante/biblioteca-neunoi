import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const EditProfile = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nome: '',
        cognome: '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                nome: user.nome || '',
                cognome: user.cognome || ''
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        if (formData.newPassword) {
            if (formData.newPassword.length < 8) {
                setLoading(false);
                return setError('La nuova password deve essere di almeno 8 caratteri');
            }
            if (formData.newPassword !== formData.confirmNewPassword) {
                setLoading(false);
                return setError('Le nuove password non coincidono');
            }
            if (!formData.currentPassword) {
                setLoading(false);
                return setError('Inserisci la password attuale per autorizzare la modifica');
            }
        }

        try {
            const res = await api.patch('/utenti/profilo', {
                nome: formData.nome,
                cognome: formData.cognome,
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            setSuccess(true);

            // Refresh local user context if needed or just navigate back
            setTimeout(() => {
                navigate('/profilo');
            }, 1500);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Errore durante l\'aggiornamento');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-full bg-bg-light pb-20">
            <div className="bg-secondary p-8 text-center">
                <h1 className="text-white text-xl font-black uppercase tracking-widest">
                    MODIFICA PROFILO
                </h1>
            </div>

            <div className="px-6 py-8 max-w-[390px] mx-auto w-full">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm space-y-8">

                    {/* Basic Info Section */}
                    <div className="space-y-6">
                        <div className="flex flex-col items-center space-y-2">
                            <label className="text-primary font-black text-[10px] uppercase tracking-widest">Nome</label>
                            <div className="relative w-full flex items-center justify-center">
                                <span className="text-gray-400 font-light text-2xl absolute left-0 leading-none">[</span>
                                <input
                                    type="text"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleChange}
                                    required
                                    className="w-full text-center bg-transparent border-b border-gray-300 px-4 py-1 text-sm focus:outline-none focus:border-primary font-bold text-gray-700"
                                />
                                <span className="text-gray-400 font-light text-2xl absolute right-0 leading-none">]</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-center space-y-2">
                            <label className="text-primary font-black text-[10px] uppercase tracking-widest">Cognome</label>
                            <div className="relative w-full flex items-center justify-center">
                                <span className="text-gray-400 font-light text-2xl absolute left-0 leading-none">[</span>
                                <input
                                    type="text"
                                    name="cognome"
                                    value={formData.cognome}
                                    onChange={handleChange}
                                    required
                                    className="w-full text-center bg-transparent border-b border-gray-300 px-4 py-1 text-sm focus:outline-none focus:border-primary font-bold text-gray-700"
                                />
                                <span className="text-gray-400 font-light text-2xl absolute right-0 leading-none">]</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-center space-y-2 opacity-60">
                            <label className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Email (non modificabile)</label>
                            <div className="relative w-full flex items-center justify-center">
                                <span className="text-gray-300 font-light text-2xl absolute left-0 leading-none">[</span>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="w-full text-center bg-transparent border-b border-gray-200 px-4 py-1 text-sm text-gray-400 font-medium cursor-not-allowed"
                                />
                                <span className="text-gray-300 font-light text-2xl absolute right-0 leading-none">]</span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6 space-y-6">
                        <h3 className="text-primary font-black text-[10px] uppercase tracking-widest text-center">Cambia Password</h3>

                        <div className="flex flex-col items-center space-y-2">
                            <label className="text-primary font-black text-[8px] uppercase tracking-widest">Password Attuale</label>
                            <div className="relative w-full flex items-center justify-center">
                                <span className="text-gray-400 font-light text-2xl absolute left-0 leading-none">[</span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    placeholder="Richiesta per modifiche"
                                    className="w-full text-center bg-transparent border-b border-gray-300 px-4 py-1 text-sm focus:outline-none focus:border-primary font-bold text-gray-700"
                                />
                                <span className="text-gray-400 font-light text-2xl absolute right-0 leading-none">]</span>

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute -right-7 text-gray-400 hover:text-primary transition-colors focus:outline-none"
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

                        <div className="flex flex-col items-center space-y-2">
                            <label className="text-primary font-black text-[8px] uppercase tracking-widest">Nuova Password</label>
                            <div className="relative w-full flex items-center justify-center">
                                <span className="text-gray-400 font-light text-2xl absolute left-0 leading-none">[</span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="w-full text-center bg-transparent border-b border-gray-300 px-4 py-1 text-sm focus:outline-none focus:border-primary font-bold text-gray-700"
                                />
                                <span className="text-gray-400 font-light text-2xl absolute right-0 leading-none">]</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-center space-y-2">
                            <label className="text-primary font-black text-[8px] uppercase tracking-widest">Conferma Nuova Password</label>
                            <div className="relative w-full flex items-center justify-center">
                                <span className="text-gray-400 font-light text-2xl absolute left-0 leading-none">[</span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="confirmNewPassword"
                                    value={formData.confirmNewPassword}
                                    onChange={handleChange}
                                    className="w-full text-center bg-transparent border-b border-gray-300 px-4 py-1 text-sm focus:outline-none focus:border-primary font-bold text-gray-700"
                                />
                                <span className="text-gray-400 font-light text-2xl absolute right-0 leading-none">]</span>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 p-3 rounded-xl">
                            <p className="text-red-500 text-[10px] font-bold text-center uppercase leading-tight">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-100 p-3 rounded-xl">
                            <p className="text-green-600 text-[10px] font-bold text-center uppercase leading-tight">✅ Profilo aggiornato!</p>
                        </div>
                    )}

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/profilo')}
                            className="flex-1 bg-gray-100 py-4 rounded-xl text-gray-500 font-black uppercase text-xs tracking-widest active:scale-[0.98] transition-all"
                        >
                            Annulla
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 bg-accent py-4 rounded-xl text-primary font-black uppercase text-xs tracking-widest shadow-sm active:scale-[0.98] transition-all ${loading ? 'opacity-50' : 'hover:shadow-md'}`}
                        >
                            {loading ? 'Salvataggio...' : 'Salva'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfile;
