import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type PalpitePrevia = {
    id: number;
    tipo: 'simples' | 'exato';
    casa_gol: number | null;
    fora_gol: number | null;
    vencedor: 'casa' | 'fora' | 'empate';
    perfil: { nickname: string } | null;
    jogo: {
        casa: { abreviacao: string; bandeira: string } | null;
        fora: { abreviacao: string; bandeira: string } | null;
    } | null;
};

export function CardPalpitesPrevia() {
    const [recentes, setRecentes] = useState<PalpitePrevia[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function carregarPalpitesRecentes() {
            try {
                setLoading(true);
                // Busca os últimos 5 palpites inseridos no sistema
                const { data, error } = await supabase
                    .from('palpite')
                    .select(`
                        id, tipo, casa_gol, fora_gol, vencedor,
                        perfil:usuario_id (nickname),
                        jogo:jogo_id (
                            casa:casa_id (abreviacao, bandeira),
                            fora:fora_id (abreviacao, bandeira)
                        )
                    `)
                    .order('id', { ascending: false }) // Newest first
                    .range(0, 4);

                if (error) throw error;
                setRecentes((data ?? []) as unknown as PalpitePrevia[]);
            } catch (error) {
                console.error('Erro ao buscar palpites recentes:', error);
            } finally {
                setLoading(false);
            }
        }

        carregarPalpitesRecentes();
    }, []);

    if (loading)
        return (
            <article className="w-full max-w-sm rounded-2xl border border-secondary bg-surface p-6 text-center text-muted shadow-sm">
                A carregar palpites...
            </article>
        );

    return (
        <article className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-secondary bg-surface p-6 shadow-sm">
            <ul className="flex w-full flex-col gap-2">
                {recentes.map((p) => {
                    if (!p.jogo) return null;
                    
                    // Monta o texto resumido da aposta feita
                    const infoAposta = p.tipo === 'exato' 
                        ? `${p.casa_gol}x${p.fora_gol}` 
                        : p.vencedor === 'empate' 
                            ? 'Empate' 
                            : p.vencedor === 'casa' 
                                ? p.jogo.casa?.abreviacao 
                                : p.jogo.fora?.abreviacao;

                    return (
                        <li key={p.id} className="flex w-full items-center justify-between gap-3 text-sm">
                            <div className="flex flex-col truncate max-w-[160px]">
                                <span className="font-bold text-main truncate">{p.perfil?.nickname ?? 'Usuário'}</span>
                                <span className="text-[9px] text-muted font-medium">
                                    {p.jogo.casa?.bandeira} {p.jogo.casa?.abreviacao} vs {p.jogo.fora?.abreviacao} {p.jogo.fora?.bandeira}
                                </span>
                            </div>
                            <span className="bg-secondary/40 text-primary px-2 py-0.5 rounded-md text-[11px] font-extrabold font-mono whitespace-nowrap">
                                {infoAposta}
                            </span>
                        </li>
                    );
                })}
                {recentes.length === 0 && (
                    <li className="text-center text-xs text-muted py-2">Nenhum palpite recente.</li>
                )}
            </ul>
            <a className="cursor-pointer text-sm text-muted hover:underline" href="/palpites">
                Ver Mural Completo...
            </a>
        </article>
    );
}