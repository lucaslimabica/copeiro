//import SelecoesList from '@/components/SelecoesList';
import { Outlet } from 'react-router-dom';
import TopBar from '@/components/TopBar';

export default function App() {
    return (
        <div className="min-h-screen bg-base">
            <TopBar />
            <Outlet />
        </div>
    );
}
