import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css';
import App from '@/App.tsx';
import Home from '@/pages/Home.tsx';
import Jogos from '@/pages/Jogos.tsx';
import Ranks from '@/pages/Ranks.tsx';
import Palpites from '@/pages/Palpites.tsx';
import NotFound from '@/pages/NotFound';

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            { index: true, element: <Home /> },
            { path: 'jogos', element: <Jogos /> },
            { path: 'ranks', element: <Ranks /> },
            { path: 'palpites', element: <Palpites /> },
            { path: '*', element: <NotFound />}
        ],
    },
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>,
);
