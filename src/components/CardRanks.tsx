import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type UserStats = {
    nickname: string;
    // Simples
    tentativasSimples: number;
    acertosSimples: number;
    percentualSimples: number;
    // Exato
    tentativasExato: number;
    acertosExato: number;
    percentualExato: number;
    // Pontuação Combinada
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

// Definição dos 5 tipos de ranking + Tipo de Estado da Tab
type TipoRank = 'geral_pontos' | 'simples_absoluto' | 'simples_percentual' | 'exato_absoluto' | 'exato_percentual';

export default function Rank() {
    const [ranking, setRanking] = useState<UserStats[]>([]);
    const [tabAtiva, setTabAtiva] = useState<TipoRank>('geral_pontos');
    const [loading, setLoading] = useState(false);

    async function calcularRankings() {
        try {
            setLoading(true);

            const { data, error } = await supabase
                .from('palpite')
                .select(`
                    tipo, vencedor, casa_gol, fora_gol,
                    perfil:usuario_id (nickname),
                    jogo:jogo_id (status, casa_gol, fora_gol)
                `);

            if (error) throw error;
            const palpites = (data ?? []) as unknown as PalpiteData[];

            const agrupado: Record<string, UserStats> = {};

            palpites.forEach((p) => {
                if (!p.jogo || p.jogo.status !== 'finalizado' || p.jogo.casa_gol === null || p.jogo.fora_gol === null) return;

                const nick = p.perfil?.nickname ?? 'Usuário Anônimo';

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

                // Processamento por tipo de palpite
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

            // Pós-processamento: Cálculo de percentuais e soma ponderada de pontos
            const listaUsuarios = Object.values(agrupado).map((user) => {
                const pctSimples = user.tentativasSimples > 0 ? (user.acertosSimples / user.tentativasSimples) * 100 : 0;
                const pctExato = user.tentativasExato > 0 ? (user.acertosExato / user.tentativasExato) * 100 : 0;
                
                // Regra: Simples = 1 ponto, Exato = 5 pontos
                const pontosTotais = (user.acertosSimples * 1) + (user.acertosExato * 5);

                return {
                    ...user,
                    percentualSimples: parseFloat(pctSimples.toFixed(1)),
                    percentualExato: parseFloat(pctExato.toFixed(1)),
                    pontosTotais
                };
            });

            setRanking(listaUsuarios);
        } catch (e) {
            console.error('Erro ao processar rankings:', e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        calcularRankings();
    }, []);

    // Ordenação customizada para cada um dos 5 cenários
    const rankingOrdenado = [...ranking].sort((a, b) => {
        switch (tabAtiva) {
            case 'geral_pontos':
                return b.pontosTotais - a.pontosTotais || b.acertosExato - a.acertosExato;
            case 'simples_absoluto':
                return b.acertosSimples - a.acertosSimples || b.percentualSimples - a.percentualSimples;
            case 'simples_percentual':
                return b.percentualSimples - a.percentualSimples || b.acertosSimples - a.acertosSimples;
            case 'exato_absoluto':
                return b.acertosExato - a.acertosExato || b.percentualExato - a.percentualExato;
            case 'exato_percentual':
                return b.percentualExato - a.percentualExato || b.acertosExato - a.acertosExato;
            default:
                return 0;
        }
    });

    // Função auxiliar para renderizar as colunas corretas dinamicamente
    const getDadosColuna = (user: UserStats) => {
        switch (tabAtiva) {
            case 'geral_pontos':
                return {
                    tentativas: user.tentativasSimples + user.tentativasExato,
                    valorPrincipal: `${user.pontosTotais} pts`,
                    subtexto: `${user.acertosSimples}S / ${user.acertosExato}E`,
                    corValor: 'text-primary'
                };
            case 'simples_absoluto':
                return {
                    tentativas: user.tentativasSimples,
                    valorPrincipal: `${user.acertosSimples} acertos`,
                    subtexto: `${user.percentualSimples}% aproveit.`,
                    corValor: 'text-green-500'
                };
            case 'simples_percentual':
                return {
                    tentativas: user.tentativasSimples,
                    valorPrincipal: `${user.percentualSimples}%`,
                    subtexto: `${user.acertosSimples} acertos`,
                    corValor: 'text-primary'
                };
            case 'exato_absoluto':
                return {
                    tentativas: user.tentativasExato,
                    valorPrincipal: `${user.acertosExato} cravadas`,
                    subtexto: `${user.percentualExato}% aproveit.`,
                    corValor: 'text-green-500'
                };
            case 'exato_percentual':
                return {
                    tentativas: user.tentativasExato,
                    valorPrincipal: `${user.percentualExato}%`,
                    subtexto: `${user.acertosExato} cravadas`,
                    corValor: 'text-primary'
                };
        }
    };

    const getTituloColunaResultado = () => {
        if (tabAtiva === 'geral_pontos') return 'Pontos';
        if (tabAtiva.includes('percentual')) return 'Aproveit.';
        return 'Acertos';
    };

    if (loading) return <div className="text-center p-6 text-muted">A analisar as estatísticas...</div>;

    return (
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
            
            {/* Seletor Adaptável de Rankings (Grade responsiva para 5 botões) */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-1 bg-base p-1 rounded-xl border border-secondary">
                <button
                    onClick={() => setTabAtiva('geral_pontos')}
                    className={`col-span-2 md:col-span-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        tabAtiva === 'geral_pontos' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted hover:text-main'
                    }`}
                >
                    Placar Geral
                </button>
                <button
                    onClick={() => setTabAtiva('simples_absoluto')}
                    className={`text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        tabAtiva === 'simples_absoluto' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted hover:text-main'
                    }`}
                >
                    Mais Acertos Simples
                </button>
                <button
                    onClick={() => setTabAtiva('simples_percentual')}
                    className={`text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        tabAtiva === 'simples_percentual' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted hover:text-main'
                    }`}
                >
                    Maior Aproveitamento Simples
                </button>
                <button
                    onClick={() => setTabAtiva('exato_absoluto')}
                    className={`text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        tabAtiva === 'exato_absoluto' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted hover:text-main'
                    }`}
                >
                    Mais Acertos Exatos
                </button>
                <button
                    onClick={() => setTabAtiva('exato_percentual')}
                    className={`text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        tabAtiva === 'exato_percentual' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted hover:text-main'
                    }`}
                >
                    Maior Aproveitamento Exato
                </button>
            </div>

            {/* Tabela de Exibição */}
            <article className="w-full rounded-2xl border border-secondary bg-surface p-6 shadow-sm">
                
                <div className="hidden md:flex justify-between items-center text-[11px] uppercase tracking-wider text-muted font-bold pb-2 border-b border-secondary mb-2">
                    <span className="w-12 text-center">Pos</span>
                    <span className="flex-1 pl-2">Competidor</span>
                    <span className="w-24 text-center">Tentativas</span>
                    <span className="w-28 text-center">{getTituloColunaResultado()}</span>
                </div>

                <ul className="flex flex-col divide-y divide-secondary/50">
                    {rankingOrdenado.map((user, index) => {
                        const posicao = index + 1;
                        const dados = getDadosColuna(user);
                        
                        const isTop3 = posicao <= 3;
                        const medalhaCor = 
                            posicao === 1 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                            posicao === 2 ? 'bg-slate-400/10 text-slate-400 border-slate-400/20' :
                            'bg-amber-700/10 text-amber-700 border-amber-700/20';

                        return (
                            <li key={user.nickname} className="py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-1.5 md:gap-4 text-sm">
                                
                                {/* Nome e Posição */}
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-8 md:w-12 flex justify-center shrink-0">
                                        <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                                            isTop3 ? medalhaCor : 'bg-base text-muted border-secondary'
                                        }`}>
                                            {posicao}º
                                        </span>
                                    </div>
                                    <span className="font-semibold text-main truncate flex-1" title={user.nickname}>
                                        {user.nickname}
                                        {posicao === 1 && ' 👑'}
                                    </span>
                                </div>

                                {/* Dados Numéricos Dinâmicos */}
                                <div className="flex flex-wrap items-center justify-start md:justify-end gap-4 pl-11 md:pl-0 text-xs md:text-sm text-muted md:text-main">
                                    
                                    {/* Tentativas específicas da aba selecionada */}
                                    <div className="md:w-24 md:text-center">
                                        <span className="md:hidden text-muted/60 font-medium">Tentativas: </span>
                                        <span className="font-mono text-main md:text-muted">{dados.tentativas}</span>
                                    </div>

                                    <span className="md:hidden text-secondary-border/60">•</span>

                                    {/* Módulo de Performance Principal */}
                                    <div className="md:w-28 md:text-center flex items-center gap-1.5 md:flex-col md:gap-0">
                                        <span className="md:hidden text-muted/60 font-medium">
                                            {getTituloColunaResultado()}:{' '}
                                        </span>
                                        <span className={`font-mono font-bold ${dados.corValor}`}>
                                            {dados.valorPrincipal}
                                        </span>
                                        
                                        {/* Sub-informação de apoio (ex: exibe acertos normais embaixo do percentual) */}
                                        <span className="text-[10px] text-muted/80 font-sans font-medium md:mt-0.5">
                                            {tabAtiva === 'geral_pontos' ? (
                                                <span className="bg-base px-1.5 py-0.5 rounded border border-secondary text-[9px] text-muted">
                                                    {dados.subtexto}
                                                </span>
                                            ) : (
                                                dados.subtexto
                                            )}
                                        </span>
                                    </div>
                                </div>

                            </li>
                        );
                    })}

                    {rankingOrdenado.length === 0 && (
                        <div className="text-center py-8 text-sm text-muted italic">
                            Nenhum jogo finalizado no sistema para computar o ranking ainda. 🏁
                        </div>
                    )}
                </ul>
            </article>
        </div>
    );
}