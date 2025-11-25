import { Link } from "react-router-dom"

export function Footer() {
    return (
        <footer className="bg-slate-50 border-t border-slate-200 py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex flex-col items-start leading-none mb-4">
                            <span className="text-2xl font-bold">
                                <span className="text-brand-blue">VAE</span>
                                <span className="text-slate-900"> Facile</span>
                            </span>
                        </div>
                        <p className="text-slate-600 text-sm max-w-xs mb-4">
                            Votre VAE générée par IA en 10 minutes. Accompagnement complet pour 89€.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="text-lg">🇫🇷</span>
                            <span>Conçu en France</span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 mb-4">
                            Navigation
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/" className="text-slate-600 hover:text-brand-blue text-sm transition-colors">
                                    Accueil
                                </Link>
                            </li>
                            <li>
                                <Link to="/offre" className="text-slate-600 hover:text-brand-blue text-sm transition-colors">
                                    Comment ça marche ?
                                </Link>
                            </li>
                            <li>
                                <Link to="/espace-client" className="text-slate-600 hover:text-brand-blue text-sm transition-colors">
                                    Mon Espace
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 mb-4">
                            Légal
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="#" className="text-slate-600 hover:text-brand-blue text-sm transition-colors">
                                    Mentions Légales
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="text-slate-600 hover:text-brand-blue text-sm transition-colors">
                                    CGV
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="text-slate-600 hover:text-brand-blue text-sm transition-colors">
                                    Politique de Confidentialité
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-600 text-sm">
                        © 2025 VAE Facile. Tous droits réservés.
                    </p>
                    <p className="text-slate-500 text-xs">
                        Service privé d'accompagnement à la VAE propulsé par IA.
                    </p>
                </div>
            </div>
        </footer>
    )
}
