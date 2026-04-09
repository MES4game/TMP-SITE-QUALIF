import { access, readdir, readFile } from 'fs/promises';
import { constants as fsConstants } from 'fs';
import yaml from 'yaml';
import { time } from 'console';
import { env } from '../config';

const PROBLEM_DIRECTORY = `${env.MOUNTED_FOLDER}/problems/`;

enum ProblemLanguage {
    CPP = 'cpp',
    PYTHON = 'python',
    JAVA = 'java',
    KOTLIN = 'kotlin',
}

function ParseProblemLanguage(lang: string): ProblemLanguage {
    switch (lang.toLowerCase()) {
        case 'c++':
        case 'cpp': return ProblemLanguage.CPP;
        case 'py':
        case 'python': return ProblemLanguage.PYTHON;
        case 'java': return ProblemLanguage.JAVA;
        case 'kt':
        case 'kotlin': return ProblemLanguage.KOTLIN;
        default: throw new Error(`Unsupported problem language: ${lang}`);
    }
}


interface ProblemResult {

}

interface CaseExecutionPath {
    path: string;
    type: 'in' | 'out' | 'jin';
}

interface CaseExecutionMap {
    caseId: string;
    paths: CaseExecutionPath[];
}

interface CaseExecutionData {
    caseId: string;
    input: string;
    output: string;
    jin?: string;
}

interface ProblemMap {
    problemId: string;
    dataYaml: string;
    validation: CaseExecutionMap[];
    performance: CaseExecutionMap[];
}

interface ProblemData {
    id: string;
    letter: string;
    time_limit_ms: number;
    memory_limit_kib: number;
    judge: {
        exist: boolean;
        language?: ProblemLanguage | undefined;
        error_code?: number | undefined;
        firewall?: string | undefined;
        source?: string | undefined;
    };
    validation_cases: CaseExecutionData[];
    performance_cases: CaseExecutionData[];   
}

interface YAMLProblemData {
        name: string;
        letter: string;
        time_limit_ms: number;
        memory_limit_MiB: number;
        judge_lang?: string;
        error_code?: number;
        firewall?: string;
}

const cachedProblemMap: Map<string, ProblemMap> = new Map();
const cachedProblems: Map<string, ProblemData> = new Map();

async function loadProblems(): Promise<void> {
    cachedProblemMap.clear();

    const problemIds = await readdir(PROBLEM_DIRECTORY);

    for (const problemId of problemIds) {
        const problemPath = `${PROBLEM_DIRECTORY}/${problemId}/`;

        if (! (await pathExists(problemPath))) continue;
        
        const dataYamlPath = `${problemPath}data.yaml`;

        if (!(await pathExists(dataYamlPath))) continue;

        const perfs: Map<string, string[]> = new Map();
        const valids: Map<string, string[]> = new Map();

        const performanceDir = `${problemPath}perf/`;
        const validationDir = `${problemPath}valid/`;

        const perfsList: CaseExecutionMap[] = [];
        const validsList: CaseExecutionMap[] = [];

        if (!(await pathExists(validationDir))) continue;

        for (const file of await readdir(validationDir)) {
            const validId = file.split('.').slice(0, -1).join('.');
            
            if (!valids.has(validId)) valids.set(validId, []);

            valids.get(validId)?.push(file);
        }

        for (const vk of valids.keys()) {
            const validFiles = valids.get(vk);
            if (!validFiles) continue;

            const files = validFiles.map(
                file => {
                    const path = `${validationDir}${file}`;
                    const type = file.endsWith('.in') ? 'in' : file.endsWith('.out') ? 'out' : file.endsWith('.jin') ? 'jin' : null;

                    if (!type) throw new Error(`Invalid file type for validation case: ${file}`);

                    return { path, type } as CaseExecutionPath;
                }
            );

            // check that there is only one .in, one .out, and optionally one .jin file
            const inCount = files.filter(f => f.type === 'in').length;
            const outCount = files.filter(f => f.type === 'out').length;
            const jinCount = files.filter(f => f.type === 'jin').length;

            if (inCount > 1 || outCount > 1 || jinCount > 1) {
                throw new Error(`Validation case ${vk} must have exactly one .in file, at most one .out file, and at most one .jin file.`);
            }

            validsList.push({ caseId: vk, paths: files });
        }

        if (await pathExists(performanceDir)) {
            for (const file of await readdir(performanceDir)) {
                const perfId = file.split('.').slice(0, -1).join('.');
                if (!perfs.has(perfId)) perfs.set(perfId, []);

                perfs.get(perfId)?.push(file);
            }

            for (const pk of perfs.keys()) {
                const perfFiles = perfs.get(pk);
                if (!perfFiles) continue;

                const files = perfFiles.map(
                    file => {
                        const path = `${performanceDir}${file}`;
                        const type = file.endsWith('.in') ? 'in' : file.endsWith('.out') ? 'out' : file.endsWith('.jin') ? 'jin' : null;

                        if (!type) throw new Error(`Invalid file type for performance case: ${file}`);

                        return { path, type } as CaseExecutionPath;
                    }
                );

                // check that there is only one .in, one .out, and optionally one .jin file
                const inCount = files.filter(f => f.type === 'in').length;
                const outCount = files.filter(f => f.type === 'out').length;
                const jinCount = files.filter(f => f.type === 'jin').length;

                if (inCount !== 1 || outCount > 1 || jinCount > 1) {
                    throw new Error(`Performance case ${pk} must have exactly one .in file, at most one .out file, and at most one .jin file.`);
                }

                perfsList.push({ caseId: pk, paths: files });
            }
        }

        cachedProblemMap.set(problemId, { problemId, dataYaml: dataYamlPath, validation: validsList, performance: perfsList });
        
    }
}

