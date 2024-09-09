// Copyright (c) 2024, a.lorkowski@dolservice.pl and contributors
// For license information, please see license.txt

frappe.ui.form.on("Wykonanie Uslugi", {

   refresh: function(frm)
    {
      //Ustawianie statusu tylko gdzy dokument został chociaż raz zapisany
      if(frm.is_new())
      {
         cur_frm.set_df_property('status_uslugi', 'reqd', false);
         cur_frm.set_df_property('status_uslugi', 'hidden', true);
      }  
      else 
      {
         cur_frm.set_df_property('status_uslugi', 'reqd', true);
         cur_frm.set_df_property('status_uslugi', 'hidden', false);

         frm.add_custom_button(__("Nowy Nr. Seryjny"), function()
            {
                operation_new_sn(frm);
            }, __("Update"));
      }

      //Automat ukrywający przycink, gdy żaden z wierszy nie jest zaznaczony.
      frm.fields_dict.do_naprawy.grid.wrapper.on('click', '.grid-row', function(event) 
      {
         if(cur_frm.get_selected().do_naprawy){
            if(cur_frm.fields_dict["do_naprawy"].grid.grid_buttons.find('.btn-custom')[0].classList.contains('hidden'))
               cur_frm.fields_dict["do_naprawy"].grid.grid_buttons.find('.btn-custom').removeClass('hidden');
         } else {
            if(!cur_frm.fields_dict["do_naprawy"].grid.grid_buttons.find('.btn-custom')[0].classList.contains('hidden'))
               cur_frm.fields_dict["do_naprawy"].grid.grid_buttons.find('.btn-custom').addClass('hidden');
         }

      });

      frm.fields_dict.uwagi.grid.wrapper.on('click', '.grid-row', function(event) 
      {
         if(cur_frm.get_selected().uwagi){
            if(cur_frm.fields_dict["uwagi"].grid.grid_buttons.find('.btn-custom')[0].classList.contains('hidden'))
               cur_frm.fields_dict["uwagi"].grid.grid_buttons.find('.btn-custom').removeClass('hidden');
         } else {
            if(!cur_frm.fields_dict["uwagi"].grid.grid_buttons.find('.btn-custom')[0].classList.contains('hidden'))
               cur_frm.fields_dict["uwagi"].grid.grid_buttons.find('.btn-custom').addClass('hidden');
         }

      });

      //Dodawanie przycisku Naprawione do tabeli do_naprawy
      if(!cur_frm.fields_dict["do_naprawy"].grid.custom_buttons.Naprawione){
         frm.fields_dict["do_naprawy"].grid.add_custom_button(__('Naprawione'), 
         function() {
            $.each(cur_frm.doc.do_naprawy, function(i, d) {
               if(d.__checked) 
               {
                  cur_frm.get_field('do_naprawy').grid.grid_rows[i].remove();
                  cur_frm.add_child('naprawione', { nazwa_uszkodzenia: d.nazwa_uszkodzenia,  opis: d.opis});
               }
            })
   
            frm.refresh_field('naprawione');
            cur_frm.fields_dict["do_naprawy"].grid.grid_buttons.find('.btn-custom').addClass('hidden');
         });
         frm.fields_dict["do_naprawy"].grid.grid_buttons.find('.btn-custom').removeClass('btn-default').addClass('btn-primary').addClass('hidden');
      }
      //Dodawanie przycisku Poprawione do tabeli uwagi
      if(!cur_frm.fields_dict["uwagi"].grid.custom_buttons.Poprawione){
         frm.fields_dict["uwagi"].grid.add_custom_button(__('Poprawione'), 
            function() {
               $.each(cur_frm.doc.uwagi, function(i, d) {
                  if(d.__checked) 
                  {
                     cur_frm.get_field('uwagi').grid.grid_rows[i].remove();
                     cur_frm.add_child('naprawione', { nazwa_uszkodzenia: d.element_obudowy, opis: d.opis});
                  }
               })
      
               frm.refresh_field('naprawione');
               cur_frm.fields_dict["uwagi"].grid.grid_buttons.find('.btn-custom').addClass('hidden');
         });
         frm.fields_dict["uwagi"].grid.grid_buttons.find('.btn-custom').removeClass('btn-default').addClass('btn-primary').addClass('hidden');
      }
   },

   nr_seryjny: function(frm) 
   {
      self_filling(frm);
   },

   onload: function(frm)
   {
      if(frm.doc.nr_seryjny)
      {
         self_filling(frm);
      }
   },

   typ_uslugi: function(frm)
   {
      cur_frm.set_df_property('wykonal_naprawe', 'hidden', 1);
      cur_frm.set_df_property('wykonal_naprawe', 'reqd', 0)

      if(frm.doc.typ_uslugi == 'Sprawdzenie Laptopa') 
      {
         cur_frm.set_df_property('wykonal_naprawe', 'hidden', 0);
         cur_frm.set_df_property('wykonal_naprawe', 'reqd', 1)
      }

      // cur_frm.refresh_fields();
      //Ukrywa tabele cześci
      //frm.toggle_display(['uzyte_czesci', 'odpady', 'odzyskane_czesci', 'barcode_uzyte', 'barcode_odpady', 'barcode_odzyskane'], false);
   },

   before_submit: function(frm){
      frappe.validated = false;
      rename_doc(frm);
   }

});

