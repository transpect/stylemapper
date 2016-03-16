$(document).ready( function(){
/* add the includes function to String-Object for IE javascript implementation*/
/*if (!String.prototype.includes) {
     String.prototype.includes = function() {
         'use strict';
         return String.prototype.indexOf.apply(this, arguments) !== -1;
     };
}*/

Prop = function (){
  this.name = '';
  this.value = '';
  this.minvalue = '';
  this.maxvalue = '';
  this.regex = '';
  this.relevant = '';
  this.id = '';
  this.colorh = '';
  this.colors = '';
  this.colorl = '';
  this.backgroundcolorh = '';
  this.backgroundcolors = '';
  this.backgroundcolorl = '';
  this.colorminh = '';
  this.colormins = '';
  this.colorminl = '';
  this.colormaxh = '';
  this.colormaxs = '';
  this.colormaxl = '';
  this.backgroundcolorminh = '';
  this.backgroundcolormins = '';
  this.backgroundcolorminl = '';
  this.backgroundcolormaxh = '';
  this.backgroundcolormaxs = '';
  this.backgroundcolormaxl = '';
};
Mapping = function(){
  this.name;
  this.priority;
  this.targetstyle;
  this.targettype;
  this.removeadhoc;
  this.props = [];
}
count = 0;
temp_props = [];
$inspector = $('#insp1');
$menu = $('#menu');
$sidebar = $('#sidebar-wrapper');
$header = $('#header');
$doc = $('#main-wrapper');
timedrequest = null;
resultListURI = "";
target_styles = '';
username='admin';
password='admin';
base_uri = 'https://transpect.le-tex.de/data/stylemapper/'
cssstyles = ['color'];
templateuri = '';
actual_mappings = $('#rules').find('a');

/* observers for rule property list and pagecontent ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
var propobserver =  new MutationObserver(function (mutations) {
    mutations.forEach(function(mutation) {
          temp_props = [];
          li_props = $('#properties').find('li');
          $.each(li_props, function(){
              var prop = li2prop(this);
/*              console.log('observed li', this, prop);*/
              temp_props.push(prop);
          });
            console.log('temp_props', temp_props)
          })
})
var page_content = $('#sm-page').get(0);
    var contentobserver =  new MutationObserver(function (mutations) {
        mutations.forEach(function(mutation) {
          if ($('#sm-page').children().length == 0) {
              doProgress('1', 0, 'failure');
              doProgress('3', 0, 'failure');
              $('#dotsstep3').attr('class', '');
              $('#delete-content').hide();  
          }
          else{
            $('#delete-content').show();
          }
        })
/*       initGuide('mrules');*/
    })
contentobserver.observe(page_content, {childList: true});
var tableelement = $('#rules1 > table > tbody').get(0);
  var ruleobserver =  new MutationObserver(function (mutations) {
      mutations.forEach(function(mutation) {
        initPriority();
        if ($(mapping_set).find('mapping').length > 0) {
          doProgress('2', 33.33, 'success');
          $('#download-rules').show();
        }
        else if ($(mapping_set).find('mapping').length == 0){
            doProgress('2', 0, 'failure');
            $('#download-rules').hide();
        }
        else{
                     
        }
      })
/*       initGuide('mrules');*/
  })
 ruleobserver.observe(tableelement, {childList: true});
modal_form = "<div class='modal fade bs-example-modal-sm' tabindex='-1' role='dialog' aria-labelledby=''>"+
                "<div class='modal-dialog modal-sm'>"+
                "<div class='modal-content'>"+"</div></div></div>"
