var WikiGoodButton = {
  endpoint: "",

  doGood: function(e) {
    var self = this,
        parent = $(e.currentTarget).parent(),
        wpid = parent.data("wpid"),
        cid = parent.data("cid");

    var pushed = this.is_already_pushed_comment(wpid, cid);
    if (pushed) {
        return;
    }

    $.ajax({
      url: self.endpoint,
      data: "cid=" + cid + "&wpid=" + wpid,
      dataType: "json",
      type: "GET", 
      xhrFields: {
        withCredentials: true
      }
    })
    .done(function(data) {
      var btn = $(".good-btn.comment-" + wpid + "-" + cid);
      var cnt = $("span.good-cnt", btn);
      cnt.html(data.result);
      self.storePushed(wpid, cid);
      btn.off("click");
      btn.css({'opacity': '0.5', 'cursor': 'auto'});
    });
  },

  storePushed: function(wpid, cid) {
    var list = localStorage.getItem('good'),
        saveList = [];
    list = JSON.parse(list); 
    list.forEach(function(wp) {
      if (wp.wpid === wpid) {
        wp.list.push(cid);
      }
      saveList.push(wp);
    });
    localStorage.setItem('good', JSON.stringify(saveList));
  },
 
  setNewPageIfIsNotExists: function(wpid, cid) {
    var found = false,
        data = localStorage.getItem('good');

    if (data !== null && data !== undefined && data !== "") {
      data = JSON.parse(data);
    }
    if (!data) {
      data = [];
      data.push({wpid: wpid, list: []});
    }
    if (!Array.isArray(data)) {
      data = [];
    }
    data.forEach(function(item) {
      if (item.wpid === wpid) found = true;
    });
    if (!found) {
      data.push({wpid: wpid, list: []});
    }
    localStorage.setItem('good', JSON.stringify(data));
  },

  is_already_pushed_comment: function (wpid, cid) {

    var data = localStorage.getItem('good');
    data = JSON.parse(data);

    var res = false;
    data.forEach(function(wp) {
      if (wp.wpid === wpid) {
        wp.list.forEach(function(item) {
          if (item === cid) res = true;
        });
      }
    });
    return res; 
  },

  initItems: function() {
    var self = this,
        divs = $("div.good-btn");

    if (typeof(divs) !== 'undefined' && divs !== null) {
      for (var i = 0; i < divs.length; i++) {
        var el     = $(divs[i]),
            cid    = $(el).data("cid"),
            wpid   = $(el).data('wpid');
        el.addClass("comment-" + wpid + "-" + cid);

        this.setNewPageIfIsNotExists(wpid, cid);
        var pushed = this.is_already_pushed_comment(wpid, cid);

        if (!pushed) {
          $("span.ico", el).on("click", function(e) { self.doGood(e); });
        } else {
          el.css({"opacity": "0.5", "cursor": "auto"});
        }
      }
    }
  },

  init : function (endpoint) {
    var self = this;
    this.endpoint = endpoint;
    self.initItems();
  }
};
