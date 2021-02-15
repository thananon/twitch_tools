/**
 * Widget Controller
 */

const fs = require('fs');
const socket = require('../services/socket.io');
const widgetUpload = require('../middleware/widgetUpload');

/** list all widgets */
exports.index = async (req, res) => {
    let widgets = req.widgets

    res.render('admin/layouts/default', {
        template: "../widgets/index",
        title: "Widgets",
        widgets
    })
}

/** get widget detail and config */
exports.detail = async (req, res) => {
    let id = req.params.id

    let widgets = req.widgets
    let widget = widgets.find(o => o.id == id);

    res.render('admin/layouts/default', {
        template: "../widgets/detail",
        title: widget.name,
        widget
    })
}

/** save setting */
exports.saveSetting = [
    widgetUpload, // upload middleware
    async (req, res) => {

        let id = req.params.id

        let widgets = req.widgets
        let widget = widgets.find(o => o.id == id);

        //merge object
        let data = {
            ...widget.storage,
            ...req.body
        }

        req.files.forEach(file => {
            if (file.filename) {
                data[file.fieldname] = file.filename
            }
        })

        /** save data to widget storage */
        let json = JSON.stringify(data, null, "\t");
        fs.writeFileSync(widget.widgetPath + "/storage.json", json, 'utf8');
        widget.storage = data

        /** event emit to widget for refresh */
        socket.io().emit(`widget::${widget.id}:reload`)

        /** redirect to edit */
        res.redirect(widget.configUrl)

    }
]

/** preview widget */
exports.preview = async (req, res) => {
    let id = req.params.id

    let widgets = req.widgets
    let widget = widgets.find(o => o.id == id);

    res.render("widget/preview", {
        widget
    })
}

/** show widget */
exports.show = async (req, res) => {
    let id = req.params.id

    let widgets = req.widgets
    let widget = widgets.find(o => o.id == id);

    res.render(widget.viewsPath + "/show", {
        widget
    })
}