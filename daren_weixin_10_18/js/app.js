var last_id = 0;
var curr_cid = 0;
var total = 0;
var base_url = 'http://app.weihe-x.com/';
var host = window.location.host;
if (host == 'localhost') {
    base_url = 'http://localhost/order/';
} else {
    var pathname = window.location.pathname;
    if (pathname.indexOf("/test/") != -1) {
        base_url = 'http://' + host + '/test/';
    } else if (pathname.indexOf("/dev/") != -1) {
        base_url = 'http://' + host + '/dev/';
    } else {
        base_url = 'http://' + host + '/';
    }

}
///alert(base_url);
function showDialog(msg) {
    alert(msg);
}

function init(together) {
    //如果是被邀请订餐的，隐藏 一起点餐，我的订单
    if (together == 1) {
        $("#myorder").hide();
        $("#together").hide();
        $("#order_add").hide();
        //$("#order_pay").hide();
        $("#table_code").hide();
    }
}

function init_items(session_id, together, platform) {
    $("#recommend").on("click", function (e) {
//		$(this).css("background-image","url(" +  base_url + "res/images/recommend_bg_press.png)");
        $(".catli").css("background-image", "");
        $(this).css("background-color", "#fff");
        $(this).css("border-left", "0.3rem solid #e61f18");
        $(".catli").css("border-left", "0 none");
        $(".catli").css("background-color", "#f3f3f3");
        $("#list").html("");
        items_list(0, 1, 0);
    });

    $("#tocart").on("click", function (e) {
        //$(this).css("background-image","url(" +  base_url + "res/images/itemsbtn_press.png)");

        if ($('#location_eror').length > 0) {
            var location_error = $('#location_eror').val();
            if (location_error == 1) {
                alert('店家未设置自己的位置，无法下单，请与店家联系');
                return false;
            } else if (location_error == 2) {
                alert('未获取您的位置信息无法下单，请重新进入公众号');
                return false;
            } else if (location_error == 3) {
                alert('您距离门店的距离超出门店最大外送距离，无法下单');
                return false;
            }
        }
        location.href = base_url + "index.php/app/cart/cart_list?together=" + together;
    });

    $("#myorder").on("click", function (e) {
        //$(this).css("background-image","url(" +  base_url + "res/images/itemsbtn_press.png)");
        location.href = base_url + "index.php/app/order/order_list?together=" + together;
    });

    if (platform == 'M' || platform == 'W') {
        $("#together").on("click", function (e) {
            //$(this).css("background-image","url(" +  base_url + "res/images/itemsbtn_press.png)");
            location.href = base_url + "index.php/app/items/together?session_id=" + session_id;
        });
    } else {
        $("#together").hide();
    }
}
var cur_select_cid = 0;
var selected_category_nums = {};
function load_items_list(recommend) {
    var last_id = 0;
    var curr_cid = 0;
    var height = $(window).height();
    $("#content").css("height", height);
    /*
     $("#more").on("click", function() {
     items_list_more(wid,curr_cid,last_id);
     });*/
    var first_cid = 0;
    $.post(base_url + "index.php/api/category/category_list", null,
        function (obj) {
            //如果套餐没有数据，不显示套餐分类
            var has_package = obj.has_package;
            if (has_package == 0) {
                $("#recommend").remove();
            }
            var num_tag = 0;
            for (var i = 0; i < obj.data.length; i++) {
                if (i == 0) first_cid = obj.data[i].cid;
                num_tag = 0;
                var display_html = " style='display:none;'";
                selected_category_nums[obj.data[i].cid] = 0;
                if (typeof(obj['cate_num'][obj.data[i].cid]) != "undefined") {
                    num_tag = obj['cate_num'][obj.data[i].cid];
                    display_html = "";
                    selected_category_nums[obj.data[i].cid] = parseInt(num_tag);
                }
                if (obj.data[i].ctype != 3) {
                    var clist = $("<li id='cid_" + obj.data[i].cid + "' class='catli fontsize_25' cid='" + obj.data[i].cid + "'>" + obj.data[i].name + "<span " + display_html + " class='numtag'>" + num_tag + "</span>" + "&nbsp;&nbsp;&nbsp;<!--span class='cattip'></span--></li>");
                    clist.on("click", function (e) {
                        var cid = $(this).attr("cid");
                        curr_cid = cid;
                        cur_select_cid = cid;
                        $(".recommend").css("background-color", "#e5e5e5");
                        $(".recommend").css("border-left", "0 none");
                        $(".catli").css("border-left", "0 none");
                        $(".catli").css("background-color", "#f3f3f3");
//					$(this).css("background-image","url(" +  base_url + "res/images/cat_bg.png)");
//					$(this).css("background-repeat","repeat-x");
                        $(this).css("background-color", "#fff");
                        $(this).css("border-left", "0.3rem solid #e61f18");
                        items_list_new(cid, 0);
                        //alert("test" + $(this).attr("cid"));
                    });
                    $("#clist").append(clist);
                }

            }
            //第一次选择第一个分类
            items_list_new(first_cid, 0);
            cur_select_cid = first_cid;
            $("#cid_" + first_cid).css("background-color", "#fff");
            $("#cid_" + first_cid).css("border-left", "0.3rem solid #e61f18");
        }, "json");

}
function items_list_more(cid, recommend, last_id) {
    items_list(cid, recommend, last_id);
}
function items_list_new(cid, recommend) {
    $("#list").html("");
    items_list(cid, recommend, 0);
}


