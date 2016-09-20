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
$(function () {

    function setTime( time ) {
        var date = new Date( Number( time + '000' ) );
        var M = date.getMonth()+1;
        var D = date.getDay();
        var H = date.getHours();
        var M = date.getMinutes();
        return M +'.'+ D +' '+ H + ':' + M;
    }
    
    function sendRed( data ) {
        $.ajax({
            url: base_url + 'index.php/api/red/make',
            data: data || {},
            timeout: 7*1000,
            type: 'POST',
            cache:false,
            dataType:'json',
            success:function(data) {
                if(data.code == '1' ){
                    $('.pop').find('.pop-tips').text('红包已经生成,即将转入分享页面.').end().show();
                    setTimeout(function () {
                        location.replace( data.url );
                    },1.5*1000);
                }else{
                    alert( data.text )
                }
            },
            error : function() {
                alert('服务器异常请重试');
            }
        })
    }

    function getRed( data ) {
        $.ajax({
            url: base_url + 'index.php/api/red/receive',
            data: data || {},
            timeout: 7*1000,
            type: 'POST',
            cache:false,
            dataType:'json',
            success:function(data) {
                if(data.code == '4' || data.code == '5' ){
                    var getData = data.data.my_get;
                    getData.name = getData.name.length > 17 ? getData.name.substring(0,12) + '...' : getData.name;
                    $('.send-msg,.get-red-bag').remove();
                    $('.red-info').find('h3').html( getData.virtual_money + '个谷币');
                    $('.red-info').find('p').html('红包已放入账户'+ getData.name +'<br />注册会员后通过微信点单使用。')
                    $('.red-info').removeClass('hide');

                    var time = setTime( getData.add_time );
                    var html = [
                        '<dl>',
                        '    <dt><img src="'+ getData.headimgurl +'" /></dt>',
                        '    <dd class="name">'+ getData.name + '<em>'+ time +'</em></dd>',
                        '    <dd class="text">'+ getData.say +'</dd>',
                        '    <dd class="price">'+ getData.virtual_money +'个</dd>',
                        '</dl>'
                    ].join('');
                    $('.user-list').prepend( html );
                    $('.user-list p').remove();
                    if( data.code == '5' ){
                        $('#register').hide();
                    }
                }else{
                    alert( data.text )
                }
            },
            error : function() {
                alert('服务器异常请重试');
            }
        })
    }

    if( $('#sendRed').get(0) ){
        //type 1 为随机红包  2为固定红包  默认为固定红包
        var type = 1;

        $('.nav li').on('click',function () {
            var _this = $(this);
            $('.nav li').removeClass('on');
            _this.addClass('on');
            type = _this.attr('type');
            if( type == '3'   ){

            }else{

            }
        });

        $('.red-box li input').blur(function(){
            var number = $.trim( $(this).val() );
            if( !/^\d+$/.test( number ) ){
                alert('请输入整数');
            }
        });

        $('#sendRedBag').on('click',function () {
            var number = $.trim( $('[name="number"]').val() );
            var total = $.trim( $('[name="total"]').val() );
            var description = $.trim( $('[name="description"]').val() );
            var data = {};
            data.type = Number( type );
            if( number != '' && /^\d+$/.test( number ) ){
                data.number = Math.round( number );
            }else{
                alert('请输入红包个数');
                return false;
            }

            if( total != '' && /^\d+$/.test( total ) ){
                total = Math.round( total );
                if( type == '1' ){
                    data.total = total;
                }else if( type == '2' ){
                    data.single = total;
                }
            }else{
                alert('请输入总金额');
                return false;
            }

            if( type == '1' && total < number ){
                alert('红包金额不能小于红包个数');
                return false;
            }

            if( description != '' ){
                data.description = description;
            }else{
                data.description = '恭喜发财,大吉大利';
            }
            sendRed( data );
        });
    }

    if( $('#openRed').get(0) ){
        $('#getRed').on('click',function () {
            getRed( { rid: $('#rid').val() } );
        });

        setTimeout(function () {
            $('.get-red-tips').hide();
        },5*1000)
    }

});