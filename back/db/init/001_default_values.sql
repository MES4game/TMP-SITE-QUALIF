INSERT INTO languages (`key`, label, file_extension)
VALUES
    ('python', 'Python', 'py'),
    ('cpp', 'C++', 'cpp'),
    ('java', 'Java', 'java'),
    ('kotlin', 'Kotlin', 'kt');

INSERT INTO statuses (name, description, color)
VALUES
    ('SOLVED', 'The problem was solved successfully.', '#28a745'),
    ('PENDING', 'The submission is pending evaluation.', '#ffc107'),
    ('IN_QUEUE', 'The submission is in the evaluation queue.', '#6f42c1'),
    ('WRONG_ANSWER', 'The submission produced an incorrect answer.', '#dc3545'),
    ('TIME_LIMIT_EXCEEDED', 'The submission exceeded the time limit.', '#17a2b8'),
    ('MEMORY_LIMIT_EXCEEDED', 'The submission exceeded the memory limit.', '#6c757d'),
    ('RUNTIME_ERROR', 'The submission caused a runtime error.', '#343a40'),
    ('COMPILATION_ERROR', 'The submission failed to compile.', '#007bff'),
    ('-', 'The submission has not been evaluated yet.', '#6c757d');

INSERT INTO problems (color, short_title, title, time_limit, memory_limit, folder_root)
VALUES
    ('#007bff', 'A', 'Problem A', 1000, 256, 'a'),
    ('#28a745', 'B1', 'Problem B1', ROUND((RAND() * (2000-500))+500), ROUND((RAND() * (256-16))+16), 'b1'),
    ('#dc3545', 'B2', 'Problem B2', ROUND((RAND() * (2000-500))+500), ROUND((RAND() * (256-16))+16), 'b2'),
    ('#17a2b8', 'C1', 'Problem C1', ROUND((RAND() * (2000-500))+500), ROUND((RAND() * (256-16))+16), 'c1'),
    ('#ffc107', 'C2', 'Problem C2', ROUND((RAND() * (2000-500))+500), ROUND((RAND() * (256-16))+16), 'c2'),
    ('#6c757d', 'D1', 'Problem D1', ROUND((RAND() * (2000-500))+500), ROUND((RAND() * (256-16))+16), 'd1'),
    ('#6f42c1', 'D2', 'Problem D2', ROUND((RAND() * (2000-500))+500), ROUND((RAND() * (256-16))+16), 'd2'),
    ('#343a40', 'E1', 'Problem E1', ROUND((RAND() * (2000-500))+500), ROUND((RAND() * (256-16))+16), 'e1'),
    ('#007bff', 'E2', 'Problem E2', ROUND((RAND() * (2000-500))+500), ROUND((RAND() * (256-16))+16), 'e2'),
    ('#28a745', 'F1', 'Problem F1', ROUND((RAND() * (2000-500))+500), ROUND((RAND() * (256-16))+16), 'f1'),
    ('#dc3545', 'F2', 'Problem F2', ROUND((RAND() * (2000-500))+500), ROUND((RAND() * (256-16))+16), 'f2'),
    ('#17a2b8', 'G1', 'Problem G1', ROUND((RAND() * (2000-500))+500), ROUND((RAND() * (256-16))+16), 'g1'),
    ('#ffc107', 'G2', 'Problem G2', ROUND((RAND() * (2000-500))+500), ROUND((RAND() * (256-16))+16), 'g2'),
    ('#6c757d', 'H1', 'Problem H1', ROUND((RAND() * (2000-500))+500), ROUND((RAND() * (256-16))+16), 'h1'),
    ('#6f42c1', 'H2', 'Problem H2', ROUND((RAND() * (2000-500))+500), ROUND((RAND() * (256-16))+16), 'h2');
