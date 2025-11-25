import { Link } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { CheckCircle2, Headphones, Sparkles, FileCheck, MessageCircle, Infinity, Brain, Zap } from "lucide-react"

export default function Offre() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-brand-blue-light rounded-full px-4 py-2 mb-4">
                        <Sparkles className="h-4 w-4 text-brand-blue" />
                        <span className="text-sm font-medium text-brand-blue">Tout-en-un propulsé par IA</span>
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">
                        Une offre unique et tout compris
                    </h1>
                    <p className="text-xl text-slate-600">
                        Tout ce dont vous avez besoin pour réussir votre VAE à un prix imbattable.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl border-4 border-brand-blue overflow-hidden mb-12">
                    <div className="bg-gradient-to-br from-brand-blue via-brand-blue-dark to-slate-900 p-8 md:p-12 text-white text-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
                        <div className="relative z-10">
                            <div className="inline-block px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-bold mb-6">
                                Pack Tout Compris
                            </div>
                            <div className="flex items-baseline justify-center gap-3 mb-4">
                                <span className="text-6xl font-extrabold">89€</span>
                            </div>
                            <p className="text-xl mb-6 opacity-90">
                                Paiement unique • Aucun frais caché • Accès à vie
                            </p>
                            <Link to="/paiement" className="inline-block">
                                <Button size="lg" className="bg-white text-brand-blue hover:bg-slate-50 shadow-2xl">
                                    <Zap className="mr-2 h-5 w-5" />
                                    Générer mon dossier maintenant
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="p-8 md:p-12">
                        <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">
                            Ce qui est inclus dans votre pack :
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-4 p-5 rounded-xl bg-brand-blue-50 border-2 border-brand-blue-light hover:border-brand-blue transition-all">
                                <div className="flex-shrink-0">
                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-blue to-brand-blue-dark flex items-center justify-center shadow-lg">
                                        <Brain className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1">Génération automatique par IA</h4>
                                    <p className="text-sm text-slate-600">L'IA analyse votre CV et génère votre dossier VAE complet en 10 minutes</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-5 rounded-xl bg-brand-blue-50 border-2 border-brand-blue-light hover:border-brand-blue transition-all">
                                <div className="flex-shrink-0">
                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-blue to-brand-blue-dark flex items-center justify-center shadow-lg">
                                        <Headphones className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1">Version audio complète</h4>
                                    <p className="text-sm text-slate-600">Écoutez votre dossier en audio pour mieux le mémoriser et préparer l'oral</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-5 rounded-xl bg-brand-blue-50 border-2 border-brand-blue-light hover:border-brand-blue transition-all">
                                <div className="flex-shrink-0">
                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-blue to-brand-blue-dark flex items-center justify-center shadow-lg">
                                        <Infinity className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1">Corrections illimitées avec IA</h4>
                                    <p className="text-sm text-slate-600">Modifiez et améliorez votre dossier autant de fois que nécessaire sans surcoût</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-5 rounded-xl bg-brand-blue-50 border-2 border-brand-blue-light hover:border-brand-blue transition-all">
                                <div className="flex-shrink-0">
                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-blue to-brand-blue-dark flex items-center justify-center shadow-lg">
                                        <FileCheck className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1">Relecture experte incluse</h4>
                                    <p className="text-sm text-slate-600">Un professionnel relit et optimise votre dossier avant soumission</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-5 rounded-xl bg-brand-blue-50 border-2 border-brand-blue-light hover:border-brand-blue transition-all">
                                <div className="flex-shrink-0">
                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-blue to-brand-blue-dark flex items-center justify-center shadow-lg">
                                        <MessageCircle className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1">Coaching personnalisé</h4>
                                    <p className="text-sm text-slate-600">Accompagnement sur-mesure pour préparer votre passage devant le jury</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-5 rounded-xl bg-brand-blue-50 border-2 border-brand-blue-light hover:border-brand-blue transition-all">
                                <div className="flex-shrink-0">
                                    <CheckCircle2 className="h-6 w-6 text-brand-green mt-1" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1">Export PDF/DOCX</h4>
                                    <p className="text-sm text-slate-600">Téléchargez vos documents aux formats officiels requis</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 p-6 bg-gradient-to-r from-brand-green-light to-brand-blue-50 rounded-xl border-2 border-brand-green">
                            <div className="flex items-start gap-4">
                                <CheckCircle2 className="h-6 w-6 text-brand-green flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-2">Garantie satisfait ou remboursé 14 jours</h4>
                                    <p className="text-sm text-slate-600">
                                        Si vous n'êtes pas satisfait de notre service dans les 14 premiers jours, nous vous remboursons intégralement.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comparison avec concurrence */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
                        Pourquoi VAE Facile est imbattable
                    </h2>
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-slate-200">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Fonctionnalité</th>
                                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-500">Faire seul(e)</th>
                                    <th className="px-6 py-4 text-center text-sm font-bold text-amber-600">Cabinet</th>
                                    <th className="px-6 py-4 text-center text-sm font-bold text-brand-blue">VAE Facile</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr>
                                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">Prix</td>
                                    <td className="px-6 py-4 text-center text-sm">0€</td>
                                    <td className="px-6 py-4 text-center text-sm">2500-4500€</td>
                                    <td className="px-6 py-4 text-center text-sm font-bold text-brand-blue">89€</td>
                                </tr>
                                <tr className="bg-slate-50">
                                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">Génération automatique IA</td>
                                    <td className="px-6 py-4 text-center">❌</td>
                                    <td className="px-6 py-4 text-center">❌</td>
                                    <td className="px-6 py-4 text-center">✅</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">Version audio</td>
                                    <td className="px-6 py-4 text-center">❌</td>
                                    <td className="px-6 py-4 text-center">❌</td>
                                    <td className="px-6 py-4 text-center">✅</td>
                                </tr>
                                <tr className="bg-slate-50">
                                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">Corrections illimitées</td>
                                    <td className="px-6 py-4 text-center">❌</td>
                                    <td className="px-6 py-4 text-center">❌</td>
                                    <td className="px-6 py-4 text-center">✅</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">Relecture experte</td>
                                    <td className="px-6 py-4 text-center">❌</td>
                                    <td className="px-6 py-4 text-center">✅</td>
                                    <td className="px-6 py-4 text-center">✅</td>
                                </tr>
                                <tr className="bg-slate-50">
                                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">Coaching personnalisé</td>
                                    <td className="px-6 py-4 text-center">❌</td>
                                    <td className="px-6 py-4 text-center">✅</td>
                                    <td className="px-6 py-4 text-center">✅</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">Disponibilité 24/7</td>
                                    <td className="px-6 py-4 text-center">-</td>
                                    <td className="px-6 py-4 text-center">❌</td>
                                    <td className="px-6 py-4 text-center">✅</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* FAQ */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
                        Questions fréquentes
                    </h2>
                    <div className="space-y-4">
                        <details className="bg-white rounded-lg shadow-sm p-6 cursor-pointer border-2 border-slate-200 hover:border-brand-blue transition-all">
                            <summary className="font-bold text-slate-900">Y a-t-il des frais supplémentaires après le paiement ?</summary>
                            <p className="mt-3 text-slate-600">Non, absolument aucun. Les 89€ incluent TOUT : génération du livret par IA, version audio, corrections illimitées, relecture experte et coaching. Aucun frais caché, aucun abonnement.</p>
                        </details>
                        <details className="bg-white rounded-lg shadow-sm p-6 cursor-pointer border-2 border-slate-200 hover:border-brand-blue transition-all">
                            <summary className="font-bold text-slate-900">Comment fonctionne la génération par IA ?</summary>
                            <p className="mt-3 text-slate-600">Vous uploadez votre CV et vos documents. Notre IA analyse votre parcours professionnel et génère automatiquement votre livret 2 complet en 10 minutes. Vous pouvez ensuite le modifier autant que vous voulez.</p>
                        </details>
                        <details className="bg-white rounded-lg shadow-sm p-6 cursor-pointer border-2 border-slate-200 hover:border-brand-blue transition-all">
                            <summary className="font-bold text-slate-900">La relecture experte est-elle vraiment incluse ?</summary>
                            <p className="mt-3 text-slate-600">Oui ! Un professionnel qualifié relit et optimise votre dossier avant que vous le soumettiez. C'est inclus dans les 89€, sans supplément.</p>
                        </details>
                        <details className="bg-white rounded-lg shadow-sm p-6 cursor-pointer border-2 border-slate-200 hover:border-brand-blue transition-all">
                            <summary className="font-bold text-slate-900">Comment fonctionne le coaching personnalisé ?</summary>
                            <p className="mt-3 text-slate-600">Vous pouvez solliciter notre équipe d'accompagnement quand vous le souhaitez via le chat. Nous vous aidons à préparer votre oral et à répondre aux questions du jury avec des conseils sur-mesure.</p>
                        </details>
                        <details className="bg-white rounded-lg shadow-sm p-6 cursor-pointer border-2 border-slate-200 hover:border-brand-blue transition-all">
                            <summary className="font-bold text-slate-900">Puis-je modifier mon dossier après génération ?</summary>
                            <p className="mt-3 text-slate-600">Absolument ! Vous avez droit à des corrections illimitées avec l'IA. Modifiez, ajustez et améliorez votre dossier autant que nécessaire. L'IA vous aide à chaque étape.</p>
                        </details>
                    </div>
                </div>

                {/* Final CTA */}
                <div className="text-center bg-gradient-to-br from-brand-blue via-brand-blue-dark to-slate-900 rounded-2xl p-12 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
                    <div className="relative z-10">
                        <Sparkles className="h-12 w-12 text-white mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Prêt à transformer votre expérience en diplôme ?
                        </h2>
                        <p className="text-xl text-white/90 mb-8">
                            Rejoignez les centaines de candidats qui ont déjà généré leur dossier avec l'IA.
                        </p>
                        <Link to="/paiement">
                            <Button size="lg" className="bg-white text-brand-blue hover:bg-slate-50 shadow-2xl">
                                <Zap className="mr-2 h-5 w-5" />
                                Commencer pour 89€
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