mapping_set = document.createElement('mapping-set');
function hideAdhoc(){
  var element_arr = $('#sm-page').find('*[style]');
  $.each(element_arr, function(){
    var css_styles = this.style.cssText.split(';'),
    adhcss_styles= [];
    css_styles.pop();
    $(this).attr('data-original-style', this.style.cssText);
    $.each(this.attributes, function(){
       if (this.name.match(/^adhcss.+/) != null){
         adhcss_styles.push(this.name.replace(/^adhcss\:/, '').replace(/\:.+/, ''));
       }
    });
    $.each(adhcss_styles, function(index){
         adh_str = this;
         $.each(css_styles, function(index){
          if (this != window){
            if (this.indexOf(adh_str) > -1){
                css_styles.splice(index, 1);
            }
          }
         })
    });
    $(this).attr('style', css_styles.join(';'));
  })
}
function showAdhoc(){
    var element_arr = $('#sm-page').find('*[style]');
    $.each(element_arr, function(){
      $(this).attr('style', $(this).attr('data-original-style'));
    });
}
function props2ul(props){
       if (props instanceof Array){
          var ul = document.createElement('ul');
            for (i= 0; i < props.length; i++){
                var li = prop2li(props[i]);
                $(ul).append(li);
           }
           return ul      
       }
}
function prop2li(prop){
       if (prop instanceof Object){
           var li = document.createElement('li'),
           false_style = '',
           rel_el = '';
            li.setAttribute('id', prop.id);
            li.setAttribute('data-name', prop.name);
            if (prop.value){
               prop_str = "<span class='value'>" + prop.value + "</span>"
               li.setAttribute('data-value', prop.value);
            }
            else if (prop.minvalue){
               prop_str = "<span class='minvalue'>" + prop.minvalue + " - "+ prop.maxvalue +"</span>"
               li.setAttribute('data-minvalue', prop.minvalue);
               li.setAttribute('data-maxvalue', prop.maxvalue);
            }
            else if (prop.regex){
               prop_str = "<span class='regex'>" + prop.regex + "</span>"
               li.setAttribute('data-regex', prop.regex);
            }
            
            if ((prop.name == 'color') && (prop.value)){
                li.setAttribute('data-color-h', prop.colorh);
                li.setAttribute('data-color-s', prop.colors);
                li.setAttribute('data-color-l', prop.colorl);
            }
            else if (prop.name =='background-color' && prop.value){  
                li.setAttribute('data-bg-h', prop.backgroundcolorh);
                li.setAttribute('data-bg-s', prop.backgroundcolors);
                li.setAttribute('data-bg-l', prop.backgroundcolorl);
            }
            else if (prop.name == 'color' && prop.minvalue){
/*                console.log(prop, 'SPEICHERUNG DER MIN UND MAX IN LISTE')*/
                li.setAttribute('data-color-min-h', prop.colorminh);
                li.setAttribute('data-color-min-s', prop.colormins);
                li.setAttribute('data-color-min-l', prop.colorminl);
                li.setAttribute('data-color-max-h', prop.colormaxh);
                li.setAttribute('data-color-max-s', prop.colormaxs);
                li.setAttribute('data-color-max-l', prop.colormaxl);
            }
            else if (prop.name =='background-color' && prop.minvalue){  
                li.setAttribute('data-bg-min-h', prop.backgroundcolorminh);
                li.setAttribute('data-bg-min-s', prop.backgroundcolormins);
                li.setAttribute('data-bg-min-l', prop.backgroundcolorminl);
                li.setAttribute('data-bg-max-h', prop.backgroundcolormaxh);
                li.setAttribute('data-bg-max-s', prop.backgroundcolormaxs);
                li.setAttribute('data-bg-max-l', prop.backgroundcolormaxl);
            }
            li.setAttribute('data-relevant', prop.relevant);
            if (prop.relevant == 'true'){
                rel_el = "<span class='glyphicon glyphicon-ok'></span>"
            }
            else {
                 false_style = 'linethrough';
            }
            li.innerHTML = "<span class='li_name "+ false_style+ "'>"+prop.name+', '+prop_str+" <span class='relevant'>"+rel_el+"</span></span><span class='li_op glyphicon glyphicon-edit clickable edit-prop' data-id='"+ prop.id+"'></span><span class='li_op glyphicon glyphicon-remove clickable delete-prop' data-id='"+ prop.id+"'></span>" ;
            return li
           }
}
function li2prop(li){
        prop = new Prop()
        prop_attr = $(li).data()
        for (name in prop_attr){
            prop[name] = prop_attr[name];
        }
        prop.id = $(li).attr('id')
        return prop
}
function errorHandler(e) {
}
function resetInput(input_label){
  $(input_label).find('span').html('<span>Choose a file...</span>');
}
function xhrReadyStateHandler() {
  if (xhr.readyState !=4){
    return;
  } 
  if (xhr.responseCode == 200){}
  else{
  var message = "Error exception while loading:" + xhr.responseCode;
  createError(message);
  }
}
function checkSize(){
    $sidebar.css('padding-top', (parseFloat($header.height()) + 1)+ 'px');
    if ($(window).width() > '768'){
      $doc.css('margin-top', (parseFloat($header.height()) + 1)+ 'px');
    }
    if ($(window).width() < '1480'){
     if ($inspector.css('display') == 'none'){
       $sidebar[0].className = 'col-sm-4 col-md-3 col-lg-3';
       $menu[0].className = 'col-sm-12 col-md-12 col-lg-12';
       $doc[0].className = 'col-sm-8 col-md-9 col-lg-9 pull-right';
     }
     else{
         $sidebar[0].className = 'col-sm-6 col-md-5 col-lg-5';
         $inspector[0].className = 'col-xm-12 col-sm-6 col-md-5 col-lg-5';
         $menu[0].className = 'col-sm-6 col-md-7 col-lg-7';
         $doc[0].className = 'col-sm-6 col-md-7 col-lg-7 pull-right';    
     }      
    }
}
function mappingVal2classes(mapping){
    var str_arr = []; 
    for (i = 0; i < mapping.props.length; i++){
        console.log('rrr ', mapping.props[i].name);
        var prop = mapping.props[i];
        if (prop.value != ''){
            if (prop.name == 'font-weight' && prop.value != ''){
                str_arr.push('.fw_'+ prop.value)
            }
            if (prop.name == 'font-size' && prop.value != ''){
                str_arr.push('.fs_'+prop.value.replace(/pt$/, ''))
            }
            if (prop.name == 'font-style' && prop.value != ''){
                str_arr.push('.fst_'+prop.value.replace(/pt$/, ''))
            }
            if (prop.name == 'font-family' && prop.value != ''){
                str_arr.push('.fm_'+prop.value.replace(/\s/, ''))
            }
            if (prop.name == 'color' && prop.value != ''){
                str_arr.push('.c_h_'+prop.colorh);
                str_arr.push('.c_s_'+prop.colors);
                str_arr.push('.c_l_'+prop.colorl);
            }
            if (prop.name == 'background-color' && prop.value != ''){
                str_arr.push('.bgc_h_'+prop.colorh);
                str_arr.push('.bgc_s_'+prop.colors);
                str_arr.push('.bgc_l_'+prop.colorl);
            }
        }
     }
            return str_arr
}
function hasRange(mapping){
    r = 0;
    for (p in mapping.props){ 
        if (mapping.props[p].minvalue){ 
            r += 1;            
        }
     }
     if (r > 0){
         return true
     }
     else{
         return false
     }
}
function mappingRange2classes(mapping, pre_filtered_elements){
    var el_arr = pre_filtered_elements,
    filtered_el_arr = [],
    temp1_arr = [],
    temp2_arr = [],
    temp3_arr = [],
    res_arr = [],
    range_classes =[];
    for (i = 0; i < mapping.props.length; i++){
        var prop = mapping.props[i];
            if (hasRange(mapping) == true){
/*              Generate range classes refering to hsl color values*/
                console.log('PROPNAME', prop.name, typeof prop.value);
                if (prop.name == 'color' && (prop.value == "")){
                    var class_arr =[],
                    h_arr=[],
                    s_arr =[],
                    l_arr=[];
                    hsl_val_arr = [h_arr, s_arr, l_arr],
                    hsl =['.r_c_h_','.r_c_s_','.r_c_l_'];
                    var rmin_h = (parseFloat(prop.colorminh)/10),
                    rmin_s = (parseFloat(prop.colormins)/10),
                    rmin_l = (parseFloat(prop.colorminl)/10),
                    hsl_arr_min = [Math.round(rmin_h)*10, Math.round(rmin_s)*10, Math.round(rmin_l)*10],
                    rmax_h = (parseFloat(prop.colormaxh)/10),
                    rmax_s = (parseFloat(prop.colormaxs)/10),
                    rmax_l = (parseFloat(prop.colormaxl)/10),
                    hsl_arr_max = [Math.round(rmax_h)*10, Math.round(rmax_s)*10, Math.round(rmax_l)*10];
                    for (var j=0; j <= 2; j++){
                        for (var l=hsl_arr_min[j]; l <= hsl_arr_max[j] ; l=l+10){
                            hsl_val_arr[j].push(hsl[j]+l);
                        }
                            class_arr.push(hsl_val_arr[j].join(','));
                            var nat_arr = el_arr.filter($(class_arr[j]));
                            el_arr = nat_arr;
                    }
                }
                else if (prop.name == "font-size" && (prop.value == "")){
                 var min = Math.round(parseFloat(prop.minvalue)),
                     max = Math.round(parseFloat(prop.maxvalue)),
                     class_arr = [];
                  for (var l=min; l <= max ; l=l+1){
                            class_arr.push('.r_fs_'+ l);
                  }
                  el_arr = el_arr.filter(class_arr.join(','));
                  console.log('ELEARRAY', el_arr);
                  console.log('class_arr', class_arr.join(','));
                }
           }
   }
    return el_arr.toArray();
}
function mapping2previews(mapping){
    var el_arr = [],
    classes_arr =[],
    filtered_arr = [];
    for (i = 0; i < mapping.props.length; i++){
        if (mapping.props[i].relevant == 'false'){
           mapping.props = mapping.props.splice(i,1); 
        }   
    }
    if (el_arr.length === 0 &&  mapping.targettype == 'para'){
        el_arr = $('#sm-page > p');
    }
    else if (el_arr.length === 0 &&  mapping.targettype == 'inline'){
        el_arr = $('#sm-page').find('span[style]');
    }
    else {
      console.log('Error: No element or target type detected');
    }
   var classes = mappingVal2classes(mapping)
     /*     console.log('klassen ', classes, mapping.props.length ,classes.length);
          console.log('range?', hasRange(mapping));*/
   var a = classes.join('');
   if (a != ""){
    filtered_arr = el_arr.filter(a);
   }
   else{
    filtered_arr = el_arr;   
   }
   if (hasRange(mapping)== true){
            filtered_arr = mappingRange2classes(mapping, filtered_arr);
   }
   return filtered_arr
}
function showMaps(){
if ($(mapping_set).children().length === 0){
        $('#rules1 > table').find('tbody').html('<td>No mapping in list.</td>');
  }
  else {
    var mappings = mapping_set.getElementsByTagName('mapping');
    $('#rules1 > table > tbody').children().remove();
    $('#inv').children().remove();
    for (var i=0; i < mappings.length; i++){    
      var row = document.createElement('tr'),
          row_arr = [],
          stype = '';
          console.log($(mappings[i]).attr('target-type'), '    Targettype', mappings[i]);
          if ($(mappings[i]).attr('target-type') == 'para'){
            stype = "(¶)";
          }
          else if($(mappings[i]).attr('target-type') == 'inline'){
            stype = "(T)"
          }
      row.innerHTML = "<td class='center drag'>"+ (mappings.length-i) +"</td><td class='mstep3 point clickable'><a id='" + mappings[i].getAttribute('name')+"' role='button' href='#'>"+mappings[i].getAttribute('name')+' '+stype+"</a></td><td class='center'>"+ $(mappings[i]).children().length+"</td><td><span name='"+mappings[i].getAttribute('name')+"' class='glyphicon glyphicon-edit edit-map mstep4'></span> <span name='"+mappings[i].getAttribute('name')+"' class='glyphicon glyphicon-remove delete-map mstep5'></span></td><td><label><input type='checkbox' name='"+mappings[i].getAttribute('name')+"' class='preview-rule mstep4'></td>"
      $(row).addClass('ui-sortable-handle');
      $('#rules1 > table > tbody').append(row);
  }
         $('.ui-sortable-handle > td.point > a').popover(
        {
          content: function(){
                var obj = getMapping(this.id),
                    table = document.createElement('table');
                table.setAttribute('class', 'spec table table-striped');
                for (var l=0; l < obj.props.length; l++){
                 var prop_row = document.createElement('tr'),
                     gly = '';
                if (obj.props[l].relevant == 'true'){
                    gly = "<span class='glyphicon glyphicon-ok'></span>"
                }
                else{
                    $(prop_row).addClass('linethrough');
                }
                if (obj.props[l].value){
                  prop_row.innerHTML = "<td>"+ obj.props[l].name+":</td><td>" + obj.props[l].value + gly + "</td>"
                }
                else if (obj.props[l].minvalue){
                  prop_row.innerHTML = "<td>"+ obj.props[l].name+":</td><td>" + obj.props[l].minvalue + " - "+ obj.props[l].maxvalue + gly +"</td>"
                }
                else if (obj.props[l].regex){
                  prop_row.innerHTML = "<td>"+ obj.props[l].name+":</td><td>Regex: " + obj.props[l].regex + gly +"</td>"
                }
                row_arr.push($(prop_row));
                table.appendChild(prop_row);
              }
              return table
          },
          html: 'true',
          toggle:'popover',
          placement:'right',
          trigger:'focus',
          title:'Rule Properties'
        }
       );
       makeMapsSortable();
  }
          $('.preview-rule').change(function(event){
              var bg_color = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
              var filtered_arr = [],
              rule_name = $(event.target).attr('name'),
              rule = getMapping(rule_name);
              var style = $("<style>."+rule_name+ " { border: dashed"+ bg_color +"; border-radius: 3px }</style>");
              document.styleSheets[0].addRule("."+rule_name, " border: dashed"+ bg_color +"; border-radius: 2px");
              $('html > head').append(style);
                if (this.checked == true){
                var filtered_arr = mapping2previews(rule);
/*                console.log(filtered_arr, filtered_arr.length, 'FILTERED ELEMENTS FOR MAPPING');*/
                if (filtered_arr.length !=0){
                $('#'+rule_name).addClass(rule_name);
              /*   $.each(filtered_arr, function(index){
                 console.log($(this).css('height'));
                             var i = index;
                             if (this != window){
                              if ($(this).css('height') == '0px'){
                                  filtered_arr.splice(i, 1);
                              }   
                             }
                 })
*/               }
                         $.each(filtered_arr, function(){
/*                         wenn priority höher als die aktuelle, dann .... */
                        console.log(rule.priority, 'RULEPRIORITY', $(this).attr('data-view-priority'));
                        if (this.hasAttribute('data-view-priority')){
                          if ($(this).attr('data-view-priority') <= rule.priority || $(this).attr('data-active-rule') == ""){
                            $(this).addClass(rule_name);
                            $(this).attr('data-active-rule', rule.name);
                            $(this).attr('data-view-priority', rule.priority);
                          }
                        }
                        else{
                         $(this).attr('data-active-rule', rule.name);
                         $(this).attr('data-view-priority', rule.priority);
                         $(this).addClass(rule_name);
                        }
                          /*  var width = $(this).width(),
                                height = $(this).height(),
                                margin_top = $(this).css('margin-top');
                                padding = $(this).css('padding');
                                margin_bottom = $(this).css('margin-bottom');
                                position = $(this).position(),
                                font_size = $(this).css('font-size');
                                $div = $(document.createElement('div'));
                                $div2 = $(document.createElement('div'));
                                $div_container = $(document.createElement('div'))
                                $div2.html('Matching rule: '+rule_name);
                                $div2.addClass('step');
                                $div_container.css('padding', padding);
                                $div_container.css('width', width);
                                $div_container.css('height', height);
                                $div_container.css('margin-top', margin_top);
                                $div_container.css('margin-bottom', margin_bottom);
                                $div_container.css('top', position.top);
                                $div.addClass('preview-overlay');
                                $div.css('background-color', bg_color);
                                $div2.addClass('preview-overlay-text');
                                $div2.css('font-size', font_size);
                                $div_container.addClass('preview '+rule_name);
                                $div_container.attr('data-priority',rule.priority);
                                $($div_container).append($div, $div2);
                                $('#sm-page').append($div_container);*/
                         })
                        
              }
              else {
                  $("*[data-active-rule='" + rule.name + "'").attr('data-active-rule', "");
/*                  $('*[data-view-priority]').removeAttr('data-view-priority');   */
                  $('.'+rule_name).removeClass(rule_name);
                  $('.preview-all').prop('checked', false);
                  $('.preview-rule:checked').trigger('change');
                  console.log('checked checkboxes', $('.preview-rule:checked'));
              }
          })
          $('.preview-all').change(function(event){
                var checkboxes = $(document).find('input.preview-rule').toArray();
                console.log('checkboxes', checkboxes);
                if (this.checked == true){
                 $.each(checkboxes, function(){
                    if ($(this).prop('checked') == false){
                        $(this).prop('checked', true);
                        $(this).trigger('change');
                    }
                 })
                }
                else{
                    $.each(checkboxes, function(){
                        $(this).prop('checked', false)
                        $(this).trigger('change');
                    })
                }
          })
}
/*function handlePreviews(){
    var element = document.getElementById('sm-page');
    pageobserver = new MutationObserver(function(mutations){
        $.each(mutations, function(){
            var prev_arr = $('#sm-page').find('.preview');

       $.each(prev_arr, function(index){
                var position = $(this).position();
                var overlap_arr = [];
                $.each(prev_arr, function(){
                    var position2 = $(this).position();
                    if (position2.top == position.top){
                        overlap_arr.push(this);   
                    }
                })
               overlap_arr = jQuery.unique(overlap_arr);
               overlap_arr.sort(function(a,b){return $(b).attr('data-priority') - $(a).attr('data-priority');})
               overlap_arr.splice(0,1);
                $.each(overlap_arr, function(){
                $(this).remove()    
                })
            })
        })
    })
    pageobserver.observe(element, {childList:true} )
}*/
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}
function importMappings(file, event){
  var xmlParser = new DOMParser();
  var xmlFromFile = xmlParser.parseFromString(file, "text/xml");
  new_mappings = xmlFromFile.getElementsByTagName('mapping');
  len = new_mappings.length
  map_arr = $(mapping_set).children();
  for (var i=0, len = new_mappings.length; i< len ; i++){
     if ($(mapping_set).find("mapping[name='"+ (new_mappings[0].getAttribute('name'))+"']").attr('name') === new_mappings[0].getAttribute('name')){ 
        $(new_mappings).eq(0).remove();
      }
     else {  
        $(mapping_set).append(new_mappings[0]);
      }
  }
  sortByPriority();
  showMaps();
  if (len){
      handleContent('rules', 'open');
      createSuccess('Rules successfully imported.');
  }
  else {
      createError("No rule has been imported. May check the xml rule structure of your document .");
  }  
  resetInput($("label[for='mapping-import']")[0]);
}
function deleteStatus(){
  $('.status').children().remove()
};
function createSuccess(text){
       deleteStatus();
       var div = document.createElement('div');
           div.setAttribute('class', 'alert alert-success');
           div.innerHTML = text;
           $('#status').html($(div));
           $('#status').css('display', 'block');
           window.setTimeout(function(){
           $('#status').css('display', 'none');
           }, 3000)
       }     
