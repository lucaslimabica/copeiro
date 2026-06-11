//import SelecoesList from '@/components/SelecoesList';
import TopBar from '@/components/TopBar';
import { CardSelecoesPrevia } from '@/components/CardSelecoesPrevia';

export default function App() {
    return (
        <div className="min-h-screen bg-base">
            <div className="bg-surface text-main">
                <TopBar />
            </div>
            <div className="flex flex-wrap justify-center gap-6 p-6">
                <CardSelecoesPrevia />
            </div>
        </div>
    );
}
