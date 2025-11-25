import { Button } from "../components/ui/Button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/Card"
import { Input } from "../components/ui/Input"
import { Lock, CheckCircle2, Sparkles } from "lucide-react"

export default function Paiement() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-[#FFFBF7]">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-brand-slate mb-2">
                        Finaliser votre inscription
                    </h1>
                    <p className="text-slate-600">
                        Un seul paiement pour accéder à tout votre accompagnement VAE.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Récapitulatif de l'offre */}
                    <div className="lg:col-span-2 space-y-4">
                        <Card className="border-2 border-[#FF2E63] bg-gradient-to-br from-[#FFF4F4] to-white">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold text-brand-slate flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-[#FF2E63]" />
                                    Pack Tout Compris
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-start gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-[#A7D9B8] flex-shrink-0 mt-0.5" />
                                    <span className="text-slate-700">Génération automatique livret 2</span>
                                </div>
                                <div className="flex items-start gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-[#A7D9B8] flex-shrink-0 mt-0.5" />
                                    <span className="text-slate-700">Version audio complète</span>
                                </div>
                                <div className="flex items-start gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-[#A7D9B8] flex-shrink-0 mt-0.5" />
                                    <span className="text-slate-700">Corrections illimitées</span>
                                </div>
                                <div className="flex items-start gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-[#A7D9B8] flex-shrink-0 mt-0.5" />
                                    <span className="text-slate-700">Relecture experte incluse</span>
                                </div>
                                <div className="flex items-start gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-[#A7D9B8] flex-shrink-0 mt-0.5" />
                                    <span className="text-slate-700">Coaching à la demande</span>
                                </div>

                                <div className="pt-4 mt-4 border-t-2 border-[#FF2E63]/20">
                                    <div className="flex items-baseline justify-between">
                                        <span className="text-sm font-medium text-slate-600">Total à payer</span>
                                        <span className="text-3xl font-extrabold text-[#FF2E63]">89€</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1 text-right">Paiement unique • Sans abonnement</p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="bg-white rounded-lg p-4 border border-[#A7D9B8]">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-[#A7D9B8] flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-brand-slate">Garantie 14 jours</p>
                                    <p className="text-xs text-slate-600 mt-1">Satisfait ou remboursé intégralement</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Formulaire de paiement */}
                    <div className="lg:col-span-3">
                        <Card className="border-2 border-slate-200">
                            <CardHeader className="bg-slate-50">
                                <CardTitle className="text-lg font-bold text-brand-slate">
                                    Informations de paiement
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="bg-[#FFF4F4] p-4 rounded-lg flex items-start gap-3 border-2 border-[#FF2E63]/20">
                                    <Lock className="h-5 w-5 text-[#FF2E63] mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-brand-slate mb-1">
                                            Paiement 100% sécurisé
                                        </p>
                                        <p className="text-xs text-slate-600">
                                            Paiement sécurisé par Stripe. Vos données bancaires sont chiffrées et jamais stockées sur nos serveurs.
                                        </p>
                                    </div>
                                </div>

                                {/* Placeholder for Stripe Elements */}
                                <div className="space-y-4">
                                    <Input label="Nom sur la carte" placeholder="Jean Dupont" />
                                    <Input label="Numéro de carte" placeholder="0000 0000 0000 0000" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input label="Expiration" placeholder="MM/AA" />
                                        <Input label="CVC" placeholder="123" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Input label="Email de confirmation" placeholder="votre@email.com" type="email" />
                                    <Input label="Téléphone (optionnel)" placeholder="+33 6 12 34 56 78" type="tel" />
                                </div>
                            </CardContent>
                            <CardFooter className="flex-col gap-4">
                                <Button className="w-full bg-[#FF2E63] hover:bg-[#E0275A] text-white font-bold" size="lg">
                                    Payer 89,00 €
                                </Button>
                                <p className="text-center text-xs text-slate-500">
                                    En payant, vous acceptez nos <a href="#" className="text-[#FF2E63] underline">Conditions Générales de Vente</a> et notre <a href="#" className="text-[#FF2E63] underline">Politique de Confidentialité</a>.
                                </p>
                            </CardFooter>
                        </Card>
                    </div>
                </div>

                {/* Badges de confiance */}
                <div className="mt-12 flex flex-wrap items-center justify-center gap-8 py-8 border-t border-slate-200">
                    <div className="flex items-center gap-2 text-slate-600">
                        <Lock className="h-5 w-5 text-[#A7D9B8]" />
                        <span className="text-sm font-medium">Paiement sécurisé SSL</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                        <CheckCircle2 className="h-5 w-5 text-[#A7D9B8]" />
                        <span className="text-sm font-medium">Satisfaction garantie</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                        <Sparkles className="h-5 w-5 text-[#FF2E63]" />
                        <span className="text-sm font-medium">Accès immédiat</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