var practice = new Array();
var cupsize = new Array();
var material = new Array();
var practice_selected = new Array();
var cupsize_selected = new Array();
var material_selected = new Array();
function items_list(cid, recommend, _last_id) {
    $.post(base_url + "index.php/api/items/items_list_weixin", {
            "cid": cid,
            "recommend": recommend,
            "last_id": _last_id
        },
        function (obj) {
            var type = '';
            if (recommend == 1) {
                type = 'P';
            }
            var total_num = obj.total_num;
            var total_money = obj.total_money;

            $("#total_num").html(total_num);
            $("#total_money").html(Math.round(total_money * 100) / 100);
            for (var i = 0; i < obj.data.length; i++) {
                var cart_id = obj.data[i].cart_id;
                var pid = obj.data[i].pid;
                var name = obj.data[i].name;
                var pic = obj.data[i].pic;
                var price = obj.data[i].price;
                var mprice = obj.data[i].mprice;
                var num = obj.data[i].num;
                var dianguo = obj.data[i].dianguo;
                practice[pid] = obj.data[i].practice;
                cupsize[pid] = obj.data[i].cupsize;
                material[pid] = obj.data[i].material;
//			console.log(obj.data[i]);
                practice_selected[pid] = obj.data[i].practice_selected;
                cupsize_selected[pid] = obj.data[i].cupsize_selected;
                material_selected[pid] = obj.data[i].material_selected;

                var is_available = obj.data[i].is_available;

                if ((i + 1) == obj.data.length) {
                    last_id = pid;
                }
                mprice_html = '';
                if (mprice > 0) {
                    mprice_html = "/<span style='color:green'>" + mprice + "</span>";
                }
                if (num >= 1) {
                    var tag_pic = " style='display:none'";
                    var tag_price = "";
                } else {
                    var tag_price = " style='display:none'";
                    var tag_pic = "";
                }
                var style_available = '';
                if (is_available == 0) {
                    style_available = " style='color:#cccccc;'";
                }
                var html = "" +
                    "<li id='pid_" + pid + "' cart_id='" + cart_id + "' pid='" + pid + "' num='0' type='" + type + "'>" +
                    "<div class='pic' " + tag_pic + "><img src='" + pic + "'/></div>" +
                    "<div class='price_edit_btn' " + tag_price + ">" +
                    "<div class='sub'><img id='sub_" + pid + "' pid='" + pid + "' src='" + base_url + "res/images/sub.png'/></div>" +
                    "<div class='num fontsize_23' id='num_" + pid + "'>" + num + "</div>" +
                    "<div class='add'><img id='add_" + pid + "' pid='" + pid + "' src='" + base_url + "res/images/add.png'/></div>" +
                    "</div>" +
                    "<div class='info'>" +
                    "<div class='top'>" +
                    "<div class='fontsize_27' id='item_name_" + pid + "' " + style_available + ">" + name + "</div>" +
                    "</div>" +
                    "<div class='bottom'>" +
                    "<div id='price_show_" + pid + "' class='price fontsize_22'>￥<span id='price_" + pid + "'>" + price + "</span>" + mprice_html + " <span> 份</span></div>" +
                    "<div id='dianguo_" + pid + "' class='dianguo fontsize_21'><span>" + dianguo + "人点过</span></div>" +

                    "</div>" +
                    "</div>" +
                    "</li>";

                var list = $(html);
                $("#list").append(list);
                /*
                 if(num >= 1) {
                 $("#pid_"+pid).css("background","#ffa800");
                 $("#pid_"+pid).css("color","#ffffff");
                 $("#price_show_"+pid).css("color","#ffffff");
                 $("#dianguo_"+pid).css("color","#ffffff");
                 $("#pid_"+pid).attr("num",num);
                 }*/
                /** */
                $("#sub_" + pid).unbind("click").bind("click", function (e) {
                    selected_category_nums[cur_select_cid] -= 1;
                    if (selected_category_nums[cur_select_cid] <= 0) {
                        $("#cid_" + cur_select_cid + " .numtag").hide();
                    } else {
                        $("#cid_" + cur_select_cid + " .numtag").show();
                        $("#cid_" + cur_select_cid + " .numtag").html(selected_category_nums[cur_select_cid])
                    }
                    var pid = $(this).parent().parent().parent().attr("pid");
                    var type = $(this).parent().parent().parent().attr("type");
                    var attr_price = 0;

                    if (parseInt($("#num_" + pid).html()) <= 1) {
                        $("#pid_" + pid + " .price_edit_btn").hide();
                        $("#pid_" + pid + " .pic").show();
                        $("#num_" + pid).html(0);
                    } else {
                        $("#num_" + pid).html(parseInt($("#num_" + pid).html()) - 1);
                    }
                    sub_cart($("#pid_" + pid).attr("cart_id"), 1, type);

                    $("#pid_" + pid).attr("num", '1');
                    var old_total_num = parseInt($("#total_num").html());
                    var old_num = parseInt($("#pid_" + pid).attr("num"));
                    var price = parseFloat($("#price_" + $("#pid_" + pid).attr("pid")).html());
                    var old_total_money = parseFloat($("#total_money").html());
                    //更新统计信息
                    var total_num = old_total_num - old_num;
                    //处理杯型加料
                    for (var i in material_selected[pid]) {
                        for (var j in material[pid]) {
                            if (material_selected[pid][i] == material[pid][j]['id']) attr_price += parseFloat(material[pid][j]['price']);
                        }
                    }
                    for (var i in cupsize_selected[pid]) {
                        for (var j in cupsize[pid]) {
                            if (cupsize_selected[pid][i] == cupsize[pid][j]['id']) attr_price += parseFloat(cupsize[pid][j]['price']);
                        }
                    }
                    var total_money = old_total_money - (old_num * price) - attr_price;
                    $("#total_num").html(total_num);
                    $("#total_money").html(Math.round(total_money * 100) / 100);
                });
                //增加
                $("#add_" + pid).unbind("click").bind("click", function (e) {
                    selected_category_nums[cur_select_cid] += 1;
                    if (selected_category_nums[cur_select_cid] <= 0) {
                        $("#cid_" + cur_select_cid + " .numtag").hide();
                    } else {
                        $("#cid_" + cur_select_cid + " .numtag").show();
                        $("#cid_" + cur_select_cid + " .numtag").html(selected_category_nums[cur_select_cid])
                    }
                    var attr_price = 0;
                    var pid = $(this).parent().parent().parent().attr("pid");
                    var type = $(this).parent().parent().parent().attr("type");

                    add_cart($("#pid_" + pid).attr("cart_id"), 1, type, '', '', '', 1);
                    $("#num_" + pid).html(parseInt($("#num_" + pid).html()) + 1);

                    $("#pid_" + pid).attr("num", '1');
                    var old_total_num = parseInt($("#total_num").html());
                    var old_num = parseInt($("#pid_" + pid).attr("num"));
                    var price = parseFloat($("#price_" + $("#pid_" + pid).attr("pid")).html());
                    var old_total_money = parseFloat($("#total_money").html());
                    //更新统计信息
                    var total_num = old_total_num + old_num;
                    //处理杯型加料
                    for (var i in material_selected[pid]) {
                        for (var j in material[pid]) {
                            if (material_selected[pid][i] == material[pid][j]['id']) attr_price += parseFloat(material[pid][j]['price']);
                        }
                    }
                    for (var i in cupsize_selected[pid]) {
                        for (var j in cupsize[pid]) {
                            if (cupsize_selected[pid][i] == cupsize[pid][j]['id']) attr_price += parseFloat(cupsize[pid][j]['price']);
                        }
                    }
                    var total_money = old_total_money + (old_num * price) + attr_price;
                    $("#total_num").html(total_num);
                    $("#total_money").html(Math.round(total_money * 100) / 100);
                });
                $("#pid_" + pid + " .pic").on("click", function () {
                    var pid = $(this).parent().attr("pid");
                    var type = $(this).parent().attr("type");
                    var cart_id = $(this).parent().attr("cart_id");
                    var num = $(this).parent().attr("num");
                    if (type == "P") return false;

                    var html = "";
                    var display_sub = "";
                    html += " <div class='mask'></div>";
                    html += "<div class='cp_info'>";
                    html += "<img alt='' src='" + ($(this).children("img").attr("src") != "" ? $(this).children("img").attr("src") : base_url + "res/images/cp_default_mage.png") + "'>";
                    html += "<div class='cp_title'><div class='h_1'>" + $("#item_name_" + pid).html() + "</div><div class='h_2'>￥" + $("#price_" + pid).html() + "/份</div></div>"
                    html += "<div class='price_edit_btn'>" +
                        "<div class='sub'><img id='sub1_" + pid + "' pid='" + pid + "' src='" + base_url + "res/images/sub.png'/></div>" +
                        "<div class='num fontsize_23' id='num1_" + pid + "'>" + 0 + "</div>" +
                        "<div class='add'><img id='add1_" + pid + "' pid='" + pid + "' src='" + base_url + "res/images/add.png'/></div>" +
                        "</div>";
                    html += " </div>";

                    $(".shape").after(html);

                    $(".mask, .cp_info img").unbind("click").bind("click", function () {
                        $(".mask, .cp_info").remove();
                    });
                    $("#sub1_" + pid).unbind("click").bind("click", function (e) {
                        selected_category_nums[cur_select_cid] -= 1;
                        if (selected_category_nums[cur_select_cid] <= 0) {
                            $("#cid_" + cur_select_cid + " .numtag").hide();
                        } else {
                            $("#cid_" + cur_select_cid + " .numtag").show();
                            $("#cid_" + cur_select_cid + " .numtag").html(selected_category_nums[cur_select_cid])
                        }

                        var attr_price = 0;
                        if (parseInt($("#num1_" + pid).html()) == 0) {
                            return false;
                        }
                        if (parseInt($("#num1_" + pid).html()) <= 1) {
                            $("#pid_" + pid + " .price_edit_btn").hide();
                            $("#pid_" + pid + " .pic").show();
                            $("#num1_" + pid).html(0);
                            $("#num_" + pid).html(0);
                        } else {
                            $("#num1_" + pid).html(parseInt($("#num1_" + pid).html()) - 1);
                            $("#num_" + pid).html(parseInt($("#num_" + pid).html()) - 1);
                        }
                        sub_cart($("#pid_" + pid).attr("cart_id"), 1, type);

                        $("#pid_" + pid).attr("num", '1');
                        var old_total_num = parseInt($("#total_num").html());
                        var old_num = parseInt($("#pid_" + pid).attr("num"));
                        var price = parseFloat($("#price_" + $("#pid_" + pid).attr("pid")).html());
                        var old_total_money = parseFloat($("#total_money").html());
                        //更新统计信息
                        var total_num = old_total_num - old_num;
                        //处理杯型加料
                        for (var i in material_selected[pid]) {
                            for (var j in material[pid]) {
                                if (material_selected[pid][i] == material[pid][j]['id']) attr_price += parseFloat(material[pid][j]['price']);
                            }
                        }
                        for (var i in cupsize_selected[pid]) {
                            for (var j in cupsize[pid]) {
                                if (cupsize_selected[pid][i] == cupsize[pid][j]['id']) attr_price += parseFloat(cupsize[pid][j]['price']);
                            }
                        }
                        var total_money = old_total_money - (old_num * price) - attr_price;
                        $("#total_num").html(total_num);
                        $("#total_money").html(Math.round(total_money * 100) / 100);
                    });
                    //增加
                    $("#add1_" + pid).unbind("click").bind("click", function (e) {

                        var attr_price = 0;
                        if (parseInt($("#num1_" + pid).html()) == 0) {
                            items_click(pid, 1, type);
                            $("#pid_" + pid + " .price_edit_btn").show();
                            $("#pid_" + pid + " .pic").hide();
                        } else {
                            add_cart($("#pid_" + pid).attr("cart_id"), 1, type, '', '', '', 1);
                            $("#num_" + pid).html(parseInt($("#num_" + pid).html()) + 1);

                        }

                        if (practice[pid] == '' && cupsize[pid] == '' && material[pid] == '') {
                            selected_category_nums[cur_select_cid] += 1;
                            if (selected_category_nums[cur_select_cid] <= 0) {
                                $("#cid_" + cur_select_cid + " .numtag").hide();
                            } else {
                                $("#cid_" + cur_select_cid + " .numtag").show();
                                $("#cid_" + cur_select_cid + " .numtag").html(selected_category_nums[cur_select_cid])
                            }

                            $("#num1_" + pid).html(parseInt($("#num1_" + pid).html()) + 1);

                            $("#pid_" + pid).attr("num", '1');
                            var old_total_num = parseInt($("#total_num").html());
                            var old_num = parseInt($("#pid_" + pid).attr("num"));
                            var price = parseFloat($("#price_" + $("#pid_" + pid).attr("pid")).html());
                            var old_total_money = parseFloat($("#total_money").html());
                            //更新统计信息
                            var total_num = old_total_num + old_num;
                            //处理杯型加料
                            for (var i in material_selected[pid]) {
                                for (var j in material[pid]) {
                                    if (material_selected[pid][i] == material[pid][j]['id']) attr_price += parseFloat(material[pid][j]['price']);
                                }
                            }
                            for (var i in cupsize_selected[pid]) {
                                for (var j in cupsize[pid]) {
                                    if (cupsize_selected[pid][i] == cupsize[pid][j]['id']) attr_price += parseFloat(cupsize[pid][j]['price']);
                                }
                            }
                            var total_money = old_total_money + (old_num * price) + attr_price;
                            $("#total_num").html(total_num);
                            $("#total_money").html(Math.round(total_money * 100) / 100);
                        }
                    });

                });

                $("#pid_" + pid + " .info").unbind("click").bind("click", function () {
                    var pid = $(this).parent().attr("pid");
                    var type = $(this).parent().attr("type");

                    if (parseInt($("#num_" + pid).html()) >= 1) {
                        /*
                         $("#pid_"+pid).css("background","");
                         $("#pid_"+pid).css("color","#000000");
                         $("#price_show_"+pid).css("color","#000000");
                         $("#dianguo_"+pid).css("color","#000000");

                         sub_cart($(this).parent().attr("cart_id"),$(this).parent().attr("num"),type);
                         $(this).css("background","");
                         var old_total_num = parseInt($("#total_num").html());
                         var old_num = parseInt($(this).attr("num"));
                         var price =  parseFloat($("#price_"+$(this).attr("pid")).html());
                         var old_total_money = parseFloat($("#total_money").html());
                         //更新统计信息
                         var total_num = old_total_num - old_num;
                         var total_money =  old_total_money -  (old_num * price);
                         $("#total_num").html(total_num);
                         $("#total_money").html(total_money);
                         $(this).attr("num",'0');
                         */
                    } else {

                        items_click(pid, 1, type);


                        if (type != 'P' && practice[pid] == '' && cupsize[pid] == '' && material[pid] == '') {
                            $(this).siblings(".price_edit_btn").show();
                            $(this).siblings(".pic").hide();
                            /*
                             $("#pid_"+pid).css("background","#ffa800");
                             $("#pid_"+pid).css("color","#ffffff");
                             $("#price_show_"+pid).css("color","#ffffff");
                             $("#dianguo_"+pid).css("color","#ffffff");
                             */
                            $(this).parent().attr("num", '1');
                            var old_total_num = parseInt($("#total_num").html());
                            var price = parseFloat($("#price_" + $(this).parent().attr("pid")).html());
                            var old_total_money = parseFloat($("#total_money").html());

                            //更新统计信息
                            var total_num = old_total_num + 1;
                            var total_money = old_total_money + price;
                            $("#total_num").html(total_num);
                            $("#total_money").html(Math.round(total_money * 100) / 100);

                            selected_category_nums[cur_select_cid] += 1;
                            if (selected_category_nums[cur_select_cid] <= 0) {
                                $("#cid_" + cur_select_cid + " .numtag").hide();
                            } else {
                                $("#cid_" + cur_select_cid + " .numtag").show();
                                $("#cid_" + cur_select_cid + " .numtag").html(selected_category_nums[cur_select_cid])
                            }
                        }
                    }

                });


                /** */
                /*
                 //选择和被选择
                 $("#pid_"+pid).on("click", function(e) {
                 //var practice = $("#practice_" + $(this).attr("pid")).val();
                 var pid = $(this).attr("pid");
                 var type = $(this).attr("type");
                 if($(this).attr("num") >= 1) {
                 $("#pid_"+pid).css("background","");
                 $("#pid_"+pid).css("color","#000000");
                 $("#price_show_"+pid).css("color","#000000");
                 $("#dianguo_"+pid).css("color","#000000");

                 sub_cart($(this).attr("cart_id"),$(this).attr("num"),type);
                 $(this).css("background","");
                 var old_total_num = parseInt($("#total_num").html());
                 var old_num = parseInt($(this).attr("num"));
                 var price =  parseFloat($("#price_"+$(this).attr("pid")).html());
                 var old_total_money = parseFloat($("#total_money").html());
                 //更新统计信息
                 var total_num = old_total_num - old_num;
                 var total_money =  old_total_money -  (old_num * price);
                 $("#total_num").html(total_num);
                 $("#total_money").html(total_money);
                 $(this).attr("num",'0');
                 } else {
                 items_click(pid,1,type);
                 if(type != 'P') {
                 $("#pid_"+pid).css("background","#ffa800");
                 $("#pid_"+pid).css("color","#ffffff");
                 $("#price_show_"+pid).css("color","#ffffff");
                 $("#dianguo_"+pid).css("color","#ffffff");
                 $(this).attr("num",'1');
                 var old_total_num = parseInt($("#total_num").html());
                 var price =  parseFloat($("#price_"+$(this).attr("pid")).html());
                 var old_total_money = parseFloat($("#total_money").html());
                 //更新统计信息
                 var total_num = old_total_num + 1;
                 var total_money =  old_total_money + price;
                 $("#total_num").html(total_num);
                 $("#total_money").html(total_money);
                 }
                 }
                 });
                 */
            }
        }, "json");
}

