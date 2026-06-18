import { CardSelecoesPrevia } from '@/components/CardSelecoesPrevia';
import { CardPalpitesPrevia } from '@/components/CardPalpitesPrevia';
import { CardRankingPrevia  } from '@/components/CardRankingPrevia';

export default function Home() {
    return (
        <div className="flex flex-wrap justify-center gap-6 p-6">
            <CardSelecoesPrevia />
            <CardRankingPrevia />
            <CardPalpitesPrevia />
        </div>
    );
}
