import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type PalpiteCompleto = {
    id: number;
    tipo: 'simples' | 'exato';
    vencedor: 'casa' | 'fora' | 'empate';
    casa_gol: number | null;
    fora_gol: number | null;
    perfil: { nickname: string } | null;
    jogo: {
        id: number;
        status: 'por_vir' | 'ao_vivo' | 'finalizado';
        casa: { nome: string; abreviacao: string; bandeira: string } | null;
        fora: { nome: string; abreviacao: string; bandeira: string } | null;
    } | null;
};

export function CardListaPalpites() {
    const [palpites, setPalpites] = useState<PalpiteCompleto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    async function carregarPalpites() {
        try {
            setLoading(true);
            
            // O segredo está nessa string de select relacional (JOIN implícito)
            const { data, error } = await supabase
                .from('palpite')
                .select(`
                    id, tipo, vencedor, casa_gol, fora_gol,
                    perfil:usuario_id (nickname),
                    jogo:jogo_id (
                        id, status,
                        casa:casa_id (nome, abreviacao, bandeira),
                        fora:fora_id (nome, abreviacao, bandeira)
                    )
                `)
                .order('id', { ascending: false }); // Mostra os mais recentes primeiro

            if (error) throw error;
            setPalpites((data ?? []) as unknown as PalpiteCompleto[]);
        } catch (e) {
            console.error('Erro ao carregar mural de palpites:', e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        carregarPalpites();
    }, []);

    if (loading) {
        return (
            <article className="w-full rounded-2xl border border-secondary bg-surface p-6 text-center text-muted shadow-sm">
                Carregando palpites da galera...
            </article>
        );
    }

    return (
        <article className="w-full rounded-2xl border border-secondary bg-surface p-6 shadow-sm">
            <h2 className="text-base font-bold text-main mb-4 border-b border-secondary pb-2 flex justify-between items-center">
                <span>Mural de Palpites 🏟️</span>
                <button 
                    onClick={carregarPalpites}
                    className="text-xs text-muted hover:text-main transition-colors cursor-pointer"
                >
                    Atualizar
                </button>
            </h2>

            <ul className="flex flex-col divide-y divide-secondary">
                {palpites.map((p) => {
                    if (!p.jogo) return null; // Prevenção caso o jogo tenha sido deletado

                    return (
                        <li key={p.id} className="py-3 flex flex-wrap items-center justify-between gap-4 text-sm">
                            
                            {/* Quem palpitou */}
                            <div className="flex flex-col min-w-[120px]">
                                <span className="font-bold text-main">
                                    {p.perfil?.nickname ?? 'Usuário Desconhecido'}
                                </span>
                                <span className="text-[10px] uppercase tracking-wider text-muted font-medium">
                                    Palpite {p.tipo}
                                </span>
                            </div>

                            {/* O Jogo em questão */}
                            <div className="flex items-center gap-2 bg-base px-3 py-1.5 rounded-xl border border-secondary">
                                <span className="font-semibold text-main">
                                    {p.jogo.casa?.bandeira} {p.jogo.casa?.abreviacao}
                                </span>
                                <span className="text-muted text-xs font-bold">vs</span>
                                <span className="font-semibold text-main">
                                    {p.jogo.fora?.bandeira} {p.jogo.fora?.abreviacao}
                                </span>
                            </div>

                            {/* O Palpite feito */}
                            <div className="ml-auto flex items-center">
                                {p.tipo === 'exato' ? (
                                    /* Exibição do Placar Exato */
                                    <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/30 text-primary font-extrabold px-3 py-1 rounded-lg text-xs">
                                        <span>Placar:</span>
                                        <span>{p.casa_gol} – {p.fora_gol}</span>
                                    </div>
                                ) : (
                                    /* Exibição do Vencedor Simples */
                                    <div className="bg-secondary/40 border border-secondary text-main px-3 py-1 rounded-lg text-xs font-medium">
                                        Vencedor: {' '}
                                        <span className="font-bold text-primary">
                                            {p.vencedor === 'empate' && 'Empate'}
                                            {p.vencedor === 'casa' && (p.jogo.casa?.nome ?? 'Casa')}
                                            {p.vencedor === 'fora' && (p.jogo.fora?.nome ?? 'Fora')}
                                        </span>
                                    </div>
                                )}
                            </div>

                        </li>
                    );
                })}

                {palpites.length === 0 && (
                    <li className="py-6 text-center text-sm text-muted italic">
                        Nenhum palpite registrado por enquanto. Seja o primeiro!
                    </li>
                )}
            </ul>
        </article>
    );
}