function items_click(pid, num, type) {
    if (type == 'P') {//如果是套餐，加入套餐详情页面
        location.href = base_url + "index.php/app/package/package_detail/?id=" + pid;
    } else {
        //处理做法
        if (practice[pid] != '' || cupsize[pid] != '' || material[pid] != '') {

//			$(".mask, .cp_info").remove();
//			
//			var html = "<ul class=\"practice\">";
//			for(var i = 0;i < practice[pid].length;i ++) {
//				var temp = practice[pid][i];
//				html += "<li id=\"practice_" + i + "\" class=\"practice_unselected\" onclick=\"items_practice_add(" + pid + "," + i + ")\">" + temp.name + "</li>";
//				//alert(temp[0].name);
//			}
//			html += "</ul>";
//			//var content = JSON.stringify(practice[pid][0]);
//			//obj = JSON.parse(practice[pid]);
//			//alert(obj[0].name);
//			var item_name = $("#item_name_" + pid).html();
//			jAlert(html, item_name + '做法');
//			$("#popup_message").after('<div id="popup_panel">确定</div>');
//			$("#popup_panel").on("click", function(e) {
//				var content = JSON.stringify(practice_selected[pid]);
//				add_cart(pid,num,type,'','','','',content); 
//				$.alerts._hide();
//			});
            var html = "";
            var select_tag = "";
            html += ' <div class="item_attr_box">';
            html += ' 	<div class="box-title"><b>' + $("#item_name_" + pid).html() + '</b><span>共 ' + $("#num_" + pid).html() + '份，' + ($("#price_" + pid).html() * $("#num_" + pid).html()) + '元</span></div>';
            html += ' 	<div class="attr">';
            html += ' 		<ul>';
            if (cupsize[pid] != '' && typeof(cupsize[pid]) != "undefined") {
                html += ' 			<li class="atrr-list">';
                html += '				<div class="list-title"><img alt="" src="">请选择您需要的杯型</div>';
                html += ' 				<ul>';
                for (var i = 0; i < cupsize[pid].length; i++) {
                    var temp = cupsize[pid][i];
                    var name = temp.price > 0 ? temp.name + " +" + temp.price + "元" : temp.name;
                    select_tag = (i == 0 ? " select" : "");
//					select_tag = "";
                    html += ' 					<li id="cupsize_' + i + '" cupsize_id="' + temp.id + '" attr_price="' + temp.price + '" onclick="items_practice_click(this,' + pid + ', ' + i + ')" class="list-info ' + select_tag + '">' + name + '</li>';
                }
                if (typeof(cupsize_selected[pid]) == "undefined")    cupsize_selected[pid] = [];
                cupsize_selected[pid].push(cupsize[pid][0]);
                html += ' 					<div style="clear: both"></div>';
                html += ' 				</ul>';
                html += ' 			</li>';
            }
            if (practice[pid] != '' && typeof(practice[pid]) != "undefined") {
                html += ' 			<li class="atrr-list">';
                html += '				<div class="list-title"><img alt="" src="">请选择您需要的做法</div>';
                html += ' 				<ul>';
                for (var i = 0; i < practice[pid].length; i++) {
                    var temp = practice[pid][i];
                    var name = temp.price > 0 ? temp.name + " +" + temp.price + "元" : temp.name;
                    select_tag = (i == 0 ? " select" : "");
                    select_tag = "";
                    html += ' 					<li id="practice_' + i + '" practice_id="' + temp.id + '" attr_price="' + temp.price + '" onclick="items_practice_click(this,' + pid + ', ' + i + ')" class="list-info ' + select_tag + '">' + name + '</li>';
                }
                //			practice_selected[pid][0] = practice[pid][0];			//默认选择第一种做法
                html += ' 					<div style="clear: both"></div>';
                html += ' 				</ul>';
                html += ' 			</li>';
            }
            if (material[pid] != '' && typeof(material[pid]) != "undefined") {
                html += ' 			<li class="atrr-list">';
                html += '				<div class="list-title"><img alt="" src="">请选择喜欢的加料</div>';
                html += ' 				<ul>';
                for (var i = 0; i < material[pid].length; i++) {
                    var temp = material[pid][i];
                    var name = temp.price > 0 ? temp.name + " +" + temp.price + "元" : temp.name;
//					select_tag = (i==0 ? " select":"");
                    select_tag = "";
                    html += ' 					<li id="material_' + i + '" material_id="' + temp.id + '" attr_price="' + temp.price + '" onclick="items_practice_click(this,' + pid + ', ' + i + ')" class="list-info ' + select_tag + '">' + name + '</li>';
                }
                //			practice_selected[pid][0] = practice[pid][0];			//默认选择第一种做法
                html += ' 					<div style="clear: both"></div>';
                html += ' 				</ul>';
                html += ' 			</li>';
            }
            html += ' 		</ul>';
            html += ' 	</div>';
            html += ' 	<div class="box-tools"><div class="cancel-box"><img alt="" src="' + base_url + 'res/images/attr_cancel_btn.png">取消</div><div class="ok-box"><img alt="" src="' + base_url + 'res/images/attr_ok_btn.png">确认</div></div>';
            html += ' </div>';

            $("body").append(html);
            $(".item_attr_box .cancel-box").unbind("click").bind("click", function () {
                $(".item_attr_box").remove();
            });
            $(".item_attr_box .ok-box").unbind("click").bind("click", function () {
                selected_category_nums[cur_select_cid] += 1;
                if (selected_category_nums[cur_select_cid] <= 0) {
                    $("#cid_" + cur_select_cid + " .numtag").hide();
                } else {
                    $("#cid_" + cur_select_cid + " .numtag").show();
                    $("#cid_" + cur_select_cid + " .numtag").html(selected_category_nums[cur_select_cid])
                }
//				var content = JSON.stringify(practice_selected[pid]);
                //var content = {"material_id":material_selected[pid],"cupsize_id":cupsize_selected[pid],"practice_id":practice_selected[pid]};
                material_selected[pid] = [];
                cupsize_selected[pid] = [];
                practice_selected[pid] = [];
                var attr_price = 0;
                $(".item_attr_box").find(".list-info.select").each(function (i, o) {
                    if ($(o).attr("id").replace(/_[0-9]+/, "") == "material") material_selected[pid].push($(o).attr($(o).attr("id").replace(/_[0-9]+/, "") + "_id"));
                    if ($(o).attr("id").replace(/_[0-9]+/, "") == "cupsize") cupsize_selected[pid].push($(o).attr($(o).attr("id").replace(/_[0-9]+/, "") + "_id"));
                    if ($(o).attr("id").replace(/_[0-9]+/, "") == "practice") practice_selected[pid].push($(o).attr($(o).attr("id").replace(/_[0-9]+/, "") + "_id"));

                    attr_price += parseFloat($(o).attr("attr_price"));
                });
                add_cart(pid, num, type, '', '', '', '', "");
                $(".item_attr_box").remove();

                $("#pid_" + pid).children(".price_edit_btn").show();
                $("#pid_" + pid).children(".pic").hide();
                var old_total_num = parseInt($("#total_num").html());
                var price = parseFloat($("#price_" + pid).html());
                var old_total_money = parseFloat($("#total_money").html());

                //更新统计信息
                var total_num = old_total_num + 1;
                var total_money = old_total_money + price + attr_price;

                $("#total_num").html(total_num);
                $("#total_money").html(Math.round(total_money * 100) / 100);
                $(".mask, .cp_info").remove();
            });
        } else {
            add_cart(pid, num, type, '');
        }
    }

}
function items_practice_click(o, pid, i) {
//	practice_selected[pid][i] = practice[pid][i];
    if ($(o).attr("cupsize_id")) {
        if (!$(o).hasClass("select")) {
            $(o).addClass("select").siblings("li").removeClass("select");
        }
    }
    else {
        if ($(o).hasClass("select")) {
            $(o).removeClass("select");
        } else {
            $(o).addClass("select");
        }
    }
}
function items_practice_add(pid, i) {
    var pclass = $("#practice_" + i).attr("class");
    if (pclass == "practice_selected") {
        practice_selected[pid][i] = null;
        $("#practice_" + i).removeClass();
        $("#practice_" + i).addClass("practice_unselected");
    } else {
        practice_selected[pid][i] = practice[pid][i];
        $("#practice_" + i).removeClass();
        $("#practice_" + i).addClass("practice_selected");
    }
    //var content = JSON.stringify(practice_selected[pid]);
    //alert(content);
}


