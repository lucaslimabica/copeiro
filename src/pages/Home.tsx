import { CardSelecoesPrevia } from '@/components/CardSelecoesPrevia';
import { CardPalpitesPrevia } from '@/components/CardPalpitesPrevia';
import { CardRankingPrevia  } from '@/components/CardRankingPrevia';
import { CardBuscaJogos } from '@/components/CardBuscaJogos'

export default function Home() {
    return (
        <div className="flex flex-wrap justify-center gap-6 p-6">
            <CardBuscaJogos />
            <CardSelecoesPrevia />
            <CardRankingPrevia />
            <CardPalpitesPrevia />
        </div>
    );
}
