import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow bg-bg-light flex justify-center">
                <div className="w-full max-w-[390px] min-h-full bg-white shadow-sm ring-1 ring-gray-900/5 sm:max-w-7xl sm:ring-0 sm:shadow-none p-0 overflow-hidden">
                    {children}
                </div>
            </main>
            <footer className="bg-primary border-t-2 border-accent py-4 flex flex-col items-center space-y-2 text-white text-[10px] font-medium tracking-tight">
                    <img
                        src="/logo-neunoi.png"
                        alt="neu [nòi]"
                        className="h-6 w-auto opacity-90"
                    />
                <p>091 573 91 29</p>
                <p>coworking@neunoi.it</p>
            </footer>
        </div>
    );
};

export default Layout;
