import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const MAX_CHARS = 1000;

const ReviewModal = ({ isOpen, onClose, bookId, bookTitle }) => {
    const { user } = useAuth();

    const [commento, setCommento] = useState('');
    const [nomeDisplay, setNomeDisplay] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setCommento('');
            setError('');
            setSuccess(false);
            if (user) {
                setNomeDisplay(`${user.nome || ''} ${user.cognome || ''}`.trim());
            } else {
                setNomeDisplay('');
            }
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (commento.length > MAX_CHARS) return;

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(`${BASE_URL}/reviews/book/${bookId}`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    commento: commento.trim() || null,
                    nome_display: nomeDisplay.trim() || null,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Errore durante l\'invio.');
            }

            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err) {
            setError(err.message || 'Errore durante l\'invio.');
        } finally {
            setLoading(false);
        }
    };

    const isOverLimit = commento.length > MAX_CHARS;

    return (
        <div className="fixed inset-0 z-[200] flex flex-col justify-end p-4">
            {/* Backdrop with blur */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            ></div>
            
            {/* Floating Sheet */}
            <div className="relative bg-white rounded-[40px] shadow-2xl animate-slide-up w-full max-w-lg mx-auto overflow-hidden flex flex-col max-h-[92vh]">
                {/* Fixed Header */}
                <div className="shrink-0 p-6 pb-0">
                    {/* Drag Handle UI */}
                    <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-6 cursor-pointer" onClick={onClose}></div>
                    
                    {/* Header with Title */}
                    <div className="pb-4">
                        <span className="text-[8px] font-black text-secondary uppercase bg-accent px-2 py-0.5 rounded tracking-[0.1em] mb-1.5 inline-block">
                            Lascia una recensione
                        </span>
                        <h2 className="text-sm font-black text-primary uppercase leading-tight line-clamp-2">{bookTitle}</h2>
                    </div>
                    <div className="h-px bg-gray-100 -mx-6"></div>
                </div>

                {/* Scrollable Context Area */}
                <div className="flex-grow overflow-y-auto px-6 py-6 custom-scrollbar relative">
                    {success ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
                                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-black text-primary uppercase">Recensione inviata!</h3>
                            <p className="text-xs font-bold text-gray-400 text-center uppercase tracking-wide">
                                Sarà visibile dopo approvazione.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Textarea commento */}
                            <div className="space-y-2">
                                <textarea
                                    value={commento}
                                    onChange={e => setCommento(e.target.value)}
                                    placeholder="Scrivi la tua recensione (opzionale)"
                                    rows={5}
                                    className={`w-full resize-none rounded-3xl border px-4 py-4 text-sm font-medium text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-4 transition-all ${
                                        isOverLimit
                                            ? 'border-red-200 bg-red-50/50 focus:border-red-400 focus:ring-red-100'
                                            : 'border-gray-100 bg-gray-50 focus:border-secondary focus:ring-secondary/10'
                                    }`}
                                />
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        Commento max 1000
                                    </span>
                                    <span className={`text-[11px] font-black ${isOverLimit ? 'text-red-500' : 'text-gray-400'}`}>
                                        {commento.length} / {MAX_CHARS}
                                    </span>
                                </div>
                            </div>

                            {/* Campo nome */}
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={nomeDisplay}
                                    onChange={e => setNomeDisplay(e.target.value)}
                                    placeholder="Lascia un nome (opzionale)"
                                    className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 placeholder-gray-300 focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all shadow-sm"
                                />
                                <div className="px-1">
                                    {user ? (
                                        <p className="text-[10px] font-bold text-gray-400">
                                            Precompilato con i tuoi dati. Svuota per restare anonimo.
                                        </p>
                                    ) : (
                                        <p className="text-[10px] font-bold text-gray-400">
                                            Puoi inserire un nome per renderlo pubblico.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Errore */}
                            {error && (
                                <div className="bg-red-50 text-red-500 text-xs p-3 rounded-2xl font-bold border border-red-100 text-center">
                                    {error}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Bottom fade for scroll context */}
                    <div className="sticky bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                </div>

                {/* Sticky Footer Actions */}
                {!success && (
                    <div className="shrink-0 p-6 pt-4 bg-white border-t border-gray-50 flex flex-col space-y-3">
                        <button
                            onClick={handleSubmit}
                            disabled={loading || isOverLimit}
                            className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all active:scale-[0.98] flex items-center justify-center space-x-2
                                ${(loading || isOverLimit) 
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                                    : 'bg-secondary text-white shadow-secondary/20 hover:bg-secondary/90'}`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center space-x-3">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>INVIO...</span>
                                </div>
                            ) : (
                                <span>INVIA RECENSIONE</span>
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-4 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:bg-gray-50 rounded-2xl transition-all"
                        >
                            CHIUDI
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewModal;
