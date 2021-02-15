/**
 * Dashboard Controller
 */

exports.index = (req, res) => {
    res.render('admin/layouts/default', {
        template: "../dashboard/index",
        title: "Dashboard"
    })
}