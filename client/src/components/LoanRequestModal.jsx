import { useState } from 'react';
import LoanFormContent from './LoanFormContent';

const LoanRequestModal = ({ book, isOpen, onClose, onConfirm, isLoading }) => {
    const [isValid, setIsValid] = useState(false);

    if (!isOpen || !book) return null;

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
                    
                    {/* Header with Book Info */}
                    <div className="flex items-start space-x-4 pb-4">
                        <div className="w-16 h-24 bg-gray-100 rounded-2xl overflow-hidden shadow-sm shrink-0 ring-1 ring-gray-100">
                            <img src={book.copertina_url || "/card-lista.jpg"} alt={book.titolo} className="w-full h-full object-cover" />
                        </div>
                        <div className="space-y-1.5 pt-1">
                            <span className="text-[8px] font-black text-secondary uppercase bg-accent px-2 py-0.5 rounded tracking-[0.1em]">Richiesta Prestito</span>
                            <h2 className="text-sm font-black text-primary uppercase leading-tight line-clamp-2">{book.titolo}</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">{book.autore}</p>
                        </div>
                    </div>
                    <div className="h-px bg-gray-100 -mx-6"></div>
                </div>

                {/* Scrollable Context Area */}
                <div className="flex-grow overflow-y-auto px-6 py-6 custom-scrollbar relative">
                    <LoanFormContent 
                        book={book} 
                        onConfirm={onConfirm} 
                        onCancel={onClose} 
                        isLoading={{ isModal: true, loading: isLoading }}
                        onValidationChange={setIsValid}
                    />
                    {/* Bottom fade for scroll context */}
                    <div className="sticky bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                </div>

                {/* Sticky Footer Actions */}
                <div className="shrink-0 p-6 pt-4 bg-white border-t border-gray-50 flex flex-col space-y-3">
                    <button
                        onClick={() => document.getElementById('modal-confirm-btn')?.click()}
                        disabled={!isValid || isLoading}
                        className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all active:scale-[0.98] flex items-center justify-center space-x-2
                            ${(!isValid || isLoading) 
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                                : 'bg-secondary text-white shadow-secondary/20 hover:bg-secondary/90'}`}
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <span>CONFERMA PRENOTAZIONE</span>
                        )}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-4 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:bg-gray-50 rounded-2xl transition-all"
                    >
                        CHIUDI
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoanRequestModal;
