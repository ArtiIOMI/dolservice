// Copyright (c) 2024, Artiom and contributors
// For license information, please see license.txt

//Dodać kolumne do tabeli z dziećmi RMA

frappe.ui.form.on("Zgloszenie Multi-RMA", {
	refresh(frm) {
      czy_posiada_RMA(frm);
      indicator_status(frm);
	},
});

//W zależności czy Zbiorcze RMA posiada już pojedyńcze RMA pojawie się odpowiedni Przycisk
function czy_posiada_RMA(frm){
   frappe.db.get_list('Zgloszenie RMA', {fields: ['name'], filters: { 'name': ["like", "%"+cur_frm.doc.name+"%"]}})
      .then(res => {         
         if(cur_frm.doc.serwisowane_urządzenia.length != res.length) //cur_frm.doc.serwisowane_urządzenia.length == res.length
            frm.add_custom_button(__("Podziel RMA"), () => split_RMA(frm));
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

function indicator_status(frm){
   var rows = frm.fields_dict['serwisowane_urządzenia'].get_value();
      rows.forEach(row => {
          frappe.db.get_doc('Zgloszenie RMA', row.child_rma).then(res=>{
             row.status = res.workflow_state;
          });
      });

      frm.set_indicator_formatter('child_rma', function (doc) {
         if(doc.status == 'Przyjęty') 
            return 'orange';
         else if(doc.status == 'Zakończone' || doc.status == 'Korekta' || doc.status == 'Przeterminowane' || doc.status == 'Odebrane' || doc.status == 'Wysłane') 
            return 'black';
         else if(doc.status == 'Na Serwisie' || doc.status == 'W Konsultacji' || doc.status == 'W Naprawie') 
            return 'light blue';
         else if(doc.status == 'Naprawiony') 
            return 'dark blue';
         else if(doc.status == 'W Pakowni' || doc.status == 'Do Opłaty') 
            return 'green';
         else return null;
      });

      
      setTimeout(() => {
         frm.refresh_field('serwisowane_urządzenia');
         indicator_status_tooltip(frm);
      }, "200");
   }

   function indicator_status_tooltip(frm){
      var rows = document.querySelector('[data-fieldname="serwisowane_urządzenia"]').querySelector('.grid-body').querySelectorAll('.data-row');
         var j = 0;
         rows.forEach(row =>{
            row.querySelector('[data-fieldname="child_rma"]').querySelector('a').setAttribute('title', frm.doc.serwisowane_urządzenia[j].status);
            j++;
         });
   }