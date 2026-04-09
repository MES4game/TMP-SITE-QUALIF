INSERT INTO languages (`key`, label, file_extension)
VALUES
    ('python', 'Python', 'py'),
    ('c', 'C', 'c'),
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

INSERT INTO problems (color, short_title, title, description_fr, description_en, time_limit, memory_limit)
VALUES
    ('#007bff', 'A', 'Hello World', 'Affichez Hello, World! à l''écran.', 'Print Hello, World! to the screen.', 1000, 256),
    ('#28a745', 'B', 'Sum of Two Numbers', 'Écrivez un programme qui lit deux nombres et affiche leur somme.', 'Write a program that reads two numbers and prints their sum.', 1000, 256),
    ('#dc3545', 'C', 'Factorial', 'Écrivez un programme qui calcule le factoriel d''un nombre donné.', 'Write a program that calculates the factorial of a given number.', 1000, 256),
    ('#17a2b8', 'D', 'Fibonacci Sequence', 'Écrivez un programme qui affiche les n premiers termes de la suite de Fibonacci.', 'Write a program that prints the first n terms of the Fibonacci sequence.', 1000, 256),
    ('#ffc107', 'E', 'Palindrome Checker', 'Écrivez un programme qui vérifie si une chaîne de caractères est un palindrome.', 'Write a program that checks if a string is a palindrome.', 1000, 256),
    ('#6c757d', 'F', 'Prime Numbers', 'Écrivez un programme qui affiche tous les nombres premiers jusqu''à un nombre donné.', 'Write a program that prints all prime numbers up to a given number.', 1000, 256),
    ('#6f42c1', 'G', 'Greatest Common Divisor', 'Écrivez un programme qui calcule le plus grand commun diviseur de deux nombres.', 'Write a program that calculates the greatest common divisor of two numbers.', 1000, 256),
    ('#343a40', 'H', 'Sorting Algorithm', 'Écrivez un programme qui trie une liste de nombres en utilisant un algorithme de tri de votre choix.', 'Write a program that sorts a list of numbers using an algorithm of your choice.', 1000, 256),
    ('#007bff', 'I', 'Matrix Multiplication', 'Écrivez un programme qui multiplie deux matrices.', 'Write a program that multiplies two matrices.', 1000, 256),
    ('#28a745', 'J', 'String Reversal', 'Écrivez un programme qui inverse une chaîne de caractères.', 'Write a program that reverses a string.', 1000, 256),
    ('#dc3545', 'K', 'Anagram Checker', 'Écrivez un programme qui vérifie si deux chaînes de caractères sont des anagrammes.', 'Write a program that checks if two strings are anagrams.', 1000, 256),
    ('#17a2b8', 'L', 'Binary Search', 'Écrivez un programme qui implémente l''algorithme de recherche binaire.', 'Write a program that implements the binary search algorithm.', 1000, 256),
    ('#ffc107', 'M', 'Linked List', 'Écrivez un programme qui implémente une liste chaînée.', 'Write a program that implements a linked list.', 1000, 256),
    ('#6c757d', 'N', 'Stack Implementation', 'Écrivez un programme qui implémente une pile (stack).', 'Write a program that implements a stack.', 1000, 256),
    ('#6f42c1', 'O', 'Queue Implementation', 'Écrivez un programme qui implémente une file d''attente (queue).', 'Write a program that implements a queue.', 1000, 256);

