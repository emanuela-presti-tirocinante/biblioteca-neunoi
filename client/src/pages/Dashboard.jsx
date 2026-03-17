import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Dashboard = () => {
    const navigate = useNavigate();
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('in_corso'); // 'in_corso', 'in_attesa', 'storico'

    useEffect(() => {
        fetchLoans();
    }, []);

    const fetchLoans = async () => {
        setLoading(true);
        try {
            const res = await api.get('/loans');
            setLoans(res.data);
        } catch (err) {
            console.error("Error fetching loans", err);
        } finally {
            setLoading(false);
        }
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

    const handleCancelLoan = async (loanId) => {
        if (!window.confirm('Sei sicuro di voler annullare questa richiesta di prestito?')) return;

        try {
            await api.delete(`/loans/${loanId}`);
            // Update local state by removing the deleted loan
            setLoans(loans.filter(loan => loan.id !== loanId));
        } catch (err) {
            console.error("Error cancelling loan", err);
            alert(err.response?.data?.message || "Errore durante l'annullamento del prestito");
        }
    };

    const filteredLoans = loans.filter(loan => {
        if (activeTab === 'in_corso') return loan.stato === 'approvato';
        if (activeTab === 'in_attesa') return loan.stato === 'richiesto';
        if (activeTab === 'storico') return loan.stato === 'restituito' || loan.stato === 'rifiutato';
        return false;
    });

    const inCorsoLoans = loans.filter(l => l.stato === 'approvato');
    const inAttesaLoans = loans.filter(l => l.stato === 'richiesto');
    const storicoLoans = loans.filter(l => l.stato === 'restituito' || l.stato === 'rifiutato');

    const getStatusLabel = (stato) => {
        const labels = {
            'approvato': 'In Lettura',
            'richiesto': 'In Attesa',
            'restituito': 'Restituito',
            'rifiutato': 'Non Approvato'
        };
        return labels[stato] || stato;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-10 h-10 border-4 border-accent border-t-secondary rounded-full animate-spin"></div>
                <p className="text-xs font-black text-primary uppercase tracking-widest animate-pulse">Caricamento prestiti...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full pb-20 bg-bg-light">
            {/* Red Header Banner */}
            <div className="bg-secondary p-8 text-center border-b-4 border-white">
                <h1 className="text-white text-xl font-black uppercase tracking-widest">
                    I MIEI PRESTITI
                </h1>
            </div>

            {/* Tab Selector */}
            <div className="bg-white border-b border-gray-100 flex justify-between px-6 py-4 sticky top-14 z-20 shadow-sm overflow-x-auto no-scrollbar space-x-3 items-center">
                <button
                    onClick={() => setActiveTab('in_corso')}
                    className={`flex-1 relative overflow-visible py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap
                        ${activeTab === 'in_corso'
                            ? 'bg-secondary text-white shadow-md'
                            : 'bg-[#F5F5F5] text-gray-500 hover:bg-gray-200'}`}
                >
                    In corso
                    <Badge count={inCorsoLoans.length} active={activeTab === 'in_corso'} />
                </button>
                <button
                    onClick={() => setActiveTab('in_attesa')}
                    className={`flex-1 relative overflow-visible py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap
                        ${activeTab === 'in_attesa'
                            ? 'bg-secondary text-white shadow-md'
                            : 'bg-[#F5F5F5] text-gray-500 hover:bg-gray-200'}`}
                >
                    In attesa
                    <Badge count={inAttesaLoans.length} active={activeTab === 'in_attesa'} />
                </button>
                <button
                    onClick={() => setActiveTab('storico')}
                    className={`flex-1 relative overflow-visible py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap
                        ${activeTab === 'storico'
                            ? 'bg-secondary text-white shadow-md'
                            : 'bg-[#F5F5F5] text-gray-500 hover:bg-gray-200'}`}
                >
                    Storico
                    <Badge count={storicoLoans.length} active={activeTab === 'storico'} />
                </button>
            </div>

            <div className="px-6 py-8 flex flex-col space-y-6">
                {/* Loans List */}
                <div className="flex flex-col space-y-4">
                    {filteredLoans.length > 0 ? (
                        filteredLoans.map(loan => (
                            <div key={loan.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex p-4 shadow-sm hover:shadow-md transition-shadow">
                                {/* Book Cover (Left) */}
                                <div className="w-20 h-28 flex-shrink-0 overflow-hidden bg-gray-50 rounded-lg shadow-inner">
                                    <img
                                        src={loan.Book?.copertina_url || "https://via.placeholder.com/150x200/d1e9ff/1a5e6a?text=Biblioteca+Neu"}
                                        alt={loan.Book?.titolo}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Content (Center) */}
                                <div className="flex-grow pl-4 flex flex-col justify-center">
                                    <h3 className="text-xs font-black uppercase text-primary leading-tight line-clamp-2">
                                        {loan.Book?.titolo}
                                    </h3>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">
                                        {loan.Book?.autore}
                                    </p>

                                    <div className="mt-3 flex flex-col space-y-1">
                                        {activeTab === 'in_corso' && loan.data_fine_prevista && (
                                            <p className="text-[9px] font-bold text-secondary uppercase">
                                                Scadenza: {new Date(loan.data_fine_prevista).toLocaleDateString()}
                                            </p>
                                        )}
                                        {activeTab === 'in_attesa' && (
                                            <p className="text-[9px] font-bold text-gray-400 uppercase italic">
                                                Richiesto il {new Date(loan.createdAt).toLocaleDateString()}
                                            </p>
                                        )}
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${loan.stato === 'approvato' ? 'bg-green-500' :
                                                loan.stato === 'richiesto' ? 'bg-yellow-500' : 'bg-gray-400'
                                                }`} />
                                            <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">
                                                {getStatusLabel(loan.stato)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action (Right) */}
                                <div className="flex items-center pl-2">
                                    {activeTab === 'in_attesa' ? (
                                        <button
                                            onClick={() => handleCancelLoan(loan.id)}
                                            className="px-3 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100 transition-colors text-[9px] font-black uppercase tracking-widest"
                                        >
                                            Annulla
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => alert('Funzionalità recensioni in arrivo!')}
                                            className="p-3 bg-accent/10 text-primary border border-accent/20 rounded-xl hover:bg-accent/20 transition-colors group"
                                        >
                                            <svg className="w-5 h-5 group-active:scale-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.196-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-dashed border-gray-200 px-10 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-loose">
                                {activeTab === 'in_corso' ? 'Nessun libro in lettura al momento' :
                                    activeTab === 'in_attesa' ? 'Non hai richieste in attesa' : 'Lo storico dei tuoi prestiti è vuoto'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Explore Catalog Button */}
                <div className="pt-4">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-accent text-primary py-4 rounded-2xl font-black uppercase tracking-widest shadow-md active:scale-[0.98] transition-all flex items-center justify-center space-x-3"
                    >
                        <span>Esplora Catalogo</span>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
