// Copyright (c) 2024, a.lorkowski@dolservice.pl and contributors
// For license information, please see license.txt

frappe.query_reports["Opisy dla dostawcy"] = {
	"filters": [
		{
			"fieldname": "dostawa",
			"label": __("Dostawa"),
			"fieldtype": "Link",
			"options": "Purchase Receipt",
			"width": 100,
			"reqd": 0,
			"default": ""
		}
	]
};