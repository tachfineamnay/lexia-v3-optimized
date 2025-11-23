import { Button } from "../components/ui/Button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../components/ui/Card"
import { Input } from "../components/ui/Input"
import { Lock } from "lucide-react"

export default function Paiement() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-brand-slate mb-2">
                        Finaliser votre inscription
                    </h1>
                    <p className="text-slate-600">
                        Réglez les frais de dossier pour accéder à votre espace.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Total à payer</span>
                            <span className="text-brand-blue">49,00 €</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-md flex items-start gap-3">
                            <Lock className="h-5 w-5 text-brand-blue mt-0.5" />
                            <p className="text-sm text-blue-900">
                                Paiement sécurisé par Stripe. Vos données bancaires sont chiffrées.
                            </p>
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
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" size="lg">
                            Payer 49,00 €
                        </Button>
                    </CardFooter>
                </Card>

                <p className="text-center text-xs text-slate-500 mt-6">
                    En payant, vous acceptez nos Conditions Générales de Vente.
                </p>
            </div>
        </div>
    )
}
