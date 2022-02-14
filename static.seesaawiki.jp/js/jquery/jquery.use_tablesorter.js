jQuery(document).ready(function($){

  $("table.number").find("th").addClass("{sorter: 'fancyNumber'}");
  $.tablesorter.addParser({
      id: "fancyNumber",
      is: function(s) {
          return /^[0-9]?[0-9,\.]*$/.test(s);
      },
      format: function(s) {
          return $.tablesorter.formatFloat(s.replace(/,/g, ''));
      },
      type: "numeric"
  });
  $("table.sort").not("table.edit").tablesorter();
  $("table.sort.edit").each(function(){
    $(this).tablesorter({
      headers: {
         '-1': { sorter: false  }
      }
    });
  });
  $("table.filter").each(function(i){
    var id = 'table-filter-' + i;
    var $table = $(this);
    $table.before('<div class="input-table-filter"><input type="text" id="' + id +'" placeholder="キーワードで絞り込み" /></div>');
    $('#' + id).textChange({
      change: function(ele) {
        var input_str = ($(ele).val() + '').replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");

        $table.find('tbody > tr').each(function(){
          var $tr = $(this);
          var re = new RegExp(input_str);
          if( re.test($tr.text()) == false ) {
            $tr.hide();
          }else{
            $tr.show();
          }
        });
      }
    });
  });
});
