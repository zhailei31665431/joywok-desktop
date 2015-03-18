
// var version = eval('('+fs.readFileSync('package.json').asciiSlice()+')')["version"];
// console.log(version);
// Backbone.sync('read',null,{url:basurl+'/lite/version',function(resp){
// 	if(resp){
// 		if(resp['version']!=version){

// 		}
// 	}
// }})

// if(version != Math.random()){
// 	alert("该程序有更新，请更新！")
// }

// fs.readFile('1.jpg',function(err, data){
// 	console.log(data)
// 	fs.writeFile('123.jpg',data,function(err){
// 	    alert('xxxxx')
// 	});
// });

// fs.writeFile('123.jpg','1234567890',function(err){
//     alert('xxxxx')
// });
$(function(){
	var fs = require('fs');
	var gui = require('nw.gui');
	var sys = navigator.appVersion.indexOf('Mac OS X')>0?'mac':'win';
	var winNow = gui.Window.get();
	
	// var address =''

	// fs.readFileSync('package.json',function(err,data){
	// 	var datas = eval('('+data+')');
	// 	address = datas['address'];	
	// })

	var address = eval('('+fs.readFileSync('package.json')+')')['address']

	// var proxy = gui.App.setProxyConfig('systim');
	// console.log(proxy)

	var store = new Store('Joywok:lite');
	var tops = this;
	var css = $('#liteStyle').html();
	$('#liteStyle').html('');
	jw.error_dialog = Backbone.View.extend({
		events:{
			'click a':'hideBar'
		},
		initialize:function(options){
			var self = this;
			var oldc = $('.error-dialog')
			if(oldc.length>0) oldc.remove();
			this.$el = $('<div class="error-dialog"></div>');
			this.$el.html('<div class="jw-formnotice-w"><div class="jw-formnotice-c shadow"><span>'+options.text+'</span><a href="javascript:;">知道了</a></div></div>');
			$('body').append(this.$el);
			_.delay(function(){
				self.hideBar();
			},2000);
		},
		hideBar:function(){
			var self = this;
			this.$el.fadeOut(500,function(){
				self.$el.remove();
				self.trigger('finish');
			});
		}
	})
	jw.login_m = Backbone.Model.extend({
		url:basurl+'/auth/desktop/'
	})
	jw.loginLite = Backbone.View.extend({
		events:{
			"click .login-btn":'load',
			'click .login-mini':'showmini',
			'click .login-close':'close',
			'click .login-forget':'forgot',
			'click .login-new':'newUser'
		},
		initialize:function(options){
			var self = this;
			_.extend(this,options);
			this.$el = $('<div class="login-w"></div>');
			this.data = store.find({id:'login'})
			this.model = new jw.login_m()
			if(this.data){
				this.model.set(this.data["data"])
			}
			this._init_main();
			this._init_name();
			this.bindEvt()
			this.init_input()
		},
		_init_main:function(){
			this.$el.html('<div class="pic"><img src="images/login-pic.png"/></div>\
							<div class="login-c">\
			 					<div class="login-user-avatar"><img src="'+(this.model.get("avatar")?basurl+this.model.get("avatar")["avatar_l"]:'images/l.jpg')+'"/></div>\
			 					<div class="login-input email">\
			 						<div class="login-input-ico"></div>\
			 						<div class="login-input-c"></div>\
			 					</div>\
			 					<div class="login-input passwd">\
			 						<div class="login-input-ico"></div>\
			 						<div class="login-input-c"></div>\
			 					</div>\
			 					<div class="login-btn-c">\
			 						<button type="button" class="login-btn" disabled="disabled">登录</button>\
			 					</div>\
			 					<div class="login-opear">\
			 						<div class="login-forget">忘记密码?</div>\
			 						<div class="login-new">注册新用户</div>\
			 					</div>\
							</div>\
							<div class="login-close"></div>\
							<div class="login-mini"></div>');
			this.parentEl.prepend(this.$el);
		},
		bindEvt:function(){
			var self = this;
			var re = /\w+((-w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]{2,}/ ;
			this.model.bind('change',function(){
				if(this.get("email")&&this.get('email')!=''&&re.test(this.get("email"))&&this.get('passwd')&&this.get('passwd')!=''&&this.get('passwd').length>5){
 					self.login_btn.removeAttr('disabled')
				}else{
					self.login_btn.attr({disabled:'disabled'})
				}
			})
		},
		_init_name:function(){
			this.login_btn = this.$el.find(".login-btn");
			this.cache_avatar = this.$el.find('.login-user-avatar>img')
		},
		init_input:function(data){
			var self = this;
			this.user_input = new jw.input({
				el:this.$el.find('.login-input.email .login-input-c'),
				tip:'邮箱',
				shadow:1
			})
			this.user_input.bind('change',function(data){
				self.cache_avatar.attr({src:'images/l.jpg'})
				self.model.set({email:data.toString()})
			})
			this.user_input.bind('keydown',function(evt){
				if(evt.keyCode == 13){
					if(self.user_input.getText().length!=0){
						self.pass_input.setFocus()
					}						
				}
			})
			this.pass_input = new jw.input({
				el:this.$el.find('.login-input.passwd .login-input-c'),
				tip:'密码',
				type:'password',
				shadow:1
			})
			this.pass_input.bind('change',function(data){
				self.model.set({passwd:data})
			})
			this.pass_input.bind('keydown',function(evt){
				if(evt.keyCode == 13){
					if(self.pass_input.getText().length!=0){
						self.load()
					}else{
						new jw.error_dialog({text:'请输入密码!!'})
					}
				}
			})
			if(this.model.get("email")){
				this.user_input.setTxt(this.model.get("email"),{silent:true})
				this.pass_input.setFocus();
			}else{
				this.user_input.setFocus();
			}
		},
		switch_login:function(){
			this.init_input()
		},
		forgot:function(){
			gui.Shell.openExternal(basurl+'/forget')
		},
		newUser:function(){
			gui.Shell.openExternal(basurl)
		},
		_save:function(){
			var self = this;
			if(this.status == 1) return ;
			this.status = 1
			this.login_btn.attr({disabled:'disabled'}).html('登录中...');
			this.model.save({email:this.model.get("email"),passwd:this.model.get("passwd")},{wait:true,silent:true,success:function(model,resp,xhl){
				if(!resp['errcode']){
					new jw.SysNotice({type    : 2,delay : 1000,text    : '登录成功'});
					resp['user']['session'] = 1;
					store.update({id:'login',data:resp['user']});
					var loginUrl = 'http://'+resp["litebaseurl"]['entdomain']+'.'+address
					if(resp["litebaseurl"]['extdomain']&& resp["litebaseurl"]['extdomain'] !='') loginUrl += resp["litebaseurl"]['extdomain'];
					loginUrl+='/groups/lite/';
					// winNow.close()
					// window.location.href = 'http://116.213.100.18/groups/lite/'
					// $('.lite').css({display:'none'})''
					// var iframe = $('<iframe src="http://116.213.100.18/groups/lite/" width="480" height="700" nwfaketop nwdisable></iframe>')
					// $('.haha').html(iframe)
					// iframe.load(function(){
					// 	// console.log(iframe)
					// })
					// iframe[0].bind('message', function(){
					// 	console.log('调用了')
					// });
					//console.log()
					$.ajax({
					  url:basurl+'/public/styles/lite/allStyle.css?='+Math.random(),
					  success: function(dataOne){
					  		fs.writeFile('css/allStyle.css',dataOne,function(err){
					  			$.ajax({
								  url:basurl+'/public/styles/lite/MacStyle.css?='+Math.random(),
								  success: function(dataTwo){
								  		fs.writeFile('css/MacStyle.css',dataTwo,function(err){
								  			// winNow.reload();
								  			// var wins = gui.Window.open(basurl+'/groups/lite/', {
								  			var wins = gui.Window.open(loginUrl, {
											  	position: 'right',
											  	width: 402,
											  	height: 728,
											  	icon:basurl+(sys=="win")?'/public/images/lite/ico-s.png':'/public/images/lite/ico-s-b.png',
											  	toolbar: false,
											  	// frame:false,
											  	focus:true,
											  	show:false,
											  	resizable:false
											  	// "inject-js-start": "a.js",
											  	// "document-start":function(){
											  	// 	alert('xxxxxxxx')	
											  	// }
											});
								  			var a = 0;
											var timeer = null;
											timeer = setInterval(function(){
												if(a == 10){
													clearInterval(timeer)
											        tray.remove();
											        tray = null;
													wins.show();
													winNow.close();
												}else{
													winNow.moveTo(winNow.x, winNow.y - 3)
													a++
												}
											},15)
										});
								  }
								});
							});
					  	}
					});
				}else{
					self.status = 0
					if(resp["errcode"]=='20118'||resp["errcode"]=='20110'){
						new jw.FormNotice({text:resp['errmemo']})
						self.user_input.setTxt('');
						self.pass_input.setTxt('');
						self.user_input.setFocus();
					}else{
						new jw.error_dialog({text:resp['errmemo']+'，请修改。'})
					}
					self.login_btn.removeAttr('disabled').html('登录');
				}
			}})                                       
		},
		load:function(){
			var self = this;
			store_data = store.find({id:'login'})?store.find({id:'login'}):{}
			this.login_btn.attr({disabled:'disabled'}).html('登录中...');
			Backbone.sync('update',new Backbone.Model(),{url:basurl+'/auth/net/',success:function(resp){
				self._save();
			},error:function(model,resp){
				self.login_btn.removeAttr('disabled').html('登录');
				new jw.error_dialog({type    : 2,delay : 1000,text    : '您当前没有网络，检查您的网络！！'});
			}})
		},
		close:function(){
			winNow.close();
		},
		showmini:function(){
			winNow.hide();
		}
	})
	var tray = new gui.Tray({icon:(sys=="win"?'ico-s.png':'ico-s-b.png'),alticon:true});//window下面可以
	tray.tooltip = '点击打开'
	tray.on('click',function(){
        winNow.show();
        if(sys == 'win') winNow.focus();//mac不用写，win用写
    })
    if(sys == "mac"){
		var mb = new gui.Menu({type:"menubar"});
		mb.createMacBuiltin("Joywok");
		gui.Window.get().menu = mb;
	}
    new jw.loginLite({
		parentEl:$('.lite')
	})
})

// fs.writeFile('a.txt','1234567890',function(err){
//     alert('xxxxx')
// });