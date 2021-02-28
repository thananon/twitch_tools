/** getVersion() : get current version can use `req.getVersion()` in controller or `getVersion()` in view  */
const packageJson = require("../../package.json");

module.exports = function(req, res, next) {

    req.getVersion = function() {
        return packageJson.version;
    };
    req.getHomepage = function() {
        return packageJson.homepage;
    };

    res.locals.getVersion = req.getVersion;
    res.locals.getHomepage = req.getHomepage;

    return next();
}