(function() {
    var _util = {
        hasClass: function(ele,cls) {
            return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
        },
        addClass: function(ele,cls) {
            if ( !this.hasClass( ele, cls) ) 
                ele.className += " " + cls;
        },
        removeClass: function(ele,cls) {
            if (this.hasClass(ele,cls)) {
                var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
                ele.className=ele.className.replace(reg,' ');
            }
        }
    }   

    var scan  = document.getElementById('scan');
    var code  = document.getElementById('code');
    var state = true;

    if(scan.attachEvent){
        scan.attachEvent("onclick", function() {
            _util.addClass(code, 'show');
        });
        code.attachEvent('onclick', function() {
            _util.removeClass(code, 'show');
        });
    } else if(code.addEventListener){
        scan.addEventListener('click', function() {
            _util.addClass(code, 'show');
        }, true);
        code.addEventListener('click', function() {
            _util.removeClass(code, 'show');
        }, true);
    }
})();
(function() {
    var aop = {
        before: function( target,method,advice ) {
            var old = target[method];
            target[method] = function() {
                var originArgs = util.makeArray(arguments);
                var next = function(){
                    old.apply(target,originArgs);
                }
                var args = originArgs.concat(next);
                advice && advice.apply(target,args);
            };
        },
        after: function( target,method,advice ) {
            var old = target[method];
            target[method] = function() {
                old.apply(target,arguments);
                advice && advice.apply(target,arguments);
            }; 
        }
    };

    var util = {
        getIOSVersion: function() {
            var v = ( navigator.appVersion ).match(/OS (\d+)_(\d+)_?(\d+)?/);
            return isIPhone && parseInt(v[1], 10);
        },
        getAndroidVersion: function(ua) {
            var match = ua.match(/Android\s([0-9\.]*)/);
            return isAndroid && match && match[1];
        },
        makeArray:function(arrayLike) {
            return Array.prototype.slice.apply(arrayLike,[0]);
        },
        hasClass: function(ele,cls) {
            return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
        },
        addClass: function(ele,cls) {
            if (!this.hasClass(ele,cls)) ele.className += " "+cls;
        },
        removeClass: function(ele,cls) {
            if (this.hasClass(ele,cls)) {
                var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
                ele.className=ele.className.replace(reg,' ');
            }
        }
    }

    var _anim = {
        adapter: function(name) {
            return name.replace(/\b(\w)|\s(\w)/g, function(m) { return m.toUpperCase(); });
        },
        state: function(domStyle, aniAttri, aniVal) {
            var aniAttrX = this.adapter(aniAttri);
            domStyle[ ''       + aniAttri ]  = aniVal;
            domStyle[ 'o'      + aniAttrX ]  = aniVal;
            domStyle[ 'moz'    + aniAttrX ]  = aniVal;
            domStyle[ 'webkit' + aniAttrX ]  = aniVal;
        },
        Tween: {
            Quint : { // 五次方缓动
                easeIn : function(start, alter, curTime, dur) {
                    return start + Math.pow(curTime / dur, 5) * alter;
                },
                easeOut: function(start, alter, curTime, dur) {
                    var progress = curTime / dur;
                    return start - (Math.pow(progress, 2) - 2 * progress) * alter;
                },
                easeInOut : function(start, alter, curTime, dur) {
                    return start - (Math.cos(curTime / dur * Math.PI / 2) - 1) * alter/ 2;
                }
            }
        }
    };

    var ua              = navigator.userAgent,
        isIPhone        = ua.indexOf('iPhone') !== -1,
        isAndroid       = ua.indexOf('Android') !== -1 || ua.indexOf('Adr') !== -1, /* 酷派机型的ua里使用的是Adr缩写 */
        isChrome        = ua.match(/Chrome\/([\d.]+)/) || ua.match(/CriOS\/([\d.]+)/),
        androidVersion  = util.getAndroidVersion(ua),
        iOSVersion      = util.getIOSVersion();

    // 捉急不支持的系统版本：ios7和android4.0以下；
    var applicable = ( isIPhone && iOSVersion >= 7 ) || ( isAndroid && parseInt(androidVersion) >= 4 );

    ///////////////////////////////////////////
    /// 与UI处理相关的逻辑；
    ///////////////////////////////////////////
    var view = {
        mask: null,
        call: null,
        cancel: null,
        ignore: null,
        dialog: null,
        download: null,
        confirmWrapper:null,
        ignoreWrapper: null,
        txtIgnore:null,
        txtDownload:null,
        init: function() {
            this.mask     = document.getElementById('mask');
            this.dialog   = document.getElementById('download-dialog');
                 
            this.call     = document.getElementById('call');
            this.cancel   = document.getElementById('cancel');
            this.ignore   = document.getElementById('ignore');
            this.download = document.getElementById('download');

            this.txtIgnore   = document.getElementById('txt-ignore');
            this.txtDownload = document.getElementById('txt-download');

            this.ignoreWrapper  = document.getElementById('ignore-wrapper');
            this.confirmWrapper = document.getElementById('confirm-wrapper');
            
            this.initEvt();
        },
        initEvt: function() {
            var showCallDialog = this.showCallDialog,
                hideCallDialog = this.hideCallDialog;
            if (applicable) {
                this.cancel.addEventListener('click', showCallDialog, true);
            } else {
                this.cancel.addEventListener('click', hideCallDialog, true);
            }
            this.ignore.addEventListener('click', hideCallDialog, true);
            // 给mask绑定click事件， 防止它将click事件传递；
            this.mask.addEventListener('click', function() {}, true);
        },
        showDownloadDialog: function() {
            this.download.setAttribute('href', router.getDownloadUrl());

            this.confirmWrapper.style.display = 'block';
            util.addClass(this.dialog, 'show');
            this.showMask();
        },
        hideDownloadDialog: function() {
            util.removeClass(this.dialog, 'show');
            util.removeClass(this.dialog, 'animated');
            util.removeClass(this.dialog, 'flipInY');

            var _this = this;
            setTimeout(function() {
                _this.ignoreWrapper.style.display = 'none';
                _this.txtDownload.style.display   = 'block';
                _this.txtIgnore.style.display     = 'none';
            }, 300);

            this.hideMask();
        },
        showUnapplicableDialog: function() {
            var param = this.dialog.children[0];
            isIPhone && ( param.textContent = '暂不支持iOS6及以下的系统...' );
            isAndroid && ( param.textContent = '暂不支持Android4.0以下的系统...' );

            util.addClass(this.download, 'u-btn-disabled');

            this.confirmWrapper.style.display = 'block';
            util.addClass(this.dialog, 'show');
            this.showMask();
        },
        hideUnapplicableDialog: function() {

        },
        showCallDialog: function() {
            util.addClass(view.dialog, 'animated');
            util.addClass(view.dialog, 'flipInY');

            view.confirmWrapper.style.display = 'none';
            view.ignoreWrapper.style.display  = 'block';
            view.txtIgnore.style.display      = 'block';
            view.txtDownload.style.display    = 'none';
        },
        hideCallDialog: function(e) {
            e.stopPropagation();
            view.hideDownloadDialog();
        },
        showMask: function() {
            mask.style.display = 'block';
            var t = 0,
                b = 0.9,
                c = 0,
                d = 44;
            function Run() {
                var anim    = _anim.Tween.Quint,
                    opacity = anim.easeIn(t,b,c,d);
                mask.style.opacity = opacity;
                if (c < d){ c++; setTimeout(Run, 10); }
            }
            Run();
        },
        hideMask: function() {
            var t = 0.9,
                b = -0.9,
                c = 0,
                d = 50;
            function Run(){
                var anim    = _anim.Tween.Quint,
                    opacity = anim.easeIn(t,b,c,d);
                mask.style.opacity = opacity;
                if (c < d ) { c++; setTimeout(Run, 10); }
                if (c == d) { 
                    mask.style.display = 'none'; 
                }
            }
            Run(); 
        }
    }

    var evt = {
        delegate: function(root, evtType, className, handle) {
            root.addEventListener(evtType, function(e) {
                var target = e.target;
                while ( target !== root ) {
                    if ( !target ) { break; }
                    if ( target.className.indexOf(className) !== -1 ) {
                        handle(e);
                        break;
                    } else {
                        target = target.parentNode;
                        if ( target === document.body ) { break; }
                    }
                }
            }, true);
        },
        init: function() {
            // 先用touchend替代click， 如果有问题; 考虑使用fastclick解决；
            this.delegate(document.body, 'click', 'x-url-zhuoji', function(e) {
                e.preventDefault();
                var target = e.target;
                view.noview = ( target.getAttribute('data-noview') === 'true' );
                core.awakeApp();
            });
        }
    }

    //////////////////////////////////////////
    /// url的管理, 参数处理，管理页面跳转url
    //////////////////////////////////////////
    var router = {
        android: 'zhuoji://',
        iphone: 'zhuoji://',
        chrome:'intent://#Intent;scheme=zhuoji;package=com.ding;end',
        homepage:'/static/res/zhuoji-20141203-01.apk',
        appstore:'https://itunes.apple.com/us/app/zhuo-ji/id948517915?ls=1&mt=8',
        getDownloadUrl: function() {
            return isIPhone ? this.appstore : this.homepage;
        },
        toDownloadPage: function() {
            var url = this.getDownloadUrl();
            if (isIPhone) {
                window.location.href = url;
            } else {
                window.open(url, '_blank');
            }
            
        }
    }


    var adapter = {
        applicable: false, 
        init: function() {
            // 捉急不支持的系统版本：ios7和android4.0以下；
            this.applicable = ( isIPhone && iOSVersion >= 7 ) || ( isAndroid && parseInt(androidVersion) >= 4 );

            if ( this.applicable ) {
                this.normalHandle();
            } else {
                // 如果是app不支持的系统版本；
                this.inapplicableHandle();
            }

        },
        normalHandle: function() {
            this._injectSchemeHandle(null, null, function() {
                view.noview ? ( router.toDownloadPage() ) : view.showDownloadDialog();
            });
        },
        inapplicableHandle: function() {
            this._injectSchemeHandle(null, null, function() {
                view.noview ? ( view.showUnapplicableDialog() ) : view.showUnapplicableDialog();
            });
        },
        _injectSchemeHandle: function(beforeHandle, afterHandle, failureHandle) {
            var startTime = 0;

            aop.after(core, 'awakeApp', function() {
                setTimeout(function() {
                    afterHandle && afterHandle();

                    /* 必须getTime再运算， 因为android2下直接new Date计算会出问题； */
                    var now      = new Date().getTime(),
                        interval = now - startTime;

                    if ( interval < 600 ) {
                        failureHandle && failureHandle();
                    }
                }, 500);
            });

            aop.before(core, 'awakeApp', function() {
                var next = util.makeArray(arguments).pop();

                beforeHandle && beforeHandle();
                startTime = new Date().getTime();
                next();
            });
        }
    };

    //////////////////////////////////////////
    /// 页面跳转逻辑
    //////////////////////////////////////////
    var core = {
        init: function() {
            adapter.init();
            evt.init();
            view.init();
        },
        awakeApp: function() {
            var doc    = document,
                body   = doc.body,
                iframe = doc.createElement('iframe');

            if ( isAndroid && isChrome ) {
                window.location = router.chrome;
            } else {
                iframe.src = isIPhone ? router.iphone : router.android;
                iframe.style.display = 'none';

                body.appendChild(iframe);
            
                setTimeout(function() {
                    body.removeChild(iframe);
                    iframe = null;
                }, 200);
            }
        }
    }

    core.init();

})();
(function() {
  window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function( callback ) {
    window.setTimeout(callback, 1000 / 60);
  };
  var values = [ 0,0,0,0,0,0,0,0,0,0,0,34.7109375,47.970703125,42.294921875,36.966796875,30.58984375,27.1796875,24.541015625,22.751953125,21.966796875,20.712890625,20.494140625,19.4375,19.50390625,20.24609375,36.681640625,31.259765625,27.353515625,24.89453125,56.5,47.017578125,44.81640625,40.515625,48.931640625,40.65234375,36.640625,34.5546875,32.50390625,43.328125,54.79296875,48.818359375,41.326171875,36.447265625,32.984375,40.8515625,45.4140625,50.27734375,44.412109375,36.7890625,31.8515625,30.654296875,30.3046875,26.677734375,37.130859375,41.8203125,38.765625,38.458984375,38.373046875,36.544921875,34.9140625,29.814453125,35.998046875,37.9296875,32.84375,29.6484375,30.3515625,29.4296875,42.1484375,36.69140625,35.671875,34.3671875,32.025390625,30.673828125,29.765625,38.208984375,32.36328125,
  30.123046875,44.458984375,46.541015625,44.470703125,37.348046875,32.29296875,28.734375,26.6953125,25.916015625,25.681640625,24.041015625,31.41015625,31.6171875,26.53515625,
  65.666015625,58.513671875,51.0703125,42.75,37.515625,34.123046875,31.72265625,29.447265625,27.6328125,26.314453125,25.15625,33.9296875,
  44.66015625,40.013671875,36.34765625,31.095703125,31.7890625,28.1171875,26.4921875,38.0234375,30.34375,29.837890625,24.650390625,23.640625,
  22.822265625,26.888671875,42.88671875,45.22265625,37.328125,28.06640625,37.984375,36.38671875,26.951171875,22.03125,28.248046875,31.35546875,
  23.7265625,20.017578125,18.5703125,17.2890625,21.708984375,21.572265625,30.970703125,26.37109375,22.833984375,22.1953125,22.03125,23.970703125,23.943359375,28.056640625,37.72265625,53.69921875,42.66015625,32.291015625,28.95703125,29.310546875,28.873046875,25.9296875,25.37890625,51.267578125,47.140625,43.630859375,38.232421875,34.212890625,32.439453125,31.572265625,29.6875,29.423828125,27.462890625,27.6953125,26.6015625,29.375,29.736328125,29.74609375,29.20703125,27.28515625,26.44140625,27.36328125,26.19140625,26.548828125,27.833984375,28.767578125,29.353515625,27.39453125,25.216796875,25.546875,25.365234375,
  34.70703125,34.63671875,30.9453125,29.01171875,29.09375,27.03515625,26.021484375,26.234375,26.779296875,26.91015625,27.177734375,27.99609375,28.423828125,31.23828125,31.3046875,29.349609375,26.640625,26.19140625,25.896484375,27.34765625,28.115234375,27.609375,26.52734375,25.427734375,26.39453125,25.09375,23.013671875,
  24.185546875,26.15625,25.548828125,27.98828125,26.80859375,22.48828125,21.294921875,21.640625,20.388671875,21.35546875,21.986328125,
  20.255859375,21.48046875,18.78515625,17.673828125,17.96875,16.505859375,14.587890625,14.923828125,16.837890625,17.97265625,16.2421875,
  11.572265625,10.083984375,8.99609375,8.724609375,7.767578125,7.796875,8.0859375,8.03125,5.509765625,4.67578125,4.26953125,4.240234375,
  3.638671875,3.302734375,3.28125,2.595703125,2.41796875,2.064453125,1.650390625,1.208984375,0.947265625,0.849609375,0.81640625,0.8046875];
  var valens = values.length;

  var canvas  = document.getElementById('canvas'),
      context = canvas.getContext("2d"),
      width   = canvas.width = 216,
      height  = canvas.height = 120,
      K       = 2,
      F       = 2,
      Noise   = 0.01,
      ALPHA   = 0.8,
      ALPHA2  = 0.01;

  update();

  var phase = 0;
  var speed = 0.15;

  function update(){
    phase = ( phase + speed ) % ( Math.PI * 64 )
    context.clearRect( 0, 0, width, height );

    drawLine(1,"rgba(255,255,255,1)", 3.5);
    drawLine(2,"rgba(255,255,255,0.6)", 1.3);
    drawLine(-2,"rgba(255,255,255,0.3)", 1.3);
    drawLine(4,"rgba(255,255,255,0.5)", 1.3);
    drawLine(-6,"rgba(255,255,255,0.3)", 1.3);
    
    requestAnimationFrame(update);
  }

  function drawLine(attenuation, lineColor, lineWidth) {
    context.moveTo(0,0);
    context.beginPath();
    context.strokeStyle = lineColor;
    context.lineWidth = lineWidth || 1;
    var x,y;
    for (var i = -K; i <= K; i+=0.01) {
      x = width * ((i+K)/(K*2));
      y = height/2 + Noise* (1/attenuation)*((height/2) * (Math.sin(F*i - phase))) * globalAttenuationFn(i);
      context.lineTo(x,y);
    }
    context.stroke();
  }


  function changeNoise(value) {
    var now = Noise;
    Noise = ALPHA * now + (1 - ALPHA) * (value / 100);
  }
  function changeFrequence(value) {
    F = 2 + (value/100) *3;
  }

  function globalAttenuationFn(x) {
    return Math.pow(K*4/(K*4+Math.pow(x,4)),K*2);
  }

  var index = 0;

  function onprogress() {
    var average = values[(index++)%valens];
    changeNoise(average);
    changeFrequence(average);

    requestAnimationFrame(onprogress);
  }

  requestAnimationFrame(onprogress);

})();
