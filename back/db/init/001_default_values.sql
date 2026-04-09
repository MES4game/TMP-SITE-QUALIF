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
    ('#007bff', 'A', 'Hello World', 1000, 256, 'a'),
    ('#28a745', 'B', 'Hello World', 1000, 256, 'b'),
    ('#dc3545', 'C', 'Hello World', 1000, 256, 'c'),
    ('#17a2b8', 'D', 'Hello World', 1000, 256, 'd'),
    ('#ffc107', 'E', 'Hello World', 1000, 256, 'e'),
    ('#6c757d', 'F', 'Hello World', 1000, 256, 'f'),
    ('#6f42c1', 'G', 'Hello World', 1000, 256, 'g'),
    ('#343a40', 'H', 'Hello World', 1000, 256, 'h'),
    ('#007bff', 'I', 'Hello World', 1000, 256, 'i'),
    ('#28a745', 'J', 'Hello World', 1000, 256, 'k'),
    ('#dc3545', 'K', 'Hello World', 1000, 256, 'k'),
    ('#17a2b8', 'L', 'Hello World', 1000, 256, 'l'),
    ('#ffc107', 'M', 'Hello World', 1000, 256, 'm'),
    ('#6c757d', 'N', 'Hello World', 1000, 256, 'n'),
    ('#6f42c1', 'O', 'Hello World', 1000, 256, 'o');
