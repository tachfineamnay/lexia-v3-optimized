import { Link } from "react-router-dom"

export function Footer() {
    return (
        <footer className="bg-brand-slate text-white py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex flex-col items-start leading-none mb-4">
                            <span className="text-2xl font-extrabold text-[#FF2E63]">VAE Facile</span>
                        </div>
                        <p className="text-slate-300 text-sm max-w-xs">
                            Simplifier l'accès à la Validation des Acquis de l'Expérience pour tous les diplômes. Tout compris à 89€.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
                            Navigation
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/" className="text-slate-300 hover:text-[#FF2E63] text-sm">
                                    Accueil
                                </Link>
                            </li>
                            <li>
                                <Link to="/offre" className="text-slate-300 hover:text-[#FF2E63] text-sm">
                                    Comment ça marche ?
                                </Link>
                            </li>
                            <li>
                                <Link to="/espace-client" className="text-slate-300 hover:text-[#FF2E63] text-sm">
                                    Mon Espace
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
                            Légal
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="#" className="text-slate-300 hover:text-[#FF2E63] text-sm">
                                    Mentions Légales
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="text-slate-300 hover:text-[#FF2E63] text-sm">
                                    CGV
                                </Link>
                            </li>
                            <li>
                                <Link to="#" className="text-slate-300 hover:text-[#FF2E63] text-sm">
                                    Politique de Confidentialité
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-400 text-sm">
                        © 2025 VAE Facile. Tous droits réservés.
                    </p>
                    <p className="text-slate-500 text-xs">
                        Service privé d'accompagnement à la VAE.
                    </p>
                </div>
            </div>
        </footer>
    )
}
