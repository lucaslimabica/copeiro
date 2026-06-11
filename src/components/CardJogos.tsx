import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Popover } from '@/components/Popover';

const PAGE_SIZE = 20;

type JogoCompleto = {
    id: number;
    casa_id: number;
    fora_id: number;
    casa_gol: number | null;
    fora_gol: number | null;
    inicio: string;
    status: 'por_vir' | 'ao_vivo' | 'finalizado';
    casa: { id: number; nome: string; abreviacao: string } | null;
    fora: { id: number; nome: string; abreviacao: string } | null;
};

function StatusLabel({ jogo }: { jogo: JogoCompleto }) {
    if (jogo.status === 'ao_vivo')
        return (
            <span className="inline-flex items-center gap-1 text-xs text-main">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                Ao vivo
            </span>
        );
        
    if (jogo.status === 'finalizado')
        return <span className="text-xs text-muted">Final</span>;

    const dataObjeto = new Date(jogo.inicio);

    // Formata o dia, mês e hora para o Brasil
    const dataHoraBR = dataObjeto.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo',
    });

    // Formata apenas a hora e minutos para Portugal
    const horaPT = dataObjeto.toLocaleTimeString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Lisbon'
    });

    return (
        <span className="text-xs text-muted">
            {dataHoraBR} BR | {horaPT} PT
        </span>
    );
}

function SelecaoBotao({
    selecao,
}: {
    selecao: JogoCompleto['casa'];
}) {
    // TODO: navegar para /selecao/:id quando a rota existir
    return (
        <button
            type="button"
            className="rounded-lg border border-secondary bg-base px-2.5 py-1 text-xs font-bold text-main hover:opacity-80 transition-opacity cursor-pointer"
        >
            {selecao?.abreviacao ?? '?'}
        </button>
    );
}

function Placar({ jogo }: { jogo: JogoCompleto }) {
    if (jogo.casa_gol == null || jogo.fora_gol == null)
        return (
            <span className="min-w-[3rem] text-center text-sm font-bold text-muted">
                vs
            </span>
        );
    return (
        <span className="min-w-[3rem] text-center text-sm font-bold text-main">
            {jogo.casa_gol} – {jogo.fora_gol}
        </span>
    );
}

function JogoRow({ jogo }: { jogo: JogoCompleto }) {
    return (
        <li className="flex flex-wrap items-center gap-3 py-3">
            <SelecaoBotao selecao={jogo.casa} />
            <Placar jogo={jogo} />
            <SelecaoBotao selecao={jogo.fora} />
            <div className="ml-2">
                <StatusLabel jogo={jogo} />
            </div>
            <div className="ml-auto flex gap-2">
                <Popover label="Palpitar">
                    <div className="text-xs">
                        <p className="font-semibold text-main">
                            {jogo.casa?.nome} vs {jogo.fora?.nome}
                        </p>
                        <p className="mt-1 text-muted">
                            Form de palpite — em breve (falta auth).
                        </p>
                    </div>
                </Popover>
                <Popover label="Duelar">
                    <div className="text-xs">
                        <p className="font-semibold text-main">
                            {jogo.casa?.nome} vs {jogo.fora?.nome}
                        </p>
                        <p className="mt-1 text-muted">
                            Criar duelo — em breve (falta auth).
                        </p>
                    </div>
                </Popover>
            </div>
        </li>
    );
}

export function CardJogos() {
    const [jogos, setJogos] = useState<JogoCompleto[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const loadingRef = useRef<boolean>(false);
    const initialLoadDone = useRef<boolean>(false);

    async function carregarMais() {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);
        try {
            const start = jogos.length;
            const { data, error } = await supabase
                .from('jogo')
                .select(
                    `
                    id, casa_id, fora_id, casa_gol, fora_gol, inicio, status,
                    casa:selecao!casa_id(id, nome, abreviacao),
                    fora:selecao!fora_id(id, nome, abreviacao)
                    `,
                )
                .order('inicio', { ascending: true })
                .range(start, start + PAGE_SIZE - 1);
            if (error) throw error;
            const novos = (data ?? []) as JogoCompleto[];
            setJogos((prev) => [...prev, ...novos]);
            if (novos.length < PAGE_SIZE) setHasMore(false);
        } catch (e) {
            console.error('Erro ao carregar jogos:', e);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }

    useEffect(() => {
        if (initialLoadDone.current) return;
        initialLoadDone.current = true;
        carregarMais();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <article className="w-full rounded-2xl border border-secondary bg-surface p-6 shadow-sm">
            <ul className="flex flex-col divide-y divide-secondary">
                {jogos.map((j) => (
                    <JogoRow key={j.id} jogo={j} />
                ))}
                {jogos.length === 0 && !loading && (
                    <li className="py-3 text-center text-sm text-muted">
                        Sem jogos.
                    </li>
                )}
            </ul>
            {hasMore && (
                <div className="mt-4 flex justify-center">
                    <button
                        type="button"
                        onClick={carregarMais}
                        disabled={loading}
                        className="rounded-lg border border-secondary bg-base px-4 py-2 text-sm font-semibold text-main hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Carregando...' : 'Carregar mais'}
                    </button>
                </div>
            )}
        </article>
    );
}
