import { throwFatalErr } from './errors';
import { writeFile } from 'fs';

/**
 * Generates a unique ID with the format `xxxxx-xxxxx-xxxxx` of letters and numbers.
 */
function genId(): string {
    const s5 = () => Math.floor((1 + Math.random()) * 0x100000).toString(16).substring(1);

    return `${s5()}-${s5()}-${s5()}`;
}

/**
 * Splits an input string at "," while also regarding starting
 * and end quotes, where commas should be ignored.
 * ### Note
 * This function only works when there ar no empty fields like:
 * `Hello,,World,`. Empty fields are ignored. It should be changed
 * to `Hello,---,World`
 *
 * ### Example
 * ```js
 * let str = `Hello,World,"Hello,World"`;
 * let result = splitCSVstring(str);
 * assert(result, ['Hello', 'World', 'Hello,World']);
 * ```
 *
 * Whitespace at front and end of a field are removed:
 * ```js
 * let str = 'Hello, World';
 * assert(splitCSVstring(str), ['Hello', 'World']);
 * ```
 *
 * Empty fields are removed:
 * ```js
 * let str = 'Hello,,World';
 * assert(splitCSVstring(str), ['Hello', 'World']);
 * ```
 *
 * ### Source
 * Shamelessly ripped of the internet. Original by
 * [martinp999](https://stackoverflow.com/users/580772/martinp999) from a comment to
 * [this answer](https://stackoverflow.com/a/11457952) on stack overflow.
 */
function splitCsvString(str: string): string[] {
    const regexp = /(".*?"|[^",\s]+)(?=\s*,|\s*$)/g;
    const arr: string[] = [];
    let res: RegExpExecArray | null;
    while ((res = regexp.exec(str)) !== null) {
        arr.push(res[0].replace(/(?:^")|(?:"$)/g, ''));
    }
    return arr;
}

export type Material = { name: string; receiptId: string; price: string };
export type Worker = { type: string; wage: number; numHours: number };

interface ProjectConstructorParams {
    name: string;
    date: string;
    place: string;
    description: string;
    brutto: number;
    shouldGenId: boolean;
    materials?: Material[];
    workers?: Worker[];
}

interface SaveProjectOptions {
    /** If saving to disk should be skipped. */
    skipDisk?: boolean;
    /** When specified will save this string to disk rather then generating one. */
    otherCsv?: string;
}

/**
 * Class representing a project object. Combines functionality to parse and
 * save the project to disk in csv format.
 */
export class Project {
    private static storageKeys = {
        project: 'CURRENT_PROJ',
        filepath: 'CURRENT_PROJ_LOC'
    } as const;

    public id: string;
    public name: string;
    public date: string;
    public place: string;
    public descr: string;
    public brutto: number;
    public materials: Material[];
    public workers: Worker[];

    /** Constructs a new `Project` instance */
    public constructor(params: ProjectConstructorParams) {
        this.id = params.shouldGenId ? genId() : '';
        this.name = params.name;
        this.date = params.date;
        this.place = params.place;
        this.descr = params.description;
        this.brutto = params.brutto;
        this.materials = params.materials ?? [];
        this.workers = params.workers ?? [];
    }

    /** Parses a string (e.g. read from a CSV file) into a new Project instance. */
    public static fromCsv(source: string): Project {
        const data = splitCsvString(source).slice(12);
        const project = new Project({
            name: data[1],
            date: data[2],
            place: data[3],
            description: data[4],
            brutto: parseFloat(data[5]),
            shouldGenId: false
        });
        project.id = data[0];

        const matAndWorkersArray = data.slice(12);
        for (let idx = 0; idx < matAndWorkersArray.length; idx += 6) {
            if (matAndWorkersArray[idx] !== '---') {
                project.materials.push({
                    name: matAndWorkersArray[idx],
                    receiptId: matAndWorkersArray[idx + 1],
                    price: matAndWorkersArray[idx + 2]
                });
            }
            if (matAndWorkersArray[idx + 3] !== '---') {
                project.workers.push({
                    type: matAndWorkersArray[idx + 3],
                    numHours: parseFloat(matAndWorkersArray[idx + 4]),
                    wage: parseFloat(matAndWorkersArray[idx + 5])
                });
            }
        }

        return project;
    }

    /**
     * ! Deprecated
     * Returns the current project saved in session storage and the location
     * of the project file. If one of them is not found, throws an fatal error.
     */
    public static getCurrentProject(): { project: Project; filePath: string } {
        const csv = sessionStorage.getItem(Project.storageKeys.project);
        const filePath = sessionStorage.getItem(Project.storageKeys.filepath);
        if (!csv || !filePath) {
            throwFatalErr('Internal Error', 'Es ist ein interner Fehler beim laden des aktuellen Projektes aufgetreten.');
        }
        return {
            project: Project.fromCsv(csv),
            filePath
        };
    }

    /** Creates a string with the Project info in CSV format. */
    public toCsv(): string {
        /* --- values will be skipped when parsing the csv back into a Project
         * filling the last 6 cells with --- now makes for an easier logic to
         * create the CSV string. Its also necessary for the splitCSVstring
         * funktion to work.
        */
        let result = 'id,name,date,place,description,brutto,m-names,m-receipt-ids,m-prices,w-types,w-num-hours,w-wages,\n'
            + `${this.id},"${this.name}",${this.date},"${this.place}","${this.descr}",${this.brutto},---,---,---,---,---,---,\n`;

        for (let idx = 0; idx < Math.max(this.materials.length, this.workers.length); idx++) {
            let str = ',,,,,,';

            if (this.materials[idx] !== undefined) {
                str += `"${this.materials[idx].name}","${this.materials[idx].receiptId}",${this.materials[idx].price},`;
            } else {
                str += '---,---,---,';
            }

            if (this.workers[idx] !== undefined) {
                str += `"${this.workers[idx].type}",${this.workers[idx].numHours},${this.workers[idx].wage},\n`;
            } else {
                str += '---,---,---,\n';
            }

            result += str;
        }

        return result;
    }

    /**
     * Saves the Project instance to `SessionStorage` _and_ to `Disk` with the provided
     * filePath parameter. It returns the CSV string generated by the method asynchronuosly.
     */
    public save(filePath: string, opts?: SaveProjectOptions): Promise<string> {
        return new Promise((resolve) => {
            const csv = opts?.otherCsv ?? this.toCsv();
            if (!csv) { //TODO: Testing required if this fixes #55
                throwFatalErr('Interner Fehler', 'Konnte das Projekt nicht speichern. Bitte App neu laden');
            }
            if (opts?.skipDisk === true) resolve(csv);
            else {
                writeFile(filePath, csv, { encoding: 'utf8' }, (error) => {
                    if (!error) resolve(csv);
                    else throwFatalErr(`FS-Fehler [${error.code}]`, error.message);
                });
            }
        });
    }
}
