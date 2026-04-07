import { type ReactNode, useEffect } from "react";

export default function DocsPage(): ReactNode {
    useEffect(() => {
        console.log("Loaded: DocsPage");
    }, []);

    useEffect(() => {
        console.log("Rendered: DocsPage");
    });

    return (<h3 style={{ textAlign: "center" }}>TODO: Documentation page</h3>);
}
