// Copyright (c) 2024, Artiom and contributors
// For license information, please see license.txt

frappe.ui.form.on("Zgloszenie RMA", {
	refresh(frm) {
        
	},
    onload: function(frm) {
        //frm.set_df_property('otrzymano_na_magazynie', 'reqd', 'true');
        frm.set_df_property('podmiot', 'reqd', 'true');
        frm.set_df_property('nazwa_firmy', 'reqd', 'true');
        frm.set_df_property('email', 'reqd', 'true');
        frm.set_df_property('serwisowane_urządzenia', 'reqd', 'true');

		if(frm.doc.creation < "2024-10-23")
		frm.set_df_property('serwisowane_urządzenia', 'hidden', true);

        //const tour_name = 'Poradnik Zgłoszenia RMA';
        //frm.tour.init({ tour_name }).then(() => frm.tour.start());
    },
    workflow_state: function(frm) {
	if(frm.doc.workflow_state == "Przyjęta"){
		frm.set_value('otrzymano_na_magazynie', frappe.datetime.now_datetime())
	}
	if(frm.doc.workflow_state == "Na Serwisie"){
		frm.set_value('otrzymano_na_serwisie', frappe.datetime.now_datetime())
	}
	if(frm.doc.workflow_state == "W Pakowni"){
		frm.set_value('wydane_z_serwisu', frappe.datetime.now_datetime());
	}
	if(frm.doc.workflow_state == "W Pakowni"){
		frm.set_value('wydane_z_serwisu', frappe.datetime.now_datetime());
	}
    },
});
