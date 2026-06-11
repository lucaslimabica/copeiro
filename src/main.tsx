import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css';
import { AuthProvider } from '@/lib/auth';
import { RequireAuth } from '@/components/RequireAuth';
import App from '@/App.tsx';
import Home from '@/pages/Home.tsx';
import Jogos from '@/pages/Jogos.tsx';
import Ranks from '@/pages/Ranks.tsx';
import Palpites from '@/pages/Palpites.tsx';
import NotFound from '@/pages/NotFound';
import Login from '@/pages/Login.tsx';

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            { path: 'login', element: <Login /> },
            {
                element: <RequireAuth />,
                children: [
                    { index: true, element: <Home /> },
                    { path: 'jogos', element: <Jogos /> },
                    { path: 'ranks', element: <Ranks /> },
                    { path: 'palpites', element: <Palpites /> },
                    { path: '*', element: <NotFound /> },
                ],
            },
        ],
    },
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    </StrictMode>,
);
