import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import {
    Box, Typography, Paper, Button, Select, MenuItem,
    FormControl, InputLabel, IconButton,
    Divider, Stack, Chip, Tooltip, Grid
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import SendIcon from '@mui/icons-material/Send';
import CodeIcon from '@mui/icons-material/Code';
import RefreshIcon from '@mui/icons-material/Refresh';

// Markdown & LaTeX dependencies
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

import type { Sample, Submit } from '~/shared/models/problem.model';
import { useGeneralContext } from '~/shared/contexts/general.context';
import { useReRender } from '~/shared/utils/hook.util';
import BlankComp from '~/ui/components/common/blank.component';
import ProblemBadgeComp from '~/ui/components/problem/badge.component';
import { getAllSamplesByProblem, getAllSubmitsByProblem, getCodeBySubmit, getSkeletonCodeByProblem, submitProblem } from '~/api/problem.api';
import BoardComp from '~/ui/components/common/board.component';

// --- Helper Components ---

const MuiMarkdown = ({ content }: { content: string }) => {
    return (
        <Box sx={{
            textAlign: 'left',
            // 1. Force general text to wrap within the container bounds
            overflowWrap: 'break-word',
            wordWrap: 'break-word',
            maxWidth: '100%',

            '& p': { mb: 2 },
            '& h1, & h2, & h3, & h4': { mt: 3, mb: 1, fontWeight: 'bold' },

            // 2. Ensure inline code blocks wrap instead of expanding off-screen
            '& code': {
                bgcolor: 'background.paper',
                p: 0.5,
                borderRadius: 1,
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
            },

            // 3. Fix KaTeX inline math so it wraps with the text
            '& .katex': {
                whiteSpace: 'normal',
            },

            // 4. If you have display/block math ($$ ... $$) that is too long, 
            // give it a horizontal scrollbar instead of breaking the layout
            '& .katex-display': {
                overflowX: 'auto',
                overflowY: 'hidden',
                paddingBottom: '0.5rem', // Padding so the scrollbar doesn't clip the equation
            }
        }}>
            <ReactMarkdown
                remarkPlugins={[remarkMath, remarkGfm]}
                rehypePlugins={[rehypeKatex]}
            >
                {content}
            </ReactMarkdown>
        </Box>
    );
};

const TerminalBlock = ({ title, text }: { title: string, text: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Paper elevation={0} sx={{
            bgcolor: 'background.paper',
            color: 'text.primary',
            overflow: 'hidden',
            borderRadius: 2,
            mb: 2,
            textAlign: 'left',
            border: 1,
            borderColor: 'divider'
        }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: 'background.default',
                px: 2,
                py: 1
            }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>
                    {title}
                </Typography>
                <Tooltip title={copied ? "Copied!" : "Copy to clipboard"} placement="top">
                    <IconButton size="small" onClick={handleCopy} sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
                        <ContentCopyIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>
            <Box sx={{ p: 2, overflow: 'auto', maxHeight: '250px' }}>
                <Typography component="pre" sx={{ m: 0, fontFamily: 'monospace', fontSize: '0.875rem', textAlign: 'left' }}>
                    {text}
                </Typography>
            </Box>
        </Paper>
    );
};

// --- Main Page Component ---

export default function ProblemByIdPage() {
    const { token, problems, languages, statuses } = useGeneralContext();
    const reRender = useReRender();
    const { id } = useParams<{ id: string }>();

    const problemId = Number(id);
    const problem = problems.current?.find(p => p.id === problemId);

    // --- State ---
    const [language, setLanguage] = useState<string>(languages.current ? languages.current[0].key : 'python');
    const [code, setCode] = useState<string>('');
    const [fileName, setFileName] = useState<string>('');
    const [codeFile, setCodeFile] = useState<File | null>(null);
    const [samples, setSamples] = useState<Sample[] | undefined>(undefined);
    const [pastSubmits, setPastSubmits] = useState<Submit[] | undefined>(undefined);

    // --- Handlers ---
    const handleDownloadSkeleton = async () => {
        if (!language) return alert("Select a language first!");

        try {
            const { filename, blob } = await getSkeletonCodeByProblem(problemId, language);
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;

            document.body.appendChild(a);
            a.click();

            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (error) {
            console.error(`Failed to download skeleton for problem ${problemId} in ${language}:`, error);
            alert("Failed to download the skeleton code. Please try again.");
        }
    };

    const handleRefreshSubmits = () => {
        if (!token.current) {
            setPastSubmits(undefined);
            return;
        }

        getAllSubmitsByProblem(token.current, problemId)
            .then((data) => { setPastSubmits(data?.sort((a, b) => { return b.submited_on.getTime() - a.submited_on.getTime(); })); })
            .catch((err) => {
                console.error("Failed to fetch submits:", err);
                setPastSubmits(undefined);
            });
    };

    const handleDownloadSubmit = async (submitId: number) => {
        if (!token.current) return alert("You must be logged in to download submit code!");

        console.log(`Downloading code for submit ${submitId}`);

        getCodeBySubmit(token.current, submitId)
            .then(({ filename, blob }) => {
                const url = window.URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = filename;

                document.body.appendChild(a);
                a.click();

                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            })
            .catch((err) => {
                console.error(`Failed to download code for submit ${submitId}:`, err);
                alert("Failed to download the submitted code. Please try again.");
            });
    };

    const handleSubmitCode = async () => {
        if (!token.current) return alert("You must be logged in to submit code!");
        if (!language || !codeFile) return;

        console.log("Submitting file:", codeFile.name, "in language:", language);

        const utf8File = new File(
            [await codeFile.text()],
            codeFile.name,
            { type: 'text/plain; charset=utf-8' }
        );

        const formData = new FormData();
        formData.append('file', utf8File);

        submitProblem(token.current!, problemId, language, formData)
            .then(() => {
                alert("Code submitted successfully!");
                setCode('');
                setFileName('');
                setCodeFile(null);
                handleRefreshSubmits();
            })
            .catch((err) => {
                console.error("Failed to submit code:", err);
                alert("Failed to submit your code. Please try again.");
            });
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // 1. Store the actual File object for the backend request
        setCodeFile(file);
        setFileName(file.name);

        // 2. Read only a safe chunk for the UI preview to prevent browser freezes
        const PREVIEW_LIMIT = 50 * 1024; // 50 KB limit for preview
        const fileSlice = file.slice(0, PREVIEW_LIMIT);

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result;
            if (typeof text === 'string') {
                if (file.size > PREVIEW_LIMIT) {
                    setCode(text + '\n\n... [File truncated for preview only. Full file will be submitted.]');
                } else {
                    setCode(text);
                }
            }
        };
        reader.readAsText(fileSlice);

        event.target.value = ''; // Reset input
    };

    // --- Effects ---
    useEffect(() => {
        if (isNaN(problemId)) return;

        getAllSamplesByProblem(problemId)
            .then((data) => { setSamples(data); })
            .catch((err) => {
                console.error("Failed to fetch samples:", err);
                setSamples(undefined);
            });

        if (token.current) {
            getAllSubmitsByProblem(token.current, problemId)
                .then((data) => { setPastSubmits(data?.sort((a, b) => { return b.submited_on.getTime() - a.submited_on.getTime(); })); })
                .catch((err) => {
                    console.error("Failed to fetch submits:", err);
                    setPastSubmits(undefined);
                });
        } else {
            setPastSubmits(undefined);
        }

        const unsubscribers: (() => void)[] = [];

        unsubscribers.push(token.subscribe(reRender));
        unsubscribers.push(problems.subscribe(reRender));
        unsubscribers.push(languages.subscribe(reRender));
        unsubscribers.push(statuses.subscribe(reRender));

        unsubscribers.push(token.subscribe((_, currentToken) => {
            if (currentToken) {
                getAllSubmitsByProblem(currentToken, problemId)
                    .then((data) => { setPastSubmits(data?.sort((a, b) => { return b.submited_on.getTime() - a.submited_on.getTime(); })); })
                    .catch((err) => {
                        console.error("Failed to fetch submits:", err);
                        setPastSubmits(undefined);
                    });
            } else {
                setPastSubmits(undefined);
            }
        }, true));

        return () => { unsubscribers.forEach((fn) => { fn(); }); };
    }, [problemId]);

    useEffect(() => { console.log(pastSubmits); }, [pastSubmits]);

    if (!problem) return <BlankComp text='No problem found' />;

    return (
        <Box component="main" sx={{ width: '100%', py: 4 }}>
            {/* Title Header Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 4 }}>
                <ProblemBadgeComp problem={problem} />
                <Typography variant="h4" fontWeight="bold">
                    {problem.title}
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* Left Column: Description & Samples */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }} variant="outlined">
                        <Typography variant="h6" fontWeight="bold" gutterBottom textAlign="left">Description</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <MuiMarkdown content={problem.description_fr} />
                    </Paper>

                    {samples !== undefined && <Paper sx={{ p: 3, borderRadius: 2 }} variant="outlined">
                        <Typography variant="h6" fontWeight="bold" gutterBottom textAlign="left">Samples</Typography>
                        <Divider sx={{ mb: 2 }} />
                        {samples.map((sample, index) => (
                            <Box key={index} sx={{ mb: 4 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom textAlign="left">
                                    Sample {index + 1}
                                </Typography>
                                <TerminalBlock title="Input" text={sample.input} />
                                <TerminalBlock title="Output" text={sample.output} />
                                {sample.explanation_fr && (
                                    <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 2, textAlign: 'left' }}>
                                        <Typography variant="subtitle2" fontWeight="bold">Explanation:</Typography>
                                        <MuiMarkdown content={sample.explanation_fr} />
                                    </Box>
                                )}
                            </Box>
                        ))}
                    </Paper>}
                </Grid>

                {/* Right Column: Code Editor & Submits */}
                <Grid size={{ xs: 12, md: 5 }}>
                    {/* Coding Area */}
                    <Paper sx={{ p: 3, mb: 3, borderRadius: 2, display: 'flex', flexDirection: 'column' }} variant="outlined">
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">Code Editor</Typography>
                            <CodeIcon color="action" />
                        </Box>

                        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Language</InputLabel>
                                <Select
                                    value={language}
                                    label="Language"
                                    onChange={(e) => setLanguage(e.target.value)}
                                    sx={{ textAlign: 'left' }}
                                >
                                    {languages.current?.map((lang) => (
                                        <MenuItem key={lang.key} value={lang.key}>{lang.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Button
                                variant="outlined"
                                startIcon={<DownloadIcon />}
                                onClick={handleDownloadSkeleton}
                                disabled={!language}
                                sx={{ whiteSpace: 'nowrap' }}
                            >
                                Skeleton
                            </Button>
                        </Stack>

                        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Button
                                variant="outlined"
                                component="label"
                                sx={{ whiteSpace: 'nowrap' }}
                            >
                                Upload Code File
                                <input
                                    type="file"
                                    hidden
                                    onChange={handleFileUpload}
                                />
                            </Button>
                            {fileName && (
                                <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: '200px' }}>
                                    Loaded: <strong>{fileName}</strong>
                                </Typography>
                            )}
                        </Box>

                        <Paper
                            variant="outlined"
                            sx={{
                                mb: 2,
                                p: 2,
                                minHeight: '250px',
                                maxHeight: '400px',
                                overflow: 'auto',
                                border: '1px solid',
                                borderColor: 'divider'
                            }}
                        >
                            {code ? (
                                <Typography component="pre" sx={{ m: 0, fontFamily: 'monospace', fontSize: '0.875rem', textAlign: 'left', whiteSpace: 'pre' }}>
                                    {code}
                                </Typography>
                            ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', mt: 14 }}>
                                    No file loaded. Click "Upload Code File" to preview your code.
                                </Typography>
                            )}
                        </Paper>

                        <Button
                            variant="contained"
                            fullWidth
                            endIcon={<SendIcon />}
                            onClick={handleSubmitCode}
                            disabled={!language || !codeFile}
                        >
                            Submit Solution
                        </Button>
                    </Paper>

                    {/* Past Submits Area */}
                    {pastSubmits !== undefined && <Paper sx={{ p: 3, borderRadius: 2 }} variant="outlined">
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold" textAlign="left" sx={{ mb: 0 }}>
                                Past Submits
                            </Typography>
                            <IconButton onClick={handleRefreshSubmits} color="primary" size="small" aria-label="refresh data">
                                <RefreshIcon />
                            </IconButton>
                        </Box>

                        <BoardComp
                            data={pastSubmits}
                            columns={[
                                {
                                    id: 1,
                                    label: "Status",
                                    extractValueToCell: (row) => {
                                        const status = statuses.current?.find((s) => s.id === row.status_id);

                                        if (!status) {
                                            return (
                                                <Chip
                                                    size="small"
                                                    label="Unknown"
                                                    color="default"
                                                    variant="outlined"
                                                />
                                            );
                                        }

                                        return (
                                            <Chip
                                                size="small"
                                                label={status.name}
                                                color={status.color as any}
                                                variant="outlined"
                                                sx={{ color: status.color, borderColor: status.color }}
                                            />
                                        );
                                    },
                                    align: "center",
                                },
                                {
                                    id: 2,
                                    label: "Lang",
                                    extractValueToCell: (row) => {
                                        const language = languages.current?.find((l) => l.key === row.language);

                                        return (
                                            <Chip
                                                size="small"
                                                label={language?.label ?? row.language}
                                                color="default"
                                                variant="outlined"
                                            />
                                        );
                                    },
                                    align: "center",
                                },
                                {
                                    id: 3,
                                    label: "Date",
                                    extractValueToCell: (row) => { return row.submited_on.toLocaleString(); },
                                    align: "center",
                                },
                                {
                                    id: 4,
                                    label: "Code",
                                    extractValueToCell: (row) => {
                                        return (
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDownloadSubmit(row.id)}
                                                color="primary"
                                            >
                                                <DownloadIcon fontSize="small" />
                                            </IconButton>
                                        );
                                    },
                                    align: "right",
                                },
                            ]}
                            rowsPerPageOptions={[5, 10, 15, 20]}
                        />
                    </Paper>}
                </Grid>
            </Grid>
        </Box>
    );
}
