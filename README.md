# Lez
## A Pez Dispenser for Lists

**You can use Lez at (lez.mamota.net)[https://lez.mamota.net].**

### Api Documentation

You can use Lez entirely via its JSON api if you wish. Use the `auth_token` from the heart popup in the app as a GET or POST parameter:

```
GET  /api/dump/
GET  /api/lists/
POST /api/lists/add/                {title: title, values: JSON.stringify(values)}
GET  /api/lists/<id>/
POST /api/lists/<id>/add/           {value: value}
POST /api/lists/<id>/modify/        {title: title}
POST /api/lists/<id>/remove/
POST /api/lists/<id>/remove/<id>/
```