function load_cart_list(first) {
    $.post(base_url + "index.php/api/cart/items_list", null,
        function (obj) {
            $(".cart_list_item").remove();
            $(".list .line").remove();
            var total = obj.total;
            var preferential_total = obj.preferential_total;
            var discount_difference_total = obj.discount_difference_total;
            var peoples = obj.peoples;
            var activity_food = obj.activity_food;
            var is_in = 0;
            var tickets = obj.tickets;
            var use_ticket = obj.use_ticket;
            //平台满减优惠显示
            var full = obj.full;
            var reduce = obj.reduce;
            //等级会员折扣显示
            var member_level = obj.member_level;
            var level_discount = obj.level_discount;
            var dis = obj.dis;

            $("#peoples").html(peoples);
            var pack_fee = 0;
            var seat_fee = 0;
            pack_fee = obj.pack_fee;
            seat_fee = obj.seat_fee;
            if (pack_fee > 0) {
                var pack_div = '<ul> <li class="item"> <div class="left">' +
                    '<span class="title fontsize_30">餐盒费</span></div> ' +
                    '<div class="right fontsize_40" style="color:red;">' +
                    '￥<span id="pack_fee">' + pack_fee + '</span> </div> </li> </ul>'
                $('#pack_div').html(pack_div);
            } else {
                $('#pack_div').html('');

            }
            //可使用卡券
            if (tickets != '') {
                var ticket_div = '<ul> <li class="item"> <div class="left">' +
                    '<span class="title fontsize_30">可使用卡券</span></div> ' +
                    '<div class="right fontsize_40" style="color:red;"><select name="use_ticket" id="use_ticket"><option value="0">不使用卡券</option>';
                $.each(tickets, function (i, ticket) {
                    if (use_ticket == ticket.id) {
                        ticket_div += '<option value="' + ticket.id + '" selected>' + ticket.name + '</option>';
                    } else {
                        ticket_div += '<option value="' + ticket.id + '">' + ticket.name + '</option>';
                    }
                });
                ticket_div += '</select></div> </li> </ul>'
                $('#ticket_div').html(ticket_div);
                $('#ticket_div').show();
            } else {
                $('#ticket_div').hide();
            }

            if (seat_fee > 0) {
                var seat_div = '<ul> <li class="item"> <div class="left">' +
                    '<span class="title fontsize_30">茶座费</span></div> ' +
                    '<div class="right fontsize_40" style="color:red;">' +
                    '￥<span id="seat_fee">' + seat_fee + '</span> </div> </li> </ul>';
                $('#seat_div').html(seat_div);
            } else {
                $('#seat_div').html('');
            }
            //显示平台满减情况
            if (member_level && level_discount && dis) {
                var member_level_discount = '<ul> <li class="item"> <div class="left">' +
                    '<span class="title fontsize_30">' + member_level + '</span></div> ' +
                    '<div class="right fontsize_40" style="color:red;">' +
                    '<span>' + level_discount + '</span> </div>' +
                    '<input type="hidden" id="dis" value="'+dis+'"></li> </ul>';
                $('#member_level_discount').html(member_level_discount);
            }
            //显示会员等级优惠
            if (full && reduce) {
                var platform_reduce = '<ul> <li class="item"> <div class="left">' +
                    '<span class="title fontsize_30">平台优惠</span></div> ' +
                    '<div class="right fontsize_40" style="color:red;">' +
                    '<span>满' + full + '减' + reduce + '</span> </div> </li> </ul>';
                $('#platform_reduce').html(platform_reduce);
            } else {
                $('#platform_reduce').hide();
            }

            $(".total_value").html(total);
            $(".preferential_total_value").html(preferential_total);
            $(".discount_difference_total_value").html(discount_difference_total);
            if (preferential_total == total) {
                $("#preferential").hide();
            }

            for (var i = 0; i < obj.data.length; i++) {
                var pid = obj.data[i].id;
                var name = obj.data[i].name;
                var price = obj.data[i].price;
                var mprice = obj.data[i].mprice;
                var num = obj.data[i].num;
                var type = obj.data[i].type;
                var real_pid = obj.data[i].pid;

//			console.log(obj.data[i]);
                var zuofa = "";
                if (obj.data[i].practice_id && practice[pid] && practice[pid][obj.data[i].practice_id]) {
                    zuofa = practice[pid][obj.data[i].practice_id];
                }

                mprice_html = '';
                if (mprice > 0) {
                    mprice_html = "/<span style='color:green'>" + mprice + "</span>";
                }

                var html = "<li class='cart_list_item'>" +
                    "<div class='left'>" +
                    "<span class='fontsize_25'>" + name + "</span><br/>" +
                    "<span class='price fontsize_20'>￥<span id='price_" + pid + "'>" + price + "</span> " + mprice_html + " 份</span>";
                if (zuofa != "") {
                    html += "<span class='zuofa'>" + zuofa + "</span>";
                }
                for (var l = 0; l < activity_food.length; l++) {
                    if (activity_food[l] == real_pid) {
                        is_in = 1;
                    }
                }
                html += "</div><div class='right'>";
                if (is_in != 1) {
                    html += "<div class='add'><img id='add_" + pid + "' pid='" + pid + "' src='" + base_url + "res/images/add.png'/></div>";
                } else {
                    html += "<div class='add'></div>";
                }
                html += "<div class='num fontsize_23'><span>x</span><span id='num_" + pid + "' >" + num + "</span></div>";
                if (is_in != 1) {
                    html += "<div class='sub'><img id='sub_" + pid + "' pid='" + pid + "' src='" + base_url + "res/images/sub.png'/></div>";
                } else {
                    html += "<div class='sub'></div>";
                }
                is_in = 0;

                html += "</div></li>";

                var cart_list = $(html);
                $("#cart_list").append('<li class="line"></li>');
                $("#cart_list").append(cart_list);
                //减少
                $("#sub_" + pid).on("click", function (e) {
                    sub_cart($(this).attr("pid"), 1, type);
                });
                //增加
                $("#add_" + pid).on("click", function (e) {
                    add_cart($(this).attr("pid"), 1, type, '', '', '', 1);
                });
                //选择使用卡券
                $("#use_ticket").change(function () {
                    var change_ticket = $(this).val();
                    $.post(base_url + "index.php/api/cart/use_ticket", {'change_ticket': change_ticket,},
                        function (obj) {
                            //重新刷新购物车页面数据
                            load_cart_list(false);
                        }, "json");
                });
            }

            //第一次加载
            if (first == true) {
                //加菜
                $("#goitems").on("click", function (e) {
                    $(this).css("background-image", "url(" + base_url + "res/images/cart_bt_press.png)");
                    location.href = base_url + "index.php/app/items/items_list";
                });
                //减少人数
                $("#sub_peoples").on("click", function (e) {
                    var peoples = parseInt($("#peoples").html());
                    peoples = peoples - 1;
                    $("#peoples").html(peoples);
                    $.post(base_url + "index.php/api/cart/sub_peoples", null,
                        function (obj) {
                            if (obj.code != '1') {
                                $("#peoples").html(peoples + 1);
                            } else {
                                load_cart_list(false);//重新刷新购物车页面数据
                            }
                        }, "json");
                });
                //增加人数
                $("#add_peoples").on("click", function (e) {
                    var peoples = parseInt($("#peoples").html());
                    peoples = peoples + 1;
                    $("#peoples").html(peoples);
                    $.post(base_url + "index.php/api/cart/add_peoples", null,
                        function (obj) {
                            if (obj.code != '1') {
                                $("#peoples").html(peoples - 1);
                            } else {
                                load_cart_list(false);//重新刷新购物车页面数据
                            }
                        }, "json");
                });
                //选择使用卡券
                $("#use_ticket").change(function () {
                    var change_ticket = $(this).val();
                    $.post(base_url + "index.php/api/cart/use_ticket", {'change_ticket': change_ticket,},
                        function (obj) {
                            //重新刷新购物车页面数据
                            load_cart_list(false);
                        }, "json");
                });
                var address = obj.address;
                $("#phone").val(address.phone);
                $("#realname").val(address.realname);
                $("#address").val(address.address);
                $("#remark").val(address.remark);
                //清空购物车
                $("#cart_clear").on("click", function (e) {
                    $(this).css("background-image", "url(" + base_url + "res/images/clear_cart_press.png)");
                    $.post(base_url + "index.php/api/cart/clear", null,
                        function (obj) {
                            if (obj.code == '1') {
                                load_cart_list(false);
                            }
                        }, "json");
                });
                //提交订单
                $("#order_add").on("click", function (e) {
                    var table_code = $("#table_code").val();
                    var peoples = $("#peoples").html();
                    var phone = $("#phone").val();
                    var realname = $("#realname").val();
                    var address = $("#address").val();
                    var remark = $("#remark").val();
                    $(this).css("background-image", "url(" + base_url + "res/images/order_add_press.png)");
                    $.post(base_url + "index.php/api/order/add", {
                            "peoples": peoples,
                            "table_code": table_code,
                            "phone": phone,
                            "realname": realname,
                            "address": address,
                            "remark": remark
                        },
                        function (obj) {
                            if (obj.code == '1') {
                                location.href = base_url + "index.php/app/order/order_ok?oid=" + obj.oid;
                            } else {
                                alert(obj.text);
                            }
                        }, "json");
                });
                //提交订单并付款
                $("#order_add_topay").on("click", function (e) {
                    var table_code = $("#table_code").val();
                    var peoples = $("#peoples").html();
                    var phone = $("#phone").val();
                    var realname = $("#realname").val();
                    var address = $("#address").val();
                    var remark = $("#remark").val();
                    if ($('#virtual_switch').length > 0) {
                        var virtual_switch = $('input[name="virtual_switch"]:checked').val();
                        virtual_switch = parseInt(virtual_switch);
                    } else {
                        var virtual_switch = 0;
                    }
                    if ($('#use_ticket').length > 0) {
                        var use_ticket = $('#use_ticket').val();
                        use_ticket = parseInt(use_ticket);
                    } else {
                        var use_ticket = 0;
                    }
                    if($('#dis').length > 0){
                        var dis = $('#dis').val();
                    }else{
                        var dis = 0;
                    }
                    $(this).css("background-image", "url(" + base_url + "res/images/order_add_press.png)");
                    $.post(base_url + "index.php/api/order/add", {
                            "payment_method": 9,
                            "peoples": peoples,
                            "table_code": table_code,
                            "phone": phone,
                            "realname": realname,
                            "address": address,
                            "remark": remark,
                            "virtual_switch": virtual_switch,
                            "use_ticket": use_ticket,
                            "dis" : dis,
                        },
                        function (obj) {
                            if (obj.code == '1') {
                                location.href = base_url + "index.php/app/order/pay_check/?oid=" + obj.oid;
                            } else {
                                alert(obj.text);
                            }
                        }, "json");
                });
                //提交订单-当面支付
                $("#order_add_facepay").on("click", function (e) {
                    var table_code = $("#table_code").val();
                    var peoples = $("#peoples").html();
                    var phone = $("#phone").val();
                    var realname = $("#realname").val();
                    var address = $("#address").val();
                    var remark = $("#remark").val();
                    $(this).css("background-image", "url(" + base_url + "res/images/order_add_press.png)");
                    $.post(base_url + "index.php/api/order/add", {
                            "payment_method": 11,
                            "peoples": peoples,
                            "table_code": table_code,
                            "phone": phone,
                            "realname": realname,
                            "address": address,
                            "remark": remark
                        },
                        function (obj) {
                            if (obj.code == '1') {
                                location.href = base_url + "index.php/app/order/pay_face/?oid=" + obj.oid;
                            } else {
                                alert(obj.text);
                            }
                        }, "json");
                });
            }
        }, "json");
}


