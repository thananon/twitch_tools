you can copy `gif` directory for create new widget in `widgets` directory 
http://localhost:3000/widget/[widget-directory]

## New Widget
- copy `gif` directory
- change directory name
- change name, color in `widget.json`
- change Test function in `config.ejs`
```javascript
function Test() {
    socket.emit('widget', {
        id: "[widget name]",  //<------ change id to same name of widget directory
        message: $("#message").val()
    });
}
```
- delete `storage.json`  for clear old data 
- restart nodejs (default data in `widget.json` will save on `storage.json`)
- see widget in http://localhost:3000/widgets

## Widget Structure
    [widget name]
        ├── public                  # You can access file in http://localhost:3000/upload/widgets/[widget name]/[file name]
        ├── views                      
        │     ├── config.ejs        # Config form display at http://localhost:3000/widgets/[widget name]
        │     └── show.ejs          # Widget Frontend display at http://localhost:3000/widget/[widget name]
        ├── storage.json            # Every thing in config form (config.ejs) will save in this file
        └── widget.json             # Widget name, color, default storage data, public_path

## config.ejs
[view ejs template doc](https://ejs.co/#docs)
[view AdminLTE3 demo](https://adminlte.io/themes/v3/pages/forms/general.html)
for create Test Button and Config Form

you can get `widget` variable like this
```html
<%= widget.name %>
```
`storage` variable
```html
<%= widget.storage.alert_delay %>
<%= widget.storage.gif %>
<%= widget.storage.sound %>
```
example Test Button
```javascript
function Test() {
      socket.emit('widget', {
          id: "[widget name]",
          message: $("#message").val()
          // you can add other parameter 
      });
}
```
### Custom config property 
you can add input in `<form>`
example
```html
<form method="post" enctype="multipart/form-data">
<!-- default input -->

<!-- custom input text -->
<input type="text" class="form-control" id="message_template" name="message_template" value="<%= widget.storage.message_template%>">

<!-- custom input file-->
<input type="file" class="custom-file-input" id="keyword_file" name="keyword_file">

<!-- submit button-->
 <button type="submit" class="btn btn-primary">Save Setting</button>
</form>
```
when you `submit` all input in `<form>` will save on `storage.json`

## show.ejs
[view ejs template doc](https://ejs.co/#docs)
for display widget
```html
<!-- load jquery -->
<script
  src="https://code.jquery.com/jquery-3.5.1.min.js"
  integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0="
  crossorigin="anonymous"></script>

<!-- load socket io -->
<script src="https://cdn.socket.io/3.1.1/socket.io.min.js"></script>

<script>
//connect to socket io
var socket = io();

//show widget
socket.on('widget::<%= widget.id %>', (data) => {

    // set text and show widget
    $("#text").text(data.message)
    $("#widget").show()
    audio.play();

   //hide widget
   var time = <%= parseInt(widget.storage.alert_delay)*1000 %>;
   setTimeout(function(){
        $("#widget").hide()
   }, time)
});

//reload this page when save config
socket.on('widget::<%= widget.id %>:reload', () => {
    window.location.reload()
});

</script>

<body>

<audio id="audio" src="/upload/widgets/<%= widget.id %>/<%= widget.storage.sound %>"></audio>
<div id="widget" style="display:none">
   <img src="/upload/widgets/<%= widget.id %>/<%= widget.storage.gif %>">
   <div id="text"></div>
</div>

</body>
```

