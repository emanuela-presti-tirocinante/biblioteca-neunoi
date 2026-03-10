import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { getBookById } from '../data/catalog';
import LoanFormContent from '../components/LoanFormContent';

const BookDetails = () => {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSelectingDates, setIsSelectingDates] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Use local extracted data as the source of truth
        const bookData = getBookById(id);
        setBook(bookData);
        setLoading(false);
    }, [id]);

    const handleLoanRequestClick = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setIsSelectingDates(true);
    };

    const handleConfirmLoan = async (loanData) => {
        setIsSubmitting(true);
        try {
            await api.post('/loans', { 
                bookId: book.id, 
                ...loanData 
            });
            alert('Richiesta prestito inviata con successo!');
            navigate('/dashboard');
        } catch (err) {
            alert(err.response?.data?.message || 'Errore nella richiesta');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-10">Caricamento...</div>;
    if (!book) return <div className="text-center py-10">Libro non trovato</div>;

    return (
        <div className="space-y-6 pb-10">
            {/* Header / Back Link */}
            <div className="flex items-center justify-between">
                <button 
                    onClick={() => isSelectingDates ? setIsSelectingDates(false) : navigate(-1)} 
                    className="p-3 bg-gray-50 text-gray-500 rounded-2xl hover:text-primary transition-all shadow-sm"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${book.disponibile ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {book.disponibile ? 'Disponibile' : 'Esaurito'}
                </span>
            </div>

            {/* Book Cover - Central on Mobile */}
            <div className={`flex justify-center transition-all duration-500 ${isSelectingDates ? 'scale-75 -my-10 opacity-50' : 'scale-100'}`}>
                <div className="w-56 h-80 bg-gray-100 rounded-3xl shadow-xl overflow-hidden ring-4 ring-white">
                    <img src={book.cover} alt={book.titolo} className="w-full h-full object-cover" />
                </div>
            </div>

            {/* Book Info */}
            <div className={`text-center space-y-2 pt-2 transition-all duration-500 ${isSelectingDates ? 'translate-y-[-20px] opacity-40' : 'translate-y-0 opacity-100'}`}>
                <h1 className="text-2xl font-black text-gray-900 leading-tight px-2 uppercase">{book.titolo}</h1>
                <p className="text-lg text-primary font-medium uppercase tracking-tight">{book.autore}</p>
            </div>

            {/* Conditional Content: Details or Form */}
            <div className="relative min-h-[300px]">
                {!isSelectingDates ? (
                    <div className="animate-fade-in space-y-6">
                        {/* Details Card */}
                        <div className="bg-gray-50 rounded-3xl p-6 space-y-4 border border-gray-100">
                            <div>
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Descrizione</h4>
                                <p className="text-sm text-gray-600 leading-relaxed italic">
                                    {book.descrizione || "Nessuna descrizione disponibile per questo volume. Contatta la biblioteca per maggiori informazioni."}
                                </p>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Anno</h4>
                                <p className="text-xs font-black text-gray-900 uppercase">{book.anno || '---'}</p>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="pt-2">
                            {user ? (
                                <button
                                    onClick={handleLoanRequestClick}
                                    disabled={book.copie_disponibili <= 0}
                                    className={`w-full py-5 rounded-2xl shadow-xl shadow-primary/20 text-xs font-black uppercase tracking-widest text-white transition-all transform active:scale-95
                                        ${book.copie_disponibili > 0 ? 'bg-primary hover:bg-black' : 'bg-gray-300 cursor-not-allowed shadow-none'}`}
                                >
                                    {book.copie_disponibili > 0 ? 'Richiedi Prestito' : 'Non disponibile'}
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full py-5 rounded-2xl bg-gray-900 text-white text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                                >
                                    Accedi per richiedere
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="animate-fade-in-up">
                        <LoanFormContent 
                            book={book} 
                            onConfirm={handleConfirmLoan} 
                            onCancel={() => setIsSelectingDates(false)}
                            isLoading={isSubmitting}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookDetails;
