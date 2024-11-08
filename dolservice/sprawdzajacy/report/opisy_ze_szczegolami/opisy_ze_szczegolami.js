// Copyright (c) 2024, Artiom and contributors
// For license information, please see license.txt

frappe.query_reports["Opisy ze szczegółami"] = {
	"filters": [
		{
			"fieldname": "grade_matrycy",
			"label": __("Matryca"),
			"fieldtype": "Select",
			"width": 50,
			"reqd": 0,
			"default": "",
			"options": [
				'',
				'A',
				'A-',
				'B',
				'C'
				],
		},
		{
			"fieldname": "grade_obudowy",
			"label": __("Obudowa"),
			"fieldtype": "Select",
			"width": 50,
			"reqd": 0,
			"default": "",
			"options": [
				'',
				'A',
				'A-',
				'B',
				'C'
				],
		},
		{
			"fieldname": "uklad_klawiatury",
			"label": __("Układ Klaw."),
			"fieldtype": "Select",
			"width": 50,
			"reqd": 0,
			"default": "",
			"options": [
				'Inne',
				'PL'
				],
		},
		{
			"fieldname": "modified",
			"label": __("Zmienione"),
			"fieldtype": "Date",
			"width": 50,
			"reqd": 0,
			"default": "",
		}
	]
};
