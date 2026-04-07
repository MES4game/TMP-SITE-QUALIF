import { type ReactNode, useEffect } from "react";

export default function NotFoundPage(): ReactNode {
    useEffect(() => {
        console.log("Loaded: NotFoundPage");
    }, []);

    useEffect(() => {
        console.log("Rendered: NotFoundPage");
    });

    return (<h3 style={{ textAlign: "center" }}>Page not found</h3>);
}
