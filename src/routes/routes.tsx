import { BrowserRouter, Route, Routes } from "react-router-dom"

import { ActivityNodePreviewPage } from "@/pages/ActivityNodePreview/ActivityNodePreview"
import { ActivityResultModalPreviewPage } from "@/pages/ActivityResultModalPreview/ActivityResultModalPreview"
import { ChatPage } from "@/pages/Chat/Chat"
import { ExercisePage } from "@/pages/Exercise/Exercise"
import { ExercisePreviewPage } from "@/pages/ExercisePreview/ExercisePreview"
import { HomePage } from "@/pages/Home/Home"
import { LessonPage } from "@/pages/Lesson/Lesson"
import { LessonPreviewPage } from "@/pages/LessonPreview/LessonPreview"
import { LoginPage } from "@/pages/Login/Login"
import { MultipleChoicePreviewPage } from "@/pages/MultipleChoicePreview/MultipleChoicePreview"
import { OnboardingPage } from "@/pages/Onboarding/Onboarding"
import { ProfilePage } from "@/pages/Profile/Profile"
import { RegistroPage } from "@/pages/Registro/Registro"
import { TrackRoadmapPage } from "@/pages/TrackRoadmap/TrackRoadmap"
import { VariMessageModalPreviewPage } from "@/pages/VariMessageModalPreview/VariMessageModalPreview"
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

                {/* Preview manual pra revisão de PR, sem login (VAR-68). */}
                <Route path="/preview/licao" element={<LessonPreviewPage />} />

                {/* Preview manual pra revisão de PR, sem login (VAR-48). */}
                <Route
                    path="/preview/atividade"
                    element={<ExercisePreviewPage />}
                />
            </Routes>
        </BrowserRouter>
    )
}
