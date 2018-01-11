# Lez
*A Pez Dispenser for Lists*

**You can use Lez at (lez.mamota.net)[https://lez.mamota.net].**

Stressed out by your list growing too huge? Lez is like a todo list where you can't see the list.

Add items any time, and when you want a suggestion, Lez will give you one. Your lists are stored on your device, sign up to save them and access them anywhere.

### Api

You can use Lez entirely via its JSON api if you wish. Use the `auth_token` from the heart popup in the app as a GET or POST parameter:

```
GET  /api/lists/
POST /api/lists/add/                {title: title, values: JSON.stringify(values)}
GET  /api/lists/<id>/
POST /api/lists/<id>/add/           {value: value}
POST /api/lists/<id>/modify/        {title: title}
POST /api/lists/<id>/remove/
POST /api/lists/<id>/remove/<id>/
GET  /api/dump/
```

e.g. `curl https://lez.mamota.net/api/lists/?auth_token=1234abcd`
