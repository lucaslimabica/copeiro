import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type UserStatsPrevia = {
    nickname: string;
    tentativasSimples: number;
    acertosSimples: number;
    percentualSimples: number;
    tentativasExato: number;
    acertosExato: number;
    percentualExato: number;
    pontosTotais: number;
};

type PalpiteData = {
    tipo: 'simples' | 'exato';
    vencedor: 'casa' | 'fora' | 'empate';
    casa_gol: number | null;
    fora_gol: number | null;
    perfil: { nickname: string } | null;
    jogo: {
        status: string;
        casa_gol: number | null;
        fora_gol: number | null;
    } | null;
};

type TipoTabPrevia = 'geral' | 's_abs' | 's_pct' | 'e_abs' | 'e_pct';

export function CardRankingPrevia() {
    const [ranking, setRanking] = useState<UserStatsPrevia[]>([]);
    const [tabAtiva, setTabAtiva] = useState<TipoTabPrevia>('geral');
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function carregarRanking() {
            try {
                setLoading(true);
                // Busca os dados necessários para o cálculo preciso de simples e exato
                const { data, error } = await supabase
                    .from('palpite')
                    .select(`
                        tipo, vencedor, casa_gol, fora_gol,
                        perfil:usuario_id (nickname),
                        jogo:jogo_id (status, casa_gol, fora_gol)
                    `);

                if (error) throw error;
                const palpites = (data ?? []) as unknown as PalpiteData[];

                const agrupado: Record<string, UserStatsPrevia> = {};

                palpites.forEach((p) => {
                    if (!p.jogo || p.jogo.status !== 'finalizado' || p.jogo.casa_gol === null || p.jogo.fora_gol === null) return;

                    const nick = p.perfil?.nickname ?? 'Anônimo';

                    if (!agrupado[nick]) {
                        agrupado[nick] = {
                            nickname: nick,
                            tentativasSimples: 0,
                            acertosSimples: 0,
                            percentualSimples: 0,
                            tentativasExato: 0,
                            acertosExato: 0,
                            percentualExato: 0,
                            pontosTotais: 0
                        };
                    }

                    let vencedorReal: 'casa' | 'fora' | 'empate' = 'empate';
                    if (p.jogo.casa_gol > p.jogo.fora_gol) vencedorReal = 'casa';
                    if (p.jogo.fora_gol > p.jogo.casa_gol) vencedorReal = 'fora';

                    if (p.tipo === 'simples') {
                        agrupado[nick].tentativasSimples += 1;
                        if (p.vencedor === vencedorReal) {
                            agrupado[nick].acertosSimples += 1;
                        }
                    } else if (p.tipo === 'exato') {
                        agrupado[nick].tentativasExato += 1;
                        if (p.casa_gol === p.jogo.casa_gol && p.fora_gol === p.jogo.fora_gol) {
                            agrupado[nick].acertosExato += 1;
                        }
                    }
                });

                const listaMapeada = Object.values(agrupado).map((user) => {
                    const pctSimples = user.tentativasSimples > 0 ? (user.acertosSimples / user.tentativasSimples) * 100 : 0;
                    const pctExato = user.tentativasExato > 0 ? (user.acertosExato / user.tentativasExato) * 100 : 0;
                    const pontosTotais = (user.acertosSimples * 1) + (user.acertosExato * 5);

                    return {
                        ...user,
                        percentualSimples: Math.round(pctSimples),
                        percentualExato: Math.round(pctExato),
                        pontosTotais
                    };
                });

                setRanking(listaMapeada);
            } catch (error) {
                console.error('Erro ao gerar prévia do ranking:', error);
            } finally {
                setLoading(false);
            }
        }

        carregarRanking();
    }, []);

    // Ordenação dinâmica baseada na aba ativa e corte restrito ao Top 3
    const obterTop3 = () => {
        const ordenado = [...ranking].sort((a, b) => {
            switch (tabAtiva) {
                case 'geral':
                    return b.pontosTotais - a.pontosTotais || b.acertosExato - a.acertosExato;
                case 's_abs':
                    return b.acertosSimples - a.acertosSimples || b.percentualSimples - a.percentualSimples;
                case 's_pct':
                    return b.percentualSimples - a.percentualSimples || b.acertosSimples - a.acertosSimples;
                case 'e_abs':
                    return b.acertosExato - a.acertosExato || b.percentualExato - a.percentualExato;
                case 'e_pct':
                    return b.percentualExato - a.percentualExato || b.acertosExato - a.acertosExato;
                default:
                    return 0;
            }
        });
        return ordenado.slice(0, 3);
    };

    // Formatação do dado da direita dinamicamente para o Card
    const getDadoExibicao = (user: UserStatsPrevia) => {
        switch (tabAtiva) {
            case 'geral':
                return `${user.pontosTotais} pts`;
            case 's_abs':
                return `${user.acertosSimples} acertos`;
            case 's_pct':
                return `${user.percentualSimples}% p/c`;
            case 'e_abs':
                return `${user.acertosExato} cravadas`;
            case 'e_pct':
                return `${user.percentualExato}% p/c`;
        }
    };

    if (loading) {
        return (
            <article className="w-full max-w-sm rounded-2xl border border-secondary bg-surface p-6 text-center text-muted shadow-sm text-xs">
                A carregar pódio...
            </article>
        );
    }

    const top3Atual = obterTop3();

    return (
        <article className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-secondary bg-surface p-4 shadow-sm">
            
            {/* Título do Card */}
            <div className="flex items-center justify-between border-b border-secondary/60 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-main flex items-center gap-1.5">
                    🏆 Líderes do Painel
                </h3>
            </div>

            {/* Micro-Tabs para alternar as 5 visões em espaço reduzido */}
            <div className="grid grid-cols-5 gap-0.5 bg-base p-0.5 rounded-lg border border-secondary text-[10px]">
                {(
                    [
                        { id: 'geral', label: 'Geral' },
                        { id: 's_abs', label: 'S.Qtd' },
                        { id: 's_pct', label: 'S.%' },
                        { id: 'e_abs', label: 'E.Qtd' },
                        { id: 'e_pct', label: 'E.%' }
                    ] as const
                ).map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setTabAtiva(tab.id)}
                        className={`text-center py-1 font-semibold rounded transition-all cursor-pointer ${
                            tabAtiva === tab.id
                                ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                                : 'text-muted hover:text-main'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Lista do Top 3 */}
            <ul className="flex w-full flex-col gap-2.5 my-1">
                {top3Atual.map((item, index) => {
                    const posicao = index + 1;
                    const medalhaCor = 
                        posicao === 1 ? 'text-amber-500' :
                        posicao === 2 ? 'text-slate-400' : 'text-amber-700';

                    return (
                        <li key={item.nickname} className="flex w-full items-center justify-between gap-3 text-sm py-0.5">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                <span className={`font-black text-xs w-5 text-center ${medalhaCor}`}>
                                    {posicao === 1 ? '🥇' : posicao === 2 ? '🥈' : '🥉'}
                                </span>
                                <span className="font-semibold text-main truncate" title={item.nickname}>
                                    {item.nickname}
                                </span>
                            </div>
                            <span className="text-primary font-mono font-bold text-xs shrink-0 bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10">
                                {getDadoExibicao(item)}
                            </span>
                        </li>
                    );
                })}
                
                {top3Atual.length === 0 && (
                    <li className="text-center text-xs text-muted py-4 italic">
                        Sem rodadas finalizadas.
                    </li>
                )}
            </ul>

            {/* Link de redirecionamento */}
            <div className="border-t border-secondary/40 pt-2 flex justify-center">
                <a 
                    href="/ranking" 
                    className="group inline-flex items-center gap-1 text-xs text-muted font-medium hover:text-primary transition-colors cursor-pointer"
                >
                    Ver Ranking Completo 
                    <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </a>
            </div>
        </article>
    );
}