async function loadYaml(yamlPath: string): Promise<YAMLProblemData> {
    const fileContent = await readFile(yamlPath, 'utf-8');
    const data = yaml.parse(fileContent) as YAMLProblemData;

    return data;
}


async function pathExists(path: string): Promise<boolean> {
    try {
        await access(path, fsConstants.F_OK);
        return true;
    } catch {
        return false;
    }
}

async function getJudgeSource(problemDir: string): Promise<string | undefined> {
    const judgePath = `${problemDir}judge`;

    // find file with any extension that starts with "judge"
    const files = await readdir(problemDir);
    const judgeFile = files.find(file => file.startsWith('judge'));

    if (!judgeFile) return undefined;

    const judgeSource = await readFile(`${problemDir}${judgeFile}`, 'utf-8');
    return judgeSource;
}


async function retrieveProblem(problemId: string): Promise<ProblemData> {
    if (!cachedProblemMap.has(problemId)) {
        throw new Error(`Problem with id ${problemId} not found.`);
    }

    const problemMap = cachedProblemMap.get(problemId);
    if (!problemMap) throw new Error(`Problem with id ${problemId} not found in cache.`);

    if (cachedProblems.has(problemId)) {
        return cachedProblems.get(problemId) as ProblemData;
    }

    // Load the problem
    const dataYaml = await loadYaml(problemMap.dataYaml);

    const validationCases: CaseExecutionData[] = [];
    for (const valCase of problemMap.validation) {
        const caseData: CaseExecutionData = { caseId: valCase.caseId, input: '', output: '' };

        for (const path of valCase.paths) {
            const content = await readFile(path.path, 'utf-8');

            if (path.type === 'in') caseData.input = content;
            else if (path.type === 'out') caseData.output = content;
            else if (path.type === 'jin') caseData.jin = content;
        }

        validationCases.push(caseData);
    }

    const performanceCases: CaseExecutionData[] = [];
    for (const perfCase of problemMap.performance) {
        const caseData: CaseExecutionData = { caseId: perfCase.caseId, input: '', output: '' };

        for (const path of perfCase.paths) {
            const content = await readFile(path.path, 'utf-8');

            if (path.type === 'in') caseData.input = content;
            else if (path.type === 'out') caseData.output = content;
            else if (path.type === 'jin') caseData.jin = content;
        }

        performanceCases.push(caseData);
    }

    const problemData: ProblemData = {
        id: dataYaml.name,
        letter: dataYaml.letter,
        time_limit_ms: dataYaml.time_limit_ms,
        memory_limit_kib: dataYaml.memory_limit_MiB * 1024,
        judge: {
            exist: !!dataYaml.judge_lang,
            language: dataYaml.judge_lang ? ParseProblemLanguage(dataYaml.judge_lang) : undefined,
            error_code: dataYaml.error_code ?? undefined,
            firewall: dataYaml.firewall ?? undefined,
            source: dataYaml.judge_lang ? await getJudgeSource(`${PROBLEM_DIRECTORY}/${problemId}/`) : undefined,
        },
        validation_cases: validationCases,
        performance_cases: performanceCases,
    };

    cachedProblems.set(problemId, problemData);
    return problemData;

}

function buildUserPayload(userCode: string, language: ProblemLanguage): object {
    return {
        lang: language,
        source: userCode,
    }
}

