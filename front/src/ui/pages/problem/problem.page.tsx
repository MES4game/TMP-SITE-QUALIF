import { Box, Fade, Grid } from "@mui/material";
import { type ReactNode, useEffect } from "react";
import { useGeneralContext } from "~/shared/contexts/general.context";
import { useReRender } from "~/shared/utils/hook.util";
import BlankComp from "~/ui/components/common/blank.component";
import ProblemCardComp from "~/ui/components/problem/card.component";

export default function ProblemPage(): ReactNode {
    const { problems } = useGeneralContext();
    const reRender = useReRender();

    useEffect(() => {
        console.log("Loaded: ProblemPage");

        const unsubscribers: (() => void)[] = [];

        unsubscribers.push(problems.subscribe(reRender));

        return () => { unsubscribers.forEach((fn) => { fn(); }); };
    }, []);

    useEffect(() => {
        console.log("Rendered: ProblemPage");
    });

    if (!problems.current || problems.current.length === 0) return <BlankComp text="No problems found" />;

    return (
        <Box sx={{ width: '100%', py: 2 }}>
            <Grid container spacing={3}>
                {problems.current.map((problem, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={problem.id}>
                        <Fade in={true} timeout={400 + (index * 150)}>
                            <Box sx={{ height: '100%', display: 'flex' }}>
                                <ProblemCardComp problem={problem} />
                            </Box>
                        </Fade>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
