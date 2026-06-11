import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database';

type Selecao = Tables<'selecao'>;

type JogoComOponente = {
    id: number;
    casa_id: number;
    fora_id: number;
    inicio: string;
    casa: { abreviacao: string } | null;
    fora: { abreviacao: string } | null;
};

function formatarProximoJogo(jogo: JogoComOponente, selecaoId: number) {
    const isCasa = jogo.casa_id === selecaoId;
    const oponente = isCasa ? jogo.fora?.abreviacao : jogo.casa?.abreviacao;
    
    const dataObjeto = new Date(jogo.inicio);

    // hora no fuso de Brasília
    const horaBR = dataObjeto.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo'
    });

    // hora no fuso de Lisboa 
    const horaPT = dataObjeto.toLocaleTimeString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Lisbon'
    });

    return `vs ${oponente ?? '?'} · ${horaBR} BR | ${horaPT} PT`;
}

export function CardSelecoesPrevia() {
    const [selecoes, setSelecoes] = useState<Selecao[]>([]);
    const [proximoPorSelecao, setProximoPorSelecao] = useState<
        Map<number, JogoComOponente>
    >(new Map());
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function carregar() {
            try {
                setLoading(true);

                const { data: selecoesData, error: erroSelecoes } =
                    await supabase.from('selecao').select('id, nome, abreviacao');
                if (erroSelecoes) throw erroSelecoes;
                if (!selecoesData) return;

                const aleatorias = [...selecoesData]
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 5);
                const ids = aleatorias.map((s) => s.id);

                const { data: jogosData, error: erroJogos } = await supabase
                    .from('jogo')
                    .select(
                        `
                        id, casa_id, fora_id, inicio,
                        casa:selecao!casa_id(abreviacao),
                        fora:selecao!fora_id(abreviacao)
                        `,
                    )
                    .in('status', ['por_vir', 'ao_vivo'])
                    .or(
                        `casa_id.in.(${ids.join(',')}),fora_id.in.(${ids.join(',')})`,
                    )
                    .order('inicio', { ascending: true });
                if (erroJogos) throw erroJogos;

                const proximo = new Map<number, JogoComOponente>();
                for (const j of (jogosData ?? []) as JogoComOponente[]) {
                    if (ids.includes(j.casa_id) && !proximo.has(j.casa_id))
                        proximo.set(j.casa_id, j);
                    if (ids.includes(j.fora_id) && !proximo.has(j.fora_id))
                        proximo.set(j.fora_id, j);
                }

                setSelecoes(aleatorias);
                setProximoPorSelecao(proximo);
            } catch (error) {
                console.error('Erro ao buscar selecoes/jogos:', error);
            } finally {
                setLoading(false);
            }
        }

        carregar();
    }, []);

    if (loading)
        return (
            <article className="w-full max-w-sm rounded-2xl border border-secondary bg-surface p-6 text-center text-muted shadow-sm">
                A carregar...
            </article>
        );

    return (
        <article className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-secondary bg-surface p-6 shadow-sm">
            <ul className="flex w-full flex-col gap-2">
                {selecoes.map((item) => {
                    const proximo = proximoPorSelecao.get(item.id);
                    return (
                        <li
                            key={item.id}
                            className="flex w-full items-center justify-between gap-3 text-sm"
                        >
                            <span className="font-bold text-main">
                                {item.nome}
                            </span>
                            <span className="text-muted text-[12px]">
                                {proximo
                                    ? formatarProximoJogo(proximo, item.id)
                                    : '—'}
                            </span>
                        </li>
                    );
                })}
            </ul>
            <a className="cursor-pointer text-sm text-muted hover:underline" href='/jogos'>
                Ver Mais...
            </a>
        </article>
    );
}
