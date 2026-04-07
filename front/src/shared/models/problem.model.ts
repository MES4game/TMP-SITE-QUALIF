import { unknownToDate, unknownToNumber, unknownToString } from "~/shared/utils/convert.util";
import { createConverter, createMapper } from "~/shared/utils/mapper.util";

export interface Problem {
    id: number;
    color: string;
    short_title: string;
    title: string;
    description: string;
    time_limit: number;
    memory_limit: number;
}

export const mapProblem = createMapper<Problem>({
    id: createConverter(unknownToNumber, -1),
    color: createConverter(unknownToString, "#000000"),
    short_title: createConverter(unknownToString, ""),
    title: createConverter(unknownToString, ""),
    description: createConverter(unknownToString, ""),
    time_limit: createConverter(unknownToNumber, 1000),
    memory_limit: createConverter(unknownToNumber, 256),
});

export interface Sample {
    id: number;
    input: string;
    output: string;
    explanation?: string;
}

export const mapSample = createMapper<Sample>({
    id: createConverter(unknownToNumber, -1),
    input: createConverter(unknownToString, ""),
    output: createConverter(unknownToString, ""),
    explanation: createConverter(unknownToString, undefined),
});

export interface Language {
    key: string;
    label: string;
}

export const mapLanguage = createMapper<Language>({
    key: createConverter(unknownToString, ""),
    label: createConverter(unknownToString, ""),
});

const ALL_STATUSES = ["SOLVED", "ERROR", "-"] as const;
export type SubmitStatus = (typeof ALL_STATUSES)[number];

const statusSet = new Set<string>(ALL_STATUSES);

export function isSubmitStatus(value: unknown): value is SubmitStatus {
    return typeof value === "string" && statusSet.has(value);
}

export interface Submit {
    status: SubmitStatus;
    submited_on: Date;
    language: Language["key"];
    submit_id: number;
}

export const mapSubmit = createMapper<Submit>({
    status: createConverter((val) => {
        if (isSubmitStatus(val)) return val;
        return "-";
    }, "-"),
    submited_on: createConverter(unknownToDate, new Date()),
    language: createConverter(unknownToString, ""),
    submit_id: createConverter(unknownToNumber, -1),
});
