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
   frappe.show_progress('Wpisywanie pojedyńczych RMA...', 0, frm.doc.serwisowane_urządzenia.length, 'Please wait');
   for(var i=0; i<frm.doc.serwisowane_urządzenia.length; i++){
      frappe.db.insert({
         doctype: 'Zgloszenie RMA',
         temp_number: i+1,
         podmiot: frm.doc.podmiot,
         nazwa_podmiotu: frm.doc.nazwa_podmiotu,
         email: frm.doc.email,
         telefon_kontaktowy: frm.doc.telefon_kontaktowy,
         adres: frm.doc.adres,
         paid: frm.doc.serwisowane_urządzenia[i].paid,
         item_name: frm.doc.serwisowane_urządzenia[i].marka_model,
         serial_no: frm.doc.serwisowane_urządzenia[i].nr_seryjny,
         sale_invoice:  frm.doc.serwisowane_urządzenia[i].nr_fakturyparagonu,
         sale_date: frm.doc.serwisowane_urządzenia[i].data_zakupu,
         description: frm.doc.serwisowane_urządzenia[i].opis_usterki,
         parent_rma: frm.doc.name
      })
      .then(function(doc) {
         frm.doc.serwisowane_urządzenia[doc.temp_number-1].child_rma = doc.name;
      });
      frappe.show_progress('Wpisywanie pojedyńczych RMA...', i, frm.doc.serwisowane_urządzenia.length, 'Proszę Czekać');
   }

   setTimeout(()=>{
      frappe.show_progress('Wpisywanie pojedyńczych RMA...', frm.doc.serwisowane_urządzenia.length, frm.doc.serwisowane_urządzenia.length, 'Ukończono', true);
      
      frm.dirty(); 
      frm.save();
      frm.reload_doc();

      frappe.show_alert({message:__('RMA Poprawnie Podzielone!'),
         indicator:'green'
      }, 5);
   }, 1000);
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