INSERT INTO samples (problem_id, input, output, explanation_fr, explanation_en)
VALUES
    (1, '', 'Hello, World!', 'Aucun input n''est nécessaire pour ce problème. Le programme doit simplement afficher "Hello, World!" à l''écran.', 'No input is required for this problem. The program should simply print "Hello, World!" to the screen.'),
    (1, '3 5', '8', 'Le programme doit lire deux nombres (3 et 5 dans cet exemple) et afficher leur somme (8).', 'The program should read two numbers (3 and 5 in this example) and print their sum (8).'),
    (1, '5', '120', 'Le programme doit calculer le factoriel de 5, qui est 5 * 4 * 3 * 2 * 1 = 120.', 'The program should calculate the factorial of 5, which is 5 * 4 * 3 * 2 * 1 = 120.'),
    (2, '10', '0 1 1 2 3 5 8 13 21 34', 'Le programme doit afficher les 10 premiers termes de la suite de Fibonacci.', 'The program should print the first 10 terms of the Fibonacci sequence.'),
    (2, 'racecar', 'YES', 'Le programme doit vérifier si "racecar" est un palindrome, ce qui est le cas, donc il doit afficher "YES".', 'The program should check if "racecar" is a palindrome, which it is, so it should print "YES".'),
    (2, '10', '2 3 5 7', 'Le programme doit afficher tous les nombres premiers jusqu''à 10, qui sont 2, 3, 5 et 7.', 'The program should print all prime numbers up to 10, which are 2, 3, 5 and 7.'),
    (2, '48 18', '6', 'Le programme doit calculer le plus grand commun diviseur de 48 et 18, qui est 6.', 'The program should calculate the greatest common divisor of 48 and 18, which is 6.'),
    (2, '5\n4 2 9 1 5', '1 2 4 5 5', 'Le programme doit trier la liste de nombres [4, 2, 9, 1, 5] en ordre croissant.', 'The program should sort the list of numbers [4, 2, 9, 1, 5] in ascending order.'),
    (3, '2\n1 2\n3\n4', '7', 'Le programme doit multiplier les deux matrices [[1, 2], [3]] et [[4]], ce qui donne [[1*4 + 2*0], [3*4 + 0*0]] = [[4], [12]].', 'The program should multiply the two matrices [[1, 2], [3]] and [[4]], which results in [[1*4 + 2*0], [3*4 + 0*0]] = [[4], [12]].'),
    (3, 'hello', 'olleh', 'Le programme doit inverser la chaîne de caractères "hello" pour obtenir "olleh".', 'The program should reverse the string "hello" to get "olleh".'),
    (3, 'listen silent', 'YES', 'Le programme doit vérifier si "listen" et "silent" sont des anagrammes l''un de l''autre, ce qui est le cas, donc il doit afficher "YES".', 'The program should check if "listen" and "silent" are anagrams of each other, which they are, so it should print "YES".'),
    (3, '5\n1 2 3 4 5\n3', '3', 'Le programme doit implémenter l''algorithme de recherche binaire pour trouver le nombre 3 dans la liste [1, 2, 3, 4, 5].', 'The program should implement the binary search algorithm to find the number 3 in the list [1, 2, 3, 4, 5].'),
    (3, '', '', 'Le programme doit implémenter une liste chaînée, qui est une structure de données composée de des nœuds où chaque nœud contient une valeur et une référence au nœud suivant.', 'The program should implement a linked list, which is a data structure consisting of nodes where each node contains a value and a reference to the next node.'),
    (3, '', '', 'Le programme doit implémenter une pile (stack), qui est une structure de données de type LIFO (Last In, First Out) où les éléments sont ajoutés et retirés du sommet de la pile.', 'The program should implement a stack, which is a LIFO (Last In, First Out) data structure where elements are added and removed from the top of the stack.'),
    (3, '', '', 'Le programme doit implémenter une file d''attente (queue), qui est une structure de données de type FIFO (First In, First Out) où les éléments sont ajoutés à l''arrière de la file et retirés de l''avant de la file.', 'The program should implement a queue, which is a FIFO (First In, First Out) data structure where elements are added to the back of the queue and removed from the front of the queue.');

INSERT INTO skeletons (problem_id, language, code)
VALUES
    (1, 'python', 'print("Hello, World!")'),
    (1, 'c', '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}'),
    (1, 'cpp', '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}'),
    (1, 'java', 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}'),
    (1, 'kotlin', 'fun main() {\n    println("Hello, World!")\n}'),
    (2, 'python', 'a, b = map(int, input().split())\nprint(a + b)'),
    (2, 'c', '#include <stdio.h>\n\nint main() {\n    int a, b;\n    scanf("%d %d", &a, &b);\n    printf("%d\\n", a + b);\n    return 0;\n}'),
    (2, 'cpp', '#include <iostream>\n\nint main() {\n    int a, b;\n    std::cin >> a >> b;\n    std::cout << a + b << std::endl;\n    return 0;\n}'),
    (2, 'java', 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        int a = scanner.nextInt();\n        int b = scanner.nextInt();\n        System.out.println(a + b);\n    }\n}'),
    (2, 'kotlin', 'fun main() {\n    val (a, b) = readLine()!!.split(" ").map { it.toInt() }\n    println(a + b)\n}');
