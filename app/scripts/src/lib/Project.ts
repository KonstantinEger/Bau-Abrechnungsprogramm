import { throwFatalErr } from "./errors";

/**
 * Generates a unique ID with the format `xxxxx-xxxxx-xxxxx` of letters and numbers.
 */
function genID(): string {
    const s5 = () => Math.floor((1 + Math.random()) * 0x100000).toString(16).substring(1);

    return "" + s5() + "-" + s5() + "-" + s5();
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
 * Shamelessly ripped of the internet. Original by [martinp999](https://stackoverflow.com/users/580772/martinp999)
 * from a comment to [this answer](https://stackoverflow.com/a/11457952) on stack overflow.
 */
function splitCSVstring(str: string): string[] {
    const regexp = /(".*?"|[^",\s]+)(?=\s*,|\s*$)/g;
    const arr: string[] = [];
    let res: RegExpExecArray | null;
    while ((res = regexp.exec(str)) !== null) { arr.push(res[0].replace(/(?:^")|(?:"$)/g, '')); }
    return arr;
}

export type Material = { name: string, receiptID: string, price: string };
export type Worker = { type: string, wage: number, amount: number };

export class Project {
    id: string;
    name: string;
    date: string;
    place: string;
    descr: string;
    brutto: number;
    materials: Material[];
    hours: Worker[];

    constructor(
        name: string,
        date: string,
        place: string,
        description: string,
        brutto: number,
        materials: Material[] = [],
        hours: Worker[] = [],
        generateID = true
    ) {
        this.id = generateID ? genID() : '';
        this.name = name;
        this.date = date;
        this.place = place;
        this.descr = description;
        this.brutto = brutto;
        this.materials = materials;
        this.hours = hours;
    }

    /** Creates a string with the Project info in CSV format. */
    toCSV(): string {
        // --- values will be skipped when parsing the csv back into a Project
        // filling the last 5 cells with --- now makes for an easier logic to
        // create the CSV string. Its also necessary for the splitCSVstring
        // funktion to work.
        let result = 'id,name,date,place,description,brutto,m-names,m-receipt-ids,m-prices,h-types,h-amounts,h-wages,\n'
            + `${this.id},"${this.name}",${this.date},"${this.place}","${this.descr}",${this.brutto},---,---,---,---,---,---,\n`;

        for (let i = 0; i < Math.max(this.materials.length, this.hours.length); i++) {
            let str = ',,,,,,';

            if (this.materials[i] !== undefined) {
                str += `"${this.materials[i].name}","${this.materials[i].receiptID}",${this.materials[i].price},`;
            } else {
                str += '---,---,---,';
            }

            if (this.hours[i] !== undefined) {
                str += `"${this.hours[i].type}",${this.hours[i].amount},${this.hours[i].wage},\n`;
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
    saveToSessionStorage({
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

    /**
     * Parses a string (e.g. read from a CSV file) into a new
     * Project instance.
     */
    static fromCSV(source: string): Project {
        const data = splitCSVstring(source).slice(12);
        const project = new Project(data[1], data[2], data[3], data[4], parseFloat(data[5]), [], [], false);
        project.id = data[0];

        const matAndHoursArray = data.slice(12);
        for (let i = 0; i < matAndHoursArray.length; i += 6) {
            if (matAndHoursArray[i] !== '---') {
                project.materials.push({
                    name: matAndHoursArray[i],
                    receiptID: matAndHoursArray[i + 1],
                    price: matAndHoursArray[i + 2],
                });
            }
            if (matAndHoursArray[i + 3] !== '---') {
                project.hours.push({
                    type: matAndHoursArray[i + 3],
                    amount: parseFloat(matAndHoursArray[i + 4]),
                    wage: parseFloat(matAndHoursArray[i + 5])
                });
            }
        }

        return project;
    }

    /**
     * Returns the current project saved in session storage and the location
     * of the project file. If one of them is not found, throws an fatal error.
     */
    static getCurrentProject(): { project: Project, filePath: string } {
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
