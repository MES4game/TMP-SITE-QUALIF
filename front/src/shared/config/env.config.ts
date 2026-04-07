import { unknownToBoolean, unknownToString, unknownToNumber } from "~/shared/utils/convert.util";
import { createConverter, createMapper } from "~/shared/utils/mapper.util";

interface IEnv {
    dev: boolean;
    host: string;
    api_url: string;
    error_malus: number;
}

const mapEnv = createMapper<IEnv>({
    dev: createConverter(unknownToBoolean, false),
    host: createConverter(unknownToString, "127.0.0.1"),
    api_url: createConverter(unknownToString, "http://127.0.0.1/api"),
    error_malus: createConverter(unknownToNumber, 20),
});

export const ENV = mapEnv(await (await fetch("/config.json")).json());
