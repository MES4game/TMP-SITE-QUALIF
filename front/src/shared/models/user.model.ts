import { unknownToDate, unknownToNumber, unknownToString, unknownToBoolean } from "~/shared/utils/convert.util";
import { createConverter, createMapper } from "~/shared/utils/mapper.util";

export interface User {
    id: number;
    email: string;
    pseudo: string;
    firstname: string;
    lastname: string;
    created_on: Date;
    last_connection: Date;
    deleted_on: Date;
    verified_email: boolean;
}

export const mapUser = createMapper<User>({
    id: createConverter(unknownToNumber, -1),
    email: createConverter(unknownToString, ""),
    pseudo: createConverter(unknownToString, ""),
    firstname: createConverter(unknownToString, ""),
    lastname: createConverter(unknownToString, ""),
    created_on: createConverter(unknownToDate, new Date()),  // eslint-disable-line @typescript-eslint/naming-convention
    last_connection: createConverter(unknownToDate, new Date()),  // eslint-disable-line @typescript-eslint/naming-convention
    deleted_on: createConverter(unknownToDate, new Date(0)), // eslint-disable-line @typescript-eslint/naming-convention
    verified_email: createConverter(unknownToBoolean, false),    // eslint-disable-line @typescript-eslint/naming-convention
});
