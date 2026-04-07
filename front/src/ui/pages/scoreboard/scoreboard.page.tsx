import { Box, Typography } from "@mui/material";
import { type ReactNode, useEffect, useState } from "react";
import { getScoreboard } from "~/api/scoreboard.api";
import { getAvatarById, getPseudoById } from "~/api/user.api";
import { ENV } from "~/shared/config/env.config";
import { useGeneralContext } from "~/shared/contexts/general.context";
import { type UserScore } from "~/shared/models/scoreboard.model";
import BlankComp from "~/ui/components/common/blank.component";
import Board from "~/ui/components/common/board.component";
import LoadingComp from "~/ui/components/common/loading.component";
import UserAvatarComp from "~/ui/components/common/user_avatar.component";
import ProblemBadgeComp from "~/ui/components/problem/badge.component";

const DEFAULT_SCOREBOARD: UserScore[] = [
    {
        user_id: 1,
        problems: [
            {
                problem_id: 1,
                time_solved: 1000,
                nb_tries: 2,
            },
            {
                problem_id: 2,
                time_solved: -1,
                nb_tries: 1,
            },
        ],
    },
    {
        user_id: 2,
        problems: [
            {
                problem_id: 1,
                time_solved: 2000,
                nb_tries: 0,
            },
            {
                problem_id: 2,
                time_solved: 3000,
                nb_tries: 3,
            },
        ],
    },
    {
        user_id: 3,
        problems: [
            {
                problem_id: 1,
                time_solved: -1,
                nb_tries: 0,
            },
            {
                problem_id: 2,
                time_solved: -1,
                nb_tries: 0,
            },
        ],
    },
    {
        user_id: 4,
        problems: [
            {
                problem_id: 1,
                time_solved: 1500,
                nb_tries: 1,
            },
            {
                problem_id: 2,
                time_solved: -1,
                nb_tries: 4,
            },
        ],
    },
    {
        user_id: 5,
        problems: [
            {
                problem_id: 1,
                time_solved: 2500,
                nb_tries: 2,
            },
            {
                problem_id: 2,
                time_solved: 3500,
                nb_tries: 1,
            },
        ],
    }
];

interface CellProps {
    row: UserScore & { score: number };
}

function UserCell(props: CellProps): ReactNode {
    const [username, setUsername] = useState<string | null | undefined>(undefined);
    const [avatarUrl, setAvatarUrl] = useState<string | null | undefined>(undefined);

    useEffect(() => {
        if (props.row.user_id > 0) {
            getAvatarById(props.row.user_id)
                .then((value) => { setAvatarUrl(URL.createObjectURL(value)); })
                .catch((err) => {
                    console.error(err);
                    setAvatarUrl(null);
                });
        }
    }, [props.row.user_id]);

    useEffect(() => {
        URL.revokeObjectURL(avatarUrl!);
    }, [avatarUrl]);

    useEffect(() => {
        if (props.row.user_id > 0) {
            getPseudoById(props.row.user_id)
                .then(setUsername)
                .catch((err) => {
                    console.error(err);
                    setUsername(null);
                });
        }
    }, [props.row.user_id]);

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center', // Vertically centers the avatar and text with each other
                justifyContent: 'flex-start', // Ensures the whole block stays left-aligned
                gap: 1.5, // Adds a consistent, theme-aware space between the avatar and text
            }}
        >
            {
                avatarUrl === undefined || username === undefined
                    ? <LoadingComp size={32} />
                    : <UserAvatarComp
                        avatar={avatarUrl === null ? undefined : avatarUrl}
                        pseudo={username === null ? "?" : username}
                        avatar_props={{ sx: { width: 32, height: 32 } }}
                        account_props={{ sx: { width: 32, height: 32 } }}
                    />
            }

            <Typography
                variant="body2" // A slightly smaller text variant suited for data tables
                color="text.primary" // Respects light/dark mode
                noWrap // Prevents the text from wrapping awkwardly in tight table columns
            >
                {
                    username === undefined
                        ? "Loading..."
                        : username === null
                            ? "Unknown User"
                            : username
                }
            </Typography>
        </Box>
    );
}

