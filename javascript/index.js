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