function add_cart(pid, num, type, go, guodi, tiaowei, is_add_num, practice, cp_ids) {
//is_add_num:代表是不是加数量
    var price = parseFloat($("#price_" + pid).html());
    price = price * num;
    var n = parseInt($("#num_" + pid).html());
    //var total = $("#total").html();
    $("#num_" + pid).html(n + num);

    //$("#total").html(parseFloat(total) + price);
    if (num > 0) {
        $("#num_" + pid).show();
        $("#sub_" + pid).show();
    }


    var postParas = {
        "pid": pid,
        "num": num,
        "type": type,
        "guodi": guodi,
        "tiaowei": tiaowei,
        "is_add_num": is_add_num
    };
    if (is_add_num == 1) {//代表是不是加数量,使用id参数
        postParas = {"id": pid, "num": num, "type": type, "guodi": guodi, "tiaowei": tiaowei, "is_add_num": is_add_num};
        $("#content #list").children("li").each(function (i, v) {
            if ($(v).attr("cart_id") == pid)    pid = $(v).attr("pid");
        });
    }
    if (cp_ids && cp_ids.length > 0) {
        postParas['cpid'] = cp_ids;
    }

    postParas['material_id'] = material_selected[pid] && material_selected[pid].length > 0 ? material_selected[pid].join(',') : "";
    postParas['cupsize_id'] = cupsize_selected[pid] && cupsize_selected[pid].length > 0 ? cupsize_selected[pid].join(',') : "";
    postParas['practice_id'] = practice_selected[pid] && practice_selected[pid].length > 0 ? practice_selected[pid].join(',') : "";

    var post_url = base_url + "index.php/api/cart/add";
    if (type == "P") post_url = base_url + "index.php/api/cart/add_package";
    $.post(post_url, postParas,
        function (obj) {
            if (obj.code == '1') {
                if (obj.data > 0) $("#pid_" + pid).attr('cart_id', obj.data);
                if (go == 'items') {
                    location.href = base_url + "index.php/app/items/items_list";
                } else if (go == 'cart') {
                    location.href = base_url + "index.php/app/cart/cart_list";
                }
                load_cart_list(false);//重新刷新购物车页面数据
            } else {
                showDialog(obj.text);
                var total_num = $("#total_num").html();
                var total_money = $("#total_money").html();
                $("#total_num").html(total_num - num);
                $("#total_money").html(parseFloat(total_money) - price);

                $("#pid_" + pid + " .price_edit_btn").hide();
                $("#pid_" + pid + " .pic").show();
                $("#num_" + pid).html(0);
            }
        }, "json");
}
function sub_cart(pid, num, type) {
    var price = parseFloat($("#price_" + pid).html());
    price = price * num;
    var n = $("#num_" + pid).html();
    //var total = $("#total").html();
    $("#num_" + pid).html(parseInt(n) - num);
    //$("#total").html(parseFloat(total) - price);
    if (n == 1) {
        $("#num_" + pid).hide();
        $("#sub_" + pid).hide();
    }
    $.post(base_url + "index.php/api/cart/sub", {"pid": pid, "num": num, "type": type},
        function (obj) {
            if (obj.code == '1') {
                //$(this).attr('cart_id',0);
                //$("#num_" + pid).html(parseInt(n) + num);
                load_cart_list(false);//重新刷新购物车页面数据
                //$("#total").html(parseFloat(total) + price);
            }
        }, "json");
}
//订单加菜，订单未处理前
function add_order(oid, pid, num) {
    $.post(base_url + "index.php/api/order/add_items", {"oid": oid, "pid": pid, "num": num},
        function (obj) {
            if (obj.code == '1') {
                var price = parseFloat($("#price_" + pid).html());
                price = price * num;
                var n = $("#num_" + pid).html();
                var total = $("#total").html();
                $("#num_" + pid).html(parseInt(n) + num);
                $("#total").html(parseFloat(total) + price);
            } else {
                alert(obj.text);
            }
        }, "json");
}
//订单减菜，订单未处理前
function sub_order(oid, pid, num) {
    $.post(base_url + "index.php/api/order/sub_items", {"oid": oid, "pid": pid, "num": num},
        function (obj) {
            if (obj.code == '1') {
                var price = parseFloat($("#price_" + pid).html());
                price = price * num;
                var n = $("#num_" + pid).html();
                var total = $("#total").html();
                $("#num_" + pid).html(parseInt(n) - num);
                $("#total").html(parseFloat(total) - price);
            } else {
                alert(obj.text);
            }
        }, "json");
}

