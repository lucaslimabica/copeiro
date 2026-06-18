import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type UserRankPrevia = {
    nickname: string;
    acertos: number;
    percentual: number;
};

type PalpiteData = {
    vencedor: 'casa' | 'fora' | 'empate';
    perfil: { nickname: string } | null;
    jogo: {
        status: string;
        casa_gol: number | null;
        fora_gol: number | null;
    } | null;
};

export function CardRankingPrevia() {
    const [topUsers, setTopUsers] = useState<UserRankPrevia[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function carregarRanking() {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('palpite')
                    .select(`
                        vencedor,
                        perfil:usuario_id (nickname),
                        jogo:jogo_id (status, casa_gol, fora_gol)
                    `);

                if (error) throw error;
                const palpites = (data ?? []) as unknown as PalpiteData[];

                const agrupado: Record<string, { nickname: string; tentativas: number; acertos: number }> = {};

                palpites.forEach((p) => {
                    if (!p.jogo || p.jogo.status !== 'finalizado' || p.jogo.casa_gol === null || p.jogo.fora_gol === null) return;

                    const nick = p.perfil?.nickname ?? 'Anônimo';

                    if (!agrupado[nick]) {
                        agrupado[nick] = { nickname: nick, tentativas: 0, acertos: 0 };
                    }

                    let vencedorReal: 'casa' | 'fora' | 'empate' = 'empate';
                    if (p.jogo.casa_gol > p.jogo.fora_gol) vencedorReal = 'casa';
                    if (p.jogo.fora_gol > p.jogo.casa_gol) vencedorReal = 'fora';

                    agrupado[nick].tentativas += 1;
                    if (p.vencedor === vencedorReal) {
                        agrupado[nick].acertos += 1;
                    }
                });

                const listaOrdenada = Object.values(agrupado)
                    .map((user) => ({
                        nickname: user.nickname,
                        acertos: user.acertos,
                        percentual: user.tentativas > 0 ? Math.round((user.acertos / user.tentativas) * 100) : 0
                    }))
                    .sort((a, b) => b.acertos - a.acertos)
                    .slice(0, 5); // Pega apenas os 5 melhores

                setTopUsers(listaOrdenada);
            } catch (error) {
                console.error('Erro ao gerar previa do ranking:', error);
            } finally {
                setLoading(false);
            }
        }

        carregarRanking();
    }, []);

    if (loading)
        return (
            <article className="w-full max-w-sm rounded-2xl border border-secondary bg-surface p-6 text-center text-muted shadow-sm">
                A carregar ranking...
            </article>
        );

    return (
        <article className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-secondary bg-surface p-6 shadow-sm">
            <ul className="flex w-full flex-col gap-2">
                {topUsers.map((item, index) => (
                    <li key={item.nickname} className="flex w-full items-center justify-between gap-3 text-sm">
                        <span className="font-bold text-main truncate max-w-[180px]">
                            {index + 1}º {item.nickname}
                        </span>
                        <span className="text-muted text-[10px] font-mono">
                            {item.acertos} acertos ({item.percentual}%)
                        </span>
                    </li>
                ))}
                {topUsers.length === 0 && (
                    <li className="text-center text-xs text-muted py-2">Sem dados de ranking.</li>
                )}
            </ul>
            <a className="cursor-pointer text-sm text-muted hover:underline" href="/ranking">
                Ver Ranking Completo...
            </a>
        </article>
    );
}