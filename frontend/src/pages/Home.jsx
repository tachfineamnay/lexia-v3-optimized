import { Link } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { Card, CardContent } from "../components/ui/Card"
import { CheckCircle2, FileText, MessageSquare, Award, Clock, Euro } from "lucide-react"

export default function Home() {
    return (
        <div className="flex flex-col gap-16 pb-16 bg-[#FFFBF7]">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-[#FF2E63] to-[#E0275A] py-20 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80')] opacity-15 bg-cover bg-center mix-blend-overlay"></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-3xl text-white">
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-6">
                            Obtenez votre diplôme en valorisant votre expérience
                        </h1>
                        <p className="text-xl text-white/90 mb-8 max-w-2xl leading-relaxed">
                            Transformez vos années de travail en diplôme reconnu par l'État. Génération automatique du livret, version audio, relecture experte et coaching inclus.
                        </p>
                        <div className="inline-block bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-8">
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-5xl font-extrabold">89€</span>
                                <span className="text-xl opacity-90">tout compris</span>
                            </div>
                            <p className="text-sm opacity-90">Paiement unique • Sans abonnement</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/paiement">
                                <Button size="lg" className="w-full sm:w-auto bg-white text-[#FF2E63] hover:bg-gray-100 border-none font-bold text-lg px-8 py-6">
                                    Commencer ma VAE maintenant
                                </Button>
                            </Link>
                            <Link to="/offre">
                                <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-transparent text-white border-2 border-white hover:bg-white/10 font-semibold text-lg px-8 py-6">
                                    Découvrir l'offre
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Comparison Section */}
            <section className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-brand-slate mb-4">
                        3 façons de faire votre VAE
                    </h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Comparez les options et découvrez pourquoi VAE Facile est le meilleur choix.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Option 1: Seul(e) */}
                    <Card className="border-2 border-slate-200 shadow-sm">
                        <CardContent className="pt-6">
                            <div className="text-center mb-6">
                                <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-brand-slate mb-2">Faire seul(e)</h3>
                                <div className="flex items-baseline justify-center gap-2 mb-4">
                                    <span className="text-3xl font-bold text-slate-700">0€</span>
                                </div>
                            </div>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-start gap-2 text-sm text-slate-600">
                                    <span className="text-red-500 mt-1">✗</span>
                                    <span>8 mois de galère en moyenne</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-slate-600">
                                    <span className="text-red-500 mt-1">✗</span>
                                    <span>Paperasse administrative complexe</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-slate-600">
                                    <span className="text-red-500 mt-1">✗</span>
                                    <span>Aucun accompagnement</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-slate-600">
                                    <span className="text-red-500 mt-1">✗</span>
                                    <span>Taux d'abandon élevé</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Option 2: Cabinet classique */}
                    <Card className="border-2 border-slate-200 shadow-sm">
                        <CardContent className="pt-6">
                            <div className="text-center mb-6">
                                <Euro className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-brand-slate mb-2">Cabinet classique</h3>
                                <div className="flex items-baseline justify-center gap-2 mb-4">
                                    <span className="text-3xl font-bold text-amber-700">2500-4500€</span>
                                </div>
                            </div>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-start gap-2 text-sm text-slate-600">
                                    <span className="text-amber-500 mt-1">~</span>
                                    <span>Accompagnement humain</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-slate-600">
                                    <span className="text-amber-500 mt-1">~</span>
                                    <span>Rendez-vous en présentiel</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-slate-600">
                                    <span className="text-red-500 mt-1">✗</span>
                                    <span>Prix prohibitif</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-slate-600">
                                    <span className="text-red-500 mt-1">✗</span>
                                    <span>Délais d'attente importants</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Option 3: VAE Facile */}
                    <Card className="border-4 border-[#FF2E63] shadow-2xl shadow-[#FF2E63]/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-[#FF2E63] text-white px-4 py-1 text-xs font-bold uppercase">
                            Meilleur choix
                        </div>
                        <CardContent className="pt-6">
                            <div className="text-center mb-6">
                                <Award className="h-12 w-12 text-[#FF2E63] mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-brand-slate mb-2">VAE Facile</h3>
                                <div className="flex items-baseline justify-center gap-2 mb-2">
                                    <span className="text-5xl font-extrabold text-[#FF2E63]">89€</span>
                                </div>
                                <p className="text-sm font-semibold text-[#FF2E63]">Tout compris • Sans surprise</p>
                            </div>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-start gap-2 text-sm text-slate-700">
                                    <CheckCircle2 className="h-5 w-5 text-[#A7D9B8] flex-shrink-0 mt-0.5" />
                                    <span className="font-medium">Génération automatique livret 2</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-slate-700">
                                    <CheckCircle2 className="h-5 w-5 text-[#A7D9B8] flex-shrink-0 mt-0.5" />
                                    <span className="font-medium">Version audio complète</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-slate-700">
                                    <CheckCircle2 className="h-5 w-5 text-[#A7D9B8] flex-shrink-0 mt-0.5" />
                                    <span className="font-medium">Corrections illimitées incluses</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-slate-700">
                                    <CheckCircle2 className="h-5 w-5 text-[#A7D9B8] flex-shrink-0 mt-0.5" />
                                    <span className="font-medium">Relecture experte incluse</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-slate-700">
                                    <CheckCircle2 className="h-5 w-5 text-[#A7D9B8] flex-shrink-0 mt-0.5" />
                                    <span className="font-medium">Coaching à la demande inclus</span>
                                </li>
                            </ul>
                            <Link to="/paiement">
                                <Button size="lg" className="w-full bg-[#FF2E63] hover:bg-[#E0275A] text-white font-bold">
                                    Commencer maintenant
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Features Section */}
            <section className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-brand-slate mb-4">
                        Pourquoi choisir VAE Facile ?
                    </h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Une solution complète, moderne et accessible pour valider vos acquis professionnels.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="border-none shadow-lg bg-white">
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <div className="h-12 w-12 rounded-full bg-[#FFF4F4] flex items-center justify-center mb-4 text-[#FF2E63]">
                                <FileText className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-brand-slate">Dossier Simplifié</h3>
                            <p className="text-slate-600">
                                Fini la paperasse administrative complexe. Notre assistant IA vous aide à constituer votre livret en quelques clics.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg bg-white">
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <div className="h-12 w-12 rounded-full bg-[#FFF4F4] flex items-center justify-center mb-4 text-[#FF2E63]">
                                <MessageSquare className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-brand-slate">Accompagnement IA + Expert</h3>
                            <p className="text-slate-600">
                                Intelligence artificielle pour la rédaction et experts humains pour la relecture. Le meilleur des deux mondes.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg bg-white">
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <div className="h-12 w-12 rounded-full bg-[#FFF4F4] flex items-center justify-center mb-4 text-[#FF2E63]">
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
            <section className="bg-white py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-brand-slate mb-6">
                                Votre VAE en 3 étapes simples
                            </h2>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#FF2E63] text-white flex items-center justify-center font-bold">1</div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-brand-slate mb-1">Inscription & Paiement</h3>
                                        <p className="text-slate-600">Créez votre compte et réglez le forfait unique de 89€. Tout est inclus, aucun frais caché.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#FF2E63] text-white flex items-center justify-center font-bold">2</div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-brand-slate mb-1">Constitution du Dossier</h3>
                                        <p className="text-slate-600">Déposez votre CV et laissez notre IA générer automatiquement votre livret. Version audio offerte.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#FF2E63] text-white flex items-center justify-center font-bold">3</div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-brand-slate mb-1">Validation & Diplôme</h3>
                                        <p className="text-slate-600">Relecture experte, coaching personnalisé, et préparation au jury. Tout est inclus dans votre pack.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8">
                                <Link to="/paiement">
                                    <Button size="lg" className="bg-[#FF2E63] hover:bg-[#E0275A] text-white font-bold">
                                        Je me lance pour 89€
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-[#FF2E63]/5 rounded-2xl transform rotate-3"></div>
                            <img
                                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80"
                                alt="Femme professionnelle souriante"
                                className="relative rounded-2xl shadow-xl"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-brand-slate mb-4">
                        Ils ont réussi leur VAE avec nous
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <Card className="border-none shadow-md bg-[#FFF4F4]">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4 mb-4">
                                <img
                                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100"
                                    alt="Marc, 42 ans"
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                    <h4 className="font-semibold text-brand-slate">Marc, 42 ans</h4>
                                    <p className="text-sm text-slate-600">BTS Management Commercial</p>
                                </div>
                            </div>
                            <p className="text-slate-700 italic">
                                "En 2 mois j'ai obtenu mon BTS grâce à VAE Facile. L'IA m'a fait gagner un temps fou et la relecture experte a vraiment fait la différence."
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md bg-[#FFF4F4]">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4 mb-4">
                                <img
                                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100"
                                    alt="Sophie, 35 ans"
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                    <h4 className="font-semibold text-brand-slate">Sophie, 35 ans</h4>
                                    <p className="text-sm text-slate-600">Licence RH</p>
                                </div>
                            </div>
                            <p className="text-slate-700 italic">
                                "Pour 89€ j'ai eu tout : génération du dossier, corrections, coaching. J'aurais payé 10 fois plus chez un cabinet classique."
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Final CTA */}
            <section className="bg-gradient-to-br from-[#FF2E63] to-[#E0275A] py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Prêt à obtenir votre diplôme ?
                    </h2>
                    <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                        Rejoignez les centaines de candidats qui ont déjà validé leurs acquis avec VAE Facile.
                    </p>
                    <Link to="/paiement">
                        <Button size="lg" className="bg-white text-[#FF2E63] hover:bg-gray-100 font-bold text-lg px-10 py-6">
                            Commencer maintenant - 89€
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    )
}