function createError(text){
       deleteStatus();
       var div = document.createElement('div');
           div.setAttribute('class', 'alert alert-danger');
           div.innerHTML = text;
           $('#status').html($(div));
           $('#status').css('display', 'block');
           window.setTimeout(function(){
           $('#status').css('display', 'none');
           }, 3000)
       }
function createInfo(text){
       deleteStatus();
       var div = document.createElement('div');
           div.innerHTML = text;
           $('#status').html($(div));
}
function createTargetStyles(uri, targettype){
    var styles = $(target_styles).children().children(),
        select = document.createElement('select'),
        plholder = $("<option value='' disabled='' selected=''>Select Target Style</option>");
    $(select).append(plholder);
  if (uri != ''){
    console.log(target_styles, 'TARGET STYLES');
    console.log('w:styleeeeeee', styles);
    $(styles).each(function(style){
    var opt = document.createElement('option'),
    name = $(this).attr('w:styleId') |  $(this).attr('Name');
    if ($(this).attr('target-type') == targettype){
      if ($(this).attr('w:styleId')){
      $(opt).html($(this).attr('w:styleId'));
      }
      else if
      ($(this).attr('Name')){
        $(opt).html($(this).attr('Name'));
      }
      $(select).append(opt);
    console.log(this, 'style');
    }
    })
    console.log(select);
  }
  else if (targettype == 'clear'){
    plholder = $("<option value='' disabled='' selected=''>Select Target Type First</option>");
    $(select).append(plholder);
  }
  $('select#target-style').html($(select).html());
}
 $('select#target-type').on('change', function(){
 console.log('hohohohohoho');
   createTargetStyles(templateuri, $(this).val());
 });
function getPropById(id){
     var result = $.grep(temp_props, function(e){return e.id == id})
     return result[0];
}
function sortByPriority(){
      var mapping_set_sorted = $(mapping_set)
      setItems = mapping_set_sorted.find('mapping');
      setItems.sort(function(a,b){return $(b).attr('priority') - $(a).attr('priority'); });
      for (var i=0; i < setItems.length; i++){
        setItems[i].setAttribute('priority', (setItems.length-i) );   
      }
      $(mapping_set).children().remove();
      $(mapping_set).append(setItems);
      }
