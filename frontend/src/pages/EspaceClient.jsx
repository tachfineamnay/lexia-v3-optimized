import { Button } from "../components/ui/Button"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card"
import { Upload, MessageSquare, FileDown, CheckCircle2 } from "lucide-react"

export default function EspaceClient() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-brand-slate">Mon Espace VAE</h1>
                <p className="text-slate-600">Gérez votre dossier et suivez votre avancement.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Step 1: Upload */}
                <Card className="border-l-4 border-l-brand-blue">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-blue-100 text-brand-blue flex items-center justify-center text-sm font-bold">1</div>
                            Documents
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-slate-600">
                            Déposez votre CV et vos justificatifs d'expérience pour commencer l'analyse.
                        </p>
                        <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                            <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm font-medium text-slate-700">Cliquez pour déposer</p>
                            <p className="text-xs text-slate-500">PDF, DOCX (max 5Mo)</p>
                        </div>
                        <Button className="w-full" variant="secondary">Gérer mes fichiers</Button>
                    </CardContent>
                </Card>

                {/* Step 2: Chat */}
                <Card className="border-l-4 border-l-slate-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-sm font-bold">2</div>
                            Assistant IA
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-slate-600">
                            Discutez avec notre assistant pour rédiger vos livrets et préparer l'oral.
                        </p>
                        <div className="bg-slate-50 rounded-lg p-4 h-32 flex items-center justify-center text-slate-400 text-sm italic">
                            L'historique de chat apparaîtra ici...
                        </div>
                        <Button className="w-full" disabled>Démarrer une discussion</Button>
                    </CardContent>
                </Card>

                {/* Step 3: Export */}
                <Card className="border-l-4 border-l-slate-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-sm font-bold">3</div>
                            Mon Livret
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-slate-600">
                            Une fois complété, téléchargez votre livret de recevabilité officiel.
                        </p>
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-md opacity-50">
                            <FileDown className="h-5 w-5 text-slate-400" />
                            <span className="text-sm text-slate-500">Livret_1_Final.pdf</span>
                        </div>
                        <Button className="w-full" disabled>Télécharger mon dossier</Button>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-12">
                <h2 className="text-lg font-semibold text-brand-slate mb-4">Progression globale</h2>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div className="bg-brand-blue h-2.5 rounded-full" style={{ width: '15%' }}></div>
                </div>
                <p className="text-right text-xs text-slate-500 mt-1">15% complété</p>
            </div>
        </div>
    )
}
