import { type ReactNode, useEffect, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { CssBaseline } from "@mui/material";
import LoadingComp from "~/ui/components/common/loading.component";
import NavbarComp from "~/ui/components/common/navbar.component";
import InfobarComp from "~/ui/components/common/infobar.component";
import { GeneralContextProvider } from "~/shared/contexts/general.context";
import { PAGES } from "~/shared/config/const.config";
import AppTheme from "~/ui/themes/app.theme";
import "~/App.css";

export default function App(): ReactNode {
    useEffect(() => {
        console.log("Loaded: App");
    }, []);

    useEffect(() => {
        console.log("Rendered: App");
    });

    return (
        <BrowserRouter>
            <GeneralContextProvider>
                <AppTheme>
                    <CssBaseline enableColorScheme />
                    <NavbarComp />

                    <main id="main">
                        <Suspense fallback={<LoadingComp size={150} />}>
                            <Routes>
                                {
                                    PAGES.map((page, idx) => {
                                        return <Route key={idx} path={page.url} element={<page.component />} />;
                                    })
                                }
                            </Routes>
                        </Suspense>
                    </main>

                    <InfobarComp />
                </AppTheme>
            </GeneralContextProvider>
        </BrowserRouter>
    );
}