var order_last_id = 0;
var order_last_date = "";
var order_last_time = "";
function load_order_list(is_more) {
    $.post(base_url + "index.php/api/order/my_order_list", {"last_id": order_last_id, "last_time": order_last_time},
        function (obj) {
            var length = obj.data.length;
            if (order_last_id == 0) {
                $("#order_list").html('');
                if (length <= 0) {
                    $('.nodata').show();
                }
            }
            if (length > 0) {
                for (var i = 0; i < obj.data.length; i++) {
                    var oid = obj.data[i].oid;
                    var number = obj.data[i].number;
                    var desc = obj.data[i].desc;
                    var year = obj.data[i].year;
                    var month = obj.data[i].month;
                    var day = obj.data[i].day;
                    var week = obj.data[i].week;
                    var total = obj.data[i].total;
                    var payed = obj.data[i].payed;
                    var status = obj.data[i].status;
                    var payed_text = '未支付';
                    var payed_img = base_url + 'res/images/xx.png';
                    if (payed == '1') {
                        payed_text = '已支付';
                        payed_img = base_url + 'res/images/ok.png';
                    }
                    if (status == '2') {
                        payed_text = '已完成';
                        payed_img = base_url + 'res/images/ook.png';
                    }
                    var top_html = "<li class='date'><div class='top'>" +
                        "<div id='year_month_" + oid + "' class='year_month fontsize_35'></div>" +
                        "</div></li>";
                    var clas = ' top_bottom';
                    var date2 = year + month + '';
                    if (i > 0) {
                        var date1 = obj.data[i - 1].year + obj.data[i - 1].month + '';
                        if (date2 == date1) {
                            top_html = '';
                            clas = '';
                        }
                    }

                    if (order_last_date == date2) {
                        top_html = '';
                        clas = '';
                    }
                    $("#order_list").append(top_html);
                    var html = "<li id='order_" + oid + "' oid='" + oid + "' number='" + number + "' payed='" + payed + "'  class='item'>" +
                        "<div class='bottom'>" +
                        "<div class='day'>" +
                        "<div class='day1 fontsize_26'><img src='" + payed_img + "'/> " + payed_text + "</div>" +
                        "<div class='day2 fontsize_24' id='day_" + oid + "'></div></div>" +
                        "<div class='info'>" +
                        "<div class='desc fontsize_21' id='desc_" + oid + "'></div>" +
                        "<div class='number_total'><span id='number_" + oid + "' class='number fontsize_21'></span> <span id='total_" + oid + "' class='total fontsize_28'></span></div>" +
                        "</div>" +
                        "<div id='goto' class='goto'>" +

                        "</div>" +
                        "</div>" +

                        "</li>";
                    var order_list = $(html);
                    $("#order_list").append(order_list);

                    $("#desc_" + oid).html(desc);
                    $("#year_month_" + oid).html(year + '年' + month + '月');
                    $("#day_" + oid).html(day + '号');
                    $("#number_" + oid).html('订单号' + number);
                    $("#total_" + oid).html('&nbsp;&nbsp;&nbsp;￥' + total);

                    $("#order_" + oid).on("click", function (e) {
                        var _oid = $(this).attr("oid");
                        var _number = $(this).attr("number");
                        var _payed = $(this).attr("payed");
                        if (_number.indexOf("X") != -1 && _payed == '1') {
                            location.href = base_url + "index.php/app/voucher/user_detail?oid=" + _oid;
                        } else {
                            location.href = base_url + "index.php/app/order/order_detail?oid=" + _oid;
                        }

                    });
                }
                //记录上一次最后一条的last_id和时间
                order_last_id = obj.data[length - 1].oid;
                order_last_time = obj.data[length - 1].add_time;
                order_last_date = obj.data[length - 1].year + obj.data[length - 1].month + '';
            }
        }, "json");
}
function load_order_detail(oid, platform) {
    $.post(base_url + "index.php/api/order/items_list", {'oid': oid},
        function (obj) {
            //$("#order_detail").html('');
            var oid = obj.data.oid;
            var total = obj.data.preferential_total;
            var number = obj.data.number;
            var table = obj.data.table;
            var add_time = obj.data.add_time;
            var pay_time = obj.data.pay_time;
            var peoples = obj.data.peoples;
            var payed = obj.data.payed;
            var status = obj.data.status;

            if (payed != 1) {
                $("#go_pay").show();
            }
            //alert(total);
            $("#number").html(number);
            $("#table").html(table);
            $("#add_time").html(add_time);
            $("#pay_time").html(pay_time);
            $("#total").html(total);
            $("#peoples").html(peoples);
            $("#status").html(status);
            for (var i = 0; i < obj.data.detail.length; i++) {
                var pid = obj.data.detail[i].opid;
                var name = obj.data.detail[i].name;
                var price = obj.data.detail[i].price;
                var num = obj.data.detail[i].num;
                var html = "<li class='item'>" +
                    "<div class='left'>" +
                    "<span class='title fontsize_25'>" + name + "</span><br/>" +
                    "<span class='price fontsize_20'>￥<span id='price_" + pid + "'>" + price + "</span>元/份</span>" +
                    "</div>" +
                    "<div class='right'>" +
                    "<div class='add'><img id='add_" + pid + "' pid='" + pid + "' src='" + base_url + "res/images/add.png'/></div>" +
                    "<div class='num fontsize_23'><span>x</span><span id='num_" + pid + "' >" + num + "</span></div>" +
                    "<div class='sub'><img id='sub_" + pid + "' pid='" + pid + "' src='" + base_url + "res/images/sub.png'/></div>" +
                    "</div>" +
                    "</li>";
                var cart_list = $(html);
                $("#order_detail").append('<li class="line"></li>');
                $("#order_detail").append(cart_list);
                if (platform == 'W') {
                    $(".sub").hide();
                    $(".add").hide();
                }
                //减少
                $("#sub_" + pid).on("click", function (e) {
                    sub_order(oid, $(this).attr("pid"), 1);
                });
                //增加
                $("#add_" + pid).on("click", function (e) {
                    add_order(oid, $(this).attr("pid"), 1);
                });

            }
            /*$("#cj_list").hide();
             if(obj.data.cj_detail != undefined) {
             $("#cj_list").show();
             for(var i = 0;i < obj.data.cj_detail.length;i ++) {
             var pid = obj.data.detail[i].pid;
             var name = obj.data.detail[i].name;
             var price = obj.data.detail[i].price;
             var num = obj.data.detail[i].num;
             var html = "<li>" +
             "<div class='left'>" +
             "<span class='title '>" + name + "</span><br/>" +
             "<span class='price'>￥<span id='price_" + pid + "'>" +price+ "</span>元/份</span>" +
             "</div>" +
             "<div class='right'>" +
             "<img id='sub_" + pid + "' pid='" + pid + "' src='" +base_url+ "res/images/sub.png'/>" +
             "  <a id='num_" + pid + "'>" + num + "</a>  " +
             "<img id='add_" + pid + "' pid='" + pid + "' src='" +base_url+ "res/images/add.png'/> " +
             "</div>" +
             "</li>";
             var cart_list = $(html);
             $("#order_detail").append(cart_list);
             //减少
             $("#sub_"+pid).on("click", function(e) {
             sub_order(oid,$(this).attr("pid"),1);
             });
             //增加
             $("#add_"+pid).on("click", function(e) {
             add_order(oid,$(this).attr("pid"),1);
             });

             }
             }*/


        }, "json");
}


