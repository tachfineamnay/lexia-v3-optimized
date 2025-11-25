import { Link } from "react-router-dom"
import { Button } from "./ui/Button"

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-2xl font-bold">
                            <span className="text-brand-blue">VAE</span>
                            <span className="text-slate-900"> Facile</span>
                        </span>
                    </Link>
                </div>

                <nav className="hidden md:flex items-center gap-8">
                    <Link to="/" className="text-sm font-medium text-slate-700 hover:text-brand-blue relative after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-brand-blue after:transition-all hover:after:w-full">
                        Accueil
                    </Link>
                    <Link to="/offre" className="text-sm font-medium text-slate-700 hover:text-brand-blue relative after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-brand-blue after:transition-all hover:after:w-full">
                        Notre Offre
                    </Link>
                    <Link to="/espace-client" className="text-sm font-medium text-slate-700 hover:text-brand-blue relative after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0 after:bg-brand-blue after:transition-all hover:after:w-full">
                        Espace Client
                    </Link>
                </nav>

                <div className="flex items-center gap-3">
                    <Link to="/espace-client">
                        <Button variant="ghost" size="sm" className="hidden sm:flex">
                            Se connecter
                        </Button>
                    </Link>
                    <Link to="/paiement">
                        <Button variant="primary" size="sm" className="shadow-md">
                            Commencer (89€)
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    )
}
