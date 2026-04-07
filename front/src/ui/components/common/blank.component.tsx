import AssignmentIcon from "@mui/icons-material/Assignment";
import { Box, Typography } from "@mui/material";
import { type ReactNode, useEffect } from "react";

interface BlankCompProps {
    text: string;
}

export default function BlankComp(props: BlankCompProps): ReactNode {
    useEffect(() => {
        console.log("Loaded: BlankComp");
    }, []);

    useEffect(() => {
        console.log("Rendered: BlankComp");
    });

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            px: 4,
            py: 8,
            color: 'text.secondary',
            bgcolor: 'background.paper',
            borderRadius: 3,
            border: '1px dashed',
            borderColor: 'divider',
            width: 'max-content',
        }}>
            <AssignmentIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" fontWeight="bold">
                {props.text}
            </Typography>
            <Typography variant="body2" color="text.disabled">
                Check back later for updates or contact the organizers for more information.
            </Typography>
        </Box>
    );
}
