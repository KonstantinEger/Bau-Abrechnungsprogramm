/**
 * Generates a unique ID with the format `xxxxx-xxxxx-xxxxx` of letters and numbers.
 * @returns {string} ID
 */
function genID() {
	const s5 = () => Math.floor((1 + Math.random()) * 0x100000).toString(16).substring(1);

	return `${s5()}-${s5()}-${s5()}`;
}

class Project {
	/**
	 * @param {string} id Project-ID
	 * @param {string} name Projectname
	 * @param {string} date Date of creation (by User input)
	 * @param {string} place
	 * @param {string} description Project description
	 * @param {number} brutto Brutto total
	 * @param {Array<{ name: string; price: string }>} materials
	 * @param {Array<{ type: string; amount: number; wage: number }>} hours
	 */
	constructor(name, date, place, description, brutto, materials = [], hours = []) {
		this.id = genID();
		this.name = name;
		this.date = date;
		this.place = place;
		this.descr = description;
		this.brutto = brutto;
		this.materials = materials;
		this.hours = hours;
	}

	/**
	 * Creates a string with the Project info in CSV format
	 * for saving it to disk.
	 * @returns {string} String in CSV format
	 */
	toCSV() {
		// --- values will be skipped when parsing the csv back into a Project
		// filling the last 5 cells with --- now makes for an easier logic to
		// create the CSV string. This could be optimized later but for now this
		// is a solution for ease of use.
		let result = 'id,name,date,place,description,brutto,m-names,m-prices,h-types,h-amounts,h-wages,\n'
		+ `${this.id},${this.name},${this.date},${this.place},${this.descr},${this.brutto},---,---,---,---,---,\n`;

		for (let i = 0; i < Math.max(this.materials.length, this.hours.length); i++) {
			let str = ',,,,,,';

			if (this.materials[i] !== undefined) {
				str += `${this.materials[i].name},${this.materials[i].price},`;
			} else {
				str += '---,---,';
			}

			if (this.hours[i] !== undefined) {
				str += `${this.hours[i].type},${this.hours[i].amount},${this.hours[i].wage},\n`;
			} else {
				str += '---,---,---,\n';
			}

			result += str;
		}

		return result;
	}

	/**
	 * Parses a string e.g. read from a CSV file into a new
	 * Project instance.
	 * @param {string} source Source string read from CSV file
	 * @returns {Project} new Project
	 */
	static fromCSV(source) {
		console.warn('Project::fromCSV not implemented yet!');
	}
}

module.exports = {
	Project
};
