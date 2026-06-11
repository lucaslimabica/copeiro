import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center text-main">
            <div className="text-center">
                <h1 className="text-4xl font-bold">
                    Ops... Algo Deu Errado
                </h1>
                <p className="mt-2 text-slate-400">
                    Página Não Encontrada :(<br></br>Tente Outra URL ou
                    <Link
                        to="/"
                        className="mt-4 inline-block font-bold py-2 px-4 rounded"
                    >
                        Voltar à Home
                    </Link>
                </p>
            </div>
        </div>
    );
}