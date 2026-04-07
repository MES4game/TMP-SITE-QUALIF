import { type ReactNode, useEffect } from "react";

export default function SubmitByIdPage(): ReactNode {
    useEffect(() => {
        console.log("Loaded: SubmitByIdPage");
    }, []);

    useEffect(() => {
        console.log("Rendered: SubmitByIdPage");
    });

    return (<h3 style={{ textAlign: "center" }}>TODO: Submit X page</h3>);
}
