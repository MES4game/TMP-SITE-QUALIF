import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import type { BoardColumn } from '~/shared/models/board.model';
import { Box, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

interface BoardProps<T extends object> {
    data: T[];
    columns: BoardColumn<T>[];
    showIndexColumn?: boolean;
    rowsPerPageOptions?: number[];
    handleRefresh?: () => void;
}

export default function BoardComp<T extends object>(props: BoardProps<T>): React.ReactNode {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    React.useEffect(() => {
        console.log("Loaded: BoardComp");
    }, []);

    React.useEffect(() => {
        console.log("Rendered: BoardComp");
    });

    props.columns.sort((a, b) => { return a.id - b.id; });

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            {props.showIndexColumn && (
                                <TableCell key="index" align="center" style={{ minWidth: 50 }}>
                                    #
                                </TableCell>
                            )}
                            {props.columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth }}
                                >
                                    {typeof column.label === 'string' || typeof column.label === 'number' ? (
                                        column.label
                                    ) : (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent:
                                                    column.align === 'center' ? 'center' :
                                                        column.align === 'right' ? 'flex-end' :
                                                            'flex-start',
                                                alignItems: 'center',
                                                width: '100%',
                                            }}
                                        >
                                            {column.label}
                                        </Box>
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {props.data
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row, idx) => {
                                return (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={idx}>
                                        {props.showIndexColumn && (
                                            <TableCell key="index" align="center">
                                                {page * rowsPerPage + idx + 1}
                                            </TableCell>
                                        )}
                                        {props.columns.map((column) => {
                                            return (
                                                <TableCell key={column.id} align={column.align}>
                                                    {column.extractValueToCell(row)}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: props.handleRefresh ? 'space-between' : 'flex-end', alignItems: 'center', padding: 1 }}>
                {props.handleRefresh && (
                    <IconButton onClick={props.handleRefresh} color="primary" size="small" aria-label="refresh data">
                        <RefreshIcon />
                    </IconButton>
                )}

                <TablePagination
                    rowsPerPageOptions={props.rowsPerPageOptions ?? [10, 25, 100]}
                    component="div"
                    count={props.data.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Box>
        </Paper>
    );
}
