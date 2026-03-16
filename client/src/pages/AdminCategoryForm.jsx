import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AdminCategoryForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [isLoading, setIsLoading] = useState(isEditing);
    const [categoryFormData, setCategoryFormData] = useState({
        nome: '',
        copertina_url: ''
    });

    useEffect(() => {
        if (isEditing) {
            fetchCategory();
        }
    }, [id]);

    const fetchCategory = async () => {
        try {
            const res = await api.get('/categories');
            const category = res.data.find(c => c.id === parseInt(id));
            if (category) {
                setCategoryFormData({
                    nome: category.nome || '',
                    copertina_url: category.copertina_url || ''
                });
            }
        } catch (error) {
            console.error("Error fetching category:", error);
            alert("Errore nel caricamento della categoria");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/categories/${id}`, categoryFormData);
            } else {
                await api.post('/categories', categoryFormData);
            }
            navigate('/admin/catalog', { state: { tab: 'categories' } });
        } catch (error) {
            console.error("Error saving category:", error);
            alert("Errore durante il salvataggio");
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white pb-20">
            {/* Header Banner */}
            <div className="bg-secondary p-8 text-center border-b-4 border-white">
                <h1 className="text-white text-xl font-black uppercase tracking-widest animate-fade-in">
                    {isEditing ? 'MODIFICA CATEGORIA' : 'CREA CATEGORIA'}
                </h1>
            </div>

            {isLoading ? (
                <div className="flex-grow flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-gray-100 border-t-secondary rounded-full animate-spin"></div>
                </div>
            ) : (
                <form 
                    onSubmit={handleSubmit}
                    className="flex-grow overflow-y-auto p-8 max-w-2xl mx-auto w-full space-y-8 animate-slide-up"
                >
                    <div className="flex items-center space-x-4 mb-2">
                        <button 
                            type="button"
                            onClick={() => navigate('/admin/catalog', { state: { tab: 'categories' } })}
                            className="p-3 bg-gray-50 text-primary rounded-2xl hover:bg-primary hover:text-white transition-all shadow-sm"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Archivio Digitale</span>
                            <h2 className="text-lg font-black text-primary uppercase tracking-tight">Struttura Categorie</h2>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-primary uppercase tracking-widest ml-1">Nome Categoria</label>
                            <input 
                                required
                                type="text"
                                value={categoryFormData.nome}
                                onChange={(e) => setCategoryFormData({...categoryFormData, nome: e.target.value})}
                                placeholder="ES. NARRATIVA ITALIANA"
                                className="w-full bg-primary/[0.02] border border-primary/10 rounded-2xl px-6 py-4 text-xs font-black uppercase text-primary placeholder:text-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-primary uppercase tracking-widest ml-1">URL Immagine Copertina</label>
                            <input 
                                type="text"
                                value={categoryFormData.copertina_url}
                                onChange={(e) => setCategoryFormData({...categoryFormData, copertina_url: e.target.value})}
                                placeholder="HTTPS://..."
                                className="w-full bg-primary/[0.02] border border-primary/10 rounded-2xl px-6 py-4 text-xs font-black text-primary placeholder:text-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="pt-8 flex space-x-4">
                        <button 
                            type="button"
                            onClick={() => navigate('/admin/catalog', { state: { tab: 'categories' } })}
                            className="flex-grow bg-white border border-gray-100 text-gray-400 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-50 transition-all"
                        >
                            Annulla
                        </button>
                        <button 
                            type="submit"
                            className="flex-[2] bg-primary text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]"
                        >
                            {isEditing ? 'SALVA MODIFICHE' : 'CREA CATEGORIA'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default AdminCategoryForm;