function clone_tables(opis_name)
{
   if(cur_frm.doc.do_naprawy.length > 0 || cur_frm.doc.uwagi.length > 0 || cur_frm.doc.konfiguracja.length > 0)
      return;

   frappe.db.exists("Opis Asortymentu", opis_name).then(res => 
   {
      if(res)
      {
         //Przypisywanie opisu
         cur_frm.set_value("opis_przedmiotu", opis_name);

         frappe.db.get_doc("Opis Asortymentu", opis_name).then(doc => 
         {
            cur_frm.clear_table("do_naprawy");
            cur_frm.clear_table("uwagi");
            cur_frm.clear_table("konfiguracja");

            cur_frm.set_value("do_naprawy", doc.uszkodzenia);
            cur_frm.set_value("uwagi", doc.uwagi);
            cur_frm.set_value("konfiguracja", doc.konfiguracja);
            
            cur_frm.refresh_field("do_naprawy");
            cur_frm.refresh_field("uwagi");
            cur_frm.refresh_field("konfiguracja");

            // $.each(doc.konfiguracja, function(i, d) {
            //    i = cur_frm.add_child("konfiguracja");

            //    i.nazwa_uszkodzenia = d.nazwa_uszkodzenia;
            //    i.opis = d.opis;
            // });
         });
      }
   });
}

function self_filling(frm)
{
   frappe.db.exists('Opis Asortymentu', 'Opis-'+frm.doc.nr_seryjny).then(res => 
      {
          if(res) {
              frappe.db.get_doc('Opis Asortymentu', 'Opis-'+frm.doc.nr_seryjny).then(res => 
                  { 
                     //Przepisanie modelu
                     frm.set_value("item_code", res.item_name);
                     //Przepisanie magazynu
                        //frm.set_value("from_warehouse", res.warehouse);
                     //Przypisywanie pliku
                     clone_tables(res.name);
                  }
              );
          }
      }
  );
}

function rename_doc(frm)
{
   $('.primary-action').prop('disabled', true);
   var sn = frm.doc.nr_seryjny; //serial number
   var shortcut = cur_frm.doc.skrot;

   frappe.db.get_list(frm.doctype, {fields: ['name'], limit: 100, filters: {'nr_seryjny': cur_frm.doc.nr_seryjny, 'typ_uslugi': cur_frm.doc.typ_uslugi}}).then(res => 
   {
      let doc_count = res.length; // liczba dokumentow

      if(doc_count > 1)
      {
         frappe.confirm(`Czy chcesz stworzyć ${doc_count} usługę z tym numerem seryjnym?`,
            () => {
               frm.save('Submit').then(() => 
               {

                  if(doc_count < 10) 
                  { 
                     doc_count = '0' + doc_count; 
                  }

                  var new_name = `${shortcut}${doc_count}-${sn}`; //new name
                  
                  frm.call({
                     method: "rename_doc",
                     args: { new_name: new_name, doctype: frm.doctype, name: frm.doc.name},
                     callback: function(r) 
                     {
                        if(r.message){
                        frappe.set_route('Form', frm.doctype, new_name);
                        } else {
                           frappe.throw(__("Podczas zmiany nazwy na {0} wystąpił błąd", [new_name]));
                        }
                     }
                  });
                  
                  $('.primary-action').prop('disabled', false);
               });
            }, 
            () => 
            {
               $('.primary-action').prop('disabled', false);
               frm.refresh()
            }
         );
      }
      else
      {
         var new_name = `${shortcut}01-${sn}`; //new name
               
         frm.save('Submit').then(() => {
            frm.call({
               method: "rename_doc",
               args: { new_name: new_name, doctype: frm.doctype, name: frm.doc.name},
               callback: function(r) 
               { 
                  if(r.message){
                     frappe.set_route('Form', frm.doctype, new_name);
                  } else {
                     frappe.throw(__("Podczas zmiany nazwy na {0} wystąpił błąd", [new_name]));
                  }
               }
            });
            $('.primary-action').prop('disabled', false);
         });
      }
   });
}

function operation_new_sn(frm)
{
   //Stary plik
   // - Wyczyszczenie uwag i zbędnych danych z konfiguracji
   // - Zmiana nazwy na starym docu z dopiskiem nowego
   // - Utworzenie nowego pliku z naprawą płyty
   //Nowy Plik
   // - Plik z nazwą nowego nr seryjnego
   var old_frm = frm;
   
   frm.copy_doc();



}