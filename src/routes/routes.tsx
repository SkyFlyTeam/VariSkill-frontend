import { BrowserRouter, Route, Routes } from "react-router-dom"

import { ChatPage } from "@/pages/Chat/Chat"
import { ExercisePage } from "@/pages/Exercise/Exercise"
import { HomePage } from "@/pages/Home/Home"
import { LessonPage } from "@/pages/Lesson/Lesson"
import { LoginPage } from "@/pages/Login/Login"
import { OnboardingPage } from "@/pages/Onboarding/Onboarding"
import { ProfilePage } from "@/pages/Profile/Profile"
import { RegistroPage } from "@/pages/Registro/Registro"
import { TrackRoadmapPage } from "@/pages/TrackRoadmap/TrackRoadmap"
import { PrivateRoute } from "@/routes/privateRoute"
import { PublicRoute } from "@/routes/publicRoute"

export const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<PublicRoute />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/registro" element={<RegistroPage />} />
                </Route>

                <Route element={<PrivateRoute />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/trilhas/:id" element={<TrackRoadmapPage />} />
                    <Route
                        path="/trilhas/:trilhaId/licao/:atividadeId"
                        element={<LessonPage />}
                    />
                    <Route
                        path="/trilhas/:trilhaId/atividade/:atividadeId"
                        element={<ExercisePage />}
                    />
                    <Route path="/onboarding" element={<OnboardingPage />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/perfil" element={<ProfilePage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}
