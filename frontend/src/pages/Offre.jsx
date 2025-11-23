import { Link } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { CheckCircle2 } from "lucide-react"

export default function Offre() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-brand-slate mb-4">
                        Une offre unique et transparente
                    </h1>
                    <p className="text-xl text-slate-600">
                        Tout ce dont vous avez besoin pour réussir votre VAE, sans frais cachés.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="p-8 md:p-12 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-center">
                            <div className="mb-4">
                                <span className="inline-block px-4 py-1 rounded-full bg-blue-100 text-brand-blue text-sm font-semibold mb-4">
                                    Offre Standard
                                </span>
                                <div className="flex items-baseline">
                                    <span className="text-5xl font-extrabold text-brand-slate">49€</span>
                                    <span className="ml-2 text-slate-500">/ dossier</span>
                                </div>
                                <p className="mt-4 text-slate-600">
                                    Paiement unique. Accès illimité à la plateforme jusqu'à l'obtention du diplôme.
                                </p>
                            </div>
                            <Link to="/paiement" className="w-full">
                                <Button size="lg" className="w-full">
                                    Choisir cette offre
                                </Button>
                            </Link>
                        </div>

                        <div className="p-8 md:p-12">
                            <h3 className="text-lg font-semibold text-brand-slate mb-6">
                                Ce qui est inclus :
                            </h3>
                            <ul className="space-y-4">
                                {[
                                    "Analyse de votre CV par IA",
                                    "Génération automatique du Livret 1",
                                    "Aide à la rédaction du Livret 2",
                                    "Chat illimité avec l'Assistant VAE",
                                    "Export des documents au format PDF",
                                    "Support client par email",
                                    "Mises à jour régulières"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-brand-success flex-shrink-0 mt-0.5" />
                                        <span className="text-slate-700">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="mt-16 text-center">
                    <h2 className="text-2xl font-bold text-brand-slate mb-4">
                        Des questions ?
                    </h2>
                    <p className="text-slate-600 mb-8">
                        Notre équipe est là pour vous aider à chaque étape de votre parcours.
                    </p>
                    <Button variant="secondary">
                        Contactez-nous
                    </Button>
                </div>
            </div>
        </div>
    )
}
