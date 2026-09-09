import { BrowserRouter, Route, Routes } from "react-router-dom"

import { HomePage } from "@/pages/Home/Home"
import { LoginPage } from "@/pages/Login/Login"
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
                </Route>
            </Routes>
        </BrowserRouter>
    )
}
