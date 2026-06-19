import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, X, Edit } from 'lucide-react';

// Reutilizando os mesmos tipos estritos do seu painel admin
type JogoStatus = 'por_vir' | 'ao_vivo' | 'finalizado';
type JogoDecisao = 'normal' | 'prorrogacao' | 'penaltis';

type JogoAdmin = {
    id: number;
    casa_gol: number | null;
    fora_gol: number | null;
    status: JogoStatus;
    decisao: JogoDecisao | null;
    inicio: string;
    casa: { nome: string; abreviacao: string; bandeira: string } | null;
    fora: { nome: string; abreviacao: string; bandeira: string } | null;
};

type CardBuscaJogosAdminProps = {
    onSelectJogo: (jogo: JogoAdmin) => void;
};

export function CardBuscaJogosAdmin({ onSelectJogo }: CardBuscaJogosAdminProps) {
    const [jogos, setJogos] = useState<JogoAdmin[]>([]);
    const [busca, setBusca] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function carregarTodosOsJogos() {
            try {
                setLoading(true);
                // Admin busca QUALQUER jogo, inclusive finalizados para correções
                const { data, error } = await supabase
                    .from('jogo')
                    .select(`
                        id, casa_gol, fora_gol, status, decisao, inicio,
                        casa:selecao!casa_id(nome, abreviacao, bandeira),
                        fora:selecao!fora_id(nome, abreviacao, bandeira)
                    `)
                    .order('inicio', { ascending: false }); // Jogos mais recentes/próximos primeiro

                if (!error && data) setJogos(data as unknown as JogoAdmin[]);
            } catch (e) {
                console.error('Erro ao carregar banco de busca do admin:', e);
            } finally {
                setLoading(false);
            }
        }
        carregarTodosOsJogos();
    }, []);

    // Filtro idêntico ao seu, cobrindo nome e sigla
    const jogosFiltrados = jogos.filter(j => {
        const termo = busca.toLowerCase().trim();
        if (!termo) return false;

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
                <span>🔍 Localizar Jogo para Atualizar</span>
            </h2>

            {/* Input de Busca */}
            <div className="relative w-full mb-4">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted">
                    <Search className="h-4 w-4" />
                </span>
                <input
                    type="text"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Busque por país ou sigla (Ex: BRA, Argentina)..."
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

            {/* Lista de Resultados */}
            <ul className="flex flex-col divide-y divide-secondary/50 max-h-60 overflow-y-auto pr-1">
                {jogosFiltrados.map((j) => (
                    <li key={j.id} className="flex items-center justify-between gap-4 py-3 first:pt-1 last:pb-1 w-full">
                        
                        <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-main">
                                    {j.casa?.bandeira} {j.casa?.abreviacao}
                                </span>
                                <span className="text-xs font-bold text-muted/70">
                                    {j.casa_gol !== null ? j.casa_gol : '—'} x {j.fora_gol !== null ? j.fora_gol : '—'}
                                </span>
                                <span className="font-semibold text-main">
                                    {j.fora?.bandeira} {j.fora?.abreviacao}
                                </span>
                            </div>
                            {/* Badge do Status atual do jogo */}
                            <span className={`text-[10px] font-medium w-max px-1.5 py-0.5 rounded ${
                                j.status === 'ao_vivo' ? 'bg-red-500/10 text-red-500' :
                                j.status === 'finalizado' ? 'bg-slate-500/10 text-muted' : 'bg-primary/10 text-primary'
                            }`}>
                                {j.status === 'ao_vivo' && '🔴 Ao Vivo'}
                                {j.status === 'finalizado' && '🏁 Finalizado'}
                                {j.status === 'por_vir' && '⏳ Agendado'}
                            </span>
                        </div>

                        {/* Ação: Retorna a Row selecionada ao clicar */}
                        <button
                            type="button"
                            onClick={() => {
                                onSelectJogo(j);
                                setBusca(''); // Limpa a busca após selecionar
                            }}
                            className="flex items-center gap-1.5 rounded-lg bg-base border border-secondary text-main px-3 py-1.5 text-xs font-semibold hover:bg-secondary/20 transition-colors cursor-pointer"
                        >
                            <Edit className="h-3 w-3 text-primary" />
                            Editar
                        </button>

                    </li>
                ))}

                {busca && jogosFiltrados.length === 0 && !loading && (
                    <li className="py-4 text-center text-xs text-muted italic">
                        Nenhum confronto encontrado.
                    </li>
                )}
                {!busca && (
                    <li className="py-3 text-center text-xs text-muted/60 italic">
                        Digite acima para filtrar um jogo específico...
                    </li>
                )}
            </ul>
        </article>
    );
}