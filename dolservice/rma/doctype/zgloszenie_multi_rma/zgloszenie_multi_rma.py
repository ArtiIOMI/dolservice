# Copyright (c) 2024, Artiom and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class ZgloszenieMultiRMA(Document):
	pass

@frappe.whitelist()
def split_rma_doc():
	frappe.msgprint(
		msg=doc.name,
		title='Error',
		raise_exception=FileNotFoundError
	)

@frappe.whitelist()
def testrma(test=None):
	frappe.msgprint(
		_("TEST"),
		alert=True,
		indicator="green"
	)

@frappe.whitelist()
def rename_doc(doctype, name, new_name):
	frappe.rename_doc(doctype, name, new_name, True)
	return True