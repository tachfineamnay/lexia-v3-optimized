import { Link } from "react-router-dom"
import { Button } from "../components/ui/Button"
import { CheckCircle2, Headphones, Sparkles, FileCheck, MessageCircle } from "lucide-react"

export default function Offre() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-[#FFFBF7]">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-brand-slate mb-4">
                        Une offre unique et tout compris
                    </h1>
                    <p className="text-xl text-slate-600">
                        Tout ce dont vous avez besoin pour réussir votre VAE à un prix imbattable.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl border-4 border-[#FF2E63] overflow-hidden mb-12">
                    <div className="bg-gradient-to-br from-[#FF2E63] to-[#E0275A] p-8 md:p-12 text-white text-center">
                        <div className="inline-block px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-bold mb-6">
                            Pack Tout Compris
                        </div>
                        <div className="flex items-baseline justify-center gap-3 mb-4">
                            <span className="text-6xl font-extrabold">89€</span>
                        </div>
                        <p className="text-xl mb-6 opacity-90">
                            Paiement unique • Aucun frais caché • Tout est inclus
                        </p>
                        <Link to="/paiement" className="inline-block">
                            <Button size="lg" className="bg-white text-[#FF2E63] hover:bg-gray-100 font-bold text-lg px-10 py-6">
                                Commencer maintenant
                            </Button>
                        </Link>
                    </div>

                    <div className="p-8 md:p-12">
                        <h3 className="text-2xl font-bold text-brand-slate mb-8 text-center">
                            Ce qui est inclus dans votre pack :
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-4 p-4 rounded-lg bg-[#FFF4F4]">
                                <div className="flex-shrink-0">
                                    <div className="h-10 w-10 rounded-full bg-[#FF2E63]/10 flex items-center justify-center">
                                        <Sparkles className="h-5 w-5 text-[#FF2E63]" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-brand-slate mb-1">Génération automatique livret 2</h4>
                                    <p className="text-sm text-slate-600">L'IA analyse votre CV et génère votre dossier VAE complet en quelques minutes</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-lg bg-[#FFF4F4]">
                                <div className="flex-shrink-0">
                                    <div className="h-10 w-10 rounded-full bg-[#FF2E63]/10 flex items-center justify-center">
                                        <Headphones className="h-5 w-5 text-[#FF2E63]" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-brand-slate mb-1">Version audio complète</h4>
                                    <p className="text-sm text-slate-600">Écoutez votre dossier en version audio pour mieux le mémoriser et le préparer</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-lg bg-[#FFF4F4]">
                                <div className="flex-shrink-0">
                                    <div className="h-10 w-10 rounded-full bg-[#FF2E63]/10 flex items-center justify-center">
                                        <FileCheck className="h-5 w-5 text-[#FF2E63]" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-brand-slate mb-1">Corrections illimitées</h4>
                                    <p className="text-sm text-slate-600">Modifiez et améliorez votre dossier autant de fois que nécessaire sans surcoût</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-lg bg-[#FFF4F4]">
                                <div className="flex-shrink-0">
                                    <div className="h-10 w-10 rounded-full bg-[#FF2E63]/10 flex items-center justify-center">
                                        <CheckCircle2 className="h-5 w-5 text-[#FF2E63]" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-brand-slate mb-1">Relecture experte incluse</h4>
                                    <p className="text-sm text-slate-600">Un professionnel relit et optimise votre dossier avant soumission</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-lg bg-[#FFF4F4]">
                                <div className="flex-shrink-0">
                                    <div className="h-10 w-10 rounded-full bg-[#FF2E63]/10 flex items-center justify-center">
                                        <MessageCircle className="h-5 w-5 text-[#FF2E63]" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-brand-slate mb-1">Coaching à la demande</h4>
                                    <p className="text-sm text-slate-600">Accompagnement personnalisé pour préparer votre passage devant le jury</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-lg bg-[#FFF4F4]">
                                <div className="flex-shrink-0">
                                    <CheckCircle2 className="h-5 w-5 text-[#A7D9B8] mt-1" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-brand-slate mb-1">Export PDF/DOCX</h4>
                                    <p className="text-sm text-slate-600">Téléchargez vos documents aux formats officiels requis</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 p-6 bg-gradient-to-r from-[#A7D9B8]/20 to-[#FFF4F4] rounded-xl border-2 border-[#A7D9B8]">
                            <div className="flex items-start gap-4">
                                <CheckCircle2 className="h-6 w-6 text-[#A7D9B8] flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-bold text-brand-slate mb-2">Garantie satisfait ou remboursé 14 jours</h4>
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
                    <h2 className="text-2xl font-bold text-brand-slate mb-8 text-center">
                        Pourquoi VAE Facile est imbattable
                    </h2>
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-brand-slate">Fonctionnalité</th>
                                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-500">Faire seul(e)</th>
                                    <th className="px-6 py-4 text-center text-sm font-bold text-amber-600">Cabinet</th>
                                    <th className="px-6 py-4 text-center text-sm font-bold text-[#FF2E63]">VAE Facile</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr>
                                    <td className="px-6 py-4 text-sm text-slate-700">Prix</td>
                                    <td className="px-6 py-4 text-center text-sm">0€</td>
                                    <td className="px-6 py-4 text-center text-sm">2500-4500€</td>
                                    <td className="px-6 py-4 text-center text-sm font-bold text-[#FF2E63]">89€</td>
                                </tr>
                                <tr className="bg-slate-50">
                                    <td className="px-6 py-4 text-sm text-slate-700">Génération automatique</td>
                                    <td className="px-6 py-4 text-center">❌</td>
                                    <td className="px-6 py-4 text-center">❌</td>
                                    <td className="px-6 py-4 text-center">✅</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-sm text-slate-700">Version audio</td>
                                    <td className="px-6 py-4 text-center">❌</td>
                                    <td className="px-6 py-4 text-center">❌</td>
                                    <td className="px-6 py-4 text-center">✅</td>
                                </tr>
                                <tr className="bg-slate-50">
                                    <td className="px-6 py-4 text-sm text-slate-700">Relecture experte</td>
                                    <td className="px-6 py-4 text-center">❌</td>
                                    <td className="px-6 py-4 text-center">✅</td>
                                    <td className="px-6 py-4 text-center">✅</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 text-sm text-slate-700">Coaching personnalisé</td>
                                    <td className="px-6 py-4 text-center">❌</td>
                                    <td className="px-6 py-4 text-center">✅</td>
                                    <td className="px-6 py-4 text-center">✅</td>
                                </tr>
                                <tr className="bg-slate-50">
                                    <td className="px-6 py-4 text-sm text-slate-700">Disponibilité 24/7</td>
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
                    <h2 className="text-2xl font-bold text-brand-slate mb-8 text-center">
                        Questions fréquentes
                    </h2>
                    <div className="space-y-4">
                        <details className="bg-white rounded-lg shadow-sm p-6 cursor-pointer">
                            <summary className="font-bold text-brand-slate">Y a-t-il des frais supplémentaires après le paiement ?</summary>
                            <p className="mt-3 text-slate-600">Non, absolument aucun. Les 89€ incluent TOUT : génération du livret, version audio, corrections illimitées, relecture experte et coaching. Aucun frais caché.</p>
                        </details>
                        <details className="bg-white rounded-lg shadow-sm p-6 cursor-pointer">
                            <summary className="font-bold text-brand-slate">La relecture experte est-elle vraiment incluse ?</summary>
                            <p className="mt-3 text-slate-600">Oui ! Un professionnel qualifié relit et optimise votre dossier avant que vous le soumettiez. C'est inclus dans les 89€, sans supplément.</p>
                        </details>
                        <details className="bg-white rounded-lg shadow-sm p-6 cursor-pointer">
                            <summary className="font-bold text-brand-slate">Comment fonctionne le coaching à la demande ?</summary>
                            <p className="mt-3 text-slate-600">Vous pouvez solliciter notre équipe d'accompagnement quand vous le souhaitez via le chat. Nous vous aidons à préparer votre oral et à répondre aux questions du jury.</p>
                        </details>
                        <details className="bg-white rounded-lg shadow-sm p-6 cursor-pointer">
                            <summary className="font-bold text-brand-slate">Puis-je modifier mon dossier après génération ?</summary>
                            <p className="mt-3 text-slate-600">Absolument ! Vous avez droit à des corrections illimitées. Modifiez, ajustez et améliorez votre dossier autant que nécessaire.</p>
                        </details>
                    </div>
                </div>

                {/* Final CTA */}
                <div className="text-center bg-gradient-to-br from-[#FF2E63] to-[#E0275A] rounded-2xl p-12">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Prêt à transformer votre expérience en diplôme ?
                    </h2>
                    <p className="text-xl text-white/90 mb-8">
                        Rejoignez les centaines de candidats qui ont déjà choisi VAE Facile.
                    </p>
                    <Link to="/paiement">
                        <Button size="lg" className="bg-white text-[#FF2E63] hover:bg-gray-100 font-bold text-lg px-10 py-6">
                            Commencer pour 89€
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
