// Copyright (c) 2024, Artiom and contributors
// For license information, please see license.txt

//Dodać kolumne do tabeli z dziećmi RMA

frappe.ui.form.on("Zgloszenie Multi-RMA", {
	refresh(frm) {
      czy_posiada_RMA(frm);
	},
});

//W zależności czy Zbiorcze RMA posiada już pojedyńcze RMA pojawie się odpowiedni Przycisk
function czy_posiada_RMA(frm){
   frappe.db.get_list('Zgloszenie RMA', {fields: ['name'], filters: { 'name': ["like", "%"+cur_frm.doc.name+"%"]}})
      .then(res => {         
         if(cur_frm.doc.serwisowane_urządzenia.length != res.length) //cur_frm.doc.serwisowane_urządzenia.length == res.length
            frm.add_custom_button(__("Podziel RMA"), () => split_RMA(frm));
         else
            frm.add_custom_button(__("Przejdz do mini-RMA"), () => send_to_RMAs());
      });
}

//Wysyłanie klienta do zbioru RMA z tego zbiorczego RMA
function send_to_RMAs(){
   frappe.set_route('List', 'Zgloszenie RMA', {parent_rma: cur_frm.docname})
}

//Dzieli Jedno zbiorcze RMA na Klilka miejszych, ilość zależna od wierszy w tabeli
function split_RMA(frm){
   var a=0;
   for(var i=0; i<cur_frm.doc.serwisowane_urządzenia.length; i++){
      frappe.db.insert({
         doctype: 'Zgloszenie RMA',
         podmiot: cur_frm.doc.podmiot,
         nazwa_podmiotu: cur_frm.doc.nazwa_podmiotu,
         email: cur_frm.doc.email,
         telefon_kontaktowy: cur_frm.doc.telefon_kontaktowy,
         adres: cur_frm.doc.adres,
         paid: cur_frm.doc.serwisowane_urządzenia[i].paid,
         item_name: cur_frm.doc.serwisowane_urządzenia[i].marka_model,
         serial_no: cur_frm.doc.serwisowane_urządzenia[i].nr_seryjny,
         sale_invoice:  cur_frm.doc.serwisowane_urządzenia[i].nr_fakturyparagonu,
         sale_date: cur_frm.doc.serwisowane_urządzenia[i].data_zakupu,
         description: cur_frm.doc.serwisowane_urządzenia[i].opis_usterki,
         parent_rma: cur_frm.doc.name
      }).then(function(doc) {
         console.log(a);
         cur_frm.doc.serwisowane_urządzenia[a].child_rma = doc.name;
         a++;
         if(cur_frm.doc.serwisowane_urządzenia.length == a){
            cur_frm.refresh_fields(); cur_frm.dirty(); cur_frm.save();
         }
         //console.log(`${doc.doctype} ${doc.name} created on ${doc.creation}`);
      });
   }

}
