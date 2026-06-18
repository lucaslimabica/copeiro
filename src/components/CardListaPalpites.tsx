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
        casa_gol: number | null; // Gols REAIS do jogo
        fora_gol: number | null; // Gols REAIS do jogo
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
            
            // 1. Atualizamos o select para incluir casa_gol e fora_gol do JOGO
            const { data, error } = await supabase
                .from('palpite')
                .select(`
                    id, tipo, vencedor, casa_gol, fora_gol,
                    perfil:usuario_id (nickname),
                    jogo:jogo_id (
                        id, status, casa_gol, fora_gol,
                        casa:casa_id (nome, abreviacao, bandeira),
                        fora:fora_id (nome, abreviacao, bandeira)
                    )
                `)
                .order('id', { ascending: false });

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

    // 2. Função inteligente para calcular o Match do Palpite com o Jogo
    function renderStatusPalpite(p: PalpiteCompleto) {
        if (!p.jogo || p.jogo.status !== 'finalizado') {
            return (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-secondary/30 text-muted">
                    Aguardando jogo ⏳
                </span>
            );
        }

        const j = p.jogo;
        if (j.casa_gol === null || j.fora_gol === null) return null;

        // Descobre quem ganhou o jogo de verdade no banco
        let vencedorReal: 'casa' | 'fora' | 'empate' = 'empate';
        if (j.casa_gol > j.fora_gol) vencedorReal = 'casa';
        if (j.fora_gol > j.casa_gol) vencedorReal = 'fora';

        // Validação se o palpite foi do tipo EXATO (Placar completo)
        if (p.tipo === 'exato') {
            const cravouPlacar = p.casa_gol === j.casa_gol && p.fora_gol === j.fora_gol;
            
            if (cravouPlacar) {
                return (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-500/10 text-green-500 border border-green-500/20">
                        Placar Exato!
                    </span>
                );
            }

            if (p.vencedor === vencedorReal) {
                return (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        Acertou o Vencedor
                    </span>
                );
            }

            return (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20">
                    Errou
                </span>
            );
        } 
        
        // Validação se o palpite foi do tipo SIMPLES (Apenas vencedor/empate)
        else {
            if (p.vencedor === vencedorReal) {
                return (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-500/10 text-green-500 border border-green-500/20">
                        Acertou!
                    </span>
                );
            }
            return (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20">
                    Errou
                </span>
            );
        }
    }

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
                <span>Mural de Palpites</span>
                <button 
                    onClick={carregarPalpites}
                    className="text-xs text-muted hover:text-main transition-colors cursor-pointer"
                >
                    Atualizar
                </button>
            </h2>

            <ul className="flex flex-col divide-y divide-secondary">
                {palpites.map((p) => {
                    if (!p.jogo) return null;

                    return (
                        <li key={p.id} className="py-3 flex flex-wrap items-center justify-between gap-4 text-sm">
                            
                            {/* Nome do usuário e a resposta do Match */}
                            <div className="flex flex-col gap-1 min-w-[140px]">
                                <span className="font-bold text-main">
                                    {p.perfil?.nickname ?? 'Usuário'}
                                </span>
                                <div className="flex flex-col items-start gap-1">
                                    <span className="text-[9px] uppercase tracking-wider text-muted font-bold">
                                        Palpite {p.tipo}
                                    </span>
                                    {/* O CRUZAMENTO DE DADOS APARECE AQUI */}
                                    {renderStatusPalpite(p)}
                                </div>
                            </div>

                            {/* Escopos das seleções e placar REAL do jogo se finalizado */}
                            <div className="flex flex-col items-center gap-1 bg-base px-3 py-1.5 rounded-xl border border-secondary">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-main">
                                        {p.jogo.casa?.bandeira} {p.jogo.casa?.abreviacao}
                                    </span>
                                    <span className="text-muted text-xs font-bold">vs</span>
                                    <span className="font-semibold text-main">
                                        {p.jogo.fora?.bandeira} {p.jogo.fora?.abreviacao}
                                    </span>
                                </div>
                                {p.jogo.status === 'finalizado' && (
                                    <span className="text-[10px] text-muted font-mono bg-secondary/20 px-1.5 py-0.5 rounded">
                                        Placar Real: {p.jogo.casa_gol}x{p.jogo.fora_gol}
                                    </span>
                                )}
                            </div>

                            {/* O que o usuário apostou */}
                            <div className="ml-auto flex items-center">
                                {p.tipo === 'exato' ? (
                                    <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/30 text-primary font-extrabold px-3 py-1 rounded-lg text-xs">
                                        <span>Apostou:</span>
                                        <span>{p.casa_gol} – {p.fora_gol}</span>
                                    </div>
                                ) : (
                                    <div className="bg-secondary/40 border border-secondary text-main px-3 py-1 rounded-lg text-xs font-medium">
                                        Apostou: {' '}
                                        <span className="font-bold text-primary">
                                            {p.vencedor === 'empate' && 'Empate'}
                                            {p.vencedor === 'casa' && (p.jogo.casa?.abreviacao ?? 'Casa')}
                                            {p.vencedor === 'fora' && (p.jogo.fora?.abreviacao ?? 'Fora')}
                                        </span>
                                    </div>
                                )}
                            </div>

                        </li>
                    );
                })}
            </ul>
        </article>
    );
}