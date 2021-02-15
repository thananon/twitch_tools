/** getUrl() : get current url can use `req.getUrl()` in controller or `getUrl()` in view  */
module.exports = function(req, res, next) {

    req.getUrl = function(url="") {
        return req.protocol + "://" + req.get('host') + url;
    }

    res.locals.getUrl = req.getUrl;

    return next();
}