// Copyright (c) 2024, Artiom and contributors
// For license information, please see license.txt

//Dodać kolumne do tabeli z dziećmi RMA

frappe.ui.form.on("Zgloszenie Multi-RMA", {
   onload(frm) {
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
   },
	refresh(frm) {
      czy_posiada_RMA(frm);
      indicator_status(frm);
	},
});

//W zależności czy Zbiorcze RMA posiada już pojedyńcze RMA pojawie się odpowiedni Przycisk
function czy_posiada_RMA(frm){
   if(!frappe.model.can_create("Zgloszenie RMA")){
      return;
   }
   frappe.db.get_list('Zgloszenie RMA', {fields: ['name'], filters: { 'name': ["like", "%"+cur_frm.doc.name+"%"]}})
      .then(res => {
         frm.add_custom_button(__("Lista RMA"), () => {frappe.set_route('List', 'Zgloszenie RMA', {parent_rma: frm.docname})}, __("RMA"));
         
         if(hasAnyChildRMA(frm)){
            frm.add_custom_button(__("Udostępnij"), () => frappe.confirm("Czy chciałbyś komuś udostępnić podzielone RMA?",() => {share_RMA(frm)}), __("RMA"));
         }else{   
            frm.add_custom_button(__("Podziel RMA"), () => frappe.confirm("Czy chciałbyś podzielić RMA?",() => {split_RMA(frm)}), __("RMA"));
            frm.add_custom_button(__("Podziel RMA i Udostępnij"), () => frappe.confirm("Czy chciałbyś podzielić RMA i komuś je udostępnić?",() => {split_share_RMA(frm)}), __("RMA"));
            
         } //cur_frm.doc.serwisowane_urządzenia.length == res.length
      });
}

//Wysyłanie klienta do zbioru RMA z tego zbiorczego RMA
function send_to_RMAs(){
   frappe.set_route('List', 'Zgloszenie RMA', {parent_rma: cur_frm.docname})
}

//Dzieli Jedno zbiorcze RMA na Klilka miejszych, ilość zależna od wierszy w tabeli
async function split_RMA(frm) {
   const devices = frm.doc.serwisowane_urządzenia || [];
   const total = devices.length;
   let current = 0;

   if (!total) {
       frappe.msgprint("Brak urządzeń do podziału.");
       return;
   }

   frappe.show_progress("Wpisywanie pojedynczych RMA...", current, total, "Proszę czekać");

   for (let i = 0; i < total; i++) {
       const device = devices[i];

       if (device.child_rma) {
           current++;
           frappe.show_progress("Wpisywanie pojedynczych RMA...", current, total, "Pomiń istniejące");
           continue;
       }

       try {
           const doc = await frappe.db.insert({
               doctype: "Zgloszenie RMA",
               temp_number: i + 1,
               podmiot: frm.doc.podmiot,
               nazwa_podmiotu: frm.doc.nazwa_podmiotu,
               email: frm.doc.email,
               telefon_kontaktowy: frm.doc.telefon_kontaktowy,
               adres: frm.doc.adres,
               paid: device.paid,
               item_name: device.marka_model,
               serial_no: device.nr_seryjny,
               sale_invoice: device.nr_fakturyparagonu,
               sale_date: device.data_zakupu,
               description: device.opis_usterki,
               parent_rma: frm.doc.name
           });

           // Zaktualizuj child_rma
           frappe.model.set_value(device.doctype, device.name, "child_rma", doc.name);

       } catch (err) {
           console.error("Błąd przy tworzeniu RMA:", err);
           frappe.msgprint(`Błąd przy pozycji ${i + 1}: ${err.message}`);
       }

       current++;
       frappe.show_progress("Wpisywanie pojedynczych RMA...", current, total);
   }

   frappe.show_progress("Wpisywanie pojedynczych RMA...", total, total, "Zakończono", true);

   // Odśwież dokument po zakończeniu
   await frm.save();
   await frm.reload_doc();

   frappe.show_alert({
       message: __("RMA poprawnie podzielone!"),
       indicator: "green"
   }, 5);
}

function indicator_status(frm){
   var rows = frm.fields_dict['serwisowane_urządzenia'].get_value();
   rows.forEach(row => {
      if(row.child_rma !== '' && row.child_rma !== undefined){
         frappe.db.get_doc('Zgloszenie RMA', row.child_rma).then(res=>{
            row.status = res.workflow_state;
         });
      }
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
      row.querySelector('[data-fieldname="child_rma"]').querySelector('a')?.setAttribute('title', frm.doc.serwisowane_urządzenia[j].status);
      j++;
   });
}

function empty_or_null(f){
   if(f == null)
      return true;

   else if(f == undefined)
      return true;
   
   else if(f == "")
      return true;

   return false;
}

async function share_RMA(frm){
   // Użytkownik potwierdził — pokaż okno dialogowe
   const d = new frappe.ui.Dialog({
      title: "Wybierz użytkownika do udostępnienia",
      fields: [
            {
               label: "Użytkownik",
               fieldname: "user",
               fieldtype: "Link",
               options: "User",
               reqd: 1
            }
      ],
      primary_action_label: "Udostępnij",
      primary_action(values) {
         frm.doc.serwisowane_urządzenia.forEach(row => {
            call_share_RMA(row.child_rma, values.user);
         })
         
         d.hide();
      }
   });
   d.show();
}

function call_share_RMA(name, user){
   frappe.call({
      method: "dolservice.rma.doctype.zgloszenie_multi_rma.api.udostepnij_dokument",
      args: {
          docname: name,
          user: user
      },
      callback: function (r) {
          frappe.msgprint(r.message);
      }
  });
}

async function split_share_RMA(frm){
   await split_RMA(frm);
   await share_RMA(frm);
}

function hasAnyChildRMA(frm) {
   return (frm.doc.serwisowane_urządzenia || []).some(row => !!row.child_rma);
}