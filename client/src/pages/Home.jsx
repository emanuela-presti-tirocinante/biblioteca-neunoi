import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCategories } from '../data/catalog';

const Home = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [visibleCount, setVisibleCount] = useState(6);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const categories = getCategories();

    const handleSearch = () => {
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    const displayedCategories = categories.slice(0, visibleCount);
    const isAllVisible = visibleCount >= categories.length;

    const handleToggle = () => {
        if (isAllVisible) {
            setVisibleCount(6);
            // Scroll up to grid top if needed, but keeping it simple for now
        } else {
            setVisibleCount(prev => Math.min(prev + 6, categories.length));
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex flex-col min-h-full">
            {/* Red Hero Banner */}
            <div className="bg-secondary p-8 text-center border-b-4 border-white">
                <h1 className="text-white text-xl font-black uppercase tracking-widest">
                    BIBLIOTECA DI NEU[NÒI]
                </h1>
            </div>

            {/* Main Content Area (Inside White Card) */}
            <div className="flex-grow px-6 py-8">
                <div className="flex flex-col items-center space-y-10">

                    {/* Search Bar Component */}
                    <div className="w-full flex items-center space-x-2">
                        <button
                            onClick={handleSearch}
                            className="p-1 hover:bg-black/5 rounded-full transition-colors active:scale-95"
                        >
                            <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                        <div className="flex-grow relative" ref={dropdownRef}>
                            <input
                                type="text"
                                placeholder="cerca in tutto il catagolo"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full bg-accent text-primary/70 placeholder-primary/50 text-xs font-bold py-3 px-10 rounded-md focus:outline-none"
                            />
                            {/* Hamburger Button */}
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-black/5 rounded-full transition-colors"
                            >
                                <svg className="h-5 w-5 text-primary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            {/* Categories Dropdown */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-full max-h-60 bg-white border border-gray-100 rounded-lg shadow-xl overflow-y-auto no-scrollbar z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
                                    <div className="py-2">
                                        <p className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">
                                            Esplora Categorie
                                        </p>
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => {
                                                    navigate(`/category/${encodeURIComponent(cat.nome)}`);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-3 text-xs font-bold text-primary hover:bg-accent/10 hover:text-secondary transition-colors border-b border-gray-50 last:border-0"
                                            >
                                                {cat.nome}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3-Column Category Grid with incremental loading */}
                    <div className="w-full space-y-4">
                        <div className="grid grid-cols-3 gap-3 w-full animate-fade-in">
                            {displayedCategories.map((cat) => (
                                <Link
                                    key={cat.id}
                                    to={`/category/${encodeURIComponent(cat.nome)}`}
                                    className="h-20 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md active:scale-95 flex flex-col items-center justify-center p-3 text-center transition-all animate-slide-up"
                                >
                                    {/* Icon Placeholder (Invisible for now) */}
                                    <div className="hidden">
                                        {/* Future icons will go here */}
                                    </div>
                                    <span className="text-[10px] font-black text-primary uppercase leading-tight break-words text-center line-clamp-2">
                                        {cat.nome.replace(/\//g, '/ ')}
                                    </span>
                                </Link>
                            ))}
                        </div>

                        {/* Toggle Button */}
                        {categories.length > 6 && (
                            <div className="flex justify-center pt-2">
                                <button
                                    onClick={handleToggle}
                                    className="px-6 py-2 border border-accent bg-white rounded-full text-[10px] font-black uppercase text-primary hover:bg-accent/10 transition-colors active:scale-95 shadow-sm"
                                >
                                    {isAllVisible ? 'Mostra meno' : 'Mostra altre'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Newsletter Section */}
                    <div className="text-center space-y-6 pt-4">
                        <p className="text-gray-600 text-sm font-medium leading-relaxed max-w-[240px] mx-auto italic">
                            Scopri le novità della biblioteca di neu[nòi] con la nostra newsletter!
                        </p>
                        <button className="bg-accent text-primary px-10 py-3 rounded-md text-sm font-black uppercase tracking-widest shadow-sm active:scale-95 transition-all">
                            iscriviti
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
