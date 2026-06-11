import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

export default function RouteErrorBoundary() {
    const error = useRouteError();
    const title = isRouteErrorResponse(error)
        ? `${error.status} ${error.statusText}`
        : 'Something went wrong';
    const detail =
        error instanceof Error
            ? error.message
            : typeof error === 'string'
              ? error
              : 'Unknown error';

    return (
        <div className="flex min-h-screen items-center justify-center bg-indigo-950 text-white">
            <div className="max-w-md text-center">
                <h1 className="text-2xl font-bold text-indigo-300">{title}</h1>
                <p className="mt-2 text-slate-400">{detail}</p>
                <p className="mt-2 text-slate-400">
                    Algo deu errado, tente novamente ou contate o suporte.
                </p>
            </div>
        </div>
    );
}