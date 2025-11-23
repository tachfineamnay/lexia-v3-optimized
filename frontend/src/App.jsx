import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Layout } from "./components/Layout"
import Home from "./pages/Home"
import Offre from "./pages/Offre"
import Paiement from "./pages/Paiement"
import EspaceClient from "./pages/EspaceClient"

const queryClient = new QueryClient()

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="offre" element={<Offre />} />
                        <Route path="paiement" element={<Paiement />} />
                        <Route path="espace-client" element={<EspaceClient />} />
                    </Route>
                </Routes>
            </Router>
        </QueryClientProvider>
    )
}

export default App
