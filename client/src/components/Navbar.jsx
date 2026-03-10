import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

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

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-primary shadow-sm sticky top-0 z-50">
            <div className="max-w-[390px] mx-auto px-4">
                <div className="flex justify-between items-center h-14">
                    {/* Logo Section */}
                    <Link to="/" className="flex items-center" onClick={() => setIsDropdownOpen(false)}>
                        <span className="bg-white px-1.5 py-0.5 rounded-sm text-primary font-black text-xl tracking-tighter">neu</span>
                        <span className="text-white font-light text-xl tracking-tighter ml-0.5">[nòi]</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-2 text-white text-[10px] font-bold uppercase tracking-tight">
                        {user ? (
                            <>
                                {user.role === 'admin' ? (
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className="flex items-center text-accent focus:outline-none"
                                        >
                                            Admin ▼
                                        </button>

                                        {/* Dropdown Menu */}
                                        {isDropdownOpen && (
                                            <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5 animate-in fade-in zoom-in duration-100 origin-top-right">
                                                <Link
                                                    to="/admin/request"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                    className="block px-4 py-2 text-[10px] text-gray-700 hover:bg-gray-100 font-bold"
                                                >
                                                    Richieste
                                                </Link>
                                                <Link
                                                    to="/admin/catalog"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                    className="block px-4 py-2 text-[10px] text-gray-700 hover:bg-gray-100 font-bold"
                                                >
                                                    Gestione
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <Link to="/dashboard" className="hover:text-accent transition-colors">I miei prestiti</Link>
                                        <div className="relative" ref={dropdownRef}>
                                            <button
                                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                className="flex items-center text-accent focus:outline-none uppercase"
                                            >
                                                {user.nome} ▼
                                            </button>

                                            {/* User Dropdown Menu */}
                                            {isDropdownOpen && (
                                                <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5 animate-in fade-in zoom-in duration-100 origin-top-right">
                                                    <Link
                                                        to="/profilo"
                                                        onClick={() => setIsDropdownOpen(false)}
                                                        className="block px-4 py-2 text-[10px] text-gray-700 hover:bg-gray-100 font-bold"
                                                    >
                                                        Il mio profilo
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                                <span className="text-white/30">|</span>
                                <button onClick={handleLogout} className="hover:text-secondary transition-colors uppercase">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="hover:text-accent transition-colors">Login</Link>
                                <span className="text-white/30">|</span>
                                <Link to="/register" className="hover:text-accent transition-colors">Registrati</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
