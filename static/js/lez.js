const list_types = [
  "recipe",
  "books to read",
  "article",
  "TV show",
  "todo"
]

const input_button = $("#btn-input")
const input_field = $("#input-value")
const input_title = $("#input-title")

const btn_yes = $("#btn-yes")
const btn_notnow = $("#btn-notnow")
const btn_no = $("#btn-no")
const btn_login = $("#login")

const login_shade = $('#login-shade')

let title = "My List"
let list = []
let suggestion = null

let suggested = []

// https://stackoverflow.com/a/12646864
const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a
}

const get_next = () => {
  let suggestions = shuffle(list.filter((v) => {
    return suggested.indexOf(v) < 0
  }))
  if(!suggestions.length){
    console.log("Out of items!")
    return
  }
  suggestion = suggestions[0]
  $('#suggestion').text(suggestion)
}

const save = () => {
  localStorage['last_update'] = new Date().valueOf()
  localStorage['list_items'] = JSON.stringify(list)
}

const enter_value = () => {
  if(is_logged_in){
    //todo
  }else{
    const value = input_field.val()
    if(value === ""){
      //todo empty
      return
    }
    if(list.indexOf(value) >= 0){
      //todo already there
      console.log("Already in list")
      return
    }
    list.push(value)
    save()
    if(list.length === 1){
      // todo change to app state
      get_next()
    }
    input_field.val('')
  }
}

$(document).ready(() => {

  // Landing text movement
  let list_type_idx = 0
  setInterval(() => {
    $('.list-type-example').text(list_types[list_type_idx])
    list_type_idx = (list_type_idx + 1) % list_types.length
  }, 2000)

  // init LocalStorage
  if(!localStorage['last_update']){
    localStorage['last_update'] = new Date().valueOf()
    localStorage['list_title'] = title
    localStorage['list_items'] = JSON.stringify(list)
  }else{
    title = localStorage['list_title']
    list = JSON.parse(localStorage['list_items'])
    if(list.length){
      get_next()
    }
  }

  input_title.val(title)

  // Auth
  if(is_logged_in){
    //todo
  }

  input_field.on("keypress", (e) => {
    ((e.charCode || e.keyCode) === 13) && enter_value()
  })

  input_button.on("click", () => {
    enter_value()
  })

  btn_yes.on("click", () => {
    list = list.filter((v) => {
      return v !== suggestion
    })
    save()
    get_next()
  })

  btn_notnow.on("click", () => {
    suggested.push(suggestion)
    get_next()
  })

  btn_no.on("click", () => {
    list = list.filter((v) => {
      return v !== suggestion
    })
    save()
    get_next()
  })

  btn_login.on('click', () => {
    login_shade.addClass('visible')
  })

  login_shade.on('click', () => {
    login_shade.removeClass('visible')
  })

  login_shade.find('section').on('click', (e) => {
    e.stopPropagation()
  })

})
