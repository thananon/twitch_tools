/** getWidgets() : get current widgets can use `req.widgets` in controller or `widgets` in view  */

const path = require('path');
const fs = require('fs');
const express = require('express')

module.exports = function (app) {

    let views = [
        app.get('views'),
    ]
    let widgetsPath = path.join(__dirname, '..', 'widgets');
    let files = fs.readdirSync(widgetsPath);
    let widgets = files.map(file => {

        /** get widget path */
        var widgetPath = path.join(widgetsPath, file);

        /** get widget config */
        var configPath = path.join(widgetPath, 'widget.json');

        /** get widget storage */
        var storagePath = path.join(widgetPath, 'storage.json');

        /** get widget views */
        var viewsPath = path.join(widgetPath, 'views');

        /** read widget config file */
        let config
        try {
            let widgetConfig = fs.readFileSync(configPath);
            config = JSON.parse(widgetConfig);
        } catch (error) {
            throw new Error(`Please create "widget.json" in widget directory "${widgetPath}"`)
        }

        /** read widget storage file */
        try {
            let storageConfig = fs.readFileSync(storagePath);
            let storage = JSON.parse(storageConfig);
            config.storage = storage
        } catch (error) {
            /** storage not found */

            let storage = {}

            /** set default storage */
            if(config.default_storage){
                storage = config.default_storage
                fs.writeFileSync(storagePath, JSON.stringify(storage, null, "\t"));
            }

            // init storage
            config.storage = storage
        }

        /** set public path of widget */
        if (config.public_path) {
            var publicPath = path.join(widgetPath, config.public_path);
            app.use(`/upload/widgets/${file}`, express.static(publicPath));
        }
        views.push(viewsPath)

        /** set widget parameter */
        config.id = file
        config.configUrl = `/widgets/${config.id}`
        config.widgetPath = widgetPath
        config.viewsPath = viewsPath

        return config
    });

    app.set('views', views);

    /** return middleware */
    return function (req, res, next) {

        /** add link to widget */
        widgets = widgets.map(widget => {
            widget.url = req.getUrl(`/widget/${widget.id}`)
            widget.publicUrl = req.getUrl(`/widget/${widget.id}/public`)
            widget.previewUrl = req.getUrl(`/widget/${widget.id}/preview`)
            return widget
        });

        /** pass variable to controller */
        req.widgets = widgets
        req.widgetsPath = widgetsPath
        res.locals.widgets = widgets;

        return next();
    }

}