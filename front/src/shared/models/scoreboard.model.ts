import { unknownToNumber } from "~/shared/utils/convert.util";
import { createConverter, createMapper } from "~/shared/utils/mapper.util";

interface ProblemScore {
    problem_id: number;
    nb_tries: number;
    time_solved: number;
}

const mapProblemScore = createMapper<ProblemScore>({
    problem_id: createConverter(unknownToNumber, -1),
    nb_tries: createConverter(unknownToNumber, -1),
    time_solved: createConverter(unknownToNumber, -1),
});

export interface UserScore {
    user_id: number;
    problems: ProblemScore[];
}

export const mapUserScore = createMapper<UserScore>({
    user_id: createConverter(unknownToNumber, -1),
    problems: createConverter((value) => {
        if (!Array.isArray(value)) return [];

        return value.map(mapProblemScore).filter((item) => item.problem_id !== -1);
    }, []),
});
