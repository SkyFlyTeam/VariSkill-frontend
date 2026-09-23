import { BrowserRouter, Route, Routes } from "react-router-dom"

import { ActivityNodePreviewPage } from "@/pages/ActivityNodePreview/ActivityNodePreview"
import { ActivityResultModalPreviewPage } from "@/pages/ActivityResultModalPreview/ActivityResultModalPreview"
import { ChatPage } from "@/pages/Chat/Chat"
import { HomePage } from "@/pages/Home/Home"
import { LoginPage } from "@/pages/Login/Login"
import { MultipleChoicePreviewPage } from "@/pages/MultipleChoicePreview/MultipleChoicePreview"
import { OnboardingPage } from "@/pages/Onboarding/Onboarding"
import { TrackRoadmapPage } from "@/pages/TrackRoadmap/TrackRoadmap"
import { VariMessageModalPreviewPage } from "@/pages/VariMessageModalPreview/VariMessageModalPreview"
import { ProfilePage } from "@/pages/Profile/Profile"
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
                    <Route path="/trilhas/:id" element={<TrackRoadmapPage />} />
                    <Route path="/onboarding" element={<OnboardingPage />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/perfil" element={<ProfilePage />} />
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

                {/* Preview manual pra revisão de PR, sem login (VAR-47). */}
                <Route
                    path="/preview/multiple-choice"
                    element={<MultipleChoicePreviewPage />}
                />

                {/* Preview manual pra revisão de PR, sem login (VAR-51). */}
                <Route
                    path="/preview/activity-node"
                    element={<ActivityNodePreviewPage />}
                />
            </Routes>
        </BrowserRouter>
    )
}
