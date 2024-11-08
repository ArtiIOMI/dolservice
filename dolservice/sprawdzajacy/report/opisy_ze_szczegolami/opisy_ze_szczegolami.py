# Copyright (c) 2024, Artiom and contributors
# For license information, please see license.txt

import frappe

def execute(filters=None):
	columns = get_columns(filters)
	data = get_data(filters)

	return columns, data

def get_data(filters=None):
	data = []
	
	opisy = frappe.get_all(
		"Opis Asortymentu", 
		fields=[
			"name", 
			"dostawa", 
			"dotykowa_matryca", 
			"grade_matrycy", 
			"grade_obudowy", 
			"item_name", 
			"nr_seryjny", 
			"uklad_klawiatury", 
			"podswietlana_klawiatura", 
			"trackpoint",
			"modified",
		],
		filters={
			"grade_matrycy": filters.grade_matrycy, 
			"grade_obudowy": filters.grade_obudowy,
			"uklad_klawiatury": filters.uklad_klawiatury,
			"modified": ['between', [filters.from_date, filters.to_date]]
			}
	)

	for opis in opisy:
		row = {
			"name": opis.name,
			"dostawa": opis.dostawa,
			"dotykowa_matryca": opis.dotykowa_matryca,
			"grade_matrycy": opis.grade_matrycy,
			"grade_obudowy": opis.grade_obudowy,
			"item_name": opis.item_name,
			"nr_seryjny": opis.nr_seryjny,
			"uklad_klawiatury": opis.uklad_klawiatury,
			"podswietlana_klawiatura": opis.podswietlana_klawiatura,
			"trackpoint": opis.trackpoint,
			"modified": opis.modified
		}

		tabKon = frappe.get_all(
			"Konfiguracja asortymentu",
			fields=["komponent", "opis_konfiguracji"],
			filters={"parent": opis.name},
		)

		row["procesor"] = podajWartosc("Procesor", tabKon)
		row["ram"] = podajWartosc("RAM", tabKon)
		row["dysk"] = podajWartosc("Dysk", tabKon)
		row["matryca"] = podajWartosc("Matryca", tabKon)
		row["grafika"] = podajWartosc("Grafika", tabKon)
		row["bateria_nr1"] = podajWartosc("Bateria Nr. 1", tabKon)
		row["bateria_nr2"] = podajWartosc("Bateria Nr. 2", tabKon)

		row["uszkodzenia"] = ""

		tabUsz = frappe.get_all(
			"Uszkodzenia asortymentu",
			fields=["nazwa_uszkodzenia", "opis"],
			filters={"parent": opis.name},
		)

		tabUst = frappe.get_all(
			"Uwagi do asortymentu",
			fields=["element_obudowy", "opis"],
			filters={"parent": opis.name},
		)

		for tab in tabUsz:
			row["uszkodzenia"] = f'{row["uszkodzenia"]}{tab["nazwa_uszkodzenia"]}: {tab["opis"]}; '


		for tab in tabUst:
			row["uszkodzenia"] = f'{row["uszkodzenia"]}{tab["element_obudowy"]}: {tab["opis"]}; '
			

		data.append(row)
	
	return data

def get_columns(filters=None):
	columns = [
		{
		"label": "Doc",
		"fieldname": "name",
		"fieldtype": "Link",
		"options": "Opis Asortymentu",
		},
		{
		"label": "Nr Seryjny",
		"fieldname": "nr_seryjny",
		"fieldtype": "Data",
		},
		{
		"label": "Dostawca",
		"fieldname": "dostawa",
		"fieldtype": "Link",
		"options": "Purchase Receipt",
		},
		{
		"label": "Model",
		"fieldname": "item_name",
		"fieldtype": "Link",
		"options" : "Item",
		},
		{
		"label": "Procesor",
		"fieldname": "procesor",
		"fieldtype": "Data",
		},
		{
		"label": "RAM",
		"fieldname": "ram",
		"fieldtype": "Data",
		},
		{
		"label": "Dysk",
		"fieldname": "dysk",
		"fieldtype": "Data",
		},
		{
		"label": "Matryca",
		"fieldname": "matryca",
		"fieldtype": "Data",
		},
		{
		"label": "Grafika",
		"fieldname": "grafika",
		"fieldtype": "Data",
		},
		{
		"label": "Dotyk",
		"fieldname": "dotykowa_matryca",
		"fieldtype": "Check",
		},
		{
		"label": "Gr. Matrycy",
		"fieldname": "grade_matrycy",
		"fieldtype": "Data",
		},
		{
		"label": "Gr. Obudowy",
		"fieldname": "grade_obudowy",
		"fieldtype": "Data",
		},
		{
		"label": "Bateria Nr. 1",
		"fieldname": "bateria_nr1",
		"fieldtype": "Data",
		},
		{
		"label": "Bateria Nr. 2",
		"fieldname": "bateria_nr2",
		"fieldtype": "Data",
		},
		{
		"label": "Uklad Klaw.",
		"fieldname": "uklad_klawiatury",
		"fieldtype": "Data",
		},
		{
		"label": "Podś. Klaw.",
		"fieldname": "podswietlana_klawiatura",
		"fieldtype": "Check",
		},
		{
		"label": "TrackPoint",
		"fieldname": "trackpoint",
		"fieldtype": "Check",
		},
		{
		"label": "Uszkodzenia",
		"fieldname": "uszkodzenia",
		"fieldtype": "Data",
		},
		{
		"label": "Zmodyfikowano",
		"fieldname": "modified",
		"fieldtype": "Datetime",
		},
	]
	return columns

def podajWartosc(klucz, tabela):
    for tab in tabela:
        if tab.komponent.lower() == klucz.lower():
            return tab.opis_konfiguracji
