import { CardJogos } from '@/components/CardJogos';
import { CardBuscaJogos } from '@/components/CardBuscaJogos'

export default function Jogos() {
    return (
        <div className="p-6">
            <CardBuscaJogos />
            <br></br>
            <CardJogos />
        </div>
    );
}
