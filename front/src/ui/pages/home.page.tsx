import { type ReactNode, useEffect } from "react";

export default function HomePage(): ReactNode {
    useEffect(() => {
        console.log("Loaded: HomePage");
    }, []);

    useEffect(() => {
        console.log("Rendered: HomePage");
    });

    return (<h3 style={{ textAlign: "center" }}>TODO: Home page</h3>);
}
