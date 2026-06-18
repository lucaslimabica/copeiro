import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type UserStats = {
    nickname: string;
    tentativas: number;
    acertos: number;
    cravadas: number; // Quantos placares exatos acertou
    percentual: number;
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

export default function Rank() {
    const [ranking, setRanking] = useState<UserStats[]>([]);
    const [tabAtiva, setTabAtiva] = useState<'absoluto' | 'percentual'>('absoluto');
    const [loading, setLoading] = useState(false);

    async function calcularRankings() {
        try {
            setLoading(true);

            // Busca os palpites e os resultados dos jogos
            const { data, error } = await supabase
                .from('palpite')
                .select(`
                    tipo, vencedor, casa_gol, fora_gol,
                    perfil:usuario_id (nickname),
                    jogo:jogo_id (status, casa_gol, fora_gol)
                `);

            if (error) throw error;
            const palpites = (data ?? []) as unknown as PalpiteData[];

            // Objeto temporário para agrupar as estatísticas por usuário
            const agrupado: Record<string, UserStats> = {};

            palpites.forEach((p) => {
                if (!p.jogo || p.jogo.status !== 'finalizado' || p.jogo.casa_gol === null || p.jogo.fora_gol === null) return;

                const nick = p.perfil?.nickname ?? 'Usuário Anônimo';

                if (!agrupado[nick]) {
                    agrupado[nick] = { nickname: nick, tentativas: 0, acertos: 0, cravadas: 0, percentual: 0 };
                }

                let vencedorReal: 'casa' | 'fora' | 'empate' = 'empate';
                if (p.jogo.casa_gol > p.jogo.fora_gol) vencedorReal = 'casa';
                if (p.jogo.fora_gol > p.jogo.casa_gol) vencedorReal = 'fora';

                agrupado[nick].tentativas += 1;

                if (p.vencedor === vencedorReal) {
                    agrupado[nick].acertos += 1;
                }

                if (p.tipo === 'exato' && p.casa_gol === p.jogo.casa_gol && p.fora_gol === p.jogo.fora_gol) {
                    agrupado[nick].cravadas += 1;
                }
            });

            const listaUsuarios = Object.values(agrupado).map((user) => {
                const porcen = user.tentativas > 0 ? (user.acertos / user.tentativas) * 100 : 0;
                return {
                    ...user,
                    percentual: parseFloat(porcen.toFixed(1))
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

    const rankingOrdenado = [...ranking].sort((a, b) => {
        if (tabAtiva === 'absoluto') {
            return b.acertos - a.acertos || b.cravadas - a.cravadas;
        } else {
            return b.percentual - a.percentual || b.tentativas - a.tentativas;
        }
    });

    if (loading) return <div className="text-center p-6 text-muted">A analisar as estatísticas...</div>;

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
            
            {/* Cabeçalho Alternador de Rankings (Tabs) */}
            <div className="flex bg-base p-1 rounded-xl border border-secondary">
                <button
                    onClick={() => setTabAtiva('absoluto')}
                    className={`flex-1 text-center py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        tabAtiva === 'absoluto' 
                            ? 'bg-primary text-primary-foreground shadow-sm' 
                            : 'text-muted hover:text-main'
                    }`}
                >
                    Rank de Mais Acertos
                </button>
                <button
                    onClick={() => setTabAtiva('percentual')}
                    className={`flex-1 text-center py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        tabAtiva === 'percentual' 
                            ? 'bg-primary text-primary-foreground shadow-sm' 
                            : 'text-muted hover:text-main'
                    }`}
                >
                    Rank Percentual
                </button>
            </div>

            {/* Tabela/Lista do Ranking */}
            <article className="w-full rounded-2xl border border-secondary bg-surface p-6 shadow-sm">
                
                {/* O CABEÇALHO AGORA SÓ APARECE NO COMPUTADOR (md:flex) */}
                <div className="hidden md:flex justify-between items-center text-[11px] uppercase tracking-wider text-muted font-bold pb-2 border-b border-secondary mb-2">
                    <span className="w-12 text-center">Pos</span>
                    <span className="flex-1 pl-2">Competidor</span>
                    <span className="w-20 text-center">Tentativas</span>
                    <span className="w-20 text-center">
                        {tabAtiva === 'absoluto' ? 'Acertos' : 'Aproveit.'}
                    </span>
                </div>

                <ul className="flex flex-col divide-y divide-secondary/50">
                    {rankingOrdenado.map((user, index) => {
                        const posicao = index + 1;
                        
                        const isTop3 = posicao <= 3;
                        const medalhaCor = 
                            posicao === 1 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                            posicao === 2 ? 'bg-slate-400/10 text-slate-400 border-slate-400/20' :
                            'bg-amber-700/10 text-amber-700 border-amber-700/20';

                        return (
                            <li key={user.nickname} className="py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-1.5 md:gap-4 text-sm">
                                
                                {/* LINHA 1 (Mobile) / COLUNA 1 e 2 (PC): Posição + Nome */}
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

                                {/* LINHA 2 (Mobile) / COLUNA 3 e 4 (PC): Dados de Palpites */}
                                <div className="flex flex-wrap items-center justify-start md:justify-end gap-3 pl-11 md:pl-0 text-xs md:text-sm text-muted md:text-main">
                                    
                                    {/* Módulo das Tentativas */}
                                    <div className="md:w-20 md:text-center">
                                        <span className="md:hidden text-muted/60 font-medium">Tentativas: </span>
                                        <span className="font-mono text-main md:text-muted">{user.tentativas}</span>
                                    </div>

                                    {/* Ponto de separação visual apenas no mobile */}
                                    <span className="md:hidden text-secondary-border/60">•</span>

                                    {/* Módulo Estatístico Principal (Muda baseado na Tab) */}
                                    <div className="md:w-20 md:text-center flex items-center gap-1.5 md:flex-col md:gap-0">
                                        <span className="md:hidden text-muted/60 font-medium">
                                            {tabAtiva === 'absoluto' ? 'Acertos: ' : 'Aproveit.: '}
                                        </span>
                                        <span className={`font-mono font-bold ${tabAtiva === 'absoluto' ? 'text-green-500' : 'text-primary'}`}>
                                            {tabAtiva === 'absoluto' ? user.acertos : `${user.percentual}%`}
                                        </span>
                                        
                                        {/* Tag de Cravadas (Placares exatos) integrada de forma compacta */}
                                        {tabAtiva === 'absoluto' && user.cravadas > 0 && (
                                            <span className="text-[9px] text-primary font-sans font-medium bg-primary/10 md:bg-transparent px-1 rounded-md md:p-0 md:mt-0.5">
                                                {user.cravadas} {user.cravadas === 1 ? 'exato' : 'exatos'}
                                            </span>
                                        )}
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