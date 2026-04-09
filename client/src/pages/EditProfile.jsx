import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import PasswordInput from '../components/PasswordInput';

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

                        <PasswordInput 
                            label="Password Attuale"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            placeholder="Richiesta per modifiche"
                            labelSize="text-[8px]"
                        />

                        <PasswordInput 
                            label="Nuova Password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            labelSize="text-[8px]"
                        />

                        <PasswordInput 
                            label="Conferma Nuova Password"
                            name="confirmNewPassword"
                            value={formData.confirmNewPassword}
                            onChange={handleChange}
                            labelSize="text-[8px]"
                        />
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
