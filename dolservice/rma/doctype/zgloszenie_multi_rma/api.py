import frappe
from frappe import _

@frappe.whitelist()
def udostepnij_dokument(docname, user):
    if not frappe.has_permission("Zgloszenie RMA", "share", doc=docname):
        return (_("Nie masz uprawnień do udostępniania tego dokumentu."))

    already_shared = frappe.db.exists(
        "DocShare",
        {
            "share_doctype": "Zgloszenie RMA",
            "share_name": docname,
            "user": user
        }
    )

    if already_shared:
        return _("<color=red>Dokument {0} jest już udostępniony użytkownikowi {1}.</color>").format(docname, user)

    frappe.share.add("Zgloszenie RMA", docname, user, read=1)
    return _("Dokument {0} udostępniony użytkownikowi {1}").format(docname, user)