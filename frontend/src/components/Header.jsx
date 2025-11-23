import { Link } from "react-router-dom"
import { Button } from "./ui/Button"

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="flex flex-col items-start leading-none">
                            <span className="text-sm font-bold text-brand-slate">RÉPUBLIQUE</span>
                            <span className="text-sm font-bold text-brand-slate">FRANÇAISE</span>
                        </div>
                        <span className="ml-4 text-lg font-bold text-brand-blue">France VAE</span>
                    </Link>
                </div>

                <nav className="hidden md:flex items-center gap-6">
                    <Link to="/" className="text-sm font-medium text-slate-700 hover:text-brand-blue">
                        Accueil
                    </Link>
                    <Link to="/offre" className="text-sm font-medium text-slate-700 hover:text-brand-blue">
                        Notre Offre
                    </Link>
                    <Link to="/espace-client" className="text-sm font-medium text-slate-700 hover:text-brand-blue">
                        Espace Candidat
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <Link to="/espace-client">
                        <Button variant="ghost" size="sm" className="hidden sm:flex">
                            Se connecter
                        </Button>
                    </Link>
                    <Link to="/paiement">
                        <Button variant="primary" size="sm">
                            Commencer (49€)
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    )
}
