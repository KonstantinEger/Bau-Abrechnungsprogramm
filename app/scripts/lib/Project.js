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
		this._id = genID();
		this._name = name;
		this._date = date;
		this._place = place;
		this._descr = description;
		this._brutto = brutto;
		this._materials = materials;
		this._hours = hours;
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
		+ `${this._id},${this._name},${this._date},${this._place},${this._descr},${this._brutto},---,---,---,---,---,\n`;

		for (let i = 0; i < Math.max(this._materials.length, this._hours.length); i++) {
			let str = ',,,,,,';

			if (this._materials[i] !== undefined) {
				str += `${this._materials[i].name},${this._materials[i].price},`;
			} else {
				str += '---,---,';
			}

			if (this._hours[i] !== undefined) {
				str += `${this._hours[i].type},${this._hours[i].amount},${this._hours[i].wage},\n`;
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