function buildCompileExecutePayload(data: ProblemData): object {
    return {
        compile: {
            time: data.time_limit_ms,
            'wall-time': data.time_limit_ms,
            'extra-time': 0,
            mem: data.memory_limit_kib,
            'virt-mem': data.memory_limit_kib,
            processes: 1,
        },
        execute: {
            time: data.time_limit_ms,
            'wall-time': data.time_limit_ms,
            'extra-time': 0,
            mem: data.memory_limit_kib,
            'virt-mem': data.memory_limit_kib,
            processes: 1,
        }
    }
}

function buildJudgePayload(data: ProblemData): object {
    if (!data.judge.exist) return {};
    return {
        judge_lang: data.judge.language,
        judge_source: data.judge.source,
        judge_fault_exitcode: data.judge.error_code,
    }
}


function buildValidationCasesPayload(data: ProblemData): object[] {
    let judge: any = {
        judge: data.judge.exist
    }

    if (data.judge.exist) {
        judge['firewall_rules'] = {
            violation_action: 'STOP',
            max_total_bytes: 1024 * 1024 * 5, // 5 MiB
            max_line_length: 1024*1024*5, // 5 MiB 
        }

        if (data.judge.firewall) {
            judge['firewall_rules']['allowed_chars'] = data.judge.firewall;
        }
    }
    
    const casesPayload: object[] = [];

    for (const val of data.validation_cases) {
        let casePayload: any = {
            name: val.caseId,
            fatal: true,
            stdin: val.input,
            judge: JSON.parse(JSON.stringify(judge)), // Deep copy of judge object
        };

        if (judge.judge) {
            casePayload['judge']['stdin_judge'] = val.jin ? val.jin : '';
            casePayload['judge']['judge_execution'] = { // Make sure judge cannot stop execution due to time or memory limits
                time: data.time_limit_ms * 5,
                'wall-time': data.time_limit_ms * 5,
                'extra-time': 0,
                mem: data.memory_limit_kib * 5,
                'virt-mem': data.memory_limit_kib * 5,
                processes: 1,
            }
        }

        if (val.output) {
            casePayload['expected'] = val.output;
        }

        casesPayload.push(casePayload);
    }

    return casesPayload;
}

function buildPerformanceCasesPayload(data: ProblemData): object[] {
    const casesPayload: object[] = [];

    const judge: any = {
        judge: data.judge.exist
    }

    if (data.judge.exist) {
        judge['firewall_rules'] = {
            violation_action: 'STOP',
            max_total_bytes: 1024 * 1024 * 5, // 5 MiB
            max_line_length: 1024*1024*5, // 5 MiB 
        }

        if (data.judge.firewall) {
            judge['firewall_rules']['allowed_chars'] = data.judge.firewall;
        }
    }

    for (const perf of data.performance_cases) {
        let casePayload: any = {
            name: perf.caseId,
            fatal: false,
            stdin: perf.input,
            judge: JSON.parse(JSON.stringify(judge)) // Deep copy of judge object
        };

        if (judge.judge) {
            casePayload['judge']['stdin_judge'] = perf.jin ? perf.jin : '';
            casePayload['judge']['judge_execution'] = { // Make sure judge cannot stop execution due to time or memory limits
                time: data.time_limit_ms * 5,
                'wall-time': data.time_limit_ms * 5,
                'extra-time': 0,
                mem: data.memory_limit_kib * 5,
                'virt-mem': data.memory_limit_kib * 5,
                processes: 1,
            }
        }

        if (perf.output) {
            casePayload['expected'] = perf.output;
        }

        casesPayload.push(casePayload);
    }

    return casesPayload;
}


async function executeProblem(userCode: string, language: ProblemLanguage, problemId: string): Promise<ProblemResult> {
    const problemData = await retrieveProblem(problemId);

    const userPayload = buildUserPayload(userCode, language);
    const compileExecutePayload = buildCompileExecutePayload(problemData);
    const judgePayload = buildJudgePayload(problemData);

    const validationCasesPayload = buildValidationCasesPayload(problemData);
    const performanceCasesPayload = buildPerformanceCasesPayload(problemData);


    const payload =  {
        ...userPayload,
        ...compileExecutePayload,
        ...judgePayload,
        tests: [
            ...validationCasesPayload,
            ...performanceCasesPayload
        ]
    }

    // post payload to camisole and return the result
    const response = await fetch(env.CAMISOLE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        throw new Error(`Failed to execute problem: ${response.statusText}`);
    }

    const result = await response.json();

    // Process the result as needed and return a ProblemResult object
    return result as ProblemResult;
}

function getCachedProblems(): Map<string, ProblemData> {
    return cachedProblems;
}

function getCachedProblemMap(): Map<string, ProblemMap> {
    return cachedProblemMap;
}

export { loadProblems, retrieveProblem, executeProblem, ParseProblemLanguage, ProblemLanguage, getCachedProblems, getCachedProblemMap };
