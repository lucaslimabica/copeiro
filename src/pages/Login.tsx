import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

export default function Login() {
    const { session, loading, signIn, signUp } = useAuth();
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    if (loading) return null;
    if (session) return <Navigate to="/" replace />;

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        const result =
            mode === 'signin'
                ? await signIn(email, password)
                : await signUp(email, password, nickname);
        setSubmitting(false);
        if (result.error) setError(result.error.message);
    }

    return (
        <div className="flex min-h-[80vh] items-center justify-center p-6">
            <form
                onSubmit={onSubmit}
                className="flex w-full max-w-sm flex-col gap-3 rounded-2xl border border-secondary bg-surface p-6 shadow-sm"
            >
                <h1 className="text-center text-lg font-bold text-main">
                    {mode === 'signin' ? 'Entrar no Copeiro' : 'Criar conta'}
                </h1>

                <label className="flex flex-col gap-1 text-xs text-muted">
                    Email
                    <input
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-lg border border-border-main bg-base p-2 text-sm text-main outline-hidden focus:ring-2 focus:ring-primary/40"
                    />
                </label>

                <label className="flex flex-col gap-1 text-xs text-muted">
                    Senha
                    <input
                        type="password"
                        required
                        minLength={6}
                        autoComplete={
                            mode === 'signin'
                                ? 'current-password'
                                : 'new-password'
                        }
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="rounded-lg border border-border-main bg-base p-2 text-sm text-main outline-hidden focus:ring-2 focus:ring-primary/40"
                    />
                </label>

                {mode === 'signup' && (
                    <label className="flex flex-col gap-1 text-xs text-muted">
                        Nickname
                        <input
                            type="text"
                            required
                            minLength={2}
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="rounded-lg border border-border-main bg-base p-2 text-sm text-main outline-hidden focus:ring-2 focus:ring-primary/40"
                        />
                    </label>
                )}

                {error && (
                    <p className="text-xs text-red-500">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-surface hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                    {submitting
                        ? 'Aguarda…'
                        : mode === 'signin'
                          ? 'Entrar'
                          : 'Criar conta'}
                </button>

                <button
                    type="button"
                    onClick={() =>
                        setMode((m) =>
                            m === 'signin' ? 'signup' : 'signin',
                        )
                    }
                    className="text-xs text-muted hover:text-main hover:underline cursor-pointer"
                >
                    {mode === 'signin'
                        ? 'Não tenho conta — criar'
                        : 'Já tenho conta — entrar'}
                </button>
            </form>
        </div>
    );
}