function updatePropTable(){
  if (!(($('select#pname').children().length - 1) == cssstyles.length))
  for (i=0; i< cssstyles.length; i++){
    opt = document.createElement('option');
    opt.value = cssstyles[i];
    opt.innerHTML = (cssstyles[i]);
    $('select#pname').append(opt);
  }
      if (!($('select#pname > option').first().html() == 'Select Property')){
            select_start = document.createElement('option');
            select_start.setAttribute('value', '');
            select_start.setAttribute('disabled', '');
            select_start.setAttribute('selected', '');
            select_start.innerHTML = 'Select Property';
      $('select#pname').prepend($(select_start));
  }
/*  initGuide('editor');*/
  var $prop = $('#pname');
  $prop.change(function(evt){
            $target = $(evt.target);
        if ($target.val() == 'color' || $target.val() == 'background-color'){
/*            Initialisation of color table elements*/
            initColorPicker()
        }
        else{
            $('#pvalue').parent('td').html("<input id='pvalue' type='text' class='form-control valgroup val1' value=''></input>");
            $('.hsl-min').parent('td').html("<input id='pmin-value' type='text' class='form-control  valgroup val2' value=''></input>");
            $('.hsl-max').parent('td').html("<input id='pmax-value' type='text' class='form-control valgroup val2' value=''></input>");
            $('#pregex').parent('td').html("<input id='pregex' type='text' class='form-control  valgroup val3' value=''></input>");
        }
        
       if ($target.val() == 'font-size'||
          $target.val() == 'margin-top'||
          $target.val() == 'margin-left'||
          $target.val() == 'margin-right'||
          $target.val() =='margin-bottom'||
          $target.val() =='color'||
          $target.val() == 'background-color'||
          $target.val() == 'text-indent'||
          $target.val() == 'line-height'){
         $('.minv, .maxv').show();
       }
       else{
         $('.minv, .maxv').hide();
       }
  });
  $("a.my-popover").popover();
  $('#pvalue, #pmax-value, #pmin-value, #pregex').trigger('input');
}
function makeValueLonely(target){
      class_name = '.'+ target.getAttribute('class').replace(/.*\s/, '');
      console.log('classname', class_name, $(target).attr('type'), 'target val: ', $(target).val());
      if ($(target).attr('type') == 'radio'){
          console.log('all but this if checked', class_name, $('input.valgroup').not(class_name));
          $(class_name).next().removeClass('disabled02');
          $.each($('input.valgroup').not(class_name), function(){
            $(this).next().addClass('disabled02');
          })
      }
      else if ($(target).val() != "" && $(target).attr('type') == 'text'){
        $("input.valgroup[type='text']").not(class_name).addClass('disabled02');
      }
      else if ($(target).attr('type') == 'text' && $('#pmin-value').val() == "" && $('#pmax-value').val() == ""){
        $("input.valgroup[type='text']").not(class_name).removeClass('disabled02');
      }
}
function initCheckboxes(){
    $('#remove-adhoc').children().remove();
    ul = $('#remove-adhoc');
    all = document.createElement('li')
    all.innerHTML = "<input type='checkbox' name='#all' value='#all'>All Properties</input>"
    ul.append(all);
    for (i=0; i < cssstyles.length; i++){
        li = document.createElement('li');
        text = document.createTextNode(cssstyles[i]);
        box = document.createElement('input');
        box.setAttribute('type', 'checkbox');
        box.setAttribute('name', cssstyles[i]);
        box.setAttribute('value', cssstyles[i]);
        li.appendChild(box);
        li.appendChild(text);
        ul.append(li);
    }
}
function initPriority(){
    var input = $('#priority');
    var map_num = $(mapping_set).find('mapping').length;
    input.attr('min', '1');
    input.attr('max', (map_num +1));
    input.attr('value', (map_num+1));
}
function isMatching(target_element,rule_id){
  var element_obj = createPropObject(target_element);
      rule = getMapping(rule_id);
       for (var i=0; i < rule.props.length; i++){
        if (rule.props[i]['relevant'] == 'false'){
        rule.props.splice(i, 1);
        }
      }
      var count_matching = rule.props.length;
      for (prop in element_obj){
          for (var l=0; l < rule.props.length; l++){
            if (prop === rule.props[l].name){
                            if  (rule.props[l]['regex'] == "" || !(rule.props[l]['regex'])){
                                if  ((rule.props[l]['minvalue'] == "") || (rule.props[l]['maxvalue'] == "")|| (rule.props[l]['maxvalue'] == null)||(rule.props[l]['minvalue'] == null)){
/*                                  console.log('ruuule props', rule.props[l]["value"], element_obj[prop]);*/
                                        if (rule.props[l]['value'] =="" || rule.props[l]['value'] == null){
                                        }
                                        else {
                                                  if  (rule.props[l]['value'] == element_obj[prop]){
                                                      count_matching = count_matching -1
                                                  }
                                                  else if (prop == 'color' || prop == 'background-color'){
                                                      if (!(element_obj[prop].indexOf('rgb(') > -1)){
/*                                                  console.log('FARBENWERT  ', name2rgb(element_obj[prop]))*/
/*                                                  console.log((element_obj[prop].indexOf('rgb(') > -1));*/
                                                          ele_val = rgb2array(name2rgb(element_obj[prop]));
                                                      }
                                                      else{
                                                      ele_val = rgb2array(element_obj[prop]);
                                                      }
                                                      ele_val_hsl = rgb2Hsl(ele_val[0],ele_val[1],ele_val[2])
/*                                                      console.log('endwert    ', rule.props[l]["value"]);*/
                                                      prop_val = rgb2array(rule.props[l]["value"]);
                                                      prop_val_hsl = rgb2Hsl(prop_val[0],prop_val[1],prop_val[2]);
                                                      if ((prop_val_hsl[0] === ele_val_hsl[0])&&(prop_val_hsl[1] === ele_val_hsl[1])&&(prop_val_hsl[2] === ele_val_hsl[2])
                                                      || (prop_val_hsl[0] === 0 && prop_val_hsl[1] === 0 && prop_val_hsl[2] === 0 && element_ob[prop] == 'black')){
                                                          count_matching = count_matching -1
                                                      }
                                                  }
                                        }
                                }
                                else{
                                    if (element_obj[prop].match(/^.+pt$/)){
                                        ele_val = parseFloat(element_obj[prop]);
                                        min_val = parseFloat(rule.props[l]['minvalue']);
                                        max_val = parseFloat(rule.props[l]['minvalue']);
                                        if  ((min_val < ele_val < max_val)){
                                         count_matching = count_matching -1
                                        }
                                    }
                                    else if (((rule.props[l]['value'] =="")||(rule.props[l]['value'] == null)) && ((rule.props[l]['regex'] =="")||(rule.props[l]['regex'] == null))){
/*                                    console.log('element_obj ', element_obj);*/
                                        ele_val = rgb2array(element_obj[prop]);
                                        ele_val_hsl = rgb2Hsl(ele_val[0],ele_val[1],ele_val[2])
                                        min_val = rgb2array(rule.props[l]['minvalue']);
                                        min_val_hsl = rgb2Hsl(min_val[0],min_val[1], min_val[2]);
                                        max_val = rgb2array(rule.props[l]['maxvalue']);
                                        max_val_hsl = rgb2Hsl(max_val[0],max_val[1],max_val[2]);
                                        console.log('vergleichswerte', ele_val, min_val, max_val);
                                         if (min_val_hsl[0] <= ele_val_hsl[0] && ele_val_hsl[0] <= max_val_hsl[0]){
                                            if (min_val_hsl[1] <= ele_val_hsl[1] && ele_val_hsl[1] <= max_val_hsl[1]) {
                                                if (min_val_hsl[2] <= ele_val_hsl[2] && ele_val_hsl[2] <= max_val_hsl[2]){
                                                  count_matching = count_matching -1
                                                }
                                            }    
                                         }
                                         
                                    }
                                }
                            }
                            else{
                                  var regex = new RegExp(rule.props[l]['regex'])
                                  if (element_obj[prop].match(regex)){
                                      count_matching = count_matching - 1;
                                  };
                            }
            }
            else{
            }
          }
      }
      console.log('counts ends', count_matching);
      console.log(element_obj);
      if (count_matching > 0){
          console.log('its NOT matching!');
          return false
      }
      else{
          console.log('its matching!');
          return true
      }
}
function rgb2array(rgb){
    var rgb_arr = [],
    string = rgb.replace(/^rgb./, '');
    string_arr =  string.split(', ');
    for (str in string_arr){
       rgb_num = parseFloat(string_arr[str])
       console.log(str, rgb_num);    
       rgb_arr.push(rgb_num);
    }
    return rgb_arr
}
function hex2rgb(hex){
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
function createPropObject(target_element){
    var props = new Object;
         if ($(target_element).closest('span')[0]){
          for (var i=0; i < $(target_element).closest('span')[0].style.length; i++){
            if ($(target_element).closest('span')[0].style[i]!= ""){
               props[$(target_element).closest('span')[0].style[i].toString()] = $(target_element).closest('span')[0].style.getPropertyValue($(target_element).closest('span')[0].style[i])
            }
          }
         }
         else if ($(target_element).closest('p')[0]){
         for (var i=0; i < $(target_element).closest('p')[0].style.length; i++){
           if ($(target_element).closest('p')[0].style[i]!= ""){
           props[$(target_element).closest('p')[0].style[i]] = $(target_element).closest('p')[0].style.getPropertyValue($(target_element).closest('p')[0].style[i])
           
           }
         }
        }
        for (prop in props){
          if ((props[prop].indexOf('\'') > -1)|| (props[prop].indexOf('&qout') > -1)){
              props[prop] = props[prop].replace(/^\'/,'');
              props[prop] = props[prop].replace(/\'$/,'');
          } 
        }
        return props
}
function name2rgb(name){
    var arr = []
    if (name == 'black'){
        return 'rgb(0,0,0)';
    }
        if (name == 'white'){
        return arr.push(255,255,255);
    }
        if (name == 'red'){
        return arr.push(255,0,0);
    }
        if (name == 'green'){
        return arr.push(0,255,0);
    }
        if (name == 'blue'){
        return arr.push(0,0,255);
    }
}
function translateElement(target_element){
  if ($(target_element).is('p')){
    el_name = 'Paragraph';
  }
  else if ($(target_element).is('span')){
    el_name = 'Inline element';
  }
  else{
    console.log('Function: translateElement, Exception: Target element is not known');
  }
  return el_name;
}
function viewTarget(target_element){
        var props = createPropObject(target_element),
        arr1 = [], 
        par_arr= [];
        override_arr = [];
        adhoc_arr = getAdhocs(target_element);
        var style_name = getTargetStyleName(target_element),
        style = getTargetStyle(target_element, style_name);
        style_info = "<p>Style Name: " + style_name+"</p>";
        $('#style-info').html(style_info);
/*        maybe generate a table for style properties <div id='style-prop-container'><table class='inspect-prop table table-striped table-condensed'><thead><tr><th>Property</th><th>Value</th><th>Add</th></tr></thead><tbody></tbody></table></div>*/
       if ($('#hide-adhoc')[0].checked === false){ 
        for (var prop in props){
          var adhoc_status = '';
         if (asAdhoc(prop, target_element) === true){
           adhoc_status = "<span class='label label-default adhoc'>Ad Hoc</span>";
         }
         if (asOverride(prop, adhoc_arr, target_element, style) === true){
           override_arr.push(prop)
         }
         if(prop === 'color'){
           arr1.push("<tr><td>"+ prop + adhoc_status +": "+"</td><td> " + props[prop] +"<div class='form-control' style='background-color:"+props[prop]+";width:25px;height:25px;float:right;padding-right:5px;'></div> " +"</td><td><span id='"+prop+"' value='"+props[prop]+"' class='glyphicon glyphicon-plus add-as-prop istep2 clickable' aria-hidden='true'></span></td></tr>")    
         }
         else {
           arr1.push("<tr><td>"+ prop + adhoc_status +": "+"</td><td>" + props[prop] +"</td><td><span id='"+prop+"' value='"+props[prop]+"' class='glyphicon glyphicon-plus add-as-prop istep2 clickable' aria-hidden='true'></span></td></tr>")
         } 
       }
       }
       else{
         console.log('STYLE', style);
         var props_arr = $.map(style.style, (x) => {return x});
         console.log('PPROPS', props_arr);
         $.each(props_arr, function(){
           if(prop === 'color'){
             arr1.push("<tr><td>"+ this +": "+"</td><td> " + style.style[this] +"<div class='form-control' style='background-color:"+style.style[this]+";width:25px;height:25px;float:right;padding-right:5px;'></div> " +"</td><td><span id='"+this+"' value='"+style.style[this]+"' class='glyphicon glyphicon-plus add-as-prop istep2 clickable' aria-hidden='true'></span></td></tr>")    
           }
           else {
             arr1.push("<tr><td>"+ this +": "+"</td><td>" + style.style[this] +"</td><td><span id='"+this+"' value='"+style.style[this]+"' class='glyphicon glyphicon-plus add-as-prop istep2 clickable' aria-hidden='true'></span></td></tr>")
           } 
         })
       }
       
         console.log('overrideArray', override_arr);
       $.each( override_arr, function(){
         var name = this;
         var value= style.style[this];
         if (value != ''){
          arr1.push("<tr><td class='override-prop'>"+ name +": "+"</td><td> " + value +"</td><td><span id='"+name+"' value='"+value+"' class='glyphicon glyphicon-plus add-as-prop istep2 clickable' aria-hidden='true'></span></td></tr>")    
         }
       });
/*       info_text = target_name+"style: " + el.attr('class').replace(/\s.+/, '');*/
    table_content =  arr1.join(' ');   
/*  target_textnode = $(target_element).contents().filter(function(){return this.nodeType===3});*/
    $('#insp1 > table > tbody').html(table_content);
    
    $('table.inspect-prop > tbody > tr > td').children('span').first().addClass('istep2');        
/*    initGuide('inspector');*/
    $('#sm-page *[srcpath]').removeClass('inspected');
    $(target_element).closest('*[srcpath]').addClass('inspected');
}
function readSingleFile(evt){
  var file = evt.target.files[0]; 
  console.log('import_event', evt);
   if (file) {
     var r = new FileReader();
     r.onload = function(e) { 
	     var contents = e.target.result;
       importMappings(contents, evt);
     }
     r.readAsText(file);
    } else { 
      console.log("Failed to load file");
    }
}
function basicHTTPAuthString(user, passwd){
  var token = user + ":" + passwd;
  var hash = btoa(token);
  
  return "Basic " + hash;
};
/*function loadXML(file) {
  if (window.XMLHttpRequest){
    xhr = new XMLHttpRequest();
  }
  else{
  var xhr = new ActiveXObject("Microsoft.XMLHTTP"); /\*creating xml object in  ie 5 and 6*\/
    }
  xhr.open('GET',file,false);
  xhr.setRequestHeader("Content-Type","text/xml");
  xhr.send();
  return xhr.responseXML;
}*/
function updateList(){
      var arr = $('#rules1 > table > tbody').children();
      $.each(arr, function(index){
        $(this).val(arr.length-index);
        $(mapping_set).find("mapping[name='"+ $(this).children(1).eq(1).text() +"']").attr('priority', $(this).val());
        $(this).children(1).eq(0).html(arr.length-index);
      });
/*      Vergleichen der Prioritäten angefangen mit dem letzten Element. Sofern ein Wert gleich ist, wird bekommt das momentante Element, sowie alle nachfolgenden Elemente, einen nächstgrößeren Wert.*/
      li_arr = $('#rules1 > table > tbody').children();
      len = li_arr.length;
      for (var l=len; l < 0; l--){
            if (li_arr.get(len-1).getAttribute('value') === li_arr.get(l).getAttribute('value')){
            li_arr.get(len-1).setAttribute('value', li_arr.get(l).getAttribute('value'));

            for (var m=l; m < len-1; m++){
              li_arr.get(m).setAttribute('value', m+2 );
            }
          $(mapping_set).find("mapping[name='"+ li_arr.get(len-1).text +"']").attr('priority', li_arr.get(len-1).getAttribute('value'));
           li_arr.get(l).setAttribute('value', li_arr.get(len-1).getAttribute('value'));
       }
      }
}
function sendMapping(){
  objbox = document.createElement('div');
  objbox.appendChild(mapping_set)
  stringbox = objbox.innerHTML
  episode = $('meta[name=episode]').attr('content');
  var string_data = [stringbox];
  var blob = new Blob(string_data, {type: 'text/plain'});
  var fd = new FormData();
  fd.append('input_file', blob, episode+'.xml');
  fd.append('type', "stylemapper");
  fd.append('add_params', "");
$.ajax({
    type: 'POST',
    url: 'https://transpect.le-tex.de/api/upload_file',
    async:true,
    data: fd,
    processData: false,
    contentType: false,
    "beforeSend": function(xhr){
      xhr.setRequestHeader("Authorization", basicHTTPAuthString(username, password));
    },
    success: function(data){
      var callbackuri = data["callback_uri"];
      initMappingStatusRequest(callbackuri);
    }
})};
function doProgress(step, progress, status){
 var $bar = $('#progress'+ step);
/*      console.log(status, percentage,' ', actual_width)*/
           if (status == 'progress'){
              $bar.animate({width:progress+'%'}, 1000);
              $bar.css('background-color', 'linear-gradient(to bottom, #194454 0%, #1F5569 99%)');
              $('#dotsstep'+ step).removeClass('glyphicon glyphicon-ok');
              $('#dotsstep'+ step).removeClass('glyphicon glyphicon-remove');
              $('#dotsstep'+ step).addClass('dots');   
            }   
            else if (status == 'success'){
              $bar.css('background-color', 'linear-gradient(to bottom, #194454 0%, #1F5569 99%)');
              $bar.animate({width:progress+'%'}, 1000);
              $('#dotsstep'+ step).removeClass('dots');
              $('#dotsstep'+ step).removeClass('glyphicon glyphicon-remove');
              $('#dotsstep'+ step).addClass('glyphicon glyphicon-ok');
            }
            else if (status == 'failure'){
              $('#dotsstep'+ step).removeClass('dots');
              $('#dotsstep'+ step).removeClass('glyphicon glyphicon-ok');
              $bar.animate({width: progress+'%'}, 500);
            }
}
function initDocxStatusRequest(URI){
doProgress('1', 10, 'progress');
statusRequest = function(){
          $.ajax({
            url:URI,
            type:'GET',
            async: true,
            success: function (data){
                if (data["status"]){
                  if (timedrequest != null){
                    if(data["status"] === "failure"){
                    clearInterval(timedrequest);
                    resetInput($("label[for='upload-doc']")[0]);
                    createError('Conversion failed. Please make shure that the document has the right format.');
                    doProgress('1', 0, 'failure');
                }
                    else if(data["status"]==="success"){
                      var fileuri = base_uri + username +'/'+filename+'/out/temp/source-content.xhtml';
                      templateuri = base_uri + username +'/'+filename+'/out/temp/template_styles.xml';
                      var container = document.createElement('div');
                      target_styles = $(container).load(templateuri)[0], 
                      doProgress('1', 33.33, 'success');
                      
                      $('#ajax-temp').load(fileuri)
                      window.setTimeout(function(){
                       var body = '',
                       styles = $('#ajax-temp').find('style')[0];
                       body = $('#ajax-temp').children('*:not(title, style, link)');    
                       $('#sm-page').html(body);
                       $('#style-container').html($(styles).html());
                       $('#ajax-temp').children().remove();
                      clearTable();
                      }, 1000)
                      $('.createrules').removeClass('disabled02');  
                      $('*[role=presentation]').removeClass('disabled02');
                      resultListURI1 = data['result_list_uri'];
                      clearInterval(timedrequest);
                    }
                  }
               }
            },
           "beforeSend": function(xhr){
              xhr.setRequestHeader("Authorization", basicHTTPAuthString(username, password));
           }
          });
       }
          timedrequest = setInterval(statusRequest, 3000);
}
function getComputedStyleNames(){
    var content_arr = $('#sm-page').find('p'),
    style_arr = [],
    clean_arr = [];
    $.each(content_arr, function(){
        var container = this.style;
        for (prop in container) {
         var string = prop.toString()
         if (/\d+/.test(string)){
             style_arr.push(container[prop]);
         }
        }
    })
    $.each(style_arr, function(i,el){
        if ($.inArray(el,clean_arr) === -1){
            clean_arr.push(el);
        }
    })
    return clean_arr
}
function initMappingStatusRequest(URI){
doProgress('3',10, 'progress');
 statusRequest = function(){
          $.ajax({
            url:URI,
            type:'GET',
            async: true,
            success: function (data){
                if (data["status"]){
                  if (timedrequest != null){
                    if(data["status"]==="failure"){
                      clearInterval(timedrequest);
                          doProgress('3',0, 'failure');
                    }
                    else if(data["status"]==="success"){
                      var fileuri = base_uri + username +'/'+filename+'/out/temp/source-content.xhtml'
                      $('#sm-page').load(fileuri);
                       doProgress('3',33.33, 'success');
                       clearInterval(timedrequest);                       
                       resultListURI2 = data['result_list_uri'];
                       getResultList(resultListURI2);
                       getResultList(resultListURI1);
                       $('#download').css('display', 'block');
                    }
                   else{
                     $('#download').css('display', 'block');
                   }
                  }
               }
            },
           "beforeSend": function(xhr){
              xhr.setRequestHeader("Authorization", basicHTTPAuthString(username, password));
           }
          });       
}
timedrequest = setInterval(statusRequest, 1000);
}
function downloadRules(){
 var current_date = (new Date()).toISOString().slice(0,10);
     mapping_set.setAttribute('date', current_date);
 var data = $(mapping_set).prop('outerHTML'),
     file = new Blob([data],{type: "text/xml;charset='utf-8'"});    
     saveAs(file, 'mapping_rules_'+current_date+'.xml');
}
function getResultList(URI){
  $('#download').children().remove();
  $.ajax({
            url: URI,
            type:'GET',
            async:true,
            success: function (data){
             if(data && data["files"]){
              var files = data["files"];
              for(var file in files){
                if(files.hasOwnProperty(file)){
                var fileLink = files[file]["download_uri"];
                  console.log('file', file);
                if (file.includes('.mod')){
                var fileLinkObject = $("<a role='button' target=\"_blank\" href=\"" + fileLink + "\">Modified Document</a>");
                  $('#download').append(fileLinkObject[0]);
                }
               }
              }
             }
            },
            "beforeSend": function(xhr){
              xhr.setRequestHeader("Authorization", basicHTTPAuthString(username, password));
           }
          });
}
function makeMapsSortable(){
$('.sortable').sortable({        
    stop: function(event, ui) {
        $( event.originalEvent.target ).on('click', function(e){ e.stopImmediatePropagation(); } );},
    update: function(event, ui){
      updateList();
      $('.preview-all').prop('checked', false);
      $('.preview-all').trigger('change');
}});
};
function clearTable(){
  cssstyles = getComputedStyleNames();
  $('#properties').children().remove();
  rules_count = $(mapping_set).children().length +1;
  $('#properties').children('a').remove();
  $('#name').val("");
  $('#priority').val(rules_count);
  $('#target-style').val("");
  $('#target-type').val("");
   rule_props = [];
   initCheckboxes();
   initPriority();
   $("a.my-popover").popover();
   $("#add-prop").on("click",function(event){
    updatePropTable();
   })
     $('#name').val('Mapping'+ rules_count);
   property = document.getElementById('properties');
   createTargetStyles('', 'clear');
   propobserver.observe(property, {childList:true, attributes: true});
  $('button#save-map').show();
  $('button#discard-map').hide();
  $('button#change-map').hide();
}
function clearPropTable(){
  $('#pname').val("");
  $('#pname').trigger('change');;
  $('#pvalue').val("");
  $('#pmin-value').val("");
  $('#pmax-value').val("");
  $('#pregex').val("");
  $('#prelevant').val("true");
  $('button#attach-prop').show();
  $('button#discard-prop').hide();
  $('button#change-prop').hide();
}
function resetEditor(){
    $('#name').val("");
    $('#target-style').val("");
    var checked = $('#remove-adhoc').find(':checked');
    $each(checked, function(){
       $(this).prop('checked', false); 
    });
    $('#rule1').children('div').remove()
}
function editMapping(name){
  clearTable();
  var map_obj = getMapping(name);
  $('#name').val(map_obj.name);
  $('#priority').val(map_obj.priority);
  $('#target-type').val(map_obj.targettype);
  $('#target-type').trigger('change');
  $('#target-style').val(map_obj.targetstyle);
  var adhoc_arr = map_obj.removeadhoc.split(" ");
  console.log(adhoc_arr);
  for (var i=0; i < cssstyles.length; i++){
      for ( var j=0; j < adhoc_arr.length; j++){
          if (cssstyles[i] == adhoc_arr[j]) {
               console.log(cssstyles[i]);
             console.log($("#mapping > li > input[name="+cssstyles[i]+"]"));
             $("input[name="+cssstyles[i]+"]").attr('checked', true)
          }
      }
  }
  for (prop in map_obj.props){
      map_obj.props[prop].id = guid();
  }
  $ul_content = $(props2ul(map_obj.props));
  $('#properties').html($ul_content.html());  
}
function editProp(id){
  $li_prop = $("li[id='"+ id + "']");
  console.log('list_property', $li_prop);
  updatePropTable();
  $('select#pname').val($li_prop.attr('data-name'));
  $('select#pname').trigger('change');
  $('#prelevant').val($li_prop.attr('data-relevant'));
    if ($li_prop.attr('data-name')==='color'){
     getColor($li_prop.attr('data-value'),$li_prop.attr('data-minvalue'),$li_prop.attr('data-maxvalue'));   
    }
  $('#pvalue').val($li_prop.attr('data-value'));
  $('#pmin-value').val($li_prop.attr('data-minvalue'));
  $('#pmax-value').val($li_prop.attr('data-maxvalue'));
  $('#regex').val($li_prop.attr('data-regex'));
  if (!($li_prop.attr('data-value') && !($li_prop.attr('data-regex')))){
  $('#r2').prop('checked', true);
  $('#r3').prop('checked', true);
  $('#r2').trigger('click');
  }
  else if (!($li_prop.attr('data-value')) && !($li_prop.attr('data-minvalue'))){
      $('#r4').prop('checked', true);
      $('#r4').trigger('click');
  }
  else{
      $('#r1').prop('checked', true);
      $('#r1').trigger('click');
  }
  $("input.valgroup[type='text']").each(function(){
    if ($(this).val()){
      $(this).trigger('input');
    }
    
  });
}
function setMapping(){
  map_obj = new Mapping();
  map_obj.name = document.getElementById('name').value;
  map_obj.priority = document.getElementById('priority').value;
  map_obj.targetstyle = document.getElementById('target-style').value;
  map_obj.targettype = document.getElementById('target-type').value;
  
  var adhoc_arr = [];
  adhoc_arr = $('#remove-adhoc > li').find('input:checked');
  var val_arr = [];
  adhoc_arr.each( function (){
      val_arr.push(this.value)
  })
  adhoc_string = val_arr.join(" ");
  map_obj.removeadhoc = adhoc_string;
  return map_obj
}
function getMapping(name){
  var map1 = $(mapping_set).find("mapping[name='"+name+"']");
  map_obj = new Mapping();
  if (map1.length > 0){
  map_obj.name = map1[0].getAttribute('name');
  map_obj.priority = map1[0].getAttribute('priority');
  map_obj.targetstyle = map1[0].getAttribute('target-style');
  map_obj.targettype = map1[0].getAttribute('target-type');
  map_obj.removeadhoc = map1[0].getAttribute('remove-adhoc');
  var prop_element = $(map1[0]).find('prop');
  for (var i=0; i < $(map1[0]).children().length ; i++){
    var prop = new Prop();
    prop.name = prop_element[i].getAttribute('name');
    if (prop_element[i].getAttribute('value') != null){
    prop.value =  prop_element[i].getAttribute('value');
    };
    prop.minvalue =  prop_element[i].getAttribute('min-value');
    prop.maxvalue =  prop_element[i].getAttribute('max-value'); 
    prop.regex =  prop_element[i].getAttribute('regex');
    prop.relevant =  prop_element[i].getAttribute('relevant');
    for (a in prop){
    if (prop_element[i].getAttribute(prop.name+'-h') != null){
    prop[prop.name+'h'] = prop_element[i].getAttribute(prop.name+'-h');
    prop[prop.name+'s'] = prop_element[i].getAttribute(prop.name+'-s');
    prop[prop.name+'l'] = prop_element[i].getAttribute(prop.name+'-l');
    }
    if (prop_element[i].getAttribute(prop.name+'-min-h') != null){
    prop[prop.name+'minh'] = prop_element[i].getAttribute(prop.name+'-min-h');
    prop[prop.name+'mins'] = prop_element[i].getAttribute(prop.name+'-min-s');
    prop[prop.name+'minl'] = prop_element[i].getAttribute(prop.name+'-min-l');
    prop[prop.name+'maxh'] = prop_element[i].getAttribute(prop.name+'-max-h');
    prop[prop.name+'maxs'] = prop_element[i].getAttribute(prop.name+'-max-s');
    prop[prop.name+'maxl'] = prop_element[i].getAttribute(prop.name+'-max-l');
    }
    }
    map_obj.props.push(prop);
  }
  return map_obj
  }
}
function deleteMapping(name){
  $(mapping_set).find("mapping[name='"+name+"']")[0].remove();
  showMaps();
}
function addProps(map_obj){
 var proplinks = $('#properties').find('li');
 for (var i=0; i < proplinks.length; i++){
   /*var prop = getPropById(proplinks[i].id);*/
   var prop = li2prop(proplinks[i]);
   console.log('single li during function addProps()', proplinks[i]);
   console.log('single prop during function addProps()', prop);
   map_obj.props.push(prop);
   
 }
}
function deleteProp(id){
  var listitem = document.getElementById(id);
  var listindex = $('#properties > li').index(listitem);
  console.log('id', id)
  $('#'+id).remove();
  temp_props.splice(listindex, 1)
}
function setProp(type){
/*the type parameter must be 'new' or 'change'*/
var prop1 = new Prop();
    prop1.name =  $('select#pname').val();
    prop1.relevant =  $('#prelevant').val();
    prop1.id = guid();
    console.log('prop vor der bedingung', prop1);
    if (prop1.name == 'color' || prop1.name == 'background-color'){
    console.log('propchecked', $('#r1').prop('checked'));
    console.log(prop1, 'nach der bedingung');
            var name = prop1.name.replace(/-/, '');    
            if ($('#pregex').val() != ""){
             prop1.regex =  $('#pregex').val();
            }
            else if ($('#r2').prop('checked') == true || $('#pvalue').val() == null || $('#pvalue').val() == 'undefined'){
                prop1.minvalue =  $('#pmin-value').val();
                prop1.maxvalue =  $('#pmax-value').val();
            var rgb_min_arr = rgb2array(prop1.minvalue),
            rgb_max_arr = rgb2array(prop1.maxvalue),
            hsl_min_arr = rgb2Hsl(rgb_min_arr[0],rgb_min_arr[1],rgb_min_arr[2]),
            hsl_max_arr = rgb2Hsl(rgb_max_arr[0],rgb_max_arr[1],rgb_max_arr[2]);
             var minh = name+'minh',
                    mins = name+'mins',
                    minl = name+'minl',
                    maxh = name+'maxh',
                    maxs = name+'maxs',
                    maxl = name+'maxl';
                prop1[minh] = hsl_min_arr[0];
                prop1[mins] = hsl_min_arr[1];
                prop1[minl] = hsl_min_arr[2];
                prop1[maxh] = hsl_max_arr[0];
                prop1[maxs] = hsl_max_arr[1];
                prop1[maxl] = hsl_max_arr[2];
                    console.log('colors', prop1[minh], prop1[mins]);
            }
            else if ($('#r1').prop('checked') == true){
                prop1.value =  $('#pvalue').val();
                var rgb_value_arr = rgb2array(prop1.value),
                hsl_value_arr = rgb2Hsl(rgb_value_arr[0],rgb_value_arr[1],rgb_value_arr[2]),
                h = name+'h',
                s = name+'s',
                l = name+'l';
                prop1[h] = hsl_value_arr[0];
                prop1[s] = hsl_value_arr[1];
                prop1[l] = hsl_value_arr[2];
            }
           }
    else{
        prop1.value =  $('#pvalue').val();
        prop1.regex =  $('#pregex').val();
        prop1.minvalue =  $('#pmin-value').val();
        prop1.maxvalue =  $('#pmax-value').val();
    }
    if (checkProp(prop1) === true) {
        var list_props_true = $('#properties').find('li[data-name=' +prop1.name+ "][data-relevant='true']"),
        list_props_not_name = $('#properties > li');
        if (type == 'new'){
            for (var i=0; i < list_props_true.length; i++){
                list_props = list_props_true;
                var data = $(list_props[i]).data();
                console.log('step relevant', data.relevant, prop1.relevant);
                if (data.relevant.toString() == prop1.relevant){
        /*                console.log('this', list_props[i]);*/
                        createQuery(prop1, list_props[i]);            
                }
        /*        else if ((data.value == prop1.value || (data.minvalue == prop1.minvalue && data.maxvalue == prop1.maxvalue || data.regex == prop1.regex)) && (data.relevant.toString() != prop1.relevant)){
                        console.log('same values values',$(list_props[i]).attr('id'));
                        console.log(data.relevant, prop1.relevant);
                        alert('2');
                        storeProp(prop1);
                        deleteProp($(list_props[i]).attr('id'))
                }
                else if ((data.value == prop1.value || (data.minvalue == prop1.minvalue && data.maxvalue == prop1.maxvalue || data.regex == prop1.regex)) &&  prop1.relevant  == 'false'){
                         alert('2');
                         createQuery(prop1, list_props[i]);
                }
                else if ((data.value != prop1.value || (data.minvalue != prop1.minvalue || data.maxvalue != prop1.maxvalue || data.regex == prop1.regex)) &&  prop1.relevant  == 'false'){
                         createQuery(prop1, list_props[i]);
                }
                else {
                       
                }*/
            }
        }
        else if (type == 'change'){
            storeProp(prop1);
            $('button#change-prop').hide().attr('data-id',event.target.getAttribute('data-id')); 
            $('button#discard-prop').hide();
            $('button#attach-prop').show();
        }
        else{
            console.log('no type attribute was set');
        }
        if (($('#properties').find('li').length == 0) || ($('#properties').find('li').length != 0 && type == 'new')){
                console.log('prop1 kurz vor der speicherung'); 
                storeProp(prop1);
        }
        else{
            console.log('Failed to attach Property!');
        }
    }
}
function storeProp(prop){
     var li = prop2li(prop);
     $('#properties').append(li);
     $('#add-prop').trigger('click');
     createSuccess('Rule property appended!');
     clearPropTable();
}
function createQuery(prop, conflict_li){
    $(".modal-content").html("<div class='modal-header'>Attention!</div><div class='modal-body'>Properties in conflict: </div><div class='modal-footer'> <button type='button' class='btn btn-default override' data-dismiss='modal'>Replace</button><button type='button' class='btn btn-primary override' data-dismiss='modal'>Store</button><button type='button' class='btn btn-primary override' data-dismiss='modal'>Abort</button></div>");        
      $('.modal').modal('show');
}
function checkProp(prop){
    var table_rows = $('#add-prop1 > table > tbody').find('tr');
    console.log(prop, '  ', prop.name);
    if (prop.name === null){
    createError('Error: Missing prop name.');
    table_rows[0].setAttribute('class','form-group has-error has-feedback');
             window.setTimeout(function(){
                $(table_rows[0]).removeClass('form-group has-error has-feedback');
             }, 2000);
    return false
  }
   else if (!(prop.value) && (!(prop.minvalue) || !(prop.maxvalue)) && !(prop.regex)){
    createError('Error: Missing value OR value min-max-range OR regular expression.');
    if (!(prop.value) ){
    table_rows[1].setAttribute('class','form-group has-error has-feedback');
    table_rows[2].setAttribute('class','form-group has-error has-feedback');
    table_rows[3].setAttribute('class','form-group has-error has-feedback');
    table_rows[4].setAttribute('class','form-group has-error has-feedback');
             window.setTimeout(function(){
                $(table_rows[1]).removeClass('form-group has-error has-feedback');
                $(table_rows[2]).removeClass('form-group has-error has-feedback');
                $(table_rows[3]).removeClass('form-group has-error has-feedback');
                $(table_rows[4]).removeClass('form-group has-error has-feedback');
             }, 2000);
    }
  }
  else{
      return true
  }  
}
function saveMapping(override, type){
    var mapping = setMapping();
    addProps(mapping);
    console.log('ruleobj', map_obj, 'override  ', override);
    if (checkMapping(map_obj, override) == true && $(mapping_set).find("mapping[name='"+mapping.name+"']")[0]){
        var map_el = $(mapping_set).find("mapping[name='"+mapping.name+"']")[0];
        $(map_el).remove();
    }
    else if (checkMapping(map_obj, override) == true && $(mapping_set).find("mapping[name='"+$('button#change-map').attr('name')+"']")[0] && type == 'change'){
        deleteMapping($('button#change-map').attr('name'));
    }
    if ($(mapping_set).find("mapping[name='"+mapping.name+"']")[0] && type == 'new'){
      $(".modal-content").html("<div class='modal-header'>Attention!</div><div class='modal-body'>Mapping already exists. Do you want to change it?</div><div class='modal-footer'><button type='button' class='btn btn-default override' data-dismiss='modal'>No</button><button type='button' class='btn btn-primary override' data-dismiss='modal'>Yes</button></div>");
      $('.modal').modal('show');
    }
    if ((checkMapping(map_obj, override) === true)){
    
    var mapping = document.createElement('mapping');
    mapping.setAttribute('name', map_obj.name);
    mapping.setAttribute('priority', map_obj.priority);
    mapping.setAttribute('target-type', map_obj.targettype);
    mapping.setAttribute('target-style', map_obj.targetstyle);
    mapping.setAttribute('remove-adhoc', map_obj.removeadhoc);

    $.each($('#properties').find('li'), function(){
      var property = document.createElement('prop');
      property.setAttribute('name', $(this).attr('data-name'));
      property.setAttribute('relevant', $(this).attr('data-relevant'));
      var name = $(this).attr('data-name');
/*      console.log('NAME', name);
      console.log('TYPEOF VALUE', typeof $(this).attr('data-value'), typeof undefined);
      console.log('TYPEOF MINVALUE', typeof $(this).attr('data-minvalue'), typeof undefined);
*/      if (name == 'color' || name == 'background-color' && typeof $(this).attr('data-regex') == undefined){
                  if ((typeof $(this).attr('data-value') == typeof undefined) && (typeof $(this).attr('data-regex') == typeof undefined) ){
                      property.setAttribute('max-value', $(this).attr('data-maxvalue'));
                      property.setAttribute('min-value', $(this).attr('data-minvalue'));
                      property.setAttribute(name+'-min-h', $(this).attr('data-'+name+'-min-h'));
                      property.setAttribute(name+'-min-s', $(this).attr('data-'+name+'-min-s'));
                      property.setAttribute(name+'-min-l', $(this).attr('data-'+name+'-min-l'));
                      property.setAttribute(name+'-max-h', $(this).attr('data-'+name+'-max-h'));
                      property.setAttribute(name+'-max-s', $(this).attr('data-'+name+'-max-s'));
                      property.setAttribute(name+'-max-l', $(this).attr('data-'+name+'-max-l'));
                  }
                  else{
                      property.setAttribute('value', $(this).attr('data-value'));
                      property.setAttribute(name+'-h', $(this).attr('data-'+name+'-h'));
                      property.setAttribute(name+'-s', $(this).attr('data-'+name+'-s'));
                      property.setAttribute(name+'-l', $(this).attr('data-'+name+'-l'));
                  }         
      }
      else if (typeof $(this).attr('data-value') != typeof undefined){
          property.setAttribute('value', $(this).attr('data-value'));
      }
      else if (typeof $(this).attr('data-minvalue')!= typeof undefined){
          property.setAttribute('min-value', $(this).attr('data-minvalue'));
          property.setAttribute('max-value', $(this).attr('data-maxvalue'));
      }
      else if (typeof $(this).attr('data-regex')!= typeof undefined){
          property.setAttribute('regex', $(this).attr('regex'));
      }
      
      mapping.appendChild(property)
    });
    createSuccess('Mapping rule saved!');
    mapping_set.appendChild(mapping);
    sortByPriority()
    showMaps();
    handleContent('rules', 'open');
    clearTable();
    }
}
function checkMapping(mapping, override, type){
  var table_rows = $('#mapping > tbody').find('tr');
  if (!(mapping.name)){
    createError('Missing mapping name.');
    table_rows[0].setAttribute('class','form-group has-error has-feedback');
             window.setTimeout(function(){
                $(table_rows[0]).removeClass('form-group has-error has-feedback');
             }, 2000);
    return false
  }
  else if (!(mapping.priority)){
    createError('Missing priority.');
    table_rows[1].setAttribute('class','form-group has-error has-feedback');
             window.setTimeout(function(){
                $(table_rows[1]).removeClass('form-group has-error has-feedback');
             }, 2000);
    return false 
  }
  else if (mapping.priority && !(/^\d+$/.test(mapping.priority))){
    createError('Priority must be a number.');
    table_rows[1].setAttribute('class','form-group has-error has-feedback');
             window.setTimeout(function(){
                $(table_rows[1]).removeClass('form-group has-error has-feedback');
             }, 2000);
    return false
  }
  else if (!(mapping.targettype)){
    createError('Missing target type.');
    table_rows[2].setAttribute('class','form-group has-error has-feedback');
             window.setTimeout(function(){
                $(table_rows[2]).removeClass('form-group has-error has-feedback');
             }, 2000);
    return false
  }
  else{
    return true
  }
}
function initColorPicker(){
           $('span > div.cp-container').remove();
           $('#pvalue').parent('td').html("<input id='r1' type='radio' class='rbox valgroup val1' name='optradio' value='' checked=''></input><input id='pvalue' type='text' class='form-control colvalue colinput val1' data-color-format='rgb' value=''></input>");
           $('#pmin-value').parent('td').html("<input id='r2' class='p-min-max rbox valgroup val2' type='radio' name='optradio' value='' checked=''></input><div id='pmin-value' class='hsl-min colinput val2' value=''></div>");
           $('#pmax-value').parent('td').html("<input id='r3' type='radio' class='p-min-max rbox valgroup val2' name='optradio1' value='' checked=''></input><div id='pmax-value' class='hsl-max colinput val2' value=''></div>");
           $('#pregex').parent('td').html("<input id='r4' type='radio' name='optradio' class='rbox valgroup val3' value='' checked=''></input><input id='pregex' type='text' class='form-control colinput val3' value=''></input>");
            $(".colvalue").ColorPickerSliders({
               order: {
                hsl: 1
               },
               onchange: function(container, color){
                   var updated_color = 'rgb('+color.rgba['r']+', '+color.rgba['g']+', '+color.rgba['b']+')';
                    $('#pmax-value').val(updated_color);
                   $('.hsl-min').trigger("colorpickersliders.updateColor", updated_color)
                   $('.hsl-max').trigger("colorpickersliders.updateColor", updated_color);
               }
            });
            $(".hsl-min").ColorPickerSliders({
                flat: true,
                previewformat: 'hsl',
                order: {
                    hsl: 1
                    },
                onchange: function(container, color){
                    var updated_color = 'rgb('+color.rgba['r']+', '+color.rgba['g']+', '+color.rgba['b']+')';
              $('#pmin-value').val(updated_color);
                }
            });
            $(".hsl-max").ColorPickerSliders({
                flat: true,
                previewformat: 'hsl',
                order: {
                    hsl: 1
                },
                onchange: function(container,color){
                     var updated_color = 'rgb('+color.rgba['r']+', '+color.rgba['g']+', '+color.rgba['b']+')';
                  $('#pmax-value').val(updated_color);
                }
            });
        $('.cp-container').ready(function(){
                    $('.hsl-min > div.cp-container > div.cp-swatches').hide();
                    $('.hsl-max > div.cp-container > div.cp-swatches').hide();
                    
        });
        $('#r1').on('click',function(){
            if ($(this).prop('checked') == true){
                $('#r2').prop('checked', false); 
                $('#r3').prop('checked', false);               
            }
         })
         $('#r2').on('click',function(){
            if ($(this).prop('checked') == true){
                $('#r1').prop('checked', false); 
                $('#r3').prop('checked', true); 
                $('#r4').prop('checked', false);
            }
         })
         $('#r3').on('click',function(){
            if ($(this).prop('checked') == true){
                $('#r1').prop('checked', false); 
                $('#r2').prop('checked', true); 
                $('#r4').prop('checked', false);
            }
         })
         $('#r4').on('click',function(){
            if ($(this).prop('checked') == true){
                $('#r2').prop('checked', false); 
                $('#r3').prop('checked', false);
            }
         })
         
         $('#r1').trigger('click');
         $('#r3').prop('checked', false);
         
}
function getColor(rgbcolor,hslmincolor,hslmaxcolor){
    if (hslmincolor == "" && hslmaxcolor== ""){
        var hslmincolor = rgbcolor,
            hslmaxcolor = rgbcolor;
        }
    else if (!rgbcolor && hslmincolor && hslmaxcolor){
        var rgbcolor = '';
    }
            $('.colvalue').trigger("colorpickersliders.updateColor", rgbcolor);
            $('.hsl-min').trigger("colorpickersliders.updateColor", hslmincolor);
            $('.hsl-max').trigger("colorpickersliders.updateColor", hslmaxcolor);
            $('#value').val(rgbcolor);
            $('#pmin-value').val(hslmincolor);
            $('#pmax-value').val(hslmaxcolor);
            $('#value').attr('value',rgbcolor);
            $('#pmin-value').attr('value',hslmincolor);
            $('#pmax-value').attr('value',hslmaxcolor);
}
function rgb2Hsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0;
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}
function handleContent(id, task){
/* function to open or close a menu*/
console.log($('#'+id).children('span')[0]);
    if ($('#'+id).children('span').hasClass('glyphicon-menu-left') && task == 'open'){
        $('#'+id).trigger('click');
    }
    else if ($('#'+id).children('span').hasClass('glyphicon-menu-down') && task =='close'){
        $('#'+id).trigger('click');
    }
    else{
        return
    }
}
function asOverride(prop, adhoc_arr, target_element, style){
 var styles_arr = $.map(document.styleSheets[3].cssRules, (x) => {return x.selectorText});     
/* console.log('styles array', styles_arr, target_element);*/
 var bool = false;
  $.each(styles_arr, function(index){
     var property_arr = style.style;   
     class_name = this.replace(/^\./, '');
/*     console.log('has propp?!', property_arr, property_arr.hasOwnProperty(prop), prop, index);*/
     if ($(target_element).hasClass(class_name) && property_arr.hasOwnProperty(prop) === true && asAdhoc(prop, target_element) == true){
           return bool = true;
     }
 })
return bool;
}
function asAdhoc(prop, target_element){
  var bool = false;
  adhoc_arr = getAdhocs(target_element);
  $.each(adhoc_arr, function(index){
    if (this == prop){
       console.log('this', this, 'prop', prop);
      return bool = true;
    }
  })
 return bool;
}
function getAdhocs(target){
  adhcss_arr = [];
  $.each(target.attributes, function(){
     if (this.name.match(/^adhcss.+/) != null){
       adhcss_arr.push(this.name.replace(/^adhcss\:/, '').replace(/\:.+/, ''));
     }
  });
console.log(adhcss_arr, 'adhoccss array');
  return adhcss_arr;
}
function getTargetStyleName(target_element){
  var styles_arr = $.map(document.styleSheets[3].cssRules, (x) => {return x.selectorText;}),
  style_name = "No Style";
  console.log(styles_arr, 'Stylearr');
  $.each(styles_arr, function(index){
     if ($(target_element).hasClass(this.replace(/^\./, ''))){
       return style_name = this;
     }
  })
  return style_name
}
function getTargetStyle(target_element, style_name){
  var styles_arr = $.map(document.styleSheets[3].cssRules, (x) => {if (x.selectorText == style_name){return x}});
  console.log(styles_arr[0]);
  return styles_arr[0]
}
function generateBreadcrumbs(target_element){
  var parents = $($(target_element).parents('*[srcpath]')),
   el_name = '',
   target_name = translateElement(target_element);
        if ($("#breadcrumbs > a[srcp='"+$(target_element).attr('srcpath')+"']").attr('srcp') == $(target_element).attr('srcpath')){
        }
         else{
           $('#breadcrumbs').children().remove();
         
           $.each(parents, function(){
               el_name = translateElement(this);
             if (el_name != ''){
               $('#breadcrumbs').prepend("<a href='#' class='clickable' srcp='"+ $(this).attr('srcpath') +"'>"+el_name+"</a><span> &gt </span> ");
             }
           });
           $('#breadcrumbs').append("<a href='#' class='clickable' srcp='"+ $(target_element).attr('srcpath')+"'>"+target_name+ "</a>");
        }  
}
/*Initialization of the application ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
showMaps();
clearTable();
checkSize();
window.addEventListener("resize", checkSize)
/* init eventhandlers ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
$('#insp').on('click', function(evt){
  var $win = $(window);
  $inspector.toggle()
  if ($inspector.css('display') == 'none'){
     $sidebar[0].className = 'col-sm-4 col-md-3 col-lg-3';
     $menu[0].className = 'col-sm-12 col-md-12 col-lg-12';
     $doc[0].className = 'col-sm-8 col-md-9 col-lg-9 pull-right';   
  }
  else{
     $sidebar[0].className = 'col-sm-6 col-md-5 col-lg-5';
     $inspector[0].className = 'col-xm-12 col-sm-6 col-md-5 col-lg-5';
     $menu[0].className = 'col-sm-6 col-md-7 col-lg-7';
     $doc[0].className = 'col-sm-6 col-md-7 col-lg-7 pull-right';    
  }
})
;( function( $, window, document, undefined )
{
	$( '.inputfile' ).each( function()
	{
		var $input	 = $(this),
			$label	 = $input.next( 'label' ),
			labelVal = $label.html();
		$input.on( 'change', function( e )
		{
			var fileName = '';
			if( this.files && this.files.length > 1 )
				alert('Only 1 document per upload!')
			else if( e.target.value )
				fileName = e.target.value.split( '\\' ).pop();

			if( fileName)
				$label.find( 'span > span' ).html( fileName );
			else
				$label.html( labelVal );
		});
		// Firefox bug fix
		$input
		.on( 'focus', function(){ $input.addClass( 'has-focus' ); })
		.on( 'blur', function(){ $input.removeClass( 'has-focus' ); });
	});
})( jQuery, window, document);
$('#remove-insp').on('click', function(){
  $('#insp').trigger('click')  
})
$("form#docxfile").submit(function(evt){
    $('#download').children().remove();
    $('#dotsstep3').attr('class', '');
    filename = document.getElementById('upload-doc').value.replace(/^.*\\/, "");
var formData = new FormData($(this)[0]);
    formData.append('type','stylemapper');
    formData.append('add_params', '');
    $.ajax({
      url: 'https://transpect.le-tex.de/api/upload_file',
      type: 'POST',
      data: formData,
      async:true,
      success: function (data){
          var callbackURI = data['callback_uri'];
          initDocxStatusRequest(callbackURI);
      },
      "beforeSend": function(xhr){
          xhr.setRequestHeader("Authorization", basicHTTPAuthString(username, password));
      },
      cache: false,
      contentType:false,
      processData:false
  })
  return false
})  
$('#attach-prop').on('click', function(){
    setProp('new');
  })
$('.navpoint').on('click', function(){
  $span = $($(this).children('span.navsym')[0]);
  if ($span.hasClass('glyphicon-menu-left')){
    $span.removeClass('glyphicon-menu-left');
    $span.addClass('glyphicon-menu-down')
    $('#'+this.id+'1').show();
  }
  else{
    $span.removeClass('glyphicon-menu-down')
    $span.addClass('glyphicon-menu-left')
    $('#'+this.id+'1').hide();
  }
})
$('#create-rule').on('click', function(){
  handleContent('rule', 'open');
  clearTable();
  $('#name').blur();
})
$("#save-map").on('click', function(){
      $("#status").hide();
      $("#status").children().remove();
      saveMapping(false, 'new');
});
$('ul#properties').on('click', 'li > span.edit-prop', function(event){
        editProp(event.target.getAttribute('data-id'));
        $('button#change-prop').show().attr('data-id',event.target.getAttribute('data-id')); 
        $('button#discard-prop').show();
        $('button#attach-prop').hide();
        handleContent('add-prop', 'open');
});
$('ul#properties').on('click', 'li > span.delete-prop', function(event){
    deleteProp(event.target.getAttribute('data-id'));
});
$('button#change-prop').on('click', function(){
          deleteProp($(this).attr('data-id'));
          setProp('change');
        })
$('button#discard-prop').on('click', function(){
    $('button#attach-prop').show();
    $('button#discard-prop').hide();
    $('button#change-prop').hide();
    clearPropTable();
    handleContent('add-prop', 'close');
 })
 $('button#change-map').on('click', function(){
   saveMapping(false, 'change');
 })
$('button#discard-map').on('click', function(){
    $('button#discard-map').hide();
    $('button#change-map').hide();
    clearPropTable();
    clearTable();
    handleContent('rule', 'close');
 });
 $('div#rules1 > table').on('click', 'tbody > tr > td > span.edit-map', function(){
        editMapping($(this).attr('name'));
       $('button#change-map').show().attr('name', $(this).attr('name')); 
        $('button#discard-map').show();
        $('button#save-map').hide();
        handleContent('rule', 'open');
});
$('div#rules1 > table').on('click', 'tbody > tr > td > span.delete-map', function(){
        deleteMapping($(this).attr('name'));
});
$('#expandboxes, #collapseboxes').on("click","span", function(){
    $('#expandboxes').toggle();
    $('#collapseboxes').toggle();
    $('#remove-adhoc').toggle();
});
$('#step2').on('click', function(){
    $("#mapping-import")[0].addEventListener('change', readSingleFile, false);
    var selected_file = $('input[type=file]#mapping-import').filter(function(){
        return $.trim(this.value) != ''
    }).length  > 0 ;
    if (selected_file){
        var evt = document.createEvent('HTMLEvents')
        evt.initEvent('change', readSingleFile, false);
        $("#mapping-import")[0].dispatchEvent(evt)
        
        $("#mapping-import").trigger('onchange')
    }
    $("#mapping-import")[0].removeEventListener('change', readSingleFile, false);
})
$('#insp-options1').on('change', 'input#hide-adhoc', function(){
    if (this.checked === false){
      showAdhoc();
    }else if(this.checked === true){
      hideAdhoc();
    }
    $("*[srcpath='"+ this.getAttribute('srcp')+"']").trigger('click');
});
$('div.modal-content').on('click', 'div.modal-footer > button.override', function(event){
     if (event.target.innerHTML === 'Yes'){
      saveMapping(true, 'change');
     }
     else if (event.target.innerHTML === 'Store'){
        $(conflict_li).attr('data-relevant', 'false');
        $(conflict_li).find('span.relevant').html('false');
        storeProp(prop)
     }
     else if (event.target.innerHTML === 'Replace')  {
        storeProp(prop);
        deleteProp($(li).attr('id'))
     }
     else if (event.target.innerHTML === 'Abort'){
         return
     }
     else{
       return false;
     }
});
$('#rules1 > table > tbody').on('click', '.ui-sortable-handle > td.point > a', function(){
  $(this).trigger('focus');
});
$('#prop_form > tbody').on('input', $('tr > td> input.valgroup'), function(evt){
  makeValueLonely(evt.target)
})
$('#prop_form > tbody').on('click', 'tr > td >#r1, tr > td > #r2, tr > td > #r3, tr > td > #r4', function(evt){
  makeValueLonely(evt.target);
/*  $(this).next().trigger('change');*/
})
$('#sm-page').on('click', 'a', function(event){
      event.preventDefault();
      console.log('prevented');
})
$('#sm-page').on('click','span[style][srcpath], p[style][srcpath]',function(event) {
        event.stopImmediatePropagation();
        generateBreadcrumbs(this);
        $('#hide-adhoc').attr('srcp', this.getAttribute('srcpath'));
        if ($('#insp1').css('display') == 'none'){
          $('#insp').trigger('click');
        }
        $("a[srcp='"+ this.getAttribute('srcpath')+"']").trigger('click');
})
$('table.inspect-prop').on('click', 'span.add-as-prop', function(event){
            var id = $(event.target).attr('id');
            var value = $(event.target).attr('value');
            handleContent('rule', 'open');
            handleContent('add-prop', 'open');
            $('select#pname').val(id);
            $('select#pname').trigger('change');
            if (id==='color'){
             getColor(value);   
            }
            $('#pvalue').val(value);
            $('#pvalue').trigger('input');
            if ($('#name').val() == ''){
              $('#name').val('Mapping'+ ($(mapping_set).children().length +1));
            }
})
$('#breadcrumbs').on('click', 'a[srcp]', function(){
/*   makes shure that the hide ad hoc function acts dynamic refering to the inspection during its change*/
  $('#hide-adhoc').attr('srcp', this.getAttribute('srcp'));
  $("#breadcrumbs > a").not(this).css('font-weight', 'normal')
  $(this).css('font-weight', 'bold')
/*  console.log(this.getAttribute('srcp'));*/
  viewTarget($("*[srcpath='"+ this.getAttribute('srcp')+"']")[0]);
});
$('#help').on('click', function(){
  count++
  function isEven(c){
    return c % 2 == 0
  }
  if (isEven(count) === true){
    $('span.glyphicon-info-sign').hide();
  }else if (isEven(count) === false){
    $('span.glyphicon-info-sign').show();
  };
});
$('#delete-content').on('click', function(){
  $('#sm-page').children().remove();
  resetInput($("label[for='upload-doc']")[0]);
})
$('#step3').on('click', function(){
  if ($('#sm-page').children().length == 0){
      createError('No document found. Please upload a document before applying.');
  }
  else if (mapping_set.childNodes.length == 0){
    createError('No rules found. Please create or import rules before applying.');
  }
  else{
    sendMapping()
  }
});
    $('.clickable').on('click', function(){
/*  $(this).find('*').animate({fontSize: '95%', width: '99%', height: '99%'}, 200);*/
/*TODO - CLICK FEEDBACK FOR CLICKABLE ELEMENTS*/
});
$('#download-rules').on('click', function(){
  downloadRules();
})
/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */
var saveAs=saveAs||function(view){"use strict";if(typeof navigator!=="undefined"&&/MSIE [1-9]\./.test(navigator.userAgent)){return}var doc=view.document,get_URL=function(){return view.URL||view.webkitURL||view},save_link=doc.createElementNS("http://www.w3.org/1999/xhtml","a"),can_use_save_link="download"in save_link,click=function(node){var event=new MouseEvent("click");node.dispatchEvent(event)},is_safari=/Version\/[\d\.]+.*Safari/.test(navigator.userAgent),webkit_req_fs=view.webkitRequestFileSystem,req_fs=view.requestFileSystem||webkit_req_fs||view.mozRequestFileSystem,throw_outside=function(ex){(view.setImmediate||view.setTimeout)(function(){throw ex},0)},force_saveable_type="application/octet-stream",fs_min_size=0,arbitrary_revoke_timeout=500,revoke=function(file){var revoker=function(){if(typeof file==="string"){get_URL().revokeObjectURL(file)}else{file.remove()}};if(view.chrome){revoker()}else{setTimeout(revoker,arbitrary_revoke_timeout)}},dispatch=function(filesaver,event_types,event){event_types=[].concat(event_types);var i=event_types.length;while(i--){var listener=filesaver["on"+event_types[i]];if(typeof listener==="function"){try{listener.call(filesaver,event||filesaver)}catch(ex){throw_outside(ex)}}}},auto_bom=function(blob){if(/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)){return new Blob(["\ufeff",blob],{type:blob.type})}return blob},FileSaver=function(blob,name,no_auto_bom){if(!no_auto_bom){blob=auto_bom(blob)}var filesaver=this,type=blob.type,blob_changed=false,object_url,target_view,dispatch_all=function(){dispatch(filesaver,"writestart progress write writeend".split(" "))},fs_error=function(){if(target_view&&is_safari&&typeof FileReader!=="undefined"){var reader=new FileReader;reader.onloadend=function(){var base64Data=reader.result;target_view.location.href="data:attachment/file"+base64Data.slice(base64Data.search(/[,;]/));filesaver.readyState=filesaver.DONE;dispatch_all()};reader.readAsDataURL(blob);filesaver.readyState=filesaver.INIT;return}if(blob_changed||!object_url){object_url=get_URL().createObjectURL(blob)}if(target_view){target_view.location.href=object_url}else{var new_tab=view.open(object_url,"_blank");if(new_tab==undefined&&is_safari){view.location.href=object_url}}filesaver.readyState=filesaver.DONE;dispatch_all();revoke(object_url)},abortable=function(func){return function(){if(filesaver.readyState!==filesaver.DONE){return func.apply(this,arguments)}}},create_if_not_found={create:true,exclusive:false},slice;filesaver.readyState=filesaver.INIT;if(!name){name="download"}if(can_use_save_link){object_url=get_URL().createObjectURL(blob);setTimeout(function(){save_link.href=object_url;save_link.download=name;click(save_link);dispatch_all();revoke(object_url);filesaver.readyState=filesaver.DONE});return}if(view.chrome&&type&&type!==force_saveable_type){slice=blob.slice||blob.webkitSlice;blob=slice.call(blob,0,blob.size,force_saveable_type);blob_changed=true}if(webkit_req_fs&&name!=="download"){name+=".download"}if(type===force_saveable_type||webkit_req_fs){target_view=view}if(!req_fs){fs_error();return}fs_min_size+=blob.size;req_fs(view.TEMPORARY,fs_min_size,abortable(function(fs){fs.root.getDirectory("saved",create_if_not_found,abortable(function(dir){var save=function(){dir.getFile(name,create_if_not_found,abortable(function(file){file.createWriter(abortable(function(writer){writer.onwriteend=function(event){target_view.location.href=file.toURL();filesaver.readyState=filesaver.DONE;dispatch(filesaver,"writeend",event);revoke(file)};writer.onerror=function(){var error=writer.error;if(error.code!==error.ABORT_ERR){fs_error()}};"writestart progress write abort".split(" ").forEach(function(event){writer["on"+event]=filesaver["on"+event]});writer.write(blob);filesaver.abort=function(){writer.abort();filesaver.readyState=filesaver.DONE};filesaver.readyState=filesaver.WRITING}),fs_error)}),fs_error)};dir.getFile(name,{create:false},abortable(function(file){file.remove();save()}),abortable(function(ex){if(ex.code===ex.NOT_FOUND_ERR){save()}else{fs_error()}}))}),fs_error)}),fs_error)},FS_proto=FileSaver.prototype,saveAs=function(blob,name,no_auto_bom){return new FileSaver(blob,name,no_auto_bom)};if(typeof navigator!=="undefined"&&navigator.msSaveOrOpenBlob){return function(blob,name,no_auto_bom){if(!no_auto_bom){blob=auto_bom(blob)}return navigator.msSaveOrOpenBlob(blob,name||"download")}}FS_proto.abort=function(){var filesaver=this;filesaver.readyState=filesaver.DONE;dispatch(filesaver,"abort")};FS_proto.readyState=FS_proto.INIT=0;FS_proto.WRITING=1;FS_proto.DONE=2;FS_proto.error=FS_proto.onwritestart=FS_proto.onprogress=FS_proto.onwrite=FS_proto.onabort=FS_proto.onerror=FS_proto.onwriteend=null;return saveAs}(typeof self!=="undefined"&&self||typeof window!=="undefined"&&window||this.content);if(typeof module!=="undefined"&&module.exports){module.exports.saveAs=saveAs}else if(typeof define!=="undefined"&&define!==null&&define.amd!=null){define([],function(){return saveAs})}
})
