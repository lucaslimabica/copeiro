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
                // Só calcula se o jogo já terminou e se temos os gols reais gravados
                if (!p.jogo || p.jogo.status !== 'finalizado' || p.jogo.casa_gol === null || p.jogo.fora_gol === null) return;

                const nick = p.perfil?.nickname ?? 'Usuário Anônimo';

                // Inicializa o usuário no mapa se for o primeiro palpite dele processado
                if (!agrupado[nick]) {
                    agrupado[nick] = { nickname: nick, tentativas: 0, acertos: 0, cravadas: 0, percentual: 0 };
                }

                // Determina o resultado real do jogo
                let vencedorReal: 'casa' | 'fora' | 'empate' = 'empate';
                if (p.jogo.casa_gol > p.jogo.fora_gol) vencedorReal = 'casa';
                if (p.jogo.fora_gol > p.jogo.casa_gol) vencedorReal = 'fora';

                agrupado[nick].tentativas += 1;

                // 1. Validar Acerto Geral (Acertou quem ganharia ou o empate)
                if (p.vencedor === vencedorReal) {
                    agrupado[nick].acertos += 1;
                }

                // 2. Validar Cravada (Apenas para tipo exato que bateu 100% dos gols)
                if (p.tipo === 'exato' && p.casa_gol === p.jogo.casa_gol && p.fora_gol === p.jogo.fora_gol) {
                    agrupado[nick].cravadas += 1;
                }
            });

            // Converte o objeto em Array e calcula a porcentagem de eficiência
            const listaUsuarios = Object.values(agrupado).map((user) => {
                const porcen = user.tentativas > 0 ? (user.acertos / user.tentativas) * 100 : 0;
                return {
                    ...user,
                    percentual: parseFloat(porcen.toFixed(1)) // Arredonda para 1 casa decimal (ex: 75.5%)
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

    // Define a ordenação com base na aba ativa
    const rankingOrdenado = [...ranking].sort((a, b) => {
        if (tabAtiva === 'absoluto') {
            // Ordena por acertos absolutos. Se empatar, desempatar por quem tem mais cravadas (placares exatos)
            return b.acertos - a.acertos || b.cravadas - a.cravadas;
        } else {
            // Ordena por percentual de eficiência. Se empatar, quem jogou mais vezes fica na frente (maior amostragem)
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
                <div className="flex justify-between items-center text-[11px] uppercase tracking-wider text-muted font-bold pb-2 border-b border-secondary mb-2">
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
                        
                        // Estilização especial para o Top 3 medalhistas
                        const isTop3 = posicao <= 3;
                        const medalhaCor = 
                            posicao === 1 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                            posicao === 2 ? 'bg-slate-400/10 text-slate-400 border-slate-400/20' :
                            'bg-amber-700/10 text-amber-700 border-amber-700/20';

                        return (
                            <li key={user.nickname} className="py-3 flex items-center justify-between text-sm">
                                
                                {/* Posição */}
                                <div className="w-12 flex justify-center">
                                    <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                                        isTop3 ? medalhaCor : 'bg-base text-muted border-secondary'
                                    }`}>
                                        {posicao}º
                                    </span>
                                </div>

                                {/* Nickname */}
                                <div className="flex-1 pl-2 font-semibold text-main truncate">
                                    {user.nickname}
                                    {posicao === 1 && ' 👑'}
                                </div>

                                {/* Total de Tentativas */}
                                <div className="w-20 text-center font-mono text-xs text-muted">
                                    {user.tentativas}
                                </div>

                                {/* Dado Principal (Muda dependendo do Rank selecionado) */}
                                <div className="w-20 text-center font-mono">
                                    {tabAtiva === 'absoluto' ? (
                                        <div className="flex flex-col items-center">
                                            <span className="font-bold text-green-500 text-sm">
                                                {user.acertos}
                                            </span>
                                            {user.cravadas > 0 && (
                                                <span className="text-[9px] text-primary font-sans font-medium">
                                                    {user.cravadas} exatos
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="font-bold text-primary text-sm">
                                            {user.percentual}%
                                        </span>
                                    )}
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