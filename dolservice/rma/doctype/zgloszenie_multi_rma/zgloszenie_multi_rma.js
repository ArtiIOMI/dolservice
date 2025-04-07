// Copyright (c) 2024, Artiom and contributors
// For license information, please see license.txt

frappe.ui.form.on("Zgloszenie Multi-RMA", {
	refresh(frm) {
        frm.add_custom_button(__("Podziel RMA"), function(){
            frm.call({
                method: "split_rma_doc",
                callback: function(r) 
                { 
                   if(r.message){
                      frappe.throw(r.message);
                   }
                }
             });
        });
	},
});
