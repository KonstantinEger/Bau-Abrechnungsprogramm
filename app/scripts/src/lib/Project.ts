import { throwFatalErr } from './errors';

/**
 * Generates a unique ID with the format `xxxxx-xxxxx-xxxxx` of letters and numbers.
 */
function genID(): string {
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
function splitCSVstring(str: string): string[] {
    const regexp = /(".*?"|[^",\s]+)(?=\s*,|\s*$)/g;
    const arr: string[] = [];
    let res: RegExpExecArray | null;
    while ((res = regexp.exec(str)) !== null) {
        arr.push(res[0].replace(/(?:^")|(?:"$)/g, ''));
    }
    return arr;
}

export type Material = { name: string, receiptID: string, price: string };
export type Worker = { type: string, wage: number, amount: number };

interface ProjectConstructorParams {
    name: string,
    date: string,
    place: string,
    description: string,
    brutto: number,
    shouldGenID: boolean
    materials?: Material[],
    hours?: Worker[],
}

export class Project {
    public id: string;
    public name: string;
    public date: string;
    public place: string;
    public descr: string;
    public brutto: number;
    public materials: Material[];
    public hours: Worker[];

    public constructor(params: ProjectConstructorParams) {
        this.id = params.shouldGenID ? genID() : '';
        this.name = params.name;
        this.date = params.date;
        this.place = params.place;
        this.descr = params.description;
        this.brutto = params.brutto;
        this.materials = params.materials ?? [];
        this.hours = params.hours ?? [];
    }

    /** Creates a string with the Project info in CSV format. */
    public toCSV(): string {
        /* --- values will be skipped when parsing the csv back into a Project
         * filling the last 5 cells with --- now makes for an easier logic to
         * create the CSV string. Its also necessary for the splitCSVstring
         * funktion to work.
        */
        let result = 'id,name,date,place,description,brutto,m-names,m-receipt-ids,m-prices,h-types,h-amounts,h-wages,\n'
            + `${this.id},"${this.name}",${this.date},"${this.place}","${this.descr}",${this.brutto},---,---,---,---,---,---,\n`;

        for (let idx = 0; idx < Math.max(this.materials.length, this.hours.length); idx++) {
            let str = ',,,,,,';

            if (this.materials[idx] !== undefined) {
                str += `"${this.materials[idx].name}","${this.materials[idx].receiptID}",${this.materials[idx].price},`;
            } else {
                str += '---,---,---,';
            }

            if (this.hours[idx] !== undefined) {
                str += `"${this.hours[idx].type}",${this.hours[idx].amount},${this.hours[idx].wage},\n`;
            } else {
                str += '---,---,---,\n';
            }

            result += str;
        }

        return result;
    }

    /**
     * Saves a project string and optionally a file path in session storage, which can
     * then be loaded through the static function `Project.getCurrentProject()`. This
     * function internally generates a csv string from the project instance. **To
     * avoid this, pass a `csvString` in the object parameter to the function.** If
     * the `filePath` is undefined, the current state will not get altered.
     */
    public saveToSessionStorage({
        csvString,
        filePath
    }: {
        csvString?: string,
        filePath?: string
    } = {}): string {
        const csv = csvString ?? this.toCSV();
        sessionStorage.setItem('CURRENT_PROJ', csv);
        if (filePath)
            sessionStorage.setItem('CURRENT_PROJ_LOC', filePath);
        return csv;
    }

    /** Parses a string (e.g. read from a CSV file) into a new Project instance. */
    public static fromCSV(source: string): Project {
        const data = splitCSVstring(source).slice(12);
        const project = new Project({
            name: data[1],
            date: data[2],
            place: data[3],
            description: data[4],
            brutto: parseFloat(data[5]),
            shouldGenID: false
        });
        project.id = data[0];

        const matAndHoursArray = data.slice(12);
        for (let idx = 0; idx < matAndHoursArray.length; idx += 6) {
            if (matAndHoursArray[idx] !== '---') {
                project.materials.push({
                    name: matAndHoursArray[idx],
                    receiptID: matAndHoursArray[idx + 1],
                    price: matAndHoursArray[idx + 2]
                });
            }
            if (matAndHoursArray[idx + 3] !== '---') {
                project.hours.push({
                    type: matAndHoursArray[idx + 3],
                    amount: parseFloat(matAndHoursArray[idx + 4]),
                    wage: parseFloat(matAndHoursArray[idx + 5])
                });
            }
        }

        return project;
    }

    /**
     * Returns the current project saved in session storage and the location
     * of the project file. If one of them is not found, throws an fatal error.
     */
    public static getCurrentProject(): { project: Project, filePath: string } {
        const csv = sessionStorage.getItem('CURRENT_PROJ');
        const filePath = sessionStorage.getItem('CURRENT_PROJ_LOC');
        if (!csv || !filePath) {
            throwFatalErr('Internal Error', 'Es ist ein interner Fehler beim laden des aktuellen Projektes aufgetreten.');
        }
        return {
            project: Project.fromCSV(csv),
            filePath
        };
    }
}
