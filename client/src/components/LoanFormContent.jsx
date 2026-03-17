import { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { it } from 'date-fns/locale';
import { format } from 'date-fns';

const LoanFormContent = ({ book, onConfirm, onCancel, isLoading, onValidationChange }) => {
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState('');
    const [duration, setDuration] = useState(0);

    const isModal = isLoading?.isModal;
    const actualLoading = isModal ? isLoading?.loading : isLoading;

    useEffect(() => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = end - start;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            setDuration(diffDays);

            let currentError = '';
            if (diffDays < 1) {
                currentError = 'La data di fine deve essere successiva a quella di inizio';
            } else if (diffDays > 31) {
                currentError = 'Il prestito non può superare i 31 giorni';
            }
            
            setError(currentError);
            if (onValidationChange) onValidationChange(!currentError && startDate && endDate);
        } else {
            setDuration(0);
            setError('');
            if (onValidationChange) onValidationChange(false);
        }
    }, [startDate, endDate, onValidationChange]);

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        if (!error && startDate && endDate) {
            onConfirm({
                data_inizio: startDate,
                data_fine_prevista: endDate
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="space-y-6 pb-4">
                <div className="space-y-4">
                    <div className="flex items-center space-x-3 border-l-4 border-secondary pl-4 py-1">
                        <h3 className="text-primary font-black text-xs uppercase tracking-tight">Periodo del Prestito</h3>
                    </div>
                    
                    <div className="bg-gray-50 border border-gray-100 rounded-3xl p-4 flex flex-col items-center">
                        <div className="w-full text-center py-2 mb-4 border-b border-gray-200">
                            {startDate && endDate ? (
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                                    Dal <span className="text-secondary">{format(new Date(startDate), 'dd/MM/yyyy')}</span> al <span className="text-secondary">{format(new Date(endDate), 'dd/MM/yyyy')}</span>
                                </p>
                            ) : (
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    Seleziona il periodo del prestito
                                </p>
                            )}
                        </div>
                        
                        <DayPicker
                            mode="range"
                            selected={{ 
                                from: startDate ? new Date(startDate) : undefined, 
                                to: endDate ? new Date(endDate) : undefined 
                            }}
                            onSelect={(range) => {
                                if (range?.from) {
                                    setStartDate(format(range.from, 'yyyy-MM-dd'));
                                } else {
                                    setStartDate('');
                                }
                                if (range?.to) {
                                    setEndDate(format(range.to, 'yyyy-MM-dd'));
                                } else {
                                    setEndDate('');
                                }
                            }}
                            disabled={{ before: new Date() }}
                            locale={it}
                            classNames={{
                                day: "text-[10px] transition-all hover:bg-secondary/20 rounded-lg h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                                range_start: "bg-secondary text-white rounded-full font-black",
                                range_end: "bg-secondary text-white rounded-full font-black",
                                range_middle: "bg-accent/40 text-primary !rounded-none",
                                selected: "bg-secondary text-white",
                                today: "text-secondary font-black",
                                disabled: "text-gray-300 opacity-50 cursor-not-allowed",
                                caption_label: "text-xs font-black uppercase text-primary tracking-widest",
                                nav_button: "hover:bg-gray-100 rounded-lg transition-colors",
                            }}
                            className="loan-day-picker"
                        />
                    </div>

                    {error ? (
                        <div className="bg-red-50 p-3 rounded-xl border border-red-100 flex items-center space-x-3 animate-shake">
                            <div className="shrink-0 w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center">
                                <svg className="h-3.5 w-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <p className="text-[9px] font-black text-red-600 uppercase leading-snug">{error}</p>
                        </div>
                    ) : duration > 0 ? (
                        <div className="bg-green-50 p-3 rounded-xl border border-green-100 flex items-center justify-between">
                            <span className="text-[9px] font-black text-green-700 uppercase tracking-wider">Durata calcolata</span>
                            <span className="text-[11px] font-black text-green-700">{duration} {duration === 1 ? 'Giorno' : 'Giorni'}</span>
                        </div>
                    ) : null}
                </div>

                <div className="bg-primary/[0.02] border border-primary/5 rounded-3xl p-5 space-y-4">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-secondary/10 rounded-2xl flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.15em] block">Sede di Ritiro</span>
                            <span className="text-[11px] font-black text-primary uppercase block leading-tight">neu [nòi] - spazio al lavoro</span>
                            <span className="text-[10px] font-bold text-gray-500 block">Via Alloro, 64, 90133 Palermo</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden button for modal trigger */}
            {isModal && (
                <button type="submit" id="modal-confirm-btn" className="hidden" />
            )}

            {!isModal && (
                <div className="flex flex-col space-y-3 pt-2">
                    <button
                        type="submit"
                        disabled={error || !startDate || !endDate || actualLoading}
                        className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all active:scale-[0.98] flex items-center justify-center space-x-2
                            ${(error || !startDate || !endDate || actualLoading) 
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                                : 'bg-secondary text-white shadow-secondary/20 hover:bg-secondary/90'}`}
                    >
                        {actualLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <span>CONFERMA RICHIESTA PRESTITO</span>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full bg-white border border-gray-100 text-gray-400 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-50 transition-all"
                    >
                        ANNULLA
                    </button>
                </div>
            )}
        </form>
    );
};

export default LoanFormContent;
