import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import LoanRequestModal from '../components/LoanRequestModal';
import { MessageCircle } from 'lucide-react';
import ReviewModal from '../components/ReviewModal';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const CategoryDetail = () => {
    const { id } = useParams(); // 'id' here is the category name from encodeURIComponent
    const categoryName = decodeURIComponent(id);
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const searchInputRef = useRef(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBook, setSelectedBook] = useState(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Review states
    const [reviewCounts, setReviewCounts] = useState({});
    const [selectedBookReviews, setSelectedBookReviews] = useState([]);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewTargetBook, setReviewTargetBook] = useState(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [totalBooks, setTotalBooks] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    // States for real data
    const [categories, setCategories] = useState([]);
    const [books, setBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories');
                setCategories(response.data);
            } catch (err) {
                console.error(err);
                setError('Errore nel caricamento delle categorie');
            }
        };

        fetchCategories();
    }, []);

    // Fetch books when category, page or search term changes
    useEffect(() => {
        const fetchBooks = async () => {
            if (categories.length === 0) return;

            setIsLoading(true);
            try {
                // Find ID from name
                const currentCat = categories.find(c => c.nome === categoryName);
                if (!currentCat) {
                    setBooks([]);
                    setIsLoading(false);
                    return;
                }

                const response = await api.get(`/books?category=${currentCat.id}&page=${currentPage}&limit=10&search=${searchTerm}`);
                const { books: newBooks, total, totalPages: tp } = response.data;

                setBooks(newBooks || []);
                setTotalBooks(total || 0);
                setTotalPages(tp || 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (err) {
                console.error(err);
                setError('Errore nel caricamento dei libri');
            } finally {
                setIsLoading(false);
            }
        };

        fetchBooks();
    }, [categoryName, categories, currentPage, searchTerm]);

    // Reset pagination when category or search term changes
    useEffect(() => {
        setCurrentPage(1);
        setBooks([]);
    }, [categoryName, searchTerm]);

    // Fetch review counts for the current list of books
    useEffect(() => {
        const fetchReviewCounts = async () => {
            if (books.length === 0) {
                setReviewCounts({});
                return;
            }
            try {
                const counts = {};
                await Promise.all(
                    books.map(async (book) => {
                        try {
                            const res = await fetch(`${BASE_URL}/reviews/book/${book.id}`);
                            if (res.ok) {
                                const data = await res.json();
                                counts[book.id] = data.length;
                            } else {
                                counts[book.id] = 0;
                            }
                        } catch (err) {
                            console.error(`Errore fetch recensioni libro ${book.id}:`, err);
                            counts[book.id] = 0;
                        }
                    })
                );
                setReviewCounts(counts);
            } catch (err) {
                console.error("Errore generico in fetchReviewCounts:", err);
            }
        };

        fetchReviewCounts();
    }, [books]);

    // Fetch reviews for the selected book in the bottom sheet
    useEffect(() => {
        if (!selectedBook) {
            setSelectedBookReviews([]);
            setShowAllReviews(false);
            return;
        }

        const fetchSelectedBookReviews = async () => {
            try {
                const res = await fetch(`${BASE_URL}/reviews/book/${selectedBook.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setSelectedBookReviews(data);
                } else {
                    setSelectedBookReviews([]);
                }
            } catch (err) {
                console.error(`Errore fetch recensioni per selectedBook ${selectedBook.id}:`, err);
                setSelectedBookReviews([]);
            } finally {
                setShowAllReviews(false);
            }
        };

        fetchSelectedBookReviews();
    }, [selectedBook]);

    // Filtering is now handled by server side search parameter
    // const filteredBooks = books.filter(book => {
    //     const term = searchTerm.toLowerCase();
    //     const titolo = String(book.titolo || "").toLowerCase();
    //     const autore = String(book.autore || "").toLowerCase();
    //     return titolo.includes(term) || autore.includes(term);
    // });

    // const booksToShow = filteredBooks.slice(0, visibleCount);

    const handleLoanRequest = (e, book) => {
        if (e) e.stopPropagation();

        if (!user) {
            navigate('/login', {
                state: {
                    from: location.pathname + location.search,
                    book: book
                }
            });
            return;
        }

        setSelectedBook(book);
        setIsSheetOpen(false); // Close details sheet if open
        setIsRequestModalOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const handleConfirmLoan = async (loanData) => {
        console.log('loanData ricevuto:', loanData);
        setIsSubmitting(true);
        try {
            await api.post('/loans', { 
                bookId: selectedBook.id, 
                ...loanData 
            });
            alert(`Richiesta inviata con successo per: ${selectedBook.titolo}!`);
            setIsRequestModalOpen(false);
            document.body.style.overflow = 'auto';
            navigate('/dashboard');
        } catch (err) {
            alert(err.response?.data?.message || 'Errore nella richiesta');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openBook = (book) => {
        setSelectedBook(book);
        setIsSheetOpen(true);
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    };

    const closeSheet = () => {
        setIsSheetOpen(false);
        document.body.style.overflow = 'auto';
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="flex flex-col min-h-full pb-20 relative">
            {/* Red Header Banner */}
            <div className="bg-secondary p-8 text-center border-b-4 border-white">
                <h1 className="text-white text-xl font-black uppercase tracking-widest">
                    CATEGORIE
                </h1>
            </div>

            {/* Horizontal Category Switcher */}
            <div className="bg-white border-b border-gray-100 px-4 py-4 flex overflow-x-auto no-scrollbar space-x-3 items-center sticky top-14 z-20">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => navigate(`/category/${encodeURIComponent(cat.nome)}`)}
                        className={`px-4 py-2 rounded-[20px] text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all
                            ${cat.nome === categoryName
                                ? 'bg-secondary text-white shadow-[0_2px_8px_-2px_rgba(226,31,29,0.3)]'
                                : 'bg-[#F5F5F5] text-gray-600 hover:bg-gray-200'}`}
                    >
                        {cat.nome}
                    </button>
                ))}
            </div>

            <div className="px-6 py-6 flex flex-col space-y-6">
                {/* Search Bar */}
                <div className="w-full flex items-center space-x-2 relative">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <div className="flex-grow relative">
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Cerca nella categoria"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-accent text-primary/70 placeholder-primary/40 text-sm font-bold py-2.5 px-4 rounded-md focus:outline-none pr-10"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    searchInputRef.current?.focus();
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-primary transition-colors"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-accent py-3 px-6 rounded-lg flex items-center justify-between shadow-sm">
                    <h2 className="text-primary font-black text-xs uppercase tracking-tight">{categoryName}</h2>
                    {!isLoading && !error && (
                        <span className="ml-4 text-[9px] font-black bg-white/50 px-2 py-0.5 rounded text-primary/60">
                            {totalBooks} LIBRI TROVATI
                        </span>
                    )}
                </div>

                {/* Loading / Error States */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-10 h-10 border-4 border-accent border-t-secondary rounded-full animate-spin"></div>
                        <p className="text-xs font-black text-primary uppercase tracking-widest animate-pulse">Caricamento libri...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-center">
                        <p className="text-red-600 text-xs font-bold uppercase tracking-tight">{error}</p>
                    </div>
                )}

                {/* Book List (Restored to horizontal single-column) */}
                {!isLoading && !error && (
                    <div className="flex flex-col space-y-4">
                        {books.length > 0 ? (
                            books.map(book => (
                                <div
                                    key={book.id}
                                    onClick={() => openBook(book)}
                                    className="bg-white border border-gray-100 rounded-xl overflow-hidden flex space-x-4 p-2.5 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                                >
                                    {/* Image Section (Left) */}
                                    <div className="w-20 h-28 flex-shrink-0 overflow-hidden bg-gray-100 rounded-lg">
                                        <img
                                            src={book.copertina_url || "/book-placeholder.svg"}
                                            alt={book.titolo}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Text Section (Right) */}
                                    <div className="flex-grow flex flex-col justify-between py-1">
                                        <div className="space-y-1">
                                            <h3 className="text-[11px] font-black uppercase text-primary leading-tight">
                                                {book.titolo}
                                            </h3>
                                            <p className="text-[9px] text-gray-500 font-bold uppercase">
                                                {book.autore}
                                            </p>
                                            <div className="flex items-center mt-1">
                                                <MessageCircle size={12} className="text-secondary mr-1" />
                                                <span className="text-[9px] font-black text-secondary">
                                                    {reviewCounts[book.id] ?? 0} RECENSIONI
                                                </span>
                                                <button
                                                    className="ml-2 text-[9px] font-black uppercase text-primary border border-primary rounded-xl px-2 py-0.5"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setReviewTargetBook(book);
                                                        setReviewModalOpen(true);
                                                    }}
                                                >
                                                    RECENSISCI
                                                </button>
                                            </div>
                                            <div className="flex flex-col space-y-0.5 pt-1">
                                                <p className="text-[9px] text-gray-400">
                                                    <span className="font-bold uppercase">Anno:</span> {book.anno_pubblicazione || 'N/D'}
                                                </p>
                                                <p className={`text-[9px] font-black uppercase ${book.copie_disponibili > 0 ? "text-green-600" : "text-red-600"}`}>
                                                    <span className="text-gray-400 font-bold">Stato:</span> {book.copie_disponibili > 0 ? "Disponibile" : "Esaurito"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Integrated Request Button (Bottom Right) */}
                                        <div className="flex justify-end pt-2">
                                            <button
                                                className="bg-accent text-primary px-4 py-2 rounded-lg font-black uppercase text-[9px] tracking-wider shadow-sm active:scale-95 transition-all"
                                                onClick={(e) => handleLoanRequest(e, book)}
                                            >
                                                Richiedi Prestito
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Nessun libro trovato in questa categoria</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Numbered Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-1.5 pt-4 pb-8">
                        {/* Prev arrow */}
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="w-8 h-8 flex items-center justify-center rounded-xl font-black text-[10px] uppercase shadow-sm bg-white text-primary border border-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                        >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {/* Page numbers */}
                        {(() => {
                            const pages = [];
                            const maxVisible = 5;
                            let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                            let end = Math.min(totalPages, start + maxVisible - 1);
                            if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

                            if (start > 1) {
                                pages.push(
                                    <button key={1} onClick={() => setCurrentPage(1)}
                                        className="w-8 h-8 flex items-center justify-center rounded-xl font-black text-[10px] uppercase shadow-sm bg-white text-primary border border-gray-100 transition-all active:scale-95">
                                        1
                                    </button>
                                );
                                if (start > 2) pages.push(<span key="start-ellipsis" className="w-8 h-8 flex items-center justify-center text-[10px] font-black text-primary/40">...</span>);
                            }

                            for (let i = start; i <= end; i++) {
                                pages.push(
                                    <button key={i} onClick={() => setCurrentPage(i)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-xl font-black text-[10px] uppercase shadow-sm transition-all active:scale-95 ${
                                            i === currentPage
                                                ? 'bg-secondary text-white'
                                                : 'bg-white text-primary border border-gray-100'
                                        }`}>
                                        {i}
                                    </button>
                                );
                            }

                            if (end < totalPages) {
                                if (end < totalPages - 1) pages.push(<span key="end-ellipsis" className="w-8 h-8 flex items-center justify-center text-[10px] font-black text-primary/40">...</span>);
                                pages.push(
                                    <button key={totalPages} onClick={() => setCurrentPage(totalPages)}
                                        className="w-8 h-8 flex items-center justify-center rounded-xl font-black text-[10px] uppercase shadow-sm bg-white text-primary border border-gray-100 transition-all active:scale-95">
                                        {totalPages}
                                    </button>
                                );
                            }

                            return pages;
                        })()}

                        {/* Next arrow */}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="w-8 h-8 flex items-center justify-center rounded-xl font-black text-[10px] uppercase shadow-sm bg-white text-primary border border-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                        >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Back to top button */}
            <button
                onClick={scrollToTop}
                className="fixed bottom-6 right-6 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all z-40 border-2 border-accent"
            >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                </svg>
            </button>

            {/* Bottom Sheet Backdrop */}
            {isSheetOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-[60] animate-in fade-in duration-300"
                    onClick={closeSheet}
                />
            )}

            {/* Bottom Sheet Component (Redesigned with external margins for floating effect) */}
            <div className={`fixed left-4 right-4 bottom-4 z-[70] transform bg-white rounded-3xl shadow-2xl transition-transform duration-300 ease-out flex flex-col max-h-[85vh] ${isSheetOpen ? 'translate-y-0' : 'translate-y-[120%]'}`}>
                {/* Drag handle / Close handle */}
                <div className="flex justify-center p-4">
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full cursor-pointer" onClick={closeSheet} />
                </div>

                {selectedBook && (
                    <div className="overflow-y-auto px-8 pt-6 pb-8 flex flex-col">
                        <div className="flex flex-col items-center mb-6">
                            <img
                                src={selectedBook.copertina_url || "/book-placeholder.svg"}
                                alt={selectedBook.titolo}
                                className="w-36 h-48 object-cover rounded-md shadow-lg mb-4"
                            />
                            <div className="text-center space-y-1">
                                <h3 className="text-base font-black text-primary uppercase leading-tight">{selectedBook.titolo}</h3>
                                <p className="text-xs font-bold text-gray-500 uppercase">{selectedBook.autore} ({selectedBook.anno_pubblicazione || 'N/D'})</p>
                                {selectedBook.editore && (
                                    <p className="text-xs text-gray-400 font-medium">{selectedBook.editore}</p>
                                )}
                                <div className="flex items-center gap-1 justify-center mt-3">
                                    <MessageCircle size={14} className="text-secondary" />
                                    <span className="text-xs font-black text-secondary uppercase">
                                        {selectedBookReviews.length} recensioni
                                    </span>
                                </div>
                                <button
                                    onClick={() => {
                                        setReviewTargetBook(selectedBook);
                                        setReviewModalOpen(true);
                                    }}
                                    className="mt-2 px-4 py-2 rounded-2xl bg-secondary text-white text-[11px] font-black uppercase tracking-widest shadow-sm mx-auto block"
                                >
                                    Scrivi una recensione
                                </button>
                            </div>
                        </div>

                        {/* Reviews List */}
                        <div className="mb-6">
                            {selectedBookReviews.length === 0 ? (
                                <p className="mt-3 text-xs text-gray-400 font-bold text-center">
                                    Ancora nessuna recensione
                                </p>
                            ) : (
                                <div className="mt-4">
                                    {(showAllReviews ? selectedBookReviews : selectedBookReviews.slice(0, 5)).map(review => (
                                        <div key={review.id} className="border-b border-gray-100 pb-2 mb-2">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-[10px] font-black text-primary uppercase">
                                                    {review.nome_display || "Anonimo"}
                                                </span>
                                                <span className="text-[9px] text-gray-400 font-bold">
                                                    {new Date(review.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 font-medium mt-0.5">
                                                {review.commento}
                                            </p>
                                        </div>
                                    ))}
                                    {selectedBookReviews.length > 5 && !showAllReviews && (
                                        <button
                                            onClick={() => setShowAllReviews(true)}
                                            className="mt-1 text-[10px] font-black text-secondary uppercase block w-full text-center"
                                        >
                                            Mostra tutte
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 text-xs font-medium text-gray-700">
                            <div className="flex justify-between border-b pb-2">
                                <span className="uppercase font-black text-primary">Disponibilità</span>
                                <span className={selectedBook.copie_disponibili > 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                                    {selectedBook.copie_disponibili > 0 ? "Disponibile" : "Non Disponibile"}
                                </span>
                            </div>

                            <div className="pt-2">
                                <span className="uppercase font-black text-primary block mb-2">Descrizione</span>
                                <p className="text-gray-600 leading-relaxed italic">
                                    {selectedBook.descrizione || "Nessuna descrizione disponibile."}
                                </p>
                            </div>
                        </div>

                        {/* Sticky CTA Button */}
                        <div className="mt-8 pt-4">
                            <button
                                onClick={(e) => handleLoanRequest(e, selectedBook)}
                                className="w-full bg-accent text-primary py-3 rounded-xl font-black uppercase tracking-wider shadow-md active:scale-[0.98] transition-all"
                            >
                                Richiedi Prestito
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Request Loan Modal (Calendario) */}
            <LoanRequestModal 
                book={selectedBook}
                isOpen={isRequestModalOpen}
                onClose={() => {
                    setIsRequestModalOpen(false);
                    document.body.style.overflow = 'auto';
                }}
                onConfirm={handleConfirmLoan}
                isLoading={isSubmitting}
            />

            {/* Review Modal */}
            <ReviewModal
                isOpen={reviewModalOpen}
                onClose={() => setReviewModalOpen(false)}
                bookId={reviewTargetBook?.id}
                bookTitle={reviewTargetBook?.titolo}
            />
        </div>
    );
};

export default CategoryDetail;
