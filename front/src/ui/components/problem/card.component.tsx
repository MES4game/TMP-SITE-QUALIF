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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
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
    const { token } = useGeneralContext();
    const reRender = useReRender();
    const navigate = useNavigate();
    const [status, setStatus] = useState<SubmitStatus>('-');
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
                    setStatus('-');
                    setNumberTries(0);
                });
        }

        const unsubscribers: (() => void)[] = [];

        unsubscribers.push(token.subscribe(reRender));

        return () => { unsubscribers.forEach((fn) => { fn(); }); };
    }, []);

    useEffect(() => {
        console.log("Rendered: ProblemCardComp");
    });

    // Helper function to map the status to specific chip colors and icons
    const getStatusConfig = (status: SubmitStatus) => {
        switch (status) {
            case 'SOLVED':
                return { color: 'success' as const, icon: <CheckCircleIcon />, label: 'Solved' };
            case 'ERROR':
                return { color: 'error' as const, icon: <ErrorIcon />, label: 'Error' };
            case '-':
            default:
                return { color: 'default' as const, icon: <HorizontalRuleIcon />, label: 'Unsolved' };
        }
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
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <ProblemBadgeComp problem={props.problem} />
                            <Typography
                                variant="h6"
                                component="div"
                                sx={{ fontWeight: 600, lineHeight: 1.2 }}
                            >
                                {props.problem.title}
                            </Typography>
                        </Box>
                        <Chip
                            size="small"
                            variant="outlined"
                            color={statusConfig.color}
                            icon={statusConfig.icon}
                            label={statusConfig.label}
                            sx={{ fontWeight: 'bold' }}
                        />
                    </Box>

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
