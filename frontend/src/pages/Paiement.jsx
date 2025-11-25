import { Button } from "../components/ui/Button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/Card"
import { Input } from "../components/ui/Input"
import { Lock, CheckCircle2, Sparkles, CreditCard, Shield } from "lucide-react"

export default function Paiement() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-brand-blue-light rounded-full px-4 py-2 mb-4">
                        <Sparkles className="h-4 w-4 text-brand-blue" />
                        <span className="text-sm font-medium text-brand-blue">Dernière étape</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        Finalisez votre inscription
                    </h1>
                    <p className="text-slate-600">
                        Un seul paiement pour accéder à tout votre accompagnement VAE.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Récapitulatif de l'offre */}
                    <div className="lg:col-span-2 space-y-4">
                        <Card className="border-2 border-brand-blue bg-gradient-to-br from-brand-blue-50 to-white shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-brand-blue" />
                                    Pack Tout Compris
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-start gap-2 text-sm">
                                    <CheckCircle2 className="h-5 w-5 text-brand-green flex-shrink-0 mt-0.5" />
                                    <span className="text-slate-700 font-medium">Génération automatique par IA (10 min)</span>
                                </div>
                                <div className="flex items-start gap-2 text-sm">
                                    <CheckCircle2 className="h-5 w-5 text-brand-green flex-shrink-0 mt-0.5" />
                                    <span className="text-slate-700 font-medium">Version audio complète</span>
                                </div>
                                <div className="flex items-start gap-2 text-sm">
                                    <CheckCircle2 className="h-5 w-5 text-brand-green flex-shrink-0 mt-0.5" />
                                    <span className="text-slate-700 font-medium">Corrections illimitées avec IA</span>
                                </div>
                                <div className="flex items-start gap-2 text-sm">
                                    <CheckCircle2 className="h-5 w-5 text-brand-green flex-shrink-0 mt-0.5" />
                                    <span className="text-slate-700 font-medium">Relecture experte incluse</span>
                                </div>
                                <div className="flex items-start gap-2 text-sm">
                                    <CheckCircle2 className="h-5 w-5 text-brand-green flex-shrink-0 mt-0.5" />
                                    <span className="text-slate-700 font-medium">Coaching personnalisé à la demande</span>
                                </div>

                                <div className="pt-4 mt-4 border-t-2 border-brand-blue/20">
                                    <div className="flex items-baseline justify-between mb-2">
                                        <span className="text-sm font-medium text-slate-600">Total à payer</span>
                                        <span className="text-4xl font-extrabold text-brand-blue">89€</span>
                                    </div>
                                    <p className="text-xs text-slate-500 text-right">Paiement unique • Sans abonnement</p>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="bg-white rounded-xl p-5 border-2 border-brand-green shadow-sm">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="h-6 w-6 text-brand-green flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-slate-900">Garantie 14 jours</p>
                                    <p className="text-xs text-slate-600 mt-1">Satisfait ou remboursé intégralement</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-brand-blue-50 rounded-xl p-5 border-2 border-brand-blue-light">
                            <div className="flex items-start gap-3">
                                <Shield className="h-6 w-6 text-brand-blue flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-slate-900">Accès immédiat</p>
                                    <p className="text-xs text-slate-600 mt-1">Commencez à générer votre dossier dès maintenant</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Formulaire de paiement */}
                    <div className="lg:col-span-3">
                        <Card className="border-2 border-slate-200 shadow-lg">
                            <CardHeader className="bg-slate-50 border-b-2 border-slate-200">
                                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-brand-blue" />
                                    Informations de paiement
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="bg-brand-blue-50 p-4 rounded-xl flex items-start gap-3 border-2 border-brand-blue-light">
                                    <Lock className="h-5 w-5 text-brand-blue mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 mb-1">
                                            Paiement 100% sécurisé
                                        </p>
                                        <p className="text-xs text-slate-600">
                                            Sécurisé par Stripe. Vos données bancaires sont chiffrées et jamais stockées sur nos serveurs.
                                        </p>
                                    </div>
                                </div>

                                {/* Placeholder for Stripe Elements */}
                                <div className="space-y-4">
                                    <Input label="Nom complet" placeholder="Jean Dupont" />
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
                            <CardFooter className="flex-col gap-4 bg-slate-50 border-t-2 border-slate-200">
                                <Button className="w-full shadow-lg" size="lg">
                                    <Lock className="mr-2 h-5 w-5" />
                                    Payer 89,00 € en toute sécurité
                                </Button>
                                <p className="text-center text-xs text-slate-500">
                                    En payant, vous acceptez nos <a href="#" className="text-brand-blue underline hover:text-brand-blue-dark">Conditions Générales</a> et notre <a href="#" className="text-brand-blue underline hover:text-brand-blue-dark">Politique de Confidentialité</a>.
                                </p>
                            </CardFooter>
                        </Card>
                    </div>
                </div>

                {/* Badges de confiance */}
                <div className="mt-12 flex flex-wrap items-center justify-center gap-8 py-8 border-t-2 border-slate-200">
                    <div className="flex items-center gap-2 text-slate-600">
                        <Lock className="h-5 w-5 text-brand-green" />
                        <span className="text-sm font-medium">SSL 256-bit</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                        <Shield className="h-5 w-5 text-brand-blue" />
                        <span className="text-sm font-medium">Stripe Payment</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                        <CheckCircle2 className="h-5 w-5 text-brand-green" />
                        <span className="text-sm font-medium">Garantie 14 jours</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                        <Sparkles className="h-5 w-5 text-brand-blue" />
                        <span className="text-sm font-medium">Accès immédiat</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
