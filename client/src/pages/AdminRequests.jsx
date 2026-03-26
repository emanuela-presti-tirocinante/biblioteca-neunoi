import { useState, useEffect } from 'react';
import api from '../utils/api';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const AdminRequests = () => {
    const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'active', 'history'
    const [loans, setLoans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedCardId, setExpandedCardId] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [isLoadingReviews, setIsLoadingReviews] = useState(false);

    const toggleExpand = (id) => {
        setExpandedCardId(expandedCardId === id ? null : id);
    };

    const handleAction = async (id, stato) => {
        try {
            await api.put(`/loans/${id}`, { stato });
            fetchLoans(); // Refresh data
        } catch (err) {
            console.error(err);
            alert('Errore durante l\'aggiornamento della richiesta');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/D';
        return new Date(dateString).toLocaleDateString('it-IT');
    };

    const Badge = ({ count, active, isHeader = false }) => {
        if (count === 0 && !isHeader) return null;

        if (isHeader) {
            return (
                <span className="ml-2 inline-flex items-center justify-center rounded-full font-black shadow-sm transition-all duration-300 w-6 h-6 text-[10px] bg-yellow-400 text-gray-900">
                    {count}
                </span>
            );
        }

        return (
            <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-gray-900 text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-md border-2 border-white z-10 transition-all duration-300">
                {count}
            </span>
        );
    };

    useEffect(() => {
        fetchLoans();
        fetchReviews();
    }, []);

    const fetchLoans = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/loans');
            setLoans(response.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Errore nel caricamento dei prestiti');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchReviews = async () => {
        setIsLoadingReviews(true);
        try {
            const response = await fetch(`${BASE_URL}/reviews/pending`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setReviews(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingReviews(false);
        }
    };

    const handleApproveReview = async (reviewId) => {
        try {
            await fetch(`${BASE_URL}/reviews/${reviewId}/approva`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            fetchReviews();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        try {
            await fetch(`${BASE_URL}/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            fetchReviews();
        } catch (err) {
            console.error(err);
        }
    };

    // Filters based on state
    const pendingRequests = loans.filter(l => l.stato === 'richiesto');
    const activeLoans = loans.filter(l => l.stato === 'approvato');
    const historyLoans = loans.filter(l => ['rifiutato', 'restituito', 'scaduto'].includes(l.stato));
    const pendingReviews = reviews.filter(r => !r.approvata);

    const renderTabContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="w-10 h-10 border-4 border-accent border-t-secondary rounded-full animate-spin"></div>
                    <p className="text-xs font-black text-primary uppercase tracking-widest animate-pulse">Caricamento...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-center">
                    <p className="text-red-600 text-xs font-bold uppercase tracking-tight">{error}</p>
                </div>
            );
        }

        switch (activeTab) {
            case 'pending':
                return (
                    <div className="space-y-4">
                        <div className="flex items-center mb-6">
                            <div className="h-6 w-1 bg-secondary rounded-full mr-3"></div>
                            <h2 className="text-primary font-black text-sm uppercase tracking-tight flex items-center">
                                RICHIESTE IN ATTESA
                                <Badge count={pendingRequests.length} active={false} isHeader={true} />
                            </h2>
                        </div>
                        {pendingRequests.length === 0 ? (
                            <p className="text-[10px] text-gray-400 font-bold uppercase italic py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">Nessuna richiesta in attesa</p>
                        ) : (
                            <div className="space-y-4">
                                {pendingRequests.map(loan => (
                                    <div
                                        key={loan.id}
                                        className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden transition-all duration-300"
                                    >
                                        {/* Compact Header */}
                                        <div
                                            onClick={() => toggleExpand(loan.id)}
                                            className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex-grow space-y-1">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-[10px] font-black text-secondary uppercase bg-accent px-2 py-0.5 rounded">IN ATTESA</span>
                                                    <h3 className="text-xs font-black uppercase text-primary tracking-tight">{loan.User?.nome} {loan.User?.cognome}</h3>
                                                </div>
                                                <p className="text-[11px] font-bold text-gray-500 uppercase">{loan.Book?.titolo}</p>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase">Richiesto il: {formatDate(loan.createdAt)}</p>
                                            </div>
                                            <div className={`transition-transform duration-300 ${expandedCardId === loan.id ? 'rotate-180' : ''}`}>
                                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        <div className={`transition-all duration-300 ease-in-out border-t border-gray-50 bg-[#FAFAFA] ${expandedCardId === loan.id ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                            <div className="p-6 space-y-6">
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <div className="space-y-1">
                                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Utente</span>
                                                            <p className="text-[11px] font-black text-primary uppercase">{loan.User?.nome} {loan.User?.cognome}</p>
                                                            <a href={`mailto:${loan.User?.email}`} className="text-[10px] font-bold text-secondary underline block">{loan.User?.email}</a>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Dati Libro</span>
                                                            <p className="text-[11px] font-black text-primary uppercase">{loan.Book?.titolo}</p>
                                                            <p className="text-[10px] font-bold text-gray-500 uppercase">{loan.Book?.autore}</p>
                                                            <p className="text-[10px] font-bold text-gray-500 uppercase">Categoria: {loan.Book?.Categories?.[0]?.nome || 'N/D'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="space-y-1">
                                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Informazioni Tecniche</span>
                                                            <p className="text-[10px] font-bold text-gray-500">Cod. Archivio: <span className="text-primary font-black uppercase ml-1">{loan.Book?.cod_archivio || 'N/D'}</span></p>
                                                            <p className="text-[10px] font-bold text-gray-500">Copie Disponibili: <span className="text-primary font-black uppercase ml-1">{loan.Book?.copie_disponibili}</span></p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Data Richiesta</span>
                                                            <p className="text-[11px] font-black text-primary">{formatDate(loan.createdAt)}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex space-x-3 pt-4 border-t border-gray-100">
                                                    <button
                                                        onClick={() => handleAction(loan.id, 'approvato')}
                                                        className="flex-grow bg-green-500 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-md active:scale-95 transition-all hover:bg-green-600"
                                                    >
                                                        APPROVA
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(loan.id, 'rifiutato')}
                                                        className="flex-grow bg-red-500 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-md active:scale-95 transition-all hover:bg-red-600"
                                                    >
                                                        RIFIUTA
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'active':
                const getDeadlineStatus = (dueDate) => {
                    // ... (existing logic)
                    if (!dueDate) return { color: 'bg-gray-400', text: 'N/D' };
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const due = new Date(dueDate);
                    due.setHours(0, 0, 0, 0);
                    const diffTime = due - today;
                    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays < 0) return { color: 'bg-red-500', text: 'SCADUTO' };
                    if (diffDays <= 3) return { color: 'bg-orange-500', text: 'IN SCADENZA' };
                    return { color: 'bg-green-500', text: 'IN CORSO' };
                };

                return (
                    <div className="space-y-4">
                        <div className="flex items-center mb-6">
                            <div className="h-6 w-1 bg-secondary rounded-full mr-3"></div>
                            <h2 className="text-primary font-black text-sm uppercase tracking-tight flex items-center">
                                PRESTITI ATTIVI
                                <Badge count={activeLoans.length} active={false} isHeader={true} />
                            </h2>
                        </div>
                        {activeLoans.length === 0 ? (
                            <p className="text-[10px] text-gray-400 font-bold uppercase italic py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">Nessun prestito attivo</p>
                        ) : (
                            <div className="space-y-4">
                                {activeLoans.map(loan => {
                                    const status = getDeadlineStatus(loan.data_fine_prevista);
                                    return (
                                        <div
                                            key={loan.id}
                                            className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden transition-all duration-300"
                                        >
                                            {/* Compact Header */}
                                            <div
                                                onClick={() => toggleExpand(loan.id)}
                                                className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex-grow space-y-1">
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`text-[9px] font-black text-white uppercase px-2 py-0.5 rounded ${status.color}`}>
                                                            {status.text}
                                                        </span>
                                                        <h3 className="text-xs font-black uppercase text-primary tracking-tight">
                                                            {loan.User?.nome} {loan.User?.cognome}
                                                        </h3>
                                                    </div>
                                                    <p className="text-[11px] font-bold text-gray-500 uppercase">{loan.Book?.titolo}</p>
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase">Scadenza: {formatDate(loan.data_fine_prevista)}</p>
                                                </div>
                                                <div className={`transition-transform duration-300 ${expandedCardId === loan.id ? 'rotate-180' : ''}`}>
                                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>

                                            {/* Expanded Details */}
                                            <div className={`transition-all duration-300 ease-in-out border-t border-gray-50 bg-[#FAFAFA] ${expandedCardId === loan.id ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                                <div className="p-6 space-y-6">
                                                    <div className="grid grid-cols-2 gap-6">
                                                        <div className="space-y-4">
                                                            <div className="space-y-1">
                                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Utente</span>
                                                                <p className="text-[11px] font-black text-primary uppercase">{loan.User?.nome} {loan.User?.cognome}</p>
                                                                <a href={`mailto:${loan.User?.email}`} className="text-[10px] font-bold text-secondary underline block">{loan.User?.email}</a>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Date Prestito</span>
                                                                <p className="text-[10px] font-bold text-gray-500 uppercase">Inizio: <span className="text-primary font-black ml-1">{formatDate(loan.data_inizio)}</span></p>
                                                                <p className="text-[10px] font-bold text-gray-500 uppercase">Fine prevista: <span className="text-primary font-black ml-1">{formatDate(loan.data_fine_prevista)}</span></p>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <div className="space-y-1">
                                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Libro</span>
                                                                <p className="text-[11px] font-black text-primary uppercase">{loan.Book?.titolo}</p>
                                                                <p className="text-[10px] font-bold text-gray-500">Cod. Archivio: <span className="text-primary font-black ml-1">{loan.Book?.cod_archivio || 'N/D'}</span></p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Badge Scadenza</span>
                                                                <div className="flex items-center space-x-2">
                                                                    <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                                                                    <p className="text-[10px] font-black text-primary uppercase">{status.text}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Action Button */}
                                                    <div className="pt-4 border-t border-gray-100">
                                                        <button
                                                            onClick={() => handleAction(loan.id, 'restituito')}
                                                            className="w-full bg-primary text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-md active:scale-95 transition-all hover:bg-black"
                                                        >
                                                            SEGNA COME RESTITUITO
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            case 'history':
                const getStatusBadge = (stato) => {
                    // ... (existing logic)
                    switch (stato) {
                        case 'restituito': return { color: 'bg-blue-500', text: 'RESTITUITO' };
                        case 'rifiutato': return { color: 'bg-gray-500', text: 'RIFIUTATO' };
                        case 'scaduto': return { color: 'bg-red-800', text: 'SCADUTO' };
                        default: return { color: 'bg-gray-400', text: stato.toUpperCase() };
                    }
                };

                return (
                    <div className="space-y-4">
                        <div className="flex items-center mb-6">
                            <div className="h-6 w-1 bg-secondary rounded-full mr-3"></div>
                            <h2 className="text-primary font-black text-sm uppercase tracking-tight flex items-center">
                                STORICO
                                <Badge count={historyLoans.length} active={false} isHeader={true} />
                            </h2>
                        </div>
                        {historyLoans.length === 0 ? (
                            <p className="text-[10px] text-gray-400 font-bold uppercase italic py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">Lo storico è vuoto</p>
                        ) : (
                            <div className="space-y-4">
                                {historyLoans.map(loan => {
                                    const status = getStatusBadge(loan.stato);
                                    return (
                                        <div
                                            key={loan.id}
                                            className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden opacity-80"
                                        >
                                            {/* Compact Header */}
                                            <div
                                                onClick={() => toggleExpand(loan.id)}
                                                className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex-grow space-y-1">
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`text-[9px] font-black text-white uppercase px-2 py-0.5 rounded ${status.color}`}>
                                                            {status.text}
                                                        </span>
                                                        <h3 className="text-xs font-black uppercase text-primary tracking-tight">
                                                            {loan.User?.nome} {loan.User?.cognome}
                                                        </h3>
                                                    </div>
                                                    <p className="text-[11px] font-bold text-gray-500 uppercase">{loan.Book?.titolo}</p>
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase">Concluso il: {formatDate(loan.updatedAt)}</p>
                                                </div>
                                                <div className={`transition-transform duration-300 ${expandedCardId === loan.id ? 'rotate-180' : ''}`}>
                                                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>

                                            {/* Expanded Details */}
                                            <div className={`transition-all duration-300 ease-in-out border-t border-gray-50 bg-[#FAFAFA] ${expandedCardId === loan.id ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                                <div className="p-6 space-y-6">
                                                    <div className="grid grid-cols-2 gap-6">
                                                        <div className="space-y-4">
                                                            <div className="space-y-1">
                                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Utente</span>
                                                                <p className="text-[11px] font-black text-primary uppercase">{loan.User?.nome} {loan.User?.cognome}</p>
                                                                <p className="text-[10px] font-bold text-gray-500">{loan.User?.email}</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Riepilogo Date</span>
                                                                <p className="text-[10px] font-bold text-gray-500 uppercase">Inizio: <span className="text-primary font-black ml-1">{formatDate(loan.data_inizio)}</span></p>
                                                                {loan.stato === 'restituito' && (
                                                                    <p className="text-[10px] font-bold text-gray-500 uppercase">Restituito: <span className="text-secondary font-black ml-1">{formatDate(loan.updatedAt)}</span></p>
                                                                )}
                                                                {loan.stato === 'rifiutato' && (
                                                                    <p className="text-[10px] font-bold text-gray-500 uppercase">Rifiutato: <span className="text-red-500 font-black ml-1">{formatDate(loan.updatedAt)}</span></p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <div className="space-y-1">
                                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Libro</span>
                                                                <p className="text-[11px] font-black text-primary uppercase">{loan.Book?.titolo}</p>
                                                                <p className="text-[10px] font-bold text-gray-500">Cod. Archivio: <span className="text-primary font-black ml-1">{loan.Book?.cod_archivio || 'N/D'}</span></p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Stato Finale</span>
                                                                <div className="flex items-center space-x-2">
                                                                    <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                                                                    <p className="text-[10px] font-black text-primary uppercase">{status.text}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            case 'reviews':
                return (
                    <div className="space-y-4">
                        <div className="flex items-center mb-6">
                            <div className="h-6 w-1 bg-secondary rounded-full mr-3"></div>
                            <h2 className="text-primary font-black text-sm uppercase tracking-tight flex items-center">
                                RECENSIONI IN ATTESA
                                <Badge count={pendingReviews.length} active={false} isHeader={true} />
                            </h2>
                        </div>
                        {isLoadingReviews ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <div className="w-10 h-10 border-4 border-accent border-t-secondary rounded-full animate-spin"></div>
                                <p className="text-xs font-black text-primary uppercase tracking-widest animate-pulse">Caricamento...</p>
                            </div>
                        ) : pendingReviews.length === 0 ? (
                            <p className="text-[10px] text-gray-400 font-bold uppercase italic py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
                                Nessuna recensione in attesa
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {pendingReviews.map(review => (
                                    <div
                                        key={review.id}
                                        className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
                                    >
                                        <div className="p-5 space-y-3">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-[10px] font-black text-secondary uppercase bg-accent px-2 py-0.5 rounded">
                                                    IN ATTESA
                                                </span>
                                                <h3 className="text-xs font-black uppercase text-primary tracking-tight">
                                                    {review.nome_display || 'Anonimo'}
                                                </h3>
                                            </div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                {review.Book?.titolo || 'Titolo non disponibile'}
                                            </p>
                                            <p className="text-xs text-gray-600 font-medium bg-gray-50 rounded-xl p-3 border border-gray-100">
                                                {review.commento || <span className="italic text-gray-400">Nessun commento</span>}
                                            </p>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase">
                                                Inviata il: {new Date(review.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
                                            </p>
                                            <div className="flex space-x-3 pt-2 border-t border-gray-100">
                                                <button
                                                    onClick={() => handleApproveReview(review.id)}
                                                    className="flex-grow bg-green-500 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-md active:scale-95 transition-all hover:bg-green-600"
                                                >
                                                    APPROVA
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteReview(review.id)}
                                                    className="flex-grow bg-red-500 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-md active:scale-95 transition-all hover:bg-red-600"
                                                >
                                                    ELIMINA
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white pb-20">
            {/* Header Banner */}
            <div className="bg-secondary p-8 text-center border-b-4 border-white">
                <h1 className="text-white text-xl font-black uppercase tracking-widest">
                    RICHIESTE
                </h1>
            </div>

            <div className="bg-white border-b border-gray-100 px-6 py-4 flex w-full space-x-3 items-center sticky top-0 z-20">
                <button
                    onClick={() => { setActiveTab('pending'); setExpandedCardId(null); }}
                    className={`flex-1 relative overflow-visible px-2 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-wider transition-all
                        ${activeTab === 'pending'
                            ? 'bg-secondary text-white shadow-[0_2px_8px_-2px_rgba(226,31,29,0.3)]'
                            : 'bg-[#F5F5F5] text-gray-600 hover:bg-gray-200'}`}
                >
                    IN ATTESA
                    <Badge count={pendingRequests.length} active={activeTab === 'pending'} />
                </button>
                <button
                    onClick={() => { setActiveTab('active'); setExpandedCardId(null); }}
                    className={`flex-1 relative overflow-visible px-2 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-wider transition-all
                        ${activeTab === 'active'
                            ? 'bg-secondary text-white shadow-[0_2px_8px_-2px_rgba(226,31,29,0.3)]'
                            : 'bg-[#F5F5F5] text-gray-600 hover:bg-gray-200'}`}
                >
                    ATTIVI
                    <Badge count={activeLoans.length} active={activeTab === 'active'} />
                </button>
                <button
                    onClick={() => { setActiveTab('history'); setExpandedCardId(null); }}
                    className={`flex-1 relative overflow-visible px-2 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-wider transition-all
                        ${activeTab === 'history'
                            ? 'bg-secondary text-white shadow-[0_2px_8px_-2px_rgba(226,31,29,0.3)]'
                            : 'bg-[#F5F5F5] text-gray-600 hover:bg-gray-200'}`}
                >
                    STORICO
                    <Badge count={historyLoans.length} active={activeTab === 'history'} />
                </button>
                <button
                    onClick={() => { setActiveTab('reviews'); setExpandedCardId(null); }}
                    className={`flex-1 relative overflow-visible px-2 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-wider transition-all
                        ${activeTab === 'reviews'
                            ? 'bg-secondary text-white shadow-[0_2px_8px_-2px_rgba(226,31,29,0.3)]'
                            : 'bg-[#F5F5F5] text-gray-600 hover:bg-gray-200'}`}
                >
                    RECENSIONI
                    <Badge count={pendingReviews.length} active={activeTab === 'reviews'} />
                </button>
            </div>

            <div className="px-6 py-6 flex flex-col space-y-6">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default AdminRequests;
