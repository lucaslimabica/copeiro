import { useState } from 'react';
import { supabase } from '@/lib/supabase';

type PalpiteTipo = 'simples' | 'exato';
type VencedorLado = 'casa' | 'fora' | 'empate';

type FormPalpiteProps = {
    jogoId: number;
    casaNome: string;
    foraNome: string;
};

export function FormPalpite({ jogoId, casaNome, foraNome }: FormPalpiteProps) {
    const [tipo, setTipo] = useState<PalpiteTipo>('exato');
    const [casaGol, setCasaGol] = useState<string>('');
    const [foraGol, setForaGol] = useState<string>('');
    const [vencedorSimples, setVencedorSimples] = useState<VencedorLado>('casa');
    const [enviando, setEnviando] = useState(false);

    async function handleEnviarPalpite(e: React.FormEvent) {
        e.preventDefault();
        setEnviando(true);

        try {
            // 1. Valida autenticação
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                alert('Você precisa estar logado para palpitar!');
                setEnviando(false);
                return;
            }

            let finalVencedor: VencedorLado = vencedorSimples;
            let finalCasaGol: number | null = null;
            let finalForaGol: number | null = null;

            // 2. Aplica as regras com base no tipo escolhido
            if (tipo === 'exato') {
                if (casaGol === '' || foraGol === '') {
                    alert('Preencha os gols para o palpite exato!');
                    setEnviando(false);
                    return;
                }
                finalCasaGol = parseInt(casaGol);
                finalForaGol = parseInt(foraGol);

                // Calcula o vencedor automaticamente no modo exato
                if (finalCasaGol > finalForaGol) finalVencedor = 'casa';
                else if (finalForaGol > finalCasaGol) finalVencedor = 'fora';
                else finalVencedor = 'empate';
            } else {
                // No modo simples, gols vão como null e o vencedor é o que ele clicou
                finalVencedor = vencedorSimples;
                finalCasaGol = null;
                finalForaGol = null;
            }

            // 3. Salva no Supabase
            const { error: insertError } = await supabase
                .from('palpite')
                .insert({
                    jogo_id: jogoId,
                    usuario_id: user.id,
                    tipo: tipo,             // 'simples' ou 'exato'
                    vencedor: finalVencedor, // 'casa', 'fora' ou 'empate'
                    casa_gol: finalCasaGol,
                    fora_gol: finalForaGol
                });
            
            if (insertError) throw insertError;

            alert('Palpite registrado com sucesso!');

        } catch (error: any) {
            console.error(error);
            alert(`Erro ao salvar palpite: ${error.message}`);
        } finally {
            setEnviando(false);
        }
    }

    return (
        <form onSubmit={handleEnviarPalpite} className="flex flex-col gap-4 p-1 min-w-[240px]">
            <p className="font-semibold text-main text-xs border-b border-secondary pb-1.5 text-center">
                Novo Palpite
            </p>

            {/* Alternador de Tipo (Tabs Simples / Exato) */}
            <div className="flex bg-base p-1 rounded-lg border border-secondary">
                <button
                    type="button"
                    onClick={() => setTipo('exato')}
                    className={`flex-1 text-center py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                        tipo === 'exato' ? 'bg-secondary text-main' : 'text-muted hover:text-main'
                    }`}
                >
                    Placar Exato
                </button>
                <button
                    type="button"
                    onClick={() => setTipo('simples')}
                    className={`flex-1 text-center py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                        tipo === 'simples' ? 'bg-secondary text-main' : 'text-muted hover:text-main'
                    }`}
                >
                    Quem Vence
                </button>
            </div>

            {/* Renderização Condicional da Interface */}
            {tipo === 'exato' ? (
                /* INTERFACE DO PLACAR EXATO */
                <div className="flex items-center justify-center gap-3 my-1">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] text-muted font-medium max-w-[65px] truncate">{casaNome}</span>
                        <input
                            type="number"
                            min="0"
                            value={casaGol}
                            onChange={(e) => setCasaGol(e.target.value)}
                            placeholder="0"
                            className="w-12 h-9 text-center bg-base border border-secondary rounded-lg text-main font-bold text-sm focus:outline-none focus:border-primary"
                        />
                    </div>
                    <span className="text-muted text-xs font-bold self-end mb-2">x</span>
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] text-muted font-medium max-w-[65px] truncate">{foraNome}</span>
                        <input
                            type="number"
                            min="0"
                            value={foraGol}
                            onChange={(e) => setForaGol(e.target.value)}
                            placeholder="0"
                            className="w-12 h-9 text-center bg-base border border-secondary rounded-lg text-main font-bold text-sm focus:outline-none focus:border-primary"
                        />
                    </div>
                </div>
            ) : (
                /* INTERFACE DO PALPITE SIMPLES (BOTÕES DE VITÓRIA) */
                <div className="flex flex-col gap-1.5 my-1">
                    <label className="text-[9px] uppercase tracking-wider text-muted font-semibold text-center mb-1">
                        Escolha o resultado:
                    </label>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setVencedorSimples('casa')}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg border border-secondary transition-all cursor-pointer ${
                                vencedorSimples === 'casa' 
                                    ? 'bg-primary/20 border-primary text-primary' 
                                    : 'bg-base text-main hover:bg-secondary/40'
                            }`}
                        >
                            {casaNome}
                        </button>
                        <button
                            type="button"
                            onClick={() => setVencedorSimples('empate')}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg border border-secondary transition-all cursor-pointer ${
                                vencedorSimples === 'empate' 
                                    ? 'bg-primary/20 border-primary text-primary' 
                                    : 'bg-base text-main hover:bg-secondary/40'
                            }`}
                        >
                            Empate
                        </button>
                        <button
                            type="button"
                            onClick={() => setVencedorSimples('fora')}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg border border-secondary transition-all cursor-pointer ${
                                vencedorSimples === 'fora' 
                                    ? 'bg-primary/20 border-primary text-primary' 
                                    : 'bg-base text-main hover:bg-secondary/40'
                            }`}
                        >
                            {foraNome}
                        </button>
                    </div>
                </div>
            )}

            {/* Botão de Enviar */}
            <button
                type="submit"
                disabled={enviando}
                className="w-full mt-1 bg-primary text-primary-foreground font-semibold text-xs py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
                {enviando ? 'Enviando palpite...' : 'Confirmar Palpite'}
            </button>
        </form>
    );
}