// Copyright (c) 2024, Artiom and contributors
// For license information, please see license.txt

frappe.query_reports["Opisy ze szczegolami"] = {
	"filters": [
		{
			"fieldname": "from_date",
			"label": __("Start Date"),
			"fieldtype": "Date",
			"reqd": 1,
			"default": frappe.datetime.add_months(frappe.datetime.get_today(), -1),
		},
		{
			"fieldname": "to_date",
			"label": __("End Date"),
			"fieldtype": "Date",
			"reqd": 1,
			"default": frappe.datetime.get_today(),
		},
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
				'',
				'Inne',
				'PL'
				],
		}
	]
};
