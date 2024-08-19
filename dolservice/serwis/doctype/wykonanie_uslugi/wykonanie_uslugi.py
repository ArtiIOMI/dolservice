# Copyright (c) 2024, a.lorkowski@dolservice.pl and contributors
# For license information, please see license.txt

import frappe
#from frappe import _
from frappe.model.document import Document

class WykonanieUslugi(Document):
	pass


@frappe.whitelist()
def rename_doc(doctype, name, new_name):
	frappe.rename_doc(doctype, name, new_name, True)
	return True