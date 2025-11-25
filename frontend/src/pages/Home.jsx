import { Link } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { Card, CardContent } from "../components/ui/Card"
import { CheckCircle2, FileText, MessageSquare, Award, Clock, Euro, Sparkles, Zap, Headphones, Brain } from "lucide-react"

export default function Home() {
    return (
        <div className="flex flex-col gap-20 pb-16">
            {/* Hero Section - Modern Tech */}
            <section className="relative bg-gradient-to-br from-brand-blue via-brand-blue-dark to-slate-900 py-20 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/90 to-transparent"></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-3xl text-white">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                            <Sparkles className="h-4 w-4" />
                            <span className="text-sm font-medium">Propulsé par IA</span>
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-6 leading-tight">
                            Votre VAE Générée en <span className="text-brand-red">10 Minutes</span> par Intelligence Artificielle
                        </h1>
                        <p className="text-xl text-white/90 mb-8 max-w-2xl leading-relaxed">
                            L'IA analyse votre expérience et génère automatiquement votre dossier complet. Version audio, corrections illimitées et coaching inclus.
                        </p>
                        <div className="inline-block bg-white rounded-2xl p-6 mb-8 shadow-2xl">
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-5xl font-extrabold text-brand-blue">89€</span>
                                <span className="text-xl text-slate-700">tout compris</span>
                            </div>
                            <p className="text-sm text-slate-600">Paiement unique • Sans abonnement • Accès à vie</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/paiement">
                                <Button size="lg" className="w-full sm:w-auto bg-white text-brand-blue hover:bg-slate-50">
                                    <Zap className="mr-2 h-5 w-5" />
                                    Générer mon dossier maintenant
                                </Button>
                            </Link>
                            <Link to="/offre">
                                <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-transparent border-2 border-white text-white hover:bg-white/10">
                                    Découvrir l'offre
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works - 4 Steps */}
            <section className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">
                        Comment ça marche ?
                    </h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        4 étapes simples pour obtenir votre diplôme par validation des acquis.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
                    <Card className="border-2 border-brand-blue-light hover:border-brand-blue hover:shadow-lg transition-all">
                        <CardContent className="pt-6 text-center">
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-blue-dark text-white flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg">
                                1
                            </div>
                            <FileText className="h-8 w-8 text-brand-blue mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Uploadez vos docs</h3>
                            <p className="text-sm text-slate-600">
                                CV, justificatifs d'expérience, diplômes existants
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-brand-blue-light hover:border-brand-blue hover:shadow-lg transition-all">
                        <CardContent className="pt-6 text-center">
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-blue-dark text-white flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg">
                                2
                            </div>
                            <Brain className="h-8 w-8 text-brand-blue mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-slate-900 mb-2">L'IA génère tout</h3>
                            <p className="text-sm text-slate-600">
                                Analyse automatique et génération du livret 2 complet
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-brand-blue-light hover:border-brand-blue hover:shadow-lg transition-all">
                        <CardContent className="pt-6 text-center">
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-blue-dark text-white flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg">
                                3
                            </div>
                            <Headphones className="h-8 w-8 text-brand-blue mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Audio + Corrections</h3>
                            <p className="text-sm text-slate-600">
                                Version audio gratuite et corrections illimitées avec l'IA
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-brand-blue-light hover:border-brand-blue hover:shadow-lg transition-all">
                        <CardContent className="pt-6 text-center">
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-blue-dark text-white flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg">
                                4
                            </div>
                            <MessageSquare className="h-8 w-8 text-brand-blue mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Coach personnel</h3>
                            <p className="text-sm text-slate-600">
                                Accompagnement sur-mesure pour préparer votre oral
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Pricing Comparison Section */}
            <section className="container mx-auto px-4 sm:px-6 lg:px-8 bg-slate-50 py-16 -mx-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">
                        3 façons de faire votre VAE
                    </h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Comparez les options et découvrez pourquoi VAE Facile est le meilleur choix.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Option 1: Seul(e) */}
                    <Card className="border-2 border-slate-200">
                        <CardContent className="pt-6">
                            <div className="text-center mb-6">
                                <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Faire seul(e)</h3>
                                <div className="flex items-baseline justify-center gap-2 mb-4">
                                    <span className="text-3xl font-bold text-slate-700">0€</span>
                                </div>
                            </div>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-start gap-2 text-sm text-slate-600">
                                    <span className="text-red-500 mt-1">✗</span>
                                    <span>8 mois de travail en moyenne</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-slate-600">
                                    <span className="text-red-500 mt-1">✗</span>
                                    <span>Paperasse complexe et chronophage</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-slate-600">
                                    <span className="text-red-500 mt-1">✗</span>
                                    <span>Aucun accompagnement ni IA</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-slate-600">
                                    <span className="text-red-500 mt-1">✗</span>
                                    <span>Taux d'abandon très élevé</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Option 2: Cabinet classique */}
                    <Card className="border-2 border-amber-200">
                        <CardContent className="pt-6">
                            <div className="text-center mb-6">
                                <Euro className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Cabinet classique</h3>
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
                                    <span>Prix prohibitif pour beaucoup</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-slate-600">
                                    <span className="text-red-500 mt-1">✗</span>
                                    <span>Pas de génération automatique</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Option 3: VAE Facile */}
                    <Card className="border-4 border-brand-blue shadow-2xl shadow-brand-blue/20 relative overflow-hidden scale-105">
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-brand-blue to-brand-blue-dark text-white px-4 py-1 text-xs font-bold uppercase">
                            Meilleur choix
                        </div>
                        <CardContent className="pt-6">
                            <div className="text-center mb-6">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-blue to-brand-blue-dark mx-auto mb-4 flex items-center justify-center">
                                    <Sparkles className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">VAE Facile + IA</h3>
                                <div className="flex items-baseline justify-center gap-2 mb-2">
                                    <span className="text-5xl font-extrabold text-brand-blue">89€</span>
                                </div>
                                <p className="text-sm font-semibold text-brand-blue">Tout compris • IA incluse</p>
                            </div>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-start gap-2 text-sm text-slate-700">
                                    <CheckCircle2 className="h-5 w-5 text-brand-green flex-shrink-0 mt-0.5" />
                                    <span className="font-medium">Génération automatique par IA</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-slate-700">
                                    <CheckCircle2 className="h-5 w-5 text-brand-green flex-shrink-0 mt-0.5" />
                                    <span className="font-medium">Version audio de votre dossier</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-slate-700">
                                    <CheckCircle2 className="h-5 w-5 text-brand-green flex-shrink-0 mt-0.5" />
                                    <span className="font-medium">Corrections illimitées avec IA</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-slate-700">
                                    <CheckCircle2 className="h-5 w-5 text-brand-green flex-shrink-0 mt-0.5" />
                                    <span className="font-medium">Coaching personnalisé inclus</span>
                                </li>
                            </ul>
                            <Link to="/paiement">
                                <Button size="lg" className="w-full">
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
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">
                        Pourquoi choisir VAE Facile ?
                    </h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        La première plateforme qui combine IA de pointe et accompagnement humain pour votre réussite.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="border-2 border-slate-100 hover:border-brand-blue-light transition-all">
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-brand-blue to-brand-blue-dark flex items-center justify-center mb-4 shadow-lg">
                                <Brain className="h-7 w-7 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-slate-900">IA de Génération</h3>
                            <p className="text-slate-600">
                                Notre intelligence artificielle analyse votre parcours et génère un dossier complet et personnalisé en quelques minutes.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-slate-100 hover:border-brand-blue-light transition-all">
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-brand-blue to-brand-blue-dark flex items-center justify-center mb-4 shadow-lg">
                                <Headphones className="h-7 w-7 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-slate-900">Version Audio Incluse</h3>
                            <p className="text-slate-600">
                                Écoutez votre dossier en version audio pour mieux le mémoriser et préparer votre passage devant le jury.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-slate-100 hover:border-brand-blue-light transition-all">
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-brand-blue to-brand-blue-dark flex items-center justify-center mb-4 shadow-lg">
                                <MessageSquare className="h-7 w-7 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-slate-900">Coach Personnel</h3>
                            <p className="text-slate-600">
                                Un accompagnement sur-mesure pour vous préparer à l'oral et maximiser vos chances de réussite au jury.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="container mx-auto px-4 sm:px-6 lg:px-8 bg-slate-50 py-16 -mx-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">
                        Ils ont réussi avec VAE Facile
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <Card className="border-2 border-slate-200">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4 mb-4">
                                <img
                                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100"
                                    alt="Marc, 42 ans"
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                    <h4 className="font-semibold text-slate-900">Marc, 42 ans</h4>
                                    <p className="text-sm text-slate-600">BTS Management Commercial</p>
                                </div>
                            </div>
                            <p className="text-slate-700 italic">
                                "L'IA a généré mon dossier en 10 minutes. J'ai juste fait quelques ajustements et obtenu mon BTS en 2 mois au lieu de 8. Incroyable."
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-slate-200">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4 mb-4">
                                <img
                                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100"
                                    alt="Sophie, 35 ans"
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                    <h4 className="font-semibold text-slate-900">Sophie, 35 ans</h4>
                                    <p className="text-sm text-slate-600">Licence RH</p>
                                </div>
                            </div>
                            <p className="text-slate-700 italic">
                                "Pour 89€, j'ai eu la génération IA, l'audio pour réviser dans le train, et le coaching pour l'oral. Rapport qualité/prix imbattable."
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Final CTA */}
            <section className="bg-gradient-to-br from-brand-blue via-brand-blue-dark to-slate-900 py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <Sparkles className="h-12 w-12 text-white mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Prêt à obtenir votre diplôme ?
                    </h2>
                    <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                        Rejoignez les centaines de candidats qui ont déjà généré leur dossier VAE avec l'IA.
                    </p>
                    <Link to="/paiement">
                        <Button size="lg" className="bg-white text-brand-blue hover:bg-slate-50 shadow-2xl">
                            <Zap className="mr-2 h-5 w-5" />
                            Générer mon dossier - 89€
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    )
}
