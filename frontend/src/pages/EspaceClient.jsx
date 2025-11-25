import { Button } from "../components/ui/Button"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card"
import { Upload, MessageSquare, FileDown, CheckCircle2, Brain, Headphones, UserCircle, Home, LayoutDashboard, FileText, Settings } from "lucide-react"

export default function EspaceClient() {
    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r-2 border-slate-200 hidden lg:block">
                <div className="p-6 border-b-2 border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-blue to-brand-blue-dark flex items-center justify-center text-white font-bold">
                            JD
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900">Jean Dupont</p>
                            <p className="text-xs text-slate-500">jean@email.com</p>
                        </div>
                    </div>
                </div>

                <nav className="p-4 space-y-2">
                    <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-brand-blue text-white font-medium transition-all">
                        <LayoutDashboard className="h-5 w-5" />
                        <span>Dashboard</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-brand-blue-50 hover:text-brand-blue font-medium transition-all">
                        <Upload className="h-5 w-5" />
                        <span>Mes Documents</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-brand-blue-50 hover:text-brand-blue font-medium transition-all">
                        <Brain className="h-5 w-5" />
                        <span>Génération IA</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-brand-blue-50 hover:text-brand-blue font-medium transition-all">
                        <MessageSquare className="h-5 w-5" />
                        <span>Chat IA</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-brand-blue-50 hover:text-brand-blue font-medium transition-all">
                        <Headphones className="h-5 w-5" />
                        <span>Version Audio</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-brand-blue-50 hover:text-brand-blue font-medium transition-all">
                        <FileText className="h-5 w-5" />
                        <span>Mon Livret</span>
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-brand-blue-50 hover:text-brand-blue font-medium transition-all">
                        <UserCircle className="h-5 w-5" />
                        <span>Coach</span>
                    </a>
                </nav>

                <div className="absolute bottom-4 left-4 right-4">
                    <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100 font-medium transition-all">
                        <Settings className="h-5 w-5" />
                        <span>Paramètres</span>
                    </a>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 sm:p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Bienvenue sur votre espace VAE</h1>
                        <p className="text-slate-600">Générez votre dossier en quelques clics et préparez votre passage devant le jury.</p>
                    </div>

                    {/* Progress Card */}
                    <Card className="mb-8 border-2 border-brand-blue-light bg-gradient-to-r from-brand-blue-50 to-white">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-1">Progression globale</h3>
                                    <p className="text-sm text-slate-600">Vous avez presque terminé votre dossier !</p>
                                </div>
                                <div className="text-4xl font-extrabold text-brand-blue">15%</div>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-3">
                                <div className="bg-gradient-to-r from-brand-blue to-brand-blue-dark h-3 rounded-full transition-all duration-500" style={{ width: '15%' }}></div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Step 1: Upload */}
                        <Card className="border-2 border-brand-blue shadow-lg hover:shadow-xl transition-all">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-blue to-brand-blue-dark text-white flex items-center justify-center text-lg font-bold shadow-lg">
                                        1
                                    </div>
                                    <span className="text-lg">Mes Documents</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-slate-600">
                                    Uploadez votre CV et vos justificatifs pour démarrer l'analyse IA.
                                </p>
                                <div className="border-2 border-dashed border-brand-blue-light rounded-xl p-8 text-center hover:bg-brand-blue-50 transition-colors cursor-pointer group">
                                    <Upload className="h-10 w-10 text-brand-blue mx-auto mb-3 group-hover:scale-110 transition-transform" />
                                    <p className="text-sm font-medium text-slate-700">Cliquez pour déposer</p>
                                    <p className="text-xs text-slate-500">PDF, DOCX (max 10Mo)</p>
                                </div>
                                <Button className="w-full" variant="secondary">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Gérer mes fichiers
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Step 2: AI Generation */}
                        <Card className="border-2 border-slate-200 hover:border-brand-blue-light hover:shadow-lg transition-all">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center text-lg font-bold">
                                        2
                                    </div>
                                    <span className="text-lg">Génération IA</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-slate-600">
                                    L'IA analyse vos docs et génère votre livret 2 complet en 10 minutes.
                                </p>
                                <div className="bg-slate-50 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400 border-2 border-slate-200">
                                    <Brain className="h-12 w-12 mb-3" />
                                    <p className="text-sm text-center italic">Uploadez vos documents pour démarrer</p>
                                </div>
                                <Button className="w-full" disabled>
                                    <Brain className="mr-2 h-4 w-4" />
                                    Générer avec l'IA
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Step 3: Chat & Corrections */}
                        <Card className="border-2 border-slate-200 hover:border-brand-blue-light hover:shadow-lg transition-all">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center text-lg font-bold">
                                        3
                                    </div>
                                    <span className="text-lg">Chat IA</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-slate-600">
                                    Discutez avec l'IA pour améliorer votre dossier et obtenir des conseils.
                                </p>
                                <div className="bg-slate-50 rounded-xl p-6 h-32 flex items-center justify-center border-2 border-slate-200">
                                    <MessageSquare className="h-8 w-8 text-slate-400" />
                                </div>
                                <Button className="w-full" disabled>
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Ouvrir le chat
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Additional Features */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        {/* Audio Version */}
                        <Card className="border-2 border-slate-200 hover:border-brand-blue-light hover:shadow-lg transition-all">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-lg">
                                    <Headphones className="h-6 w-6 text-brand-blue" />
                                    Version Audio
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-slate-600">
                                    Écoutez votre dossier en version audio pour mieux le mémoriser.
                                </p>
                                <Button className="w-full" variant="secondary" disabled>
                                    <Headphones className="mr-2 h-4 w-4" />
                                    Écouter mon dossier
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Export */}
                        <Card className="border-2 border-slate-200 hover:border-brand-blue-light hover:shadow-lg transition-all">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3 text-lg">
                                    <FileDown className="h-6 w-6 text-brand-blue" />
                                    Télécharger
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-slate-600">
                                    Exportez votre livret au format PDF ou DOCX officiel.
                                </p>
                                <Button className="w-full" variant="secondary" disabled>
                                    <FileDown className="mr-2 h-4 w-4" />
                                    Télécharger mon livret
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Coach CTA */}
                    <Card className="mt-6 border-2 border-brand-blue bg-gradient-to-br from-brand-blue via-brand-blue-dark to-slate-900 text-white overflow-hidden relative">
                        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
                        <CardContent className="pt-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Besoin d'aide pour préparer l'oral ?</h3>
                                    <p className="text-white/90 mb-4">Réservez une session de coaching personnalisé avec un expert VAE.</p>
                                    <Button className="bg-white text-brand-blue hover:bg-slate-50">
                                        <UserCircle className="mr-2 h-5 w-5" />
                                        Contacter mon coach
                                    </Button>
                                </div>
                                <UserCircle className="h-24 w-24 text-white/20" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
