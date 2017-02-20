function addEvent(obj,sEv,fn){
    if(obj.addEventListener){
        obj.addEventListener(sEv,fn,false);
    }else{
        obj.attachEvent('on'+sEv,fn);
    }
}
function addWheel(obj,fn){
    function fnDir(ev){
        var dir = true;
        var oEvent = ev||event;

        dir = oEvent.wheelDelta?oEvent.wheelDelta<0:oEvent.detail>0;

        fn&&fn(dir);

        oEvent.preventDefault&&oEvent.preventDefault();
        return false;
    }
    if(navigator.userAgent.indexOf('Firefox')!=-1){
        addEvent(obj,'DOMMouseScroll',fnDir);
    }else{
        addEvent(obj,'mousewheel',fnDir);
    }
}
function toDou(iNum){
    return iNum<10?'0'+iNum:''+iNum;
}
function getYearTime(ms){
    var oDate = new Date();
    oDate.setTime(ms);
    return oDate.getFullYear()+'-'+toDou(oDate.getMonth()+1)+'-'+toDou(oDate.getDate())+' '+toDou(oDate.getHours())+':'+toDou(oDate.getMinutes())+':'+toDou(oDate.getSeconds());
}
window.onload = function(){
    var oFaceBox = document.getElementById('face_box');
    var oImg = oFaceBox.children[0];
    var oPrev = oFaceBox.children[1];
    var oNext = oFaceBox.children[2];
    var oUser = document.getElementById('username');
    var oPass = document.getElementById('password');
    var oAdd = document.getElementById('add_btn');
    var oLogin = document.getElementById('login_btn');
    var oLoginPage = document.getElementById('login_page');
    var oChatPage = document.getElementById('chat_page');
    var oFace = document.getElementById('face_img');

    var oUserBox = document.getElementById('user_box');
    var oUserList = document.getElementById('user_list');
    var oUserBarBox = document.getElementById('user_bar_box');
    var oUserBar = document.getElementById('user_bar');

    var oChatBox = document.getElementById('chat_box');
    var oChatList = document.getElementById('chat_list');
    var oChatBarBox = document.getElementById('chat_bar_box');
    var oChatBar = document.getElementById('chat_bar');
    var oContent = document.getElementById('content');
    var oSendBtn = document.getElementById('send_btn');
    var oLogout = document.getElementById('logout');

    //头像ID
    var faceID = 1;

    //最大消息ID
    var maxID = null;

    //身份标识
    var token = null;

    //获取更新用的定时器
    var timer = null;

    //交互URL
    var URL = 'http://zhinengshe.com/exercise/im/api.php';

    oFaceBox.onmouseover = function(){
        oPrev.style.display = 'block';
        oNext.style.display = 'block';
    };
    oFaceBox.onmouseout = function(){
        oPrev.style.display = 'none';
        oNext.style.display = 'none';
    };

    //点击切换头像
    oPrev.onclick = function(){
        faceID--;
        if(faceID<1){
            faceID = 8;
        }
        oImg.src = 'img/'+faceID+'.jpg';
    };
    //点击切换头像
    oNext.onclick = function(){
        faceID++;
        if(faceID>8){
            faceID = 1;
        }
        oImg.src = 'img/'+faceID+'.jpg';
    };

    //注册功能
    oAdd.onclick = function(){
        if(oUser.value==''||oPass.value==''){
            alert('用户名和密码不能为空');
            return;
        }
        jsonp({
            url:URL,
            data:{
                "a":"reg",
                "user":oUser.value,
                "pass":oPass.value,
                "face":faceID
            },
            success:function(res){
                if(res.err==0){
                    alert(res.msg);
                }else{
                    alert(res.msg);
                }
            },
            error:function(err){
                alert('错误:'+err);
            }
        });
    };

    //登录
    oLogin.onclick = function(){
        if(oUser.value==''||oPass.value==''){
            alert('用户名或密码不能为空');
            return;
        }
        jsonp({
            url:URL,
            data:{
                "a":"lgn",
                "user":oUser.value,
                "pass":oPass.value
            },
            success:function(res){
                if(res.err==0){
                    token = res.token;
                    oLoginPage.style.display = 'none';
                    oChatPage.style.display = 'block';
                    oFace.src = 'img/'+res.face+'.jpg';
                    getUser();
                    getMsg();

                    clearInterval(timer);
                    timer = setInterval(function(){
                        jsonp({
                            url:URL,
                            data:{
                                "a":"get_msg_n",
                                "n":maxID,
                                "token":token
                            },
                            success:function(res){
                                if(res.err==0){
                                    oPass.value = '';
                                    var arr = res.data;
                                    for(var i=0;i<arr.length;i++){
                                        var oLi = document.createElement('li');
                                        oLi.innerHTML='<h2><strong>'+arr[i].username+'</strong><span>'+getYearTime(arr[i].post_time*1000)+'</span></h2><p>'+arr[i].content+'</p>';
                                        oChatList.appendChild(oLi);
                                        maxID = arr[i].ID;
                                    }
                                    oChatList.style.top = -(oChatList.scrollHeight-oChatBox.offsetHeight)+'px';
                                    oChatBar.style.top = oChatBarBox.offsetHeight-oChatBar.offsetHeight+'px';
                                }else{
                                    alert('失败');
                                }
                            },
                            error:function(err){
                                alert('错误:'+err);
                            }
                        });
                    },1000);

                }else{
                    alert(res.msg);
                }
            },
            error:function(err){
                alert('错误:'+err);
            }
        });
    };

    oLogout.onclick = function(){
        jsonp({
            url:URL,
            data:{
                "a":"logout",
                "token":token
            },
            success:function(res){
                if(res.err==0){
                    alert(res.msg);
                    clearInterval(timer);
                    oChatPage.style.display='none';
                    oChatList.innerHTML = '';
                    oUserList.innerHTML = '';
                    oUser.value = '';
                    oLoginPage.style.display='block';
                }else{
                    alert(res.msg);
                }
            },
            error:function(err){
                alert('错误:'+err);
            }
        });
    };

    function getMsg(){
        jsonp({
            url:URL,
            data:{
                "a":"get_msg",
                "token":token
            },
            success:function(res){
                if(res.err==0){
                    var arr = res.data;
                    for(var i=0;i<arr.length;i++){
                        var oLi = document.createElement('li');
                        oLi.innerHTML='<h2><strong>'+arr[i].username+'</strong><span>'+getYearTime(arr[i].post_time*1000)+'</span></h2><p>'+arr[i].content+'</p>';
                        oChatList.appendChild(oLi);
                        maxID = arr[i].ID;
                    }
                    oChatList.style.top = -(oChatList.scrollHeight-oChatBox.offsetHeight)+'px';
                    oChatBar.style.top = oChatBarBox.offsetHeight-oChatBar.offsetHeight+'px';
                    wheel(oChatBox,oChatList,oChatBarBox,oChatBar);
                }else{
                    alert('获取聊天记录失败');
                }
            },
            error:function(err){
                alert('错误:'+err);
            }
        });
    }

    function getUser(){
        jsonp({
            url:URL,
            data:{
                "a":"get_user_list",
                "token":token
            },
            success:function(res){
                if(res.err==0){
                    var arr = res.data;
                    for(var i=0;i<arr.length;i++){
                        var oLi = document.createElement('li');
                        oLi.innerHTML = '<img src="img/'+arr[i].face+'.jpg" /><strong>'+arr[i].username+'</strong>';
                        oUserList.appendChild(oLi);
                    }
                    wheel(oUserBox,oUserList,oUserBarBox,oUserBar);
                }else{
                    alert('获取用户列表失败');
                }
            },
            error:function(err){
                alert('错误:'+err);
            }
        });
    }

    //发言
    oSendBtn.onclick = function(){
        if(oContent.value==''){
            alert('内容不能为空');
            return;
        }
        jsonp({
            url:URL,
            data:{
                "a":"snd_msg",
                "content":oContent.value,
                "token":token
            },
            success:function(res){
                if(res.err==0){
                    var oLi = document.createElement('li');
                    oLi.innerHTML = '<h2><strong>'+oUser.value+'</strong><span>'+getYearTime(res.time*1000)+'</span></h2><p>'+oContent.value+'</p>';
                    oChatList.appendChild(oLi);
                    oChatList.style.top = -(oChatList.scrollHeight-oChatBox.offsetHeight)+'px';
                    oChatBar.style.top = oChatBarBox.offsetHeight-oChatBar.offsetHeight+'px';
                    oContent.value = '';
                    maxID = res.ID;
                }else{
                    alert('失败');
                }
            },
            error:function(err){
                alert('错误:'+err);
            }
        });
    };

    function wheel(oBox,oList,oBarBox,oBar){
        oBar.onmousedown = function(ev){
            var oEvent = ev||event;
            var disY = oEvent.clientY-oBar.offsetTop;
            document.onmousemove = function(ev){
                var oEvent = ev||event;
                var t = oEvent.clientY-disY;
                changeT(t);
            };
            document.onmouseup = function(){
                document.onmousemove = null;
                document.onmouseup = null;
                oBar.releaseCapture&&oBar.releaseCapture();
            };
            oBar.setCapture&&oBar.setCapture();
            return false;
        };
        function changeT(t){
            if(t<0){
                t = 0;
            }else if(t>oBarBox.offsetHeight-oBar.offsetHeight){
                t = oBarBox.offsetHeight-oBar.offsetHeight;
            }
            oBar.style.top = t+'px';

            var scale = t/(oBarBox.offsetHeight-oBar.offsetHeight);
            oList.style.top = -(oList.scrollHeight-oBox.offsetHeight)*scale+'px';
        }
        addWheel(oBox,function(bDir){
            var t = oBar.offsetTop;
            if(bDir){
                t+=10;
            }else{
                t-=10;
            }
            changeT(t);
        });
    }
};