function load_package_detail(id) {
    $.post(base_url + "index.php/api/package/package_detail_new", {"id": id},
        function (obj) {
            obj = obj.data;
//			console.log(obj);
            $(".package_list_item").remove();
            $(".list .line").remove();
//			var guodi = obj.guodi;
//			var tiaowei = obj.tiaowei;
            var package_id = obj.brief.id;
//			var name = obj.brief.name;
//			var price = obj.brief.price;
//			$("#name").html(name);
//			$("#price").html(price);
//			$("#tiaowei").html(tiaowei);

//			$("#guodi").val(guodi);
            var html = "";
            if (obj.detail.length > 0) {
                for (i = 0; i < obj.detail.length; i++) {
//					console.log(i);
                    var menu = obj.detail[i];
                    html += '<div class="list">';
                    html += '<ul id="list_' + menu.id + '" vaild_num="' + menu.valid_num + '">';
                    html += '<li class="title">';
                    html += '<div class="left"><span class="fontsize_30">' + menu.name + '  <span style="color:#898989;font-size:1.2rem">(' + menu.name + '提供' + menu.list.length + '选' + menu.valid_num + ')</span>' + '</span></div>';
                    if (menu.list.length > 0) {
                        for (j = 0; j < menu.list.length; j++) {
                            name = menu.list[j].name;
                            pid = menu.list[j].id;
                            price = menu.list[j].price;
                            num = 0;
                            html += "<li class='package_list_item'>" +
                                "<div class='left'>" +
                                "<span class='fontsize_25'>" + name + "</span><br/>" +
                                "<span class='price fontsize_20'>￥<span id='price_" + pid + "'>" + price + "</span>元/份</span>" +
                                "</div>" +
                                "<div class='right'>" +
                                "<div class='add'><img id='add_" + pid + "' pid='" + pid + "' src='" + base_url + "res/images/add.png'/></div>" +
                                "<div class='num fontsize_23'><span id='num_" + pid + "' class='guodi_num'>" + num + "</span></div>" +
                                "<div class='sub'> <img id='sub_" + pid + "' pid='" + pid + "' src='" + base_url + "res/images/sub.png'/></div>" +
                                "</div>" +
                                "</li><li class=\"line\"></li>";
                        }
                    }
                    html += '</li>';
                    html += '</ul>';
                    html += '</div>';
                }
            }
            html += '	<div class="op">';
            html += '<div id="gocart" class="btn gocart fontsize_27">提交结算</div>';
            html += '<div id="goitems" class="btn goitems fontsize_27">加入购物车并继续点菜</div>	';
            html += '</div>	';
            $("#package").append(html);
            $(".add").unbind('click').bind("click", function () {
                var added = 0;
                $(this).parent().parent().parent().find(".guodi_num").each(function (a, b) {
                    added += parseInt($(b).html())
                });
                if (added >= parseInt($(this).parent().parent().parent().attr("vaild_num"))) {
                    alert("该菜品的数量已超额，请选择其他菜品品类！");
                    return false;
                }
                if (parseInt($(this).parent().find('span').html()) >= 1) {
                    $(this).parent().find('span').html(1);
                } else {
                    $(this).parent().find('span').html(parseInt($(this).parent().find('span').html()) + 1);
                }
            });
            $(".sub").unbind('click').bind("click", function () {
                if (parseInt($(this).parent().find('span').html()) <= 0) {
                    $(this).parent().find('span').html(0);
                } else {
                    $(this).parent().find('span').html(parseInt($(this).parent().find('span').html()) - 1);
                }
            });
            /*
             for(var i = 0;i < obj.gd.length;i ++) {
             var pid = obj.gd[i].id;
             var name = obj.gd[i].name;
             var price = obj.gd[i].price;
             var num = 0;
             if(obj.gd[i].num != undefined) {
             num = obj.gd[i].num;
             }
             if(guodi == pid) {
             num = 1;
             }
             var html = "<li class='package_list_item'>" +
             "<div class='left'>" +
             "<span class='fontsize_25'>" + name + "</span><br/>" +
             "<span class='price fontsize_20'>￥<span id='price_" + pid + "'>" +price+ "</span>元/份</span>" +
             "</div>" +
             "<div class='right'>" +
             "<div class='add'><img id='add_" + pid + "' pid='" + pid + "' src='" +base_url+ "res/images/add.png'/></div>" +
             "<div class='num fontsize_23'><span>x</span><span id='num_" + pid + "' class='guodi_num'>" + num + "</span></div>" +
             "<div class='sub'> </div>" +
             "</div>" +
             "</li>";
             var package_list = $(html);
             $("#package_list").append('<li class="line"></li>');
             $("#package_list").append(package_list);
             //减少锅底
             /*
             $("#sub_"+pid).on("click", function(e) {
             var guodi_pid = $(this).attr("pid");
             if(guodi > 0) {
             update_guodi(package_id,0,-1);
             }
             $(".guodi_num").html('0');
             $("#num_" + guodi_pid).html('1');
             if(guodi_pid == 0) {
             $("#guodi").val('');
             } else {
             $("#guodi").val(guodi_pid);
             }
             });*/
            //增加锅底
            /*	$("#add_"+pid).on("click", function(e) {
             var guodi_pid = $(this).attr("pid");
             if(guodi > 0) {
             update_guodi(package_id,guodi_pid,1);
             }
             $(".guodi_num").html('0');
             $("#num_" + guodi_pid).html('1');
             if(guodi_pid == 0) {
             $("#guodi").val('');
             } else {
             $("#guodi").val(guodi_pid);
             }
             });
             }
             //调味料
             $("#add_tiaowei").on("click", function(e) {
             if(guodi > 0) {
             update_tiaowei(package_id,1);
             }
             var number = parseInt($("#tiaowei").html());
             number ++;
             $("#tiaowei").html(number);

             });
             $("#sub_tiaowei").on("click", function(e) {
             if(guodi > 0) {
             update_tiaowei(package_id,-1);
             }
             var number = parseInt($("#tiaowei").html());
             if(number > 1)
             number --;
             $("#tiaowei").html(number);

             });
             for(var i = 0;i < obj.hc.length;i ++) {
             var pid = obj.hc[i].id;
             var name = obj.hc[i].name;
             var price = obj.hc[i].price;
             var num = 1;
             if(obj.hc[i].num != undefined) {
             num = obj.hc[i].num;
             }
             var left_html = "<span class='fontsize_25'>" + '' + "</span><br/>" +
             "<span class='price fontsize_20'><span id='price_" + pid + "'>" +''+ "</span></span>";
             if(i < obj.hc.length - 1) {
             i ++;
             left_html = "<span class='fontsize_25'>" + obj.hc[i].name + "</span><br/>" +
             "<span class='price fontsize_20'>￥<span id='price_" + obj.hc[i].id + "'>" +obj.hc[i].price+ "</span>元/份</span>";
             }
             var html = "<li class='package_list_item'>" +
             "<div class='left'>" +
             "<span class='fontsize_25'>" + name + "</span><br/>" +
             "<span class='price fontsize_20'>￥<span id='price_" + pid + "'>" +price+ "</span>元/份</span>" +
             "</div>" +
             "<div class='right'>" +
             left_html +
             "</div>" +
             "</li>";
             var hc_list = $(html);
             $("#hc_list").append('<li class="line"></li>');
             $("#hc_list").append(hc_list);
             }
             for(var i = 0;i < obj.sc.length;i ++) {
             var pid = obj.sc[i].id;
             var name = obj.sc[i].name;
             var price = obj.sc[i].price;
             var num = 1;
             if(obj.sc[i].num != undefined) {
             num = obj.sc[i].num;
             }
             var left_html = "<span class='fontsize_25'>" + '' + "</span><br/>" +
             "<span class='price fontsize_20'><span id='price_" + pid + "'>" +''+ "</span></span>";
             if(i < obj.sc.length - 1) {
             i ++;
             left_html = "<span class='fontsize_25'>" + obj.sc[i].name + "</span><br/>" +
             "<span class='price fontsize_20'>￥<span id='price_" + obj.sc[i].id + "'>" +obj.sc[i].price+ "</span>元/份</span>";
             }
             var html = "<li class='package_list_item'>" +
             "<div class='left'>" +
             "<span class='fontsize_25'>" + name + "</span><br/>" +
             "<span class='price fontsize_20'>￥<span id='price_" + pid + "'>" +price+ "</span>元/份</span>" +
             "</div>" +
             "<div class='right'>" +
             left_html +
             "</div>" +
             "</li>";
             var sc_list = $(html);
             $("#sc_list").append('<li class="line"></li>');
             $("#sc_list").append(sc_list);
             }
             */
            /*
             $("#goitems").on("click", function(e) {
             var guodi = $("#guodi").val();
             var tiaowei = parseInt($("#tiaowei").html());
             if(guodi > 0) {
             add_cart(package_id,1,'P','items',guodi,tiaowei);
             } else {
             alert('必须选择一个锅底');
             }
             });*/
            $("#goitems").on("click", function (e) {
                var selected_num = 0;
                var vaild_num = 0;
                var caipin = [];

//				console.log($(this).parent().parent().find(".guodi_num"));
                $(this).parent().parent().find(".list ul").each(function (i, v) {
                    vaild_num += parseInt($(v).attr("vaild_num"));
                });
                $(this).parent().parent().find(".guodi_num").each(function (i, v) {
                    selected_num += parseInt($(v).html());
                    if (parseInt($(v).html()) >= 1) {
                        var cid = $(v).attr("id").split('_')[1];
                        caipin.push(cid);
                    }
                });
                if (selected_num <= 0) {
                    alert("请选择套餐中的菜品。");
                    return false;
                }
                if (selected_num > vaild_num) {
                    alert("菜品数量超额。");
                    return false;
                }
//				console.log(package_id);
                if (caipin.length > 0) {
                    add_cart(package_id, 1, 'P', 'items', "", 0, "", "", caipin);
                }

//				var tiaowei = parseInt($("#tiaowei").html());
//				if(guodi > 0) {
//					add_cart(package_id,1,'P','items',guodi,tiaowei);
//				} else {
//					alert('必须选择一个锅底');
//				}
            });
            $("#gocart").on("click", function (e) {
                var selected_num = 0;
                var vaild_num = 0;
                var caipin = [];

//				console.log($(this).parent().parent().find(".guodi_num"));
                $(this).parent().parent().find(".list ul").each(function (i, v) {
                    vaild_num += parseInt($(v).attr("vaild_num"));
                });
                $(this).parent().parent().find(".guodi_num").each(function (i, v) {
                    selected_num += parseInt($(v).html());
                    if (parseInt($(v).html()) >= 1) {
                        var cid = $(v).attr("id").split('_')[1];
                        caipin.push(cid);
                    }
                });
                if (selected_num <= 0) {
                    alert("请选择套餐中的菜品。");
                    return false;
                }
                if (selected_num > vaild_num) {
                    alert("菜品数量超额。");
                    return false;
                }
//				console.log(package_id);
                if (caipin.length > 0) {
                    add_cart(package_id, 1, 'P', 'cart', "", 0, "", "", caipin);
                }

            });
        }, "json");
}

