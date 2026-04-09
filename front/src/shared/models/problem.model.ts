import { unknownToDate, unknownToNumber, unknownToString } from "~/shared/utils/convert.util";
import { createConverter, createMapper } from "~/shared/utils/mapper.util";

export interface Problem {
    id: number;
    color: string;
    short_title: string;
    title: string;
    description_fr: string;
    description_en: string;
    time_limit: number;
    memory_limit: number;
}

export const mapProblem = createMapper<Problem>({
    id: createConverter(unknownToNumber, -1),
    color: createConverter(unknownToString, "#000000"),
    short_title: createConverter(unknownToString, ""),
    title: createConverter(unknownToString, ""),
    description_fr: createConverter(unknownToString, ""),
    description_en: createConverter(unknownToString, ""),
    time_limit: createConverter(unknownToNumber, 1000),
    memory_limit: createConverter(unknownToNumber, 256),
});

export interface Sample {
    id: number;
    input: string;
    output: string;
    explanation_fr?: string;
    explanation_en?: string;
}

export const mapSample = createMapper<Sample>({
    id: createConverter(unknownToNumber, -1),
    input: createConverter(unknownToString, ""),
    output: createConverter(unknownToString, ""),
    explanation_fr: createConverter(unknownToString, undefined),
    explanation_en: createConverter(unknownToString, undefined),
});

export interface Language {
    key: string;
    label: string;
    file_extension: string;
}

export const mapLanguage = createMapper<Language>({
    key: createConverter(unknownToString, ""),
    label: createConverter(unknownToString, ""),
    file_extension: createConverter(unknownToString, ""),
});

export interface SubmitStatus {
    id: number;
    name: string;
    description: string;
    color: string;
}

export const mapSubmitStatus = createMapper<SubmitStatus>({
    id: createConverter(unknownToNumber, -1),
    name: createConverter(unknownToString, ""),
    description: createConverter(unknownToString, ""),
    color: createConverter(unknownToString, "#000000"),
});

export interface Submit {
    status_id: number;
    submited_on: Date;
    language: Language["key"];
    submit_id: number;
}

export const mapSubmit = createMapper<Submit>({
    status_id: createConverter(unknownToNumber, -1),
    submited_on: createConverter(unknownToDate, new Date()),
    language: createConverter(unknownToString, ""),
    submit_id: createConverter(unknownToNumber, -1),
});
