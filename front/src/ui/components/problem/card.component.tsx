import { type ReactNode, useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Stack,
    Divider,
    CardActionArea
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MemoryIcon from '@mui/icons-material/Memory';
import ReplayIcon from '@mui/icons-material/Replay';
import type { Problem, SubmitStatus } from '~/shared/models/problem.model';
import ProblemBadgeComp from '~/ui/components/problem/badge.component';
import { useNavigate } from 'react-router';
import { getUserInfoByProblem } from '~/api/problem.api';
import { useGeneralContext } from '~/shared/contexts/general.context';
import { useReRender } from '~/shared/utils/hook.util';

interface ProblemCardProps {
    problem: Problem;
}

export default function ProblemCardComp(props: ProblemCardProps): ReactNode {
    const { token, statuses } = useGeneralContext();
    const reRender = useReRender();
    const navigate = useNavigate();
    const [status, setStatus] = useState(-1);
    const [numberTries, setNumberTries] = useState<number>(0);

    useEffect(() => {
        console.log("Loaded: ProblemCardComp");

        if (token.current !== undefined) {
            getUserInfoByProblem(token.current, props.problem.id)
                .then((info) => {
                    setStatus(info.status);
                    setNumberTries(info.number_tries);
                })
                .catch((err) => {
                    console.error(`Failed to fetch user info for problem ${props.problem.id}:`, err);
                    setStatus(-1);
                    setNumberTries(0);
                });
        }

        const unsubscribers: (() => void)[] = [];

        unsubscribers.push(token.subscribe(reRender));
        unsubscribers.push(statuses.subscribe(reRender));

        unsubscribers.push(token.subscribe((_, curr) => {
            if (curr === undefined) return;

            getUserInfoByProblem(curr, props.problem.id)
                .then((info) => {
                    setStatus(info.status);
                    setNumberTries(info.number_tries);
                })
                .catch((err) => {
                    console.error(`Failed to fetch user info for problem ${props.problem.id}:`, err);
                    setStatus(-1);
                    setNumberTries(0);
                });
        }));

        return () => { unsubscribers.forEach((fn) => { fn(); }); };
    }, []);

    useEffect(() => {
        console.log("Rendered: ProblemCardComp");
    });

    // Helper function to map the status to specific chip colors and icons
    const getStatusConfig = (status: number): SubmitStatus => {
        return statuses.current?.find((s) => s.id === status) ?? { id: -1, name: "-", description: "", color: "#000000" };
    };

    const statusConfig = getStatusConfig(status);

    return (
        <Card
            sx={{
                minWidth: 320,
                borderRadius: 3,
                boxShadow: 2,
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                },
                p: 0,
            }}
        >
            <CardActionArea
                onClick={() => { navigate(`/problem/${props.problem.id.toString()}`); }}
                sx={{ width: "stretch", height: 'stretch', p: "20px" }}
            >
                <CardContent>
                    {/* Header: Badge, Title, and Status */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                        <ProblemBadgeComp problem={props.problem} />
                        <Chip
                            size="small"
                            variant="outlined"
                            color={statusConfig.color as any}
                            label={statusConfig.name}
                            sx={{ fontWeight: 'bold', color: statusConfig.color, borderColor: statusConfig.color }}
                        />
                    </Box>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ fontWeight: 600, lineHeight: 1.2, mb: 2 }}
                    >
                        {props.problem.title}
                    </Typography>

                    <Divider sx={{ my: 1.5 }} />

                    {/* Footer/Details: Time Limit, Memory Limit, Number of Tries */}
                    <Stack
                        direction="row"
                        spacing={2}
                        justifyContent="space-between"
                        sx={{ mt: 2 }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} title="Time Limit">
                            <AccessTimeIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                {props.problem.time_limit}ms
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} title="Memory Limit">
                            <MemoryIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                {props.problem.memory_limit}MB
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} title="Number of Tries">
                            <ReplayIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                {numberTries} {numberTries === 1 ? 'try' : 'tries'}
                            </Typography>
                        </Box>
                    </Stack>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}
