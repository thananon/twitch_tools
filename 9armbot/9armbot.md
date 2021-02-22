
### 9armbot.js

___

แจ้งการทำงานทั้งหมดที่ บอท สามารถทำได้ โดยเรียกผ่าน ชื่อและตามด้วย Handler 

```js
client.on('message', onMessageHandler);
client.on('cheer', onCheerHandler);
[...]
client.on('connected', onConnectedHandler);
```

คำสั่งต่างๆ ที่บอทจะตอบสนองจะถูกเก็บในตัวแปร command จะเป็น dict() ที่ key คือคำสั่งที่บอทตอบสนอง value คือ pointer ที่อยู่ของฟังชั่น

```js
const command = {
    "!c": checkCoin,
    ...
    "!thanos": thanosClick
}
```
___
#### ฟั่งชั่น
```js
function onMessageHandler(channel, userstate, message, self)
```
ทำงานเมื่อมีผู้ใช้ส่งข้อความมาใน แชทของช่องทั้ง ข้อความธรรมดา คำสั่ง action "/me [ข้อความ]" และ การกระซิบ

```js

channel : ชื่อของช่องนั้น

userstate : ข้อมูลของผู้ใช้

message : ข้อความ

self : นิพจน์ เป็นจริงเมื่อข้อความนั้นมากจากตัว บอทเอง

```

ฟังชั่นนี้ไม่สนใจข้อความจากตัวบอทเอง จะตัดคำจากข้อความเฉพาะชุดแรก และไป map กับชุดคำสั่งที่ บอท จะตอบสนองแล้วเรียก ฟังชั่นนั้นๆ หรือในกรณีที่ sentry ทำงานอยู่ถ้าข้อความนั้นๆ ไม่ใช่คำสั่งที่ บอท ต้องตอบสนองจะส่งข้อความไปตรวจสอบด้วย

```js
function onCheerHandler(channel, userstate, message) 
```

```js
function onSubHandler(channel, username, method, message, userstate) 
```

```js
function onReSubHandler(channel, username, months, message, userstate, method) 
```

```js
function onSubGiftHandler(channel, username, streakMonths, recipient, methods, userstate) 
```

```js
function onSubGiftMysteryHandler(channel, username, numbOfSubs, methods, userstate)
```

```js
function onConnectedHandler(addr, port) 
```