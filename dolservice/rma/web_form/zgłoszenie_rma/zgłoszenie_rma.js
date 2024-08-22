frappe.ready(function() {
	frappe.web_form.validate = () => {
		let error = false;
		if(!frappe.web_form.get_value('regulamin')){
			frappe.msgprint('Aby zgłosić RMA, musisz zatwierdzić Regulamin!');
			error = true;
		}
		if(!frappe.web_form.get_value('dane_osobowe')){
			frappe.msgprint('Aby zgłosić RMA, musisz wyrazić zgodę Danych Osobowych!');
			error = true;
		}
		if(!frappe.web_form.get_value('email').includes('@')){
			frappe.msgprint('Adres E-Mail jest nie prawdziwy!');
			error = true;
		}
		if(frappe.web_form.get_value('telefon_kontaktowy').length < 9){
			frappe.msgprint('Numer telefonu jest za krótki!');
			error = true;
		}

		if(error){
			return false;
		}
	}
})