import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import CategoryDetail from './pages/CategoryDetail';
import Login from './pages/Login';
import Registration from './pages/Registration';
import ForgotPassword from './pages/ForgotPassword';
import SearchResults from './pages/SearchResults';
import Dashboard from './pages/Dashboard';
import AdminRequests from './pages/AdminRequests';
import AdminCatalog from './pages/AdminCatalog';
import AdminBookForm from './pages/AdminBookForm';
import AdminCategoryForm from './pages/AdminCategoryForm';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import ResetPassword from './pages/ResetPassword';

import { Toaster } from 'sonner';

function App() {
    return (
        <Router>
            <Toaster position="top-right" richColors />
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/category/:id" element={<CategoryDetail />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Registration />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/search" element={<SearchResults />} />

                    {/* Protected User Routes */}
                    <Route element={<PrivateRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/profilo" element={<Profile />} />
                        <Route path="/profilo/modifica" element={<EditProfile />} />
                    </Route>

                    {/* Protected Admin Routes */}
                    <Route element={<PrivateRoute adminOnly={true} />}>
                        <Route path="/admin/request" element={<AdminRequests />} />
                        <Route path="/admin/catalog" element={<AdminCatalog />} />
                        <Route path="/admin/catalog/book/add" element={<AdminBookForm />} />
                        <Route path="/admin/catalog/book/edit/:id" element={<AdminBookForm />} />
                        <Route path="/admin/catalog/category/add" element={<AdminCategoryForm />} />
                        <Route path="/admin/catalog/category/edit/:id" element={<AdminCategoryForm />} />
                    </Route>
                </Routes>
            </Layout>
        </Router>
    )
}

export default App;
