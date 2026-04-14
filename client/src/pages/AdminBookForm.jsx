import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'sonner';

const AdminBookForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(isEditing);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [bookFormData, setBookFormData] = useState({
        titolo: '',
        autore: '',
        categoryIds: [],
        isbn: '',
        anno_pubblicazione: '',
        cod_archivio: '',
        copie_totali: 1,
        descrizione: '',
        copertina_url: ''
    });

    useEffect(() => {
        fetchCategories();
        if (isEditing) {
            fetchBook();
        }
    }, [id]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error("Errore nel caricamento delle categorie");
        }
    };

    const fetchBook = async () => {
        try {
            const res = await api.get(`/books/${id}`);
            const book = res.data;
            setBookFormData({
                titolo: book.titolo || '',
                autore: book.autore || '',
                categoryIds: book.Categories?.map(c => c.id) || [],
                isbn: book.isbn || '',
                anno_pubblicazione: book.anno_pubblicazione || '',
                cod_archivio: book.cod_archivio || '',
                copie_totali: book.copie_totali || 1,
                descrizione: book.descrizione || '',
                copertina_url: book.copertina_url || ''
            });
        } catch (error) {
            console.error("Error fetching book:", error);
            toast.error("Errore nel caricamento del libro");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        // Aggiungi tutti i campi testuali
        Object.keys(bookFormData).forEach(key => {
            if (key === 'categoryIds') {
                formData.append(key, bookFormData[key].join(','));
            } else {
                formData.append(key, bookFormData[key]);
            }
        });

        // Aggiungi il file se presente
        if (selectedFile) {
            formData.append('copertina', selectedFile);
        }

        const promise = isEditing 
            ? api.put(`/books/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
            : api.post('/books', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

        toast.promise(promise, {
            loading: isEditing ? 'Salvataggio modifiche...' : 'Aggiunta libro al catalogo...',
            success: () => {
                navigate('/admin/catalog');
                return isEditing ? 'Libro aggiornato con successo!' : 'Libro aggiunto con successo!';
            },
            error: (err) => {
                console.error("Error saving book:", err);
                return err.response?.data?.message || "Errore durante il salvataggio";
            }
        });
    };

    return (
        <div className="flex flex-col min-h-screen bg-white pb-20">
            {/* Header Banner */}
            <div className="bg-secondary p-8 text-center border-b-4 border-white transition-all">
                <h1 className="text-white text-xl font-black uppercase tracking-widest animate-fade-in">
                    {isEditing ? 'MODIFICA LIBRO' : 'AGGIUNGI LIBRO'}
                </h1>
            </div>

            {isLoading ? (
                <div className="flex-grow flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-gray-100 border-t-secondary rounded-full animate-spin"></div>
                </div>
            ) : (
                <form 
                    onSubmit={handleSubmit}
                    className="flex-grow overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-8 animate-slide-up"
                >
                    <div className="flex items-center space-x-4 mb-2">
                        <button 
                            type="button"
                            onClick={() => navigate('/admin/catalog')}
                            className="p-3 bg-gray-50 text-primary rounded-2xl hover:bg-primary hover:text-white transition-all shadow-sm"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Procedura Amministrativa</span>
                            <h2 className="text-lg font-black text-primary uppercase tracking-tight">Inserimento Dati Catalogo</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-primary uppercase tracking-widest ml-1">Titolo del Libro</label>
                            <input 
                                required
                                type="text"
                                value={bookFormData.titolo}
                                onChange={(e) => setBookFormData({...bookFormData, titolo: e.target.value})}
                                placeholder="ES. IL NOME DELLA ROSA"
                                className="w-full bg-primary/[0.02] border border-primary/10 rounded-2xl px-6 py-4 text-xs font-black uppercase text-primary placeholder:text-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-primary uppercase tracking-widest ml-1">Autore</label>
                            <input 
                                required
                                type="text"
                                value={bookFormData.autore}
                                onChange={(e) => setBookFormData({...bookFormData, autore: e.target.value})}
                                placeholder="ES. UMBERTO ECO"
                                className="w-full bg-primary/[0.02] border border-primary/10 rounded-2xl px-6 py-4 text-xs font-black uppercase text-primary placeholder:text-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-primary uppercase tracking-widest ml-1">Anno Pubblicazione</label>
                            <input 
                                type="number"
                                value={bookFormData.anno_pubblicazione}
                                onChange={(e) => setBookFormData({...bookFormData, anno_pubblicazione: e.target.value})}
                                placeholder="1980"
                                className="w-full bg-primary/[0.02] border border-primary/10 rounded-2xl px-6 py-4 text-xs font-black uppercase text-primary placeholder:text-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-primary uppercase tracking-widest ml-1">ISBN</label>
                            <input 
                                type="text"
                                value={bookFormData.isbn}
                                onChange={(e) => setBookFormData({...bookFormData, isbn: e.target.value})}
                                placeholder="978-..."
                                className="w-full bg-primary/[0.02] border border-primary/10 rounded-2xl px-6 py-4 text-xs font-black uppercase text-primary placeholder:text-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-primary uppercase tracking-widest ml-1">Cod. Archivio</label>
                            <input 
                                type="text"
                                value={bookFormData.cod_archivio}
                                onChange={(e) => setBookFormData({...bookFormData, cod_archivio: e.target.value})}
                                placeholder="ARC-..."
                                className="w-full bg-primary/[0.02] border border-primary/10 rounded-2xl px-6 py-4 text-xs font-black uppercase text-primary placeholder:text-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-primary uppercase tracking-widest ml-1">Categoria</label>
                            <select 
                                required
                                value={bookFormData.categoryIds[0] || ''}
                                onChange={(e) => setBookFormData({...bookFormData, categoryIds: [parseInt(e.target.value)]})}
                                className="w-full bg-primary/[0.02] border border-primary/10 rounded-2xl px-6 py-4 text-xs font-black uppercase text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none shadow-sm cursor-pointer"
                            >
                                <option value="">Seleziona Categoria</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-primary uppercase tracking-widest ml-1">Copie Totali</label>
                            <input 
                                required
                                type="number"
                                min="1"
                                value={bookFormData.copie_totali}
                                onChange={(e) => setBookFormData({...bookFormData, copie_totali: parseInt(e.target.value)})}
                                className="w-full bg-primary/[0.02] border border-primary/10 rounded-2xl px-6 py-4 text-xs font-black uppercase text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-primary uppercase tracking-widest ml-1">Carica Copertina (File)</label>
                                    <div className="relative group">
                                        <input 
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="copertina-upload"
                                        />
                                        <label 
                                            htmlFor="copertina-upload"
                                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/20 rounded-2xl cursor-pointer hover:bg-primary/5 hover:border-primary/40 transition-all group"
                                        >
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <svg className="w-8 h-8 mb-3 text-primary/40 group-hover:text-primary/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                </svg>
                                                <p className="text-[10px] font-black text-primary/40 group-hover:text-primary/60 uppercase tracking-widest">
                                                    {selectedFile ? 'Cambia Immagine' : 'Seleziona Immagine'}
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-primary uppercase tracking-widest ml-1">URL Copertina (Fallback o Esterno)</label>
                                    <input 
                                        type="text"
                                        value={bookFormData.copertina_url}
                                        onChange={(e) => setBookFormData({...bookFormData, copertina_url: e.target.value})}
                                        placeholder="HTTPS://..."
                                        className="w-full bg-primary/[0.02] border border-primary/10 rounded-2xl px-6 py-4 text-xs font-black text-primary placeholder:text-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                                    />
                                    <p className="text-[8px] font-bold text-gray-400 italic px-1">Se carichi un file, l'URL sopra verrà ignorato.</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-primary uppercase tracking-widest ml-1">Anteprima</label>
                                <div className="w-full h-[256px] bg-gray-50 rounded-2xl border border-primary/5 flex items-center justify-center overflow-hidden">
                                    {previewUrl || bookFormData.copertina_url ? (
                                        <img 
                                            src={previewUrl || bookFormData.copertina_url} 
                                            alt="Preview" 
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/card-lista.jpg';
                                            }}
                                        />
                                    ) : (
                                        <div className="text-center p-8">
                                            <p className="text-[9px] font-black text-gray-300 uppercase italic">Nessuna anteprima</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-primary uppercase tracking-widest ml-1">Descrizione Libro</label>
                            <textarea 
                                rows="6"
                                value={bookFormData.descrizione}
                                onChange={(e) => setBookFormData({...bookFormData, descrizione: e.target.value})}
                                placeholder="SCRIVI UNA BREVE TRAMA O NOTA..."
                                className="w-full bg-primary/[0.02] border border-primary/10 rounded-2xl px-6 py-4 text-xs font-black uppercase text-primary placeholder:text-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="pt-8 flex space-x-4">
                        <button 
                            type="button"
                            onClick={() => navigate('/admin/catalog')}
                            className="flex-grow bg-white border border-gray-100 text-gray-400 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-50 transition-all"
                        >
                            Annulla
                        </button>
                        <button 
                            type="submit"
                            className="flex-[2] bg-primary text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]"
                        >
                            {isEditing ? 'SALVA MODIFICHE' : 'AGGIUNGI AL CATALOGO'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default AdminBookForm;
