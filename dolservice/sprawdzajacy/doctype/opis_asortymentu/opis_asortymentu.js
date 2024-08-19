// Copyright (c) 2024, a.lorkowski@dolservice.pl and contributors
// For license information, please see license.txt
const regex = /[;]/;

class LaptopInfo {
    constructor(model, procesor, ram, dysk, kam, matryca, gpu, bateria) {
      this.model = model;
      this.procesor = procesor;
      this.ram = ram;
      this.dysk = dysk;
      this.kam = kam;
      this.matryca = matryca.replace(/\(.*\)/gm, '');
      this.gpu = gpu?gpu:"GPU";
      this.bateria = bateria;
    }
}

frappe.ui.form.on("Opis Asortymentu", {
    refresh: function(frm)
    {
        add_3_row(frm);

        //Dodawanie przycisku do tabeli
        frm.fields_dict["konfiguracja"].grid.add_custom_button(__('Domyślnie Wartości'), 
			function() {
				frm.add_child('konfiguracja', { komponent: 'Procesor',  opis_konfiguracji: ''});
                frm.add_child('konfiguracja', { komponent: 'RAM',       opis_konfiguracji: ''});
                frm.add_child('konfiguracja', { komponent: 'Dysk',      opis_konfiguracji: ''});
                frm.add_child('konfiguracja', { komponent: 'Matryca',   opis_konfiguracji: ''});
                frm.add_child('konfiguracja', { komponent: 'Grafika',   opis_konfiguracji: ''});
                frm.add_child('konfiguracja', { komponent: 'Bateria Nr. 1',   opis_konfiguracji: ''});
                frm.refresh_field('konfiguracja');
        });
        frm.fields_dict["konfiguracja"].grid.grid_buttons.find('.btn-custom').removeClass('btn-default').addClass('btn-primary');

        frm.add_custom_button(__("Drukuj"), function(){
            PrintElem();
        }, __("Naklejka"));
        
        if(!frm.is_new())
        {
            frm.add_custom_button(__("Wykonanie Usługi"), function()
            {
                frappe.new_doc('Wykonanie Uslugi',
                    {
                        "typ_uslugi": "Naprawa Laptopa",
                        "nr_seryjny": frm.doc.nr_seryjny,
                        "item_code": frm.doc.item_name
                    }
                );
            }, __("Create"));

            frm.add_custom_button(__("Sprawdzenie"), function()
            {
                frappe.new_doc('Wykonanie Uslugi',
                    {
                        "typ_uslugi": "Sprawdzenie Laptopa",
                        "nr_seryjny": frm.doc.nr_seryjny,
                        "item_code": frm.doc.item_name
                    }
                );
            }, __("Create"));
        }
    },

    before_save: function(frm) 
    {
        //Zmiana Nr Seryjnego na duże znaki
        frm.set_value("nr_seryjny", frm.doc.nr_seryjny.toUpperCase());
    },

    nr_seryjny: function(frm) 
    {
        //console.log(frm.doc.nr_seryjny);
        //frappe.db.get_doc('Serial No',frm.doc.nr_seryjny).then(res => { if() console.log(res.purchase_document_no) });
        frappe.db.exists(cur_frm.doc.doctype ,"Opis-"+cur_frm.doc.nr_seryjny).then(res => {
            console.log(res);
            if(res){
                cur_frm.set_df_property('nr_seryjny', 'description', '<b><span style="color: red;">Taki nr. seryjny już został wpisany!!!</span></b>')
            }
        });

        frappe.db.exists('Serial No',frm.doc.nr_seryjny).then(res => 
            {
                if(res) {
                    frappe.db.get_doc('Serial No',frm.doc.nr_seryjny).then(res => 
                        { 
                            frm.set_value("dostawa", res.purchase_document_no);
                            frm.set_value("item_name", res.item_code);
                        }
                    );
                }
            }
        );
    },

	barcode: function(frm) {
        if(frm.doc.barcode != "")//Sam nr SN
        { 
            //console.log(frm.doc.barcode);
            if(frm.doc.barcode.search(regex) == -1) // Legion 5 15ACH6A;;Ryzen 7 5800H;;16 / 1TB 1TB / KAM;;QHD-T (X);;Radeon 6600M;;11% 22%
            {
                frm.set_value("nr_seryjny", frm.doc.barcode);

                //frappe.db.get_list('Item', {fields: ['name','item_name'], limit: 10, filters: {'item_name': ["like", "%5400%"]}}).then(res => { console.log(res[0].item_name) }); // Szuka podobnego wyrazu w nazwach doctype
                frm.set_value("barcode", "");
            }
            else //Długi kod z konfiguracją
            {
                frm.set_value('konfiguracja', []);
                var dane = frm.doc.barcode.split(';;');
                var sdane = dane[2].split(' / ');

                var info = new LaptopInfo(dane[0], dane[1], sdane[0], sdane[1], (sdane[2].length > 2), dane[3], dane[4], dane[5]);
                
                //console.log(info.model+"\nProc "+info.procesor+"\nRAM "+info.ram+"\nDYSK "+info.dysk+"\nKAM "+info.kam+"\nMAT "+info.matryca+"\nGPU "+info.gpu+"\nBAT "+info.bateria);
                
                //Model
                 
                var model;
                frappe.db.get_list('Item', {fields: ['name','item_name'], limit: 10, filters: {'item_name': ["like", "%"+dane[0]+"%"]}}).then(res => {

                    if(res[0] != null)
                    {
                        frm.set_value("item_name", res[0].name);
                    }
                    else if(!frm.doc.item_name)
                    {
                        frappe.msgprint(__('Nie znaleziono takiego modelu w systemie!'));
                        frm.set_value("item_name", dane[0]);
                    } 
                    else 
                    {
                        frappe.msgprint(__('Model pobrany z Nr Seryjnego nie pokrywa się z Modelen z Linuxa'));
                    }
                    
                });

                //Procek
                frm.add_child('konfiguracja', {
                    komponent: 'Procesor',
                    opis_konfiguracji: info.procesor
                });

                //RAM
                frm.add_child('konfiguracja', {
                    komponent: 'RAM',
                    opis_konfiguracji: info.ram
                });
                
                //Dysk
                if(info.dysk)
                frm.add_child('konfiguracja', {
                    komponent: 'Dysk',
                    opis_konfiguracji: info.dysk
                });
                
                //Matryca
                //Dotyk?
                if(info.matryca.includes("T"))
                {
                    frm.set_value("dotykowa_matryca", 1);
                }

                frm.add_child('konfiguracja', 
                    {
                        komponent: 'Matryca',
                        opis_konfiguracji: info.matryca
                    }
                );

                //Grafika
                if(info.gpu.length > 2)    
                {
                    frm.add_child('konfiguracja', 
                        {
                            komponent: 'Grafika',
                            opis_konfiguracji: info.gpu
                        }
                    );
                }

                //Kamera
                frm.set_value("kamera", info.kam);

                //Bateria
                if(info.bateria.includes("% "))
                {
                    var bat = info.bateria.split(' ');

                    frm.add_child('konfiguracja', 
                        {
                            komponent: 'Bateria Nr. 1',
                            opis_konfiguracji: bat[0]
                        }
                    );

                    if(!bat[1]=="")
                    {
                        frm.add_child('konfiguracja', 
                            {
                                komponent: 'Bateria Nr. 2',
                                opis_konfiguracji: bat[1]
                            }
                        );
                    }
                }
                else if(!info.bateria.includes("Wh") && !info.bateria.includes("N/"))
                {
                    if(!info.bateria.includes("--%"))
                    {
                        frm.add_child('konfiguracja', 
                            {
                                komponent: 'Bateria Nr. 1',
                                opis_konfiguracji: info.bateria
                            }
                        );
                    }
                }
                

                //Koniec
                frm.refresh_field('konfiguracja');
                frm.set_value("barcode", "");
            }
        }
	},
});

