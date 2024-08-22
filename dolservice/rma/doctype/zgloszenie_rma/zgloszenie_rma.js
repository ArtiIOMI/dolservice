// Copyright (c) 2024, Artiom and contributors
// For license information, please see license.txt

frappe.ui.form.on("Zgloszenie RMA", {
	refresh(frm) {
        
	},
    onload: function(frm) {
        frm.set_df_property('otrzymano_na_magazynie', 'reqd', 'true');
        frm.set_df_property('podmiot', 'reqd', 'true');
        frm.set_df_property('nazwa_firmy', 'reqd', 'true');
        frm.set_df_property('email', 'reqd', 'true');
        frm.set_df_property('serwisowane_urządzenia', 'reqd', 'true');

        //const tour_name = 'Poradnik Zgłoszenia RMA';
        //frm.tour.init({ tour_name }).then(() => frm.tour.start());
    },
});