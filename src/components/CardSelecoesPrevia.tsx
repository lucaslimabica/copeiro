import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database';

type Selecao = Tables<'selecao'>;

export function CardSelecoesPrevia() {
    const [selecoes, setSelecoes] = useState<Selecao[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function carregarSelecoes() {
            try {
                setLoading(true);

                const { data, error } = await supabase
                    .from('selecao')
                    .select('id, nome, abreviacao');

                if (error) throw error;

                if (data) {
                    const aleatorias = [...data]
                        .sort(() => 0.5 - Math.random())
                        .slice(0, 5);

                    setSelecoes(aleatorias);
                }
            } catch (error) {
                console.error('Erro ao buscar selecoes:', error);
            } finally {
                setLoading(false);
            }
        }

        carregarSelecoes();
    }, []);

    if (loading)
        return (
            <article className="w-full max-w-sm rounded-2xl border border-secondary bg-surface p-6 text-center text-muted shadow-sm">
                A carregar...
            </article>
        );

    return (
        <article className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-secondary bg-surface p-6 shadow-sm">
            <ul className="flex w-full flex-col items-center gap-2">
                {selecoes.map((item) => (
                    <li key={item.id} className="text-sm font-bold text-main">
                        {item.nome}
                    </li>
                ))}
            </ul>
            <a className="cursor-pointer text-sm text-muted hover:underline">
                Ver Mais...
            </a>
        </article>
    );
}
