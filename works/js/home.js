window.onload = function() {
	$(".typed").typed({
    	strings: ["这里是诸佳杰","欢迎来到诸佳杰的作业本"],
    	contentType: 'html',
		typeSpeed: 50
	});
};

var OriginTitile = document.title;
var titleTime;
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        document.title = '卧槽，页面好像崩溃了';// + OriginTitile;
        clearTimeout(titleTime);
    }
    else {
        document.title = '食屎拉你';// + OriginTitile;
        titleTime = setTimeout(function() {
            document.title = OriginTitile;
        }, 2000);
    }
});