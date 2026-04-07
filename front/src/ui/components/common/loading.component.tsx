import { type ReactNode, useEffect } from "react";
import { CircularProgress } from "@mui/material";

interface LoadingCompProps {
    size?: string | number;
}

export default function LoadingComp(props: LoadingCompProps): ReactNode {
    useEffect(() => {
        console.log("Loaded: LoadingComp");
    }, []);

    useEffect(() => {
        console.log("Rendered: LoadingComp");
    });

    return <CircularProgress size={props.size ?? 16} enableTrackSlot />;
}