function fill_serial_no_opis(frm)
{
    frappe.db.get_value('Serial No', frm.doc.nr_seryjny, 'custom_opis').then(res => 
        {
            if(!res.message.custom_opis)
            {
                frappe.db.set_value('Serial No', frm.doc.nr_seryjny, 'custom_opis', 'Opis-'+frm.doc.nr_seryjny)
            }
        }
    );
}

function add_3_row(frm){
    if(cur_frm.is_new()){
        for(let i=0; i<3; i++)
        {
            frm.add_child("uwagi");
            frm.add_child("uszkodzenia");
        }
        frm.refresh_field("uwagi");
        frm.refresh_field("uszkodzenia");
    }
}
function PrintElem()
{
    var nazwa = "";
    var procesor = "";
    var rdk = " / / ";
    var martyca = "";
    var gpu = "";
    var bat1 = "", bat2 = "";
    var podswietlanie = "";
    var trackpoint = "";
    var opis = "";
    var autor = "";

    var trdk = rdk.split('/');

    frappe.db.get_value('Item', cur_frm.doc.item_name, 'item_name').then(r => {
        nazwa = r.message.item_name;
    });

    frappe.db.get_value('User', cur_frm.doc.modified_by, 'username').then(r => {
        autor = r.message.username;
    });
    
    cur_frm.doc.konfiguracja.forEach(function(row){
        if("Procesor" == row.komponent){
            procesor = row.opis_konfiguracji;
        }
    });
    
    cur_frm.doc.konfiguracja.forEach(function(row){
        if("RAM" == row.komponent){
            trdk[0] = row.opis_konfiguracji;
        }
    });
    
    cur_frm.doc.konfiguracja.forEach(function(row){
        if("Dysk" == row.komponent){
            trdk[1] = row.opis_konfiguracji;
        }
    });
    
    if(cur_frm.doc.kamera){
        trdk[2] = "KAM";
    }

    rdk = trdk.join(" / ");
    
    cur_frm.doc.konfiguracja.forEach(function(row){
        if("Matryca" == row.komponent){
            martyca = row.opis_konfiguracji;
        }
    });
    
    if(cur_frm.doc.dotykowa_matryca){
        martyca += "-T";
    }
    
    cur_frm.doc.konfiguracja.forEach(function(row){
        if("Grafika" == row.komponent){
            gpu = row.opis_konfiguracji;
        }
    });
    
    cur_frm.doc.konfiguracja.forEach(function(row){
        if("Bateria Nr. 1" == row.komponent){
            bat1 = row.opis_konfiguracji;
        }
    });
    
    cur_frm.doc.konfiguracja.forEach(function(row){
        if("Bateria Nr. 2" == row.komponent){
            bat2 = row.opis_konfiguracji;
        }
    });
    
    if(cur_frm.doc.podswietlana_klawiatura){
        podswietlanie = "Pdś";
    }
    else {
        podswietlanie = "Niepdś";
    }
    
    if(cur_frm.doc.trackpoint){
        trackpoint = "TrP";
    }
    
    cur_frm.doc.uszkodzenia.forEach(function(row){
        if(row.nazwa_uszkodzenia){
            opis += row.nazwa_uszkodzenia+(row.opis?": "+row.opis:"")+".";
        }
    });
    
    cur_frm.doc.uwagi.forEach(function(row){
        if(row.element_obudowy){
            opis += row.element_obudowy+(row.opis?": "+row.opis:"")+".";
        }
    });
    
    var mywindow = window.open('', 'PRINT', 'height=600,width=1000');

    setTimeout(() => {
        const date = new Date();
        
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        
        let currentDate = `${day}.${month}.${year}`;
        
        //[Nazwa];;Procek;;RAM / DYSK / KAM;;SIZE (GRADE);;[GPU] ;;[BATERIA];;[GRADE 2];;[OPIS] ;;[UKLAD];;[PODS]
        var qrInfo = `${nazwa};;${procesor};;${rdk};;${martyca} (${cur_frm.doc.grade_matrycy});;${gpu} ;;${bat1} ${bat2};;${cur_frm.doc.grade_obudowy};;${opis} ;;${cur_frm.doc.uklad_klawiatury=="PL"?"1":"0"};;${cur_frm.doc.podswietlana_klawiatura}`;
        qrInfo = qrInfo.replaceAll(/\r?\n/g, ', ').replaceAll(/ą/g, "a").replaceAll(/ę/g, "e").replaceAll(/ć/g, "c").replaceAll(/ł/g, "l").replaceAll(/ń/g, "n").replaceAll(/ż/g, "z").replaceAll(/ź/g, "z").replaceAll(/ś/g, "s").replaceAll(/ó/g, "o").replaceAll(/Ą/g, "A").replaceAll(/Ę/g, "E").replaceAll(/Ć/g, "C").replaceAll(/Ł/g, "L").replaceAll(/Ń/g, "N").replaceAll(/Ż/g, "Z").replaceAll(/Ź/g, "Z").replaceAll(/Ś/g, "S").replaceAll(/Ó/g, "O");
        qrInfo = qrInfo.replaceAll(/%/g, "%25");
        //console.log(qrInfo);

        mywindow.document.write('<html><head><style>');
        
        mywindow.document.write('#printText > p, #floatText > p, body {margin: 0;margin-top: 1,5mm;margin-left: 1,5mm;} #printParent{    font-family: Arial;    font-weight: normal;    text-align: left;    color: black;    width: 10cm;    height: 2.75cm;    display: flex;    flex-direction: column;    background: #ffffff;    margin-bottom: 0.25cm;    zoom: 100%;}div.print{    margin-top: 0.15cm;    margin-left: 0.15cm;}#printMain{    display: flex;    flex-direction: row;    height: 1.9cm;    background: #ffffff;}#qrcode{    width: 2.7cm;    background: #ffffff;}#frame{    width: 94%;    margin: 3% 3% 0 3%;}#printText{    width: 3.7cm;    font-size: 10px;    margin-top: 0.05cm;}#floatText{    width: 1.0cm;    font-size: 10px;    margin-top: 0.05cm;    text-align: center;}#printId{    text-align: right;    width: 2.6cm;    display: flex;    flex-direction: column;}#printSerial{    height: 1cm;    text-align: center;}#seriales{    display: flex;    flex-direction: row;}#barcode{    margin-top: 0.06cm;    width: 1.25cm;    height: 1.25cm;    /*clip-path: inset(0.12cm 0 0.25cm 0);*/}#serialtext{    height: 0.3cm;    text-align: center;    font-size: 10px;    margin-top: 0.33cm;}#printAuthor{    font-size: 9px;    text-align: center;    height: 0.2cm;    margin: 0cm 0 0 0;}#printText2{    margin-left: 2.7cm;    margin-right: 0.1cm;    border-top: 1px solid;    height: 0.7cm;    font-size: 9px;    padding: 0.05cm 0 0 0;    background: #ffffff;}');
        
        mywindow.document.write('</style></head><body >');
        
        mywindow.document.write('<div id="toPrint"><div id="printParent"><div id="printMain"><div id="qrcode">');
        mywindow.document.write('<img id="frame" src="https://quickchart.io/qr?text='+qrInfo+'&amp;margin=0&amp;size=200"></div>');
        
        mywindow.document.write('<div id="printText">');
        mywindow.document.write('<p>'+nazwa+'</p>');
        mywindow.document.write('<p>'+procesor+'</p><p>'+rdk+'</p>');
        mywindow.document.write('<p>'+martyca+' ('+cur_frm.doc.grade_matrycy+')</p><p>.'+gpu+'</p>');
        mywindow.document.write('<p>'+bat1+' '+bat2+' Grade '+cur_frm.doc.grade_obudowy+'</p></div>');
        
        mywindow.document.write('<div id="floatText"><p>.'+cur_frm.doc.uklad_klawiatury+'</p><p>'+podswietlanie+'</p><p>'+trackpoint+'</p></div>');
        
        mywindow.document.write('<div id="printId"><div id="printSerial">');
        mywindow.document.write('<img id="barcode" src="https://barcode.tec-it.com/barcode.ashx?data='+(cur_frm.doc.nr_seryjny ? cur_frm.doc.nr_seryjny : 'DOL000000')+'&amp;code=DataMatrix&amp;translate-esc=on&amp;dpi=200&amp;eclevel=L&amp;dmsize=Default"></div>');
        mywindow.document.write('<div id="serialtext" style="font-size: 10px;">'+(cur_frm.doc.nr_seryjny ? cur_frm.doc.nr_seryjny : 'DOL000000')+'</div>');

        mywindow.document.write('<div id="printAuthor"> '+autor+'| '+currentDate+' | </div></div></div>');
        mywindow.document.write('<div id="printText2" style="font-size: 9px;">'+opis+'</div>');
        mywindow.document.write('</div></div>');
        mywindow.document.write('</body></html>');
        
        mywindow.document.close(); // necessary for IE >= 10
        mywindow.focus(); // necessary for IE >= 10*/
    }, 100);
    
    setTimeout(() => {
        mywindow.print();
        mywindow.close();
    }, 1000);
}