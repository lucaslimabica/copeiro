import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CardBuscaJogosAdmin } from '@/components/CardBuscaJogosAdmin'; 

type JogoStatus = 'por_vir' | 'ao_vivo' | 'finalizado';
type JogoDecisao = 'normal' | 'prorrogacao' | 'penaltis';

type JogoAdmin = {
    id: number;
    casa_gol: number | null;
    fora_gol: number | null;
    status: JogoStatus;
    decisao: JogoDecisao | null;
    inicio: string;
    casa: { nome: string; abreviacao: string; bandeira: string } | null;
    fora: { nome: string; abreviacao: string; bandeira: string } | null;
};

export default function Dev() {
    const [jogos, setJogos] = useState<JogoAdmin[]>([]);
    const [jogoSelecionado, setJogoSelecionado] = useState<JogoAdmin | null>(null); // Estado para a busca
    const [loading, setLoading] = useState(false);
    const [savingId, setSavingId] = useState<number | null>(null);

    async function carregarJogos() {
        setLoading(true);
        const { data, error } = await supabase
            .from('jogo')
            .select(`
                id, casa_gol, fora_gol, status, decisao, inicio,
                casa:selecao!casa_id(nome, abreviacao, bandeira),
                fora:selecao!fora_id(nome, abreviacao, bandeira)
            `)
            .order('inicio', { ascending: true });

        if (!error && data) setJogos(data as unknown as JogoAdmin[]);
        setLoading(false);
    }

    useEffect(() => {
        carregarJogos();
    }, []);

    // 1. Modificador para a Lista Geral
    const handleInputChange = (
        id: number, 
        campo: 'casa_gol' | 'fora_gol' | 'status' | 'decisao', 
        valor: any
    ) => {
        setJogos(prev => prev.map(j => {
            if (j.id === id) {
                if (campo === 'status' && valor !== 'finalizado') {
                    return { ...j, status: valor, decisao: null };
                }
                return { ...j, [campo]: valor === '' ? null : valor };
            }
            return j;
        }));
    };

    // 2. Modificador exclusivo para a linha selecionada na Busca
    const handleInputChangeSelecionado = (
        campo: 'casa_gol' | 'fora_gol' | 'status' | 'decisao', 
        valor: any
    ) => {
        if (!jogoSelecionado) return;
        setJogoSelecionado(prev => {
            if (!prev) return null;
            if (campo === 'status' && valor !== 'finalizado') {
                return { ...prev, status: valor, decisao: null };
            }
            return { ...prev, [campo]: valor === '' ? null : valor };
        });
    };

    // Função unificada para persistir os dados no banco
    async function salvarAlteracoes(jogo: JogoAdmin) {
        setSavingId(jogo.id);
        try {
            const { error } = await supabase
                .from('jogo')
                .update({
                    casa_gol: jogo.casa_gol,
                    fora_gol: jogo.fora_gol,
                    status: jogo.status,
                    decisao: jogo.decisao
                })
                .eq('id', jogo.id);

            if (error) throw error;
            alert(`Jogo ${jogo.id} atualizado com sucesso!`);
            
            // Sincroniza a lista geral caso ele tenha sido editado pela caixa de busca
            setJogos(prev => prev.map(j => j.id === jogo.id ? jogo : j));
        } catch (e) {
            console.error(e);
            alert('Erro ao salvar: Verifique se os valores coincidem com o banco.');
        } finally {
            setSavingId(null);
        }
    }

    if (loading) return <div className="text-center p-6 text-muted">Carregando painel de controle...</div>;

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 py-4">
            
            {/* COMPONENTE DE BUSCA (No topo para fácil acesso) */}
            <CardBuscaJogosAdmin onSelectJogo={(jogo) => setJogoSelecionado(jogo as JogoAdmin)} />

            {/* SEÇÃO DE EDIÇÃO FOCADA (Só aparece se você selecionar um jogo na busca) */}
            {jogoSelecionado && (
                <article className="w-full rounded-2xl border-2 border-primary bg-surface p-6 shadow-md transition-all">
                    <div className="flex justify-between items-center mb-4 border-b border-secondary pb-2">
                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                            ⚡ Jogo Selecionado para Alteração
                        </h3>
                        <button 
                            onClick={() => setJogoSelecionado(null)}
                            className="text-xs text-muted hover:text-main underline cursor-pointer"
                        >
                            Fechar edição focada
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 py-2 text-sm bg-base/40 p-4 rounded-xl border border-secondary">
                        <div className="min-w-[180px]">
                            <p className="font-bold text-main">
                                {jogoSelecionado.casa?.bandeira} {jogoSelecionado.casa?.nome} vs {jogoSelecionado.fora?.bandeira} {jogoSelecionado.fora?.nome}
                            </p>
                            <span className="text-xs text-muted font-mono">ID do Confronto: {jogoSelecionado.id}</span>
                        </div>

                        {/* Placar */}
                        <div className="flex items-center gap-2 bg-base px-2 py-1.5 rounded-lg border border-secondary">
                            <input
                                type="number"
                                min="0"
                                value={jogoSelecionado.casa_gol ?? ''}
                                placeholder="—"
                                onChange={(e) => handleInputChangeSelecionado('casa_gol', e.target.value ? parseInt(e.target.value) : '')}
                                className="w-12 text-center bg-transparent text-main font-bold focus:outline-none"
                            />
                            <span className="text-muted text-xs">x</span>
                            <input
                                type="number"
                                min="0"
                                value={jogoSelecionado.fora_gol ?? ''}
                                placeholder="—"
                                onChange={(e) => handleInputChangeSelecionado('fora_gol', e.target.value ? parseInt(e.target.value) : '')}
                                className="w-12 text-center bg-transparent text-main font-bold focus:outline-none"
                            />
                        </div>

                        {/* Status */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase tracking-wider text-muted font-semibold">Status</label>
                            <select
                                value={jogoSelecionado.status}
                                onChange={(e) => handleInputChangeSelecionado('status', e.target.value)}
                                className="rounded-lg border border-secondary bg-base px-3 py-1.5 text-xs font-medium text-main focus:outline-none cursor-pointer"
                            >
                                <option value="por_vir">Por Vir</option>
                                <option value="ao_vivo">Ao Vivo 🔴</option>
                                <option value="finalizado">Finalizado 🏁</option>
                            </select>
                        </div>

                        {/* Decisão */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase tracking-wider text-muted font-semibold">Decidido em</label>
                            <select
                                value={jogoSelecionado.decisao ?? ''}
                                disabled={jogoSelecionado.status !== 'finalizado'}
                                onChange={(e) => handleInputChangeSelecionado('decisao', e.target.value || '')}
                                className="rounded-lg border border-secondary bg-base px-3 py-1.5 text-xs font-medium text-main focus:outline-none cursor-pointer disabled:opacity-40"
                            >
                                <option value="">Não definido (Null)</option>
                                <option value="normal">Tempo Normal</option> 
                                <option value="prorrogacao">Prorrogação</option>
                                <option value="penaltis">Pênaltis</option>
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={() => salvarAlteracoes(jogoSelecionado)}
                            disabled={savingId === jogoSelecionado.id}
                            className="ml-auto rounded-lg bg-primary text-primary-foreground px-5 py-2 text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                        >
                            {savingId === jogoSelecionado.id ? 'Salvando...' : 'Salvar Alteração'}
                        </button>
                    </div>
                </article>
            )}

            {/* LISTA COMPLETA ORIGINAL (Mantida para navegação visual completa) */}
            <article className="w-full rounded-2xl border border-secondary bg-surface p-6 shadow-sm">
                <h2 className="text-base font-bold text-main mb-4 border-b border-secondary pb-2 uppercase tracking-wider text-muted">
                    📋 Todos os Confrontos Agendados
                </h2>
                <ul className="flex flex-col divide-y divide-secondary">
                    {jogos.map((j) => (
                        <li key={j.id} className="flex flex-wrap items-center gap-4 py-4 text-sm">
                            
                            <div className="min-w-[180px]">
                                <p className="font-semibold text-main">
                                    {j.casa?.bandeira} {j.casa?.nome} vs {j.fora?.bandeira} {j.fora?.nome}
                                </p>
                                <span className="text-xs text-muted">ID: {j.id}</span>
                            </div>

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

                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] uppercase tracking-wider text-muted font-semibold">Decidido em</label>
                                <select
                                    value={j.decisao ?? ''}
                                    disabled={j.status !== 'finalizado'}
                                    onChange={(e) => handleInputChange(j.id, 'decisao', e.target.value || '')}
                                    className="rounded-lg border border-secondary bg-base px-3 py-1.5 text-xs font-medium text-main focus:outline-none cursor-pointer disabled:opacity-40"
                                >
                                    <option value="">Não definido (Null)</option>
                                    <option value="normal">Tempo Normal</option> 
                                    <option value="prorrogacao">Prorrogação</option>
                                    <option value="penaltis">Pênaltis</option>
                                </select>
                            </div>

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
        </div>
    );
}