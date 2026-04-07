import { Avatar } from "@mui/material";
import { type ReactNode, useEffect } from "react";
import type { Problem } from "~/shared/models/problem.model";

interface ProblemBadgeCompProps {
    problem: Problem;
}

export default function ProblemBadgeComp(props: ProblemBadgeCompProps): ReactNode {
    useEffect(() => {
        console.log("Loaded: ProblemBadgeComp");
    }, []);

    useEffect(() => {
        console.log("Rendered: ProblemBadgeComp");
    });

    return (
        <Avatar sx={{ bgcolor: props.problem.color }} variant="rounded">
            {props.problem.short_title}
        </Avatar>
    );
}
