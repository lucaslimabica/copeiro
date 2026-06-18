import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Tipos baseados estritamente nos Enums do seu Postgres
type JogoStatus = 'por_vir' | 'ao_vivo' | 'finalizado';
type JogoDecisao = 'normal' | 'prorrogacao' | 'penaltis';

type JogoAdmin = {
    id: number;
    casa_gol: number | null;
    fora_gol: number | null;
    status: JogoStatus;
    decisao: JogoDecisao | null; // Pode ser null se o jogo não acabou
    inicio: string;
    casa: { nome: string; bandeira: string } | null;
    fora: { nome: string; bandeira: string } | null;
};

export default function Dev() {
    const [jogos, setJogos] = useState<JogoAdmin[]>([]);
    const [loading, setLoading] = useState(false);
    const [savingId, setSavingId] = useState<number | null>(null);

    async function carregarJogos() {
        setLoading(true);
        const { data, error } = await supabase
            .from('jogo')
            .select(`
                id, casa_gol, fora_gol, status, decisao, inicio,
                casa:selecao!casa_id(nome, bandeira),
                fora:selecao!fora_id(nome, bandeira)
            `)
            .order('inicio', { ascending: true });

        if (!error && data) setJogos(data as JogoAdmin[]);
        setLoading(false);
    }

    useEffect(() => {
        carregarJogos();
    }, []);

    const handleInputChange = (
        id: number, 
        campo: 'casa_gol' | 'fora_gol' | 'status' | 'decisao', 
        valor: any
    ) => {
        setJogos(prev => prev.map(j => {
            if (j.id === id) {
                // Se alterar o status para algo diferente de 'finalizado', removemos a decisão automaticamente
                if (campo === 'status' && valor !== 'finalizado') {
                    return { ...j, status: valor, decisao: null };
                }
                return { ...j, [campo]: valor === '' ? null : valor };
            }
            return j;
        }));
    };

    async function salvarAlteracoes(jogo: JogoAdmin) {
        setSavingId(jogo.id);
        try {
            const { error } = await supabase
                .from('jogo')
                .update({
                    casa_gol: jogo.casa_gol,
                    fora_gol: jogo.fora_gol,
                    status: jogo.status,
                    decisao: jogo.decisao // Enviando o enum ou null
                })
                .eq('id', jogo.id);

            if (error) throw error;
            alert(`Jogo ${jogo.id} atualizado com sucesso!`);
        } catch (e) {
            console.error(e);
            alert('Erro ao salvar: Verifique se os valores do Enum coincidem com o banco.');
        } finally {
            setSavingId(null);
        }
    }

    if (loading) return <div className="text-center p-6 text-muted">Carregando painel de controle...</div>;

    return (
        <article className="w-full rounded-2xl border border-secondary bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-bold text-main mb-4 border-b border-secondary pb-2">
                Painel Admin - Ajuste de Enums (Status & Decisão)
            </h2>
            <ul className="flex flex-col divide-y divide-secondary">
                {jogos.map((j) => (
                    <li key={j.id} className="flex flex-wrap items-center gap-4 py-4 text-sm">
                        
                        {/* Identificação do Jogo */}
                        <div className="min-w-[180px]">
                            <p className="font-semibold text-main">
                                {j.casa?.bandeira} {j.casa?.nome} vs {j.fora?.bandeira} {j.fora?.nome}
                            </p>
                            <span className="text-xs text-muted">ID: {j.id}</span>
                        </div>

                        {/* Placar */}
                        <div className="flex items-center gap-2 bg-base p-1.5 rounded-lg border border-secondary">
                            <input
                                type="number"
                                min="0"
                                value={j.casa_gol ?? ''}
                                placeholder="—"
                                onChange={(e) => handleInputChange(j.id, 'casa_gol', e.target.value ? parseInt(e.target.value) : '')}
                                className="w-12 text-center bg-transparent text-main font-bold focus:outline-none"
                            />
                            <span className="text-muted text-xs">x</span>
                            <input
                                type="number"
                                min="0"
                                value={j.fora_gol ?? ''}
                                placeholder="—"
                                onChange={(e) => handleInputChange(j.id, 'fora_gol', e.target.value ? parseInt(e.target.value) : '')}
                                className="w-12 text-center bg-transparent text-main font-bold focus:outline-none"
                            />
                        </div>

                        {/* Dropdown de Status (Enum jogo_status) */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase tracking-wider text-muted font-semibold">Status</label>
                            <select
                                value={j.status}
                                onChange={(e) => handleInputChange(j.id, 'status', e.target.value)}
                                className="rounded-lg border border-secondary bg-base px-3 py-1.5 text-xs font-medium text-main focus:outline-none cursor-pointer"
                            >
                                <option value="por_vir">Por Vir</option>
                                <option value="ao_vivo">Ao Vivo 🔴</option>
                                <option value="finalizado">Finalizado 🏁</option>
                            </select>
                        </div>

                        {/* Dropdown de Decisão (Enum jogo_decisao) */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase tracking-wider text-muted font-semibold">Decidido em</label>
                            <select
                                value={j.decisao ?? ''}
                                disabled={j.status !== 'finalizado'}
                                onChange={(e) => handleInputChange(j.id, 'decisao', e.target.value || '')}
                                className="rounded-lg border border-secondary bg-base px-3 py-1.5 text-xs font-medium text-main focus:outline-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <option value="">Não definido (Null)</option>
                                        
                                {/* Mude AQUI o value para "normal" */}
                                <option value="normal">Tempo Normal</option> 
                                        
                                <option value="prorrogacao">Prorrogação</option>
                                <option value="penaltis">Pênaltis</option>
                            </select>
                        </div>

                        {/* Ação de Salvar */}
                        <button
                            type="button"
                            onClick={() => salvarAlteracoes(j)}
                            disabled={savingId === j.id}
                            className="ml-auto rounded-lg bg-primary text-primary-foreground px-4 py-1.5 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                        >
                            {savingId === j.id ? 'Salvando...' : 'Salvar'}
                        </button>
                    </li>
                ))}
            </ul>
        </article>
    );
}