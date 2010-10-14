(function (global, document, undefined){


    global.getRemoteImageData = function ( img_url, callback )
    {
        var page_url = document.location.href,
            secure_root = "https://img-to-json.appspot.com/",
            insecure_root = "http://img-to-json.maxnov.com/",
            secure_regex = /^https:/,
            is_secure = secure_regex.test(img_url) || secure_regex.test(page_url),
            service_root = is_secure ? secure_root : insecure_root,
            cb_stack_name = "cp_remote_image_callbacks",
            cb_stack = cb_stack_name in global ? global[cb_stack_name] : global[cb_stack_name] = [],
            cb_name = cb_stack_name +'['+ cb_stack.length +']',
            service_url = service_root + "?url=" + escape(img_url) + "&callback=" + cb_name,
            script = document.createElement('script');

            cb_stack.push( callback );
            script.src = service_url;
            document.body.appendChild(script);
    };

})(window, document);