function update_guodi(package_id, pid, num) {
    $.post(base_url + "index.php/api/cart/update_package", {
            "package_id": package_id,
            "pid": pid,
            "num": num,
            "op": "guodi"
        },
        function (obj) {
            if (obj.code == '1') {

            } else {
                alert(obj.text);
            }
        }, "json");
}
function update_tiaowei(package_id, num) {
    $.post(base_url + "index.php/api/cart/update_package", {"package_id": package_id, "num": num, "op": "tiaowei"},
        function (obj) {
            if (obj.code == '1') {

            } else {
                alert(obj.text);
            }
        }, "json");
}
//发送验证码
function send_vcode() {
    var mobile = $("#mobile").val();
    $.post(base_url + "index.php/api/validate/get_code", {"mobile": mobile},
        function (obj) {
            if (obj.code == '1') {

            }
            alert(obj.text);
        }, "json");
}

function member_bind() {
    var realname = $("#realname").val();
    var mobile = $("#mobile").val();
    var vcode = $("#vcode").val();
    if ($("#ticket_id").length > 0) {
        var ticket_id = $("#ticket_id").val();
        var par = {"realname": realname, "mobile": mobile, "vcode": vcode, "ticket_id": ticket_id};
    } else {
        var par = {"realname": realname, "mobile": mobile, "vcode": vcode};
    }
    $.post(base_url + "index.php/api/member/bind", par,
        function (obj) {
            if (obj.code == '1') {
                location.href = base_url + "index.php/app/member/bind_ok";
            } else if (obj.code == '2') {
                alert(obj.text);
                location.href = base_url + "index.php/app/member/profile";
            } else {
                alert(obj.text);
            }
        }, "json");
}
function member_bind_card() {
    var card_num = $("#card_num").val();
    var key = $("#key").val();
    var realname = $("#realname").val();
    var mobile = $("#mobile").val();
    var vcode = $("#vcode").val();
    $.post(base_url + "index.php/api/member/bind_card", {
            "card_num": card_num,
            "key": key,
            "realname": realname,
            "mobile": mobile,
            "vcode": vcode
        },
        function (obj) {
            if (obj.code == '1') {
                location.href = base_url + "index.php/app/member/profile";
            } else {
                alert(obj.text);
            }
        }, "json");
}
function send_bind_vcode() {
    var mobile = $("#mobile").val();
    $.post(base_url + "index.php/api/validate/get_code", {"mobile": mobile},
        function (obj) {
            showDialog(obj.text);
        }, "json");
    /*
     var card_no = $("#card_no").val();
     $.post(base_url + "index.php/api/card/get_data", {"card_no":card_no},
     function(obj){
     if(obj.code == '1') {
     var mobile = obj.data.mobile;
     $.post(base_url + "index.php/api/validate/get_code", {"mobile":mobile},
     function(obj){
     alert(obj.text);
     }, "json");
     } else {
     alert(obj.text);
     }
     }, "json");*/
}
//取号
function get_number() {
    var peoples = $("#peoples").val();
    $.post(base_url + "index.php/api/queue/get_number_weixin", {"peoples": peoples},
        function (obj) {
            if (obj.code == '1') {
                $("#info1").html("取号已提交");
            } else {
                $("#info1").html("取号失败");
            }
            var text = obj.text;
            text = text.replace('{number}', "编号：");
            text = text.replace('{peoples}', "人数：");
            $("#info2").html(text);
            //$("#info3").html('（请稍等片刻）');
        }, "json");
}

function score_to_money() {
    if (confirm("您确定要兑换码？")) {
        var mobile = $("#mobile").val();
        var vcode = $("#vcode").val();
        $.post(base_url + "index.php/api/member/score_to_money", null,
            function (obj) {
                if (obj.code == '1') {
                    location.href = base_url + "index.php/app/member/score_to_money";
                } else {
                    alert(obj.text);
                }
            }, "json");

    }
}
function load_related_dishes(oid) {
    $.post(base_url + "index.php/api/order/voucher_order_item", {'oid': oid},
        function (obj) {
            var dishes = obj.data;
            $.each(dishes, function (i, item) {
                var html = "<li class='cart_list_item'>" +
                    "<div class='left'>" +
                    "<span class='fontsize_25'>" + dishes[i].name + "</span><br/>" +
                    "<span class='price fontsize_20'></span>";
                html += "</div>" +
                    "<div class='right'>" +
                    "<div class='add'></div>" +
                    "<div class='num fontsize_23'><span>x</span><span id='num_" + dishes[i].pid + "' >" + dishes[i].num + "</span></div>" +
                    "<div class='sub'></div>" +
                    "</div>" +
                    "</li>";
                var cart_list = $(html);
                $("#order_detail").append('<li class="line"></li>');
                $("#order_detail").append(cart_list);
            });

        }, "json");
}

//外卖界面input输入
$(function () {
    $('#address_list input').on('keydown', function (event) {
        var _this = $(this);
        if (event.keyCode == 13) {
            _this.parent().next().find('input').select();
        }
    })
})