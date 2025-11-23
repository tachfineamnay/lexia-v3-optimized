import { Link } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { Card, CardContent } from "../components/ui/Card"
import { CheckCircle2, FileText, MessageSquare, Award } from "lucide-react"

export default function Home() {
    return (
        <div className="flex flex-col gap-16 pb-16">
            {/* Hero Section */}
            <section className="relative bg-brand-blue py-20 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-3xl text-white">
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-6">
                            Obtenez votre diplôme grâce à votre expérience.
                        </h1>
                        <p className="text-xl text-blue-100 mb-8 max-w-2xl">
                            Transformez vos années de travail en diplôme reconnu par l'État.
                            Une procédure simplifiée, 100% en ligne, pour seulement 49€.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/paiement">
                                <Button size="lg" className="w-full sm:w-auto bg-white text-brand-blue hover:bg-blue-50 border-none">
                                    Commencer ma VAE
                                </Button>
                            </Link>
                            <Link to="/offre">
                                <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-transparent text-white border-white hover:bg-white/10">
                                    Découvrir l'offre
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-brand-slate mb-4">
                        Pourquoi choisir France VAE ?
                    </h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Nous avons repensé le parcours de Validation des Acquis pour le rendre accessible, rapide et transparent.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="border-none shadow-lg shadow-slate-200/50">
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 text-brand-blue">
                                <FileText className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-brand-slate">Dossier Simplifié</h3>
                            <p className="text-slate-600">
                                Fini la paperasse administrative complexe. Notre assistant IA vous aide à constituer votre livret en quelques clics.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg shadow-slate-200/50">
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 text-brand-blue">
                                <MessageSquare className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-brand-slate">Accompagnement IA</h3>
                            <p className="text-slate-600">
                                Notre intelligence artificielle analyse votre profil et vous guide dans la rédaction de vos expériences.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg shadow-slate-200/50">
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 text-brand-blue">
                                <Award className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-brand-slate">Diplôme Officiel</h3>
                            <p className="text-slate-600">
                                Votre expérience vaut un diplôme. Obtenez la reconnaissance officielle de vos compétences par l'État.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Steps Section */}
            <section className="bg-slate-50 py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-brand-slate mb-6">
                                Votre VAE en 3 étapes simples
                            </h2>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold">1</div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-brand-slate mb-1">Inscription & Paiement</h3>
                                        <p className="text-slate-600">Créez votre compte et réglez les frais de dossier uniques de 49€.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold">2</div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-brand-slate mb-1">Constitution du Dossier</h3>
                                        <p className="text-slate-600">Déposez votre CV et laissez notre assistant vous aider à rédiger votre livret de recevabilité.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold">3</div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-brand-slate mb-1">Validation & Diplôme</h3>
                                        <p className="text-slate-600">Soumettez votre dossier et préparez votre passage devant le jury.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8">
                                <Link to="/paiement">
                                    <Button size="lg">
                                        Je me lance
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-brand-blue/5 rounded-2xl transform rotate-3"></div>
                            <img
                                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80"
                                alt="Groupe de travail"
                                className="relative rounded-2xl shadow-xl"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