function ScoreCell(props: CellProps): ReactNode {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center', // Centers the items horizontally
                textAlign: 'center',  // Ensures the text itself is centered
                width: '100%'
            }}
        >
            <Typography
                variant="h5" // Makes it bigger
                fontWeight="bold" // Makes it bold
                color="text.primary" // Standard theme color (dark in light mode, light in dark mode)
            >
                {props.row.problems.reduce((acc, problem) => acc + (problem.time_solved >= 0 ? 1 : 0), 0).toString()}
            </Typography>

            <Typography
                variant="body1" // Smaller than the first string
                fontWeight="regular" // Not bold
                color="text.secondary" // Lighter shade that automatically respects the active theme
            >
                {props.row.score.toString()}
            </Typography>
        </Box>
    );
}

function ProblemCell(props: CellProps & { problem: { id: number } }): ReactNode {
    const problemData = props.row.problems.find((p) => p.problem_id === props.problem.id);

    if (!problemData) return <></>;

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center', // Centers the items horizontally
                textAlign: 'center',  // Ensures the text itself is centered
                width: '100%',
                bgcolor: problemData.time_solved >= 0 ? 'success' : 'error',
            }}
        >
            <Typography variant="body1" fontWeight="bold" color="text.primary">
                {problemData.time_solved >= 0 ? problemData.time_solved.toString() : ''}
            </Typography>

            {problemData.nb_tries > 0 && (
                <Typography variant="body2" color="text.secondary">
                    {problemData.nb_tries.toString()} tries
                </Typography>
            )}
        </Box>
    );
}

export default function ScoreboardPage(): ReactNode {
    const { problems } = useGeneralContext();
    const [scoreboard, setScoreboard] = useState<(UserScore & { score: number })[] | null | undefined>(undefined);

    function tansformUserScore(row: UserScore): UserScore & { score: number } {
        return {
            ...row,
            score: row.problems.reduce((acc, problem) => acc + (problem.time_solved >= 0 ? problem.time_solved + (problem.nb_tries - 1) * ENV.error_malus : 0), 0),
        };
    }

    function compareScore(a: UserScore & { score: number }, b: UserScore & { score: number }): number {
        const a_solved = a.problems.reduce((acc, problem) => acc + (problem.time_solved >= 0 ? 1 : 0), 0);
        const b_solved = b.problems.reduce((acc, problem) => acc + (problem.time_solved >= 0 ? 1 : 0), 0);

        if (b_solved !== a_solved) {
            return b_solved - a_solved;
        }

        return a.score - b.score;
    }

    useEffect(() => {
        console.log("Loaded: ScoreboardPage");

        getScoreboard()
            .then((scoreboard) => {
                setScoreboard(scoreboard?.map(tansformUserScore).sort(compareScore));
            })
            .catch((error) => {
                console.error("Failed to fetch scoreboard data:", error);
                alert("Failed to fetch scoreboard data. Please try again later.");
                setScoreboard(DEFAULT_SCOREBOARD.map(tansformUserScore).sort(compareScore));
            });
    }, []);

    useEffect(() => {
        console.log("Rendered: ScoreboardPage");
    });

    if (scoreboard === undefined) return (<LoadingComp size={200} />);

    if (scoreboard === null || scoreboard?.length === 0) return <BlankComp text="No Scoreboard to display" />;

    return (
        <Board
            data={scoreboard}
            columns={[
                {
                    id: 1,
                    label: "Pseudo",
                    extractValueToCell: (row) => { return <UserCell row={row} />; },
                    minWidth: 200,
                    align: "left",
                },
                {
                    id: 2,
                    label: "Score",
                    extractValueToCell: (row) => { return <ScoreCell row={row} />; },
                    minWidth: 100,
                    align: "center",
                },
                ...(problems.current?.map((problem) => {
                    return {
                        id: problem.id + 2,
                        label: <ProblemBadgeComp problem={problem} />,
                        extractValueToCell: (row: UserScore & { score: number }) => { return <ProblemCell row={row} problem={problem} />; },
                        minWidth: 150,
                        align: 'center' as const,
                    };
                }) || []),
            ]}
            showIndexColumn
        />
    );
}
