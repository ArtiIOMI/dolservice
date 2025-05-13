frappe.ready(function() {
	frappe.web_form.fields_dict['serwisowane_urządzenia'].grid.update_docfield_property('child_rma', 'hidden', 1);

	setTimeout(() => {
		remove_df_Link();
		document.querySelector('[data-fieldname="serwisowane_urządzenia"]').querySelector('.grid-add-row').addEventListener("click", function () {
			// Poczekaj aż Frappe doda wiersz
			remove_df_Link();
		});
    }, 210);
})

function remove_df_Link(){
	document.querySelector('[data-fieldname="serwisowane_urządzenia"]').querySelector('[data-fieldname="child_rma"]').style.display = "none";

	var rows = document.querySelector('[data-fieldname="serwisowane_urządzenia"]').querySelector('.grid-body').querySelectorAll('.data-row');
	rows.forEach(row =>{
		row.querySelector('[data-fieldname="child_rma"]').style.display = "none";
	})
}