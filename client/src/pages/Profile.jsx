import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Profile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/utenti/profilo');
                setProfileData(res.data);
            } catch (err) {
                console.error("Error fetching profile", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "Mai";
        const date = new Date(dateString);
        return date.toLocaleString('it-IT', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-10 h-10 border-4 border-accent border-t-secondary rounded-full animate-spin"></div>
                <p className="text-xs font-black text-primary uppercase tracking-widest animate-pulse">Caricamento profilo...</p>
            </div>
        );
    }

    const { user: userData, stats } = profileData || {};

    return (
        <div className="flex flex-col min-h-full bg-bg-light pb-20">
            {/* Red Header Banner */}
            <div className="bg-secondary p-8 text-center">
                <h1 className="text-white text-xl font-black uppercase tracking-widest">
                    IL MIO PROFILO
                </h1>
            </div>

            <div className="px-6 py-8 flex flex-col space-y-6 max-w-[390px] mx-auto w-full">

                {/* Card 1: Informazioni Personali */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col space-y-4">
                    <div className="flex items-center space-x-3 border-b border-gray-50 pb-3">
                        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-primary">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h2 className="text-primary font-black text-xs uppercase tracking-widest">Informazioni Personali</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-secondary uppercase tracking-tighter">Nome</span>
                            <p className="font-bold text-gray-700">{userData?.nome}</p>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-secondary uppercase tracking-tighter">Cognome</span>
                            <p className="font-bold text-gray-700">{userData?.cognome}</p>
                        </div>
                        <div className="flex flex-col col-span-2">
                            <span className="text-[9px] font-black text-secondary uppercase tracking-tighter">Email</span>
                            <p className="font-bold text-gray-700 text-sm truncate">{userData?.email}</p>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-secondary uppercase tracking-tighter">Telefono</span>
                            <p className="font-bold text-gray-700">{userData?.telefono || "Non inserito"}</p>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-secondary uppercase tracking-tighter">Tipo Documento</span>
                            <p className="font-bold text-gray-700">{userData?.tipo_documento || "Non inserito"}</p>
                        </div>
                        <div className="flex flex-col col-span-2">
                            <span className="text-[9px] font-black text-secondary uppercase tracking-tighter">Numero Documento</span>
                            <p className="font-bold text-gray-700">{userData?.numero_documento || "Non inserito"}</p>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-secondary uppercase tracking-tighter">Ruolo</span>
                            <span className="inline-block bg-accent px-2 py-0.5 rounded text-[10px] font-black text-primary uppercase w-fit">{userData?.role}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-secondary uppercase tracking-tighter">Membro da</span>
                            <p className="font-bold text-gray-700 text-[11px]">{formatDate(userData?.createdAt)}</p>
                        </div>
                    </div>
                </div>

                {/* Card 2: Riepilogo Attività */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col space-y-4">
                    <div className="flex items-center space-x-3 border-b border-gray-50 pb-3">
                        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-primary">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h2 className="text-primary font-black text-xs uppercase tracking-widest">Riepilogo Attività</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-y-6 pt-2">
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-black text-primary">{stats?.inAttesa || 0}</span>
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Richieste in attesa</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-black text-primary">{stats?.libriPresi || 0}</span>
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Libri presi</span>
                        </div>
                        <div className="flex flex-col items-center pt-4">
                            <span className="text-2xl font-black text-primary">{stats?.inLettura || 0}</span>
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Libri in lettura</span>
                        </div>
                        <div className="flex flex-col items-center pt-4">
                            <span className="text-2xl font-black text-primary">{stats?.restituiti || 0}</span>
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Libri restituiti</span>
                        </div>
                        <div className="flex flex-col items-center col-span-2 pt-4">
                            <span className="text-2xl font-black text-primary">{stats?.recensioni || 0}</span>
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Recensioni</span>
                        </div>
                    </div>
                </div>

                {/* Card 3: Sicurezza */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col space-y-4">
                    <div className="flex items-center space-x-3 border-b border-gray-50 pb-3">
                        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-primary">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-primary font-black text-xs uppercase tracking-widest">Sicurezza</h2>
                    </div>

                    <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="font-black text-gray-400 uppercase tracking-tighter">Ultimo Accesso:</span>
                            <span className="font-bold text-gray-700">{formatDate(userData?.last_login)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="font-black text-gray-400 uppercase tracking-tighter">Dispositivo:</span>
                            <span className="font-bold text-gray-700">N/D</span>
                            {/* TODO: implement dispositivo detection with ua-parser-js */}
                        </div>
                    </div>
                </div>

                {/* Edit Button */}
                <button
                    onClick={() => navigate('/profilo/modifica')}
                    className="w-full bg-accent py-4 rounded-2xl text-primary font-black uppercase text-sm tracking-widest shadow-sm hover:shadow-md active:scale-[0.98] transition-all mt-4"
                >
                    Modifica dati personali
                </button>
            </div>
        </div>
    );
};

export default Profile;
