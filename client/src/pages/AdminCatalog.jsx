import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';

const AdminCatalog = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.tab || 'books'); // 'books' or 'categories'
    const [stats, setStats] = useState({ books: 0, categories: 0 });
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [isDeleteSheetOpen, setIsDeleteSheetOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleteType, setDeleteType] = useState(null); // 'book' o 'category'
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const categoryDropdownRef = useRef(null);
    const firstNewBookRef = useRef(null);

    const fetchBooks = async (p = 1) => {
        setIsLoadingData(true);
        try {
            const params = {
                search: search || undefined,
                category: selectedCategory || undefined,
                limit: 20,
                page: p
            };
            const res = await api.get('/books', { params });
            const { books: newBooks, totalPages } = res.data;
            
            if (p === 1) {
                setBooks(newBooks);
            } else {
                setBooks(prev => [...prev, ...newBooks]);
            }
            setHasMore(p < totalPages);
            setPage(p);
        } catch (error) {
            console.error("Error fetching books:", error);
        } finally {
            setIsLoadingData(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const fetchStats = async () => {
        try {
            const [resBooks, resCats] = await Promise.all([
                api.get('/books', { params: { limit: 1 } }),
                api.get('/categories')
            ]);
            setStats({
                books: resBooks.data.total,
                categories: resCats.data.length
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const openDeleteConfirm = (item, type) => {
        setItemToDelete(item);
        setDeleteType(type);
        setIsDeleteSheetOpen(true);
    };

    const handleDeleteExecute = async () => {
        if (!itemToDelete || !deleteType) return;
        try {
            const endpoint = deleteType === 'book' ? `/books/${itemToDelete.id}` : `/categories/${itemToDelete.id}`;
            await api.delete(endpoint);
            setIsDeleteSheetOpen(false);
            if (deleteType === 'book') fetchBooks();
            else {
                fetchCategories();
                // If we are on categories tab, we might want to ensure we stay there
                // though usually deletion happens on the current tab.
            }
            fetchStats();
        } catch (error) {
            console.error("Error deleting item:", error);
            alert("Errore durante l'eliminazione");
        }
    };

    // Filter categories based on search (for categories tab)
    const filteredCategories = categories.filter(cat =>
        cat.nome.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        fetchBooks();
        fetchStats();
    }, []);

    useEffect(() => {
        if (activeTab === 'categories') fetchCategories();
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'books') fetchBooks(1);
    }, [search, selectedCategory]);

    useEffect(() => {
        if (page > 1 && firstNewBookRef.current) {
            firstNewBookRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [books]);


    const renderDeleteSheet = () => {
        if (!isDeleteSheetOpen) return null;

        return (
            <div className="fixed inset-0 z-[200] flex flex-col justify-end p-4">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
                    onClick={() => setIsDeleteSheetOpen(false)}
                ></div>

                {/* Floating Sheet */}
                <div className="relative bg-white rounded-3xl p-8 shadow-2xl animate-slide-up space-y-8 w-full max-w-lg mx-auto">
                    <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto -mt-2 mb-6 cursor-pointer" onClick={() => setIsDeleteSheetOpen(false)}></div>

                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-black text-primary uppercase tracking-tight">Conferma Eliminazione</h3>
                        <p className="text-sm font-medium text-gray-500 max-w-[280px] mx-auto italic">
                            Sei sicuro di voler eliminare dal catalogo <span className="font-black text-primary not-italic">"{itemToDelete?.titolo || itemToDelete?.nome}"</span>? L'azione è irreversibile.
                        </p>
                    </div>

                    <div className="flex flex-col space-y-3 pt-4">
                        <button
                            onClick={handleDeleteExecute}
                            className="w-full bg-secondary text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-secondary/20 active:scale-[0.98] transition-all"
                        >
                            ELIMINA DEFINITIVAMENTE
                        </button>
                        <button
                            onClick={() => setIsDeleteSheetOpen(false)}
                            className="w-full bg-white border border-gray-100 text-gray-400 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-50 transition-all font-bold"
                        >
                            ANNULLA
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#F8F9FA] pb-20">
            {renderDeleteSheet()}
            {/* Header Banner */}
            <div className="bg-secondary p-8 text-center border-b-4 border-white">
                <h1 className="text-white text-xl font-black uppercase tracking-widest">
                    GESTIONE CATALOGO
                </h1>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white border-b border-gray-100 px-4 py-4 flex overflow-x-auto no-scrollbar space-x-3 items-center sticky top-0 z-20">
                <button
                    onClick={() => { setActiveTab('books'); setSearch(''); }}
                    className={`relative overflow-visible px-6 py-2 rounded-[20px] text-[10px] font-black uppercase tracking-wider transition-all
                        ${activeTab === 'books'
                            ? 'bg-secondary text-white shadow-lg'
                            : 'bg-[#F2F2F2] text-gray-400 hover:bg-gray-200'}`}
                >
                    LIBRI
                    <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-gray-900 text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-md border-2 border-white z-10 transition-all duration-300">
                        {stats.books}
                    </span>
                </button>
                <button
                    onClick={() => { setActiveTab('categories'); setSearch(''); }}
                    className={`relative overflow-visible px-6 py-2 rounded-[20px] text-[10px] font-black uppercase tracking-wider transition-all
                        ${activeTab === 'categories'
                            ? 'bg-secondary text-white shadow-lg'
                            : 'bg-[#F2F2F2] text-gray-400 hover:bg-gray-200'}`}
                >
                    CATEGORIE
                    <span className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-gray-900 text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-md border-2 border-white z-10 transition-all duration-300">
                        {stats.categories}
                    </span>
                </button>
            </div>

            {/* Content Area */}
            <div className="px-6 py-6 flex flex-col space-y-6">

                {/* Search and Add Logic (Shared structure) */}
                <div className="animate-fadeIn space-y-6">
                    <div className="flex flex-col space-y-4">
                        <button
                            onClick={() => activeTab === 'books'
                                ? navigate('/admin/catalog/book/add')
                                : navigate('/admin/catalog/category/add')}
                            className="w-full bg-accent text-primary py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-md flex items-center justify-center space-x-2 active:scale-[0.98] transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>AGGIUNGI {activeTab === 'books' ? 'LIBRO' : 'CATEGORIA'}</span>
                        </button>

                        {activeTab === 'books' ? (
                            <div className="relative" ref={categoryDropdownRef}>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        placeholder="CERCA PER TITOLO O AUTORE..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full bg-white border border-primary/30 rounded-2xl pl-12 pr-12 py-4 text-[10px] font-black uppercase tracking-widest text-primary placeholder:text-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                    />
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2">
                                        <svg className="h-4 w-4 text-primary/40 group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>

                                    {/* Discrete Filter Toggle */}
                                    <button
                                        onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-primary/5 rounded-xl transition-all active:scale-90"
                                    >
                                        <svg className={`h-4 w-4 ${selectedCategory ? 'text-primary' : 'text-primary/30'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4.5h18m-18 5h18m-18 5h18m-18 5h18" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Custom Dropdown Menu */}
                                {isCategoryDropdownOpen && (
                                    <div className="absolute right-0 mt-3 w-full max-h-64 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-y-auto no-scrollbar z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="py-2">
                                            <div className="px-5 py-3 border-b border-gray-50 mb-1 flex justify-between items-center">
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Scegli Categoria</span>
                                                {selectedCategory && (
                                                    <button
                                                        onClick={() => setSelectedCategory('')}
                                                        className="text-[8px] font-black text-primary uppercase underline"
                                                    >
                                                        Reset
                                                    </button>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedCategory('');
                                                    setIsCategoryDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-wider transition-all border-b border-gray-50
                                                    ${selectedCategory === '' ? 'bg-primary text-white' : 'text-primary hover:bg-gray-50'}`}
                                            >
                                                TUTTE LE CATEGORIE
                                            </button>
                                            {categories.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => {
                                                        setSelectedCategory(cat.id);
                                                        setIsCategoryDropdownOpen(false);
                                                    }}
                                                    className={`w-full text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-wider transition-all border-b border-gray-50 last:border-0
                                                        ${selectedCategory == cat.id ? 'bg-primary text-white' : 'text-primary hover:bg-gray-50'}`}
                                                >
                                                    {cat.nome}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="CERCA CATEGORIA..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-white border border-primary/30 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest text-primary placeholder:text-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                />
                                <div className="absolute right-5 top-1/2 -translate-y-1/2">
                                    <svg className="w-4 h-4 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Data List */}
                    {isLoadingData ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-3">
                            <div className="w-8 h-8 border-4 border-gray-100 border-t-secondary rounded-full animate-spin"></div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Caricamento dati...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activeTab === 'books' ? (
                                books.length === 0 ? (
                                    <div className="py-20 text-center bg-white border border-dashed border-gray-200 rounded-2xl">
                                        <p className="text-[10px] font-black uppercase text-gray-300 tracking-widest italic">Nessun libro trovato</p>
                                    </div>
                                ) : (
                                    books.map((book, index) => (
                                        <div 
                                            key={book.id} 
                                            ref={index === (page - 1) * 100 ? firstNewBookRef : null}
                                            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex justify-between items-center group text-left"
                                        >
                                            <div className="space-y-1 pr-4">
                                                <h3 className="text-xs font-black uppercase text-primary tracking-tight leading-tight line-clamp-1">{book.titolo}</h3>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">{book.autore}</p>
                                                <div className="flex items-center space-x-2 pt-1">
                                                    <span className="text-[8px] font-black px-2 py-0.5 bg-accent text-primary rounded uppercase">{book.Categories?.[0]?.nome || 'N/D'}</span>
                                                    <span className="text-[8px] font-black text-gray-300 uppercase">Copie: <span className="text-primary">{book.copie_disponibili}/{book.copie_totali}</span></span>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => navigate(`/admin/catalog/book/edit/${book.id}`)}
                                                    className="p-3 bg-[#F8F9FA] rounded-xl text-gray-400 hover:bg-primary hover:text-white transition-all shadow-sm"
                                                    title="Modifica Libro"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => openDeleteConfirm(book, 'book')}
                                                    className="p-3 bg-[#F8F9FA] rounded-xl text-gray-400 hover:bg-secondary hover:text-white transition-all shadow-sm"
                                                    title="Elimina Libro"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )
                            ) : (
                                filteredCategories.length === 0 ? (
                                    <div className="py-20 text-center bg-white border border-dashed border-gray-200 rounded-2xl">
                                        <p className="text-[10px] font-black uppercase text-gray-300 tracking-widest italic">Nessuna categoria trovata</p>
                                    </div>
                                ) : (
                                    filteredCategories.map(cat => (
                                        <div key={cat.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex justify-between items-center">
                                            <div className="space-y-1">
                                                <h3 className="text-xs font-black uppercase text-primary tracking-tight">{cat.nome}</h3>
                                                <p className="text-[9px] font-bold text-gray-300 uppercase leading-none">ID #{cat.id}</p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => navigate(`/admin/catalog/category/edit/${cat.id}`)}
                                                    className="p-3 bg-[#F8F9FA] rounded-xl text-gray-400 hover:bg-primary hover:text-white transition-all shadow-sm"
                                                    title="Modifica Categoria"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => openDeleteConfirm(cat, 'category')}
                                                    className="p-3 bg-[#F8F9FA] rounded-xl text-gray-400 hover:bg-secondary hover:text-white transition-all shadow-sm"
                                                    title="Elimina Categoria"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )
                            )}
                        </div>
                    )}

                    {/* Load More Button */}
                    {activeTab === 'books' && hasMore && (
                        <div className="flex justify-center pt-4 pb-8">
                            <button
                                onClick={() => fetchBooks(page + 1)}
                                className="px-8 py-3 bg-secondary text-white rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-secondary/90 transition-all active:scale-95 shadow-lg flex items-center space-x-2"
                            >
                                <span>Carica altri ({stats.books - books.length})</span>
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminCatalog;
