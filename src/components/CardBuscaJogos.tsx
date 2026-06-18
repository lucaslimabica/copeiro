import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, X } from 'lucide-react';
import { Popover } from '@/components/Popover';
import { FormPalpite } from './FormPalpite'; // Formulário que fizemos antes

type JogoBusca = {
    id: number;
    casa_gol: number | null;
    fora_gol: number | null;
    inicio: string;
    status: 'por_vir' | 'ao_vivo' | 'finalizado';
    casa: { nome: string; abreviacao: string; bandeira: string } | null;
    fora: { nome: string; abreviacao: string; bandeira: string } | null;
};

export function CardBuscaJogos() {
    const [jogos, setJogos] = useState<JogoBusca[]>([]);
    const [busca, setBusca] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function carregarJogosParaBusca() {
            try {
                setLoading(true);
                // Carrega jogos ativos (para facilitar o palpite)
                const { data, error } = await supabase
                    .from('jogo')
                    .select(`
                        id, casa_gol, fora_gol, inicio, status,
                        casa:selecao!casa_id(nome, abreviacao, bandeira),
                        fora:selecao!fora_id(nome, abreviacao, bandeira)
                    `)
                    .in('status', ['por_vir', 'ao_vivo'])
                    .order('inicio', { ascending: true });

                if (!error && data) setJogos(data as JogoBusca[]);
            } catch (e) {
                console.error('Erro ao carregar banco de busca:', e);
            } finally {
                setLoading(false);
            }
        }
        carregarJogosParaBusca();
    }, []);

    // Filtro em tempo de execução conforme digita
    const jogosFiltrados = jogos.filter(j => {
        const termo = busca.toLowerCase().trim();
        if (!termo) return false; // Se não digitou nada, não mostra nenhum jogo (deixa o card limpo)

        const casaNome = j.casa?.nome?.toLowerCase() ?? '';
        const casaAbrev = j.casa?.abreviacao?.toLowerCase() ?? '';
        const foraNome = j.fora?.nome?.toLowerCase() ?? '';
        const foraAbrev = j.fora?.abreviacao?.toLowerCase() ?? '';

        return casaNome.includes(termo) || casaAbrev.includes(termo) || 
               foraNome.includes(termo) || foraAbrev.includes(termo);
    });

    return (
        <article className="w-full rounded-2xl border border-secondary bg-surface p-6 shadow-sm">
            <h2 className="text-base font-bold text-main mb-3 flex items-center gap-2">
                <span>Encontrar Jogos</span>
            </h2>

            {/* Input de Busca embutido no bloco */}
            <div className="relative w-full mb-4">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted">
                    <Search className="h-4 w-4" />
                </span>
                <input
                    type="text"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Digite o nome ou sigla do país..."
                    className="w-full h-10 pl-10 pr-10 bg-base border border-secondary rounded-xl text-sm text-main placeholder-muted/60 focus:outline-none focus:border-primary transition-colors"
                />
                {busca && (
                    <button
                        type="button"
                        onClick={() => setBusca('')}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted hover:text-main transition-colors cursor-pointer"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Lista de Resultados Encontrados */}
            <ul className="flex flex-col divide-y divide-secondary/50">
                {jogosFiltrados.map((j) => (
                    <li key={j.id} className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 first:pt-2 last:pb-0 w-full">
                        
                        {/* Infos do Jogo (Centralizado no Mobile) */}
                        <div className="flex flex-col items-center md:flex-row md:items-center gap-3 w-full md:w-auto">
                            <div className="flex items-center justify-center gap-3">
                                <span className="rounded-lg border border-secondary bg-base px-2.5 py-1 text-xs font-bold text-main">
                                    {j.casa?.abreviacao} {j.casa?.bandeira}
                                </span>
                                <span className="text-sm font-bold text-muted">vs</span>
                                <span className="rounded-lg border border-secondary bg-base px-2.5 py-1 text-xs font-bold text-main">
                                    {j.fora?.abreviacao} {j.fora?.bandeira}
                                </span>
                            </div>
                        </div>

                        {/* Botões de Ação (Centralizado no Mobile, Direita no PC) */}
                        <div className="flex items-center justify-center gap-2 w-full md:w-auto md:ml-auto">
                            <Popover label="Palpitar">
                                <FormPalpite 
                                    jogoId={j.id} 
                                    casaNome={j.casa?.nome ?? 'Casa'} 
                                    foraNome={j.fora?.nome ?? 'Fora'} 
                                />
                            </Popover>
                        </div>

                    </li>
                ))}

                {/* Feedback quando não acha ou quando está vazio */}
                {busca && jogosFiltrados.length === 0 && !loading && (
                    <li className="py-4 text-center text-xs text-muted italic">
                        Nenhuma seleção correspondente encontrada
                    </li>
                )}
                {!busca && (
                    <li className="py-3 text-center text-xs text-muted/60 italic">
                        Comece a digitar acima para buscar confrontos diretos...
                    </li>
                )}
            </ul>
        </article>
    );
}