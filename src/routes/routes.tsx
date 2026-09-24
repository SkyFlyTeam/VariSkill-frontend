import { BrowserRouter, Route, Routes } from "react-router-dom"

import { ActivityResultModalPreviewPage } from "@/pages/ActivityResultModalPreview/ActivityResultModalPreview"
import { HomePage } from "@/pages/Home/Home"
import { LoginPage } from "@/pages/Login/Login"
import { OnboardingPage } from "@/pages/Onboarding/Onboarding"
import { VariMessageModalPreviewPage } from "@/pages/VariMessageModalPreview/VariMessageModalPreview"
import { PrivateRoute } from "@/routes/privateRoute"
import { PublicRoute } from "@/routes/publicRoute"

export const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<PublicRoute />}>
                    <Route path="/login" element={<LoginPage />} />
                </Route>

                <Route element={<PrivateRoute />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/onboarding" element={<OnboardingPage />} />
                </Route>

                {/* Preview manual pra revisão de PR, sem login (VAR-34). */}
                <Route
                    path="/preview/vari-message-modal"
                    element={<VariMessageModalPreviewPage />}
                />

                {/* Preview manual pra revisão de PR, sem login (VAR-69). */}
                <Route
                    path="/preview/activity-result-modal"
                    element={<ActivityResultModalPreviewPage />}
                />
            </Routes>
        </BrowserRouter>
    )
}
