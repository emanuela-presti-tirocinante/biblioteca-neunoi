import { useState, useEffect } from 'react';
import api from '../utils/api';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('loans'); // 'loans' or 'books'
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch data based on active tab
    useEffect(() => {
        if (activeTab === 'loans') {
            fetchLoans();
        }
    }, [activeTab]);

    const fetchLoans = async () => {
        setLoading(true);
        try {
            const res = await api.get('/loans');
            setLoans(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLoanAction = async (id, action) => {
        // action: 'approvato', 'rifiutato', 'restituito'
        try {
            await api.put(`/loans/${id}`, { stato: action });
            fetchLoans(); // Refresh list
        } catch (err) {
            alert('Errore nell\'aggiornamento dello stato');
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#F8F9FA] pb-20">
            {/* Header Banner */}
            <div className="bg-secondary p-8 text-center border-b-4 border-white">
                <h1 className="text-white text-xl font-black uppercase tracking-widest">
                    DASHBOARD ADMIN
                </h1>
            </div>

            <div className="px-6 py-4">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('loans')}
                        className={`${activeTab === 'loans' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Gestione Prestiti
                    </button>
                    <button
                        onClick={() => setActiveTab('books')}
                        className={`${activeTab === 'books' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Gestione Libri
                    </button>
                </nav>
            </div>

            {activeTab === 'loans' && (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    {loading ? <div className="p-4">Caricamento...</div> : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utente</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Libro</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loans.map(loan => (
                                    <tr key={loan.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {loan.User?.nome} {loan.User?.cognome}<br />
                                            <span className="text-xs text-gray-500">{loan.User?.email}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {loan.Book?.titolo}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${loan.stato === 'approvato' ? 'bg-green-100 text-green-800' :
                                                    loan.stato === 'rifiutato' ? 'bg-red-100 text-red-800' :
                                                        loan.stato === 'restituito' ? 'bg-gray-100 text-gray-800' :
                                                            'bg-yellow-100 text-yellow-800'}`}>
                                                {loan.stato}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            {loan.stato === 'richiesto' && (
                                                <>
                                                    <button onClick={() => handleLoanAction(loan.id, 'approvato')} className="text-green-600 hover:text-green-900">Approva</button>
                                                    <button onClick={() => handleLoanAction(loan.id, 'rifiutato')} className="text-red-600 hover:text-red-900">Rifiuta</button>
                                                </>
                                            )}
                                            {loan.stato === 'approvato' && (
                                                <button onClick={() => handleLoanAction(loan.id, 'restituito')} className="text-blue-600 hover:text-blue-900">Segna Restituito</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {activeTab === 'books' && (
                <div className="text-center py-10 text-gray-500">
                    Gestione Libri (Implementazione Futura: Aggiungi/Modifica/Elimina)
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
