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
const btn_register = $("#register")
const btn_login_email = $("#btn-login-email")
const btn_signup = $("#btn-signup")

const login_shade = $('#login-shade')
const login_email = $('#email-login')

let title = "My List"
let list = []
let suggestion = null
let auth_mode = null
let list_id = null

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

const save_local = () => {
  localStorage['last_update'] = new Date().valueOf()
  localStorage['list_items'] = JSON.stringify(list)
}

const enter_value = () => {
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

  if(is_logged_in){
    $.ajax({
      url: "api/lists/" + list_id + "/add/",
      method: "post",
      data:{
        value: value
      },
      success: (data) => {
        console.log(data)
      }
    })
  }

  list.push(value)
  save_local()
  if(list.length === 1){
    $('#output .contents').addClass('visible')
    get_next()
  }
  input_field.val('')
}

set_logged_in = () => {
  $('.logged-out-only').hide()
  $('.logged-in-only').show()
}

set_logged_out = () => {
  $('.logged-out-only').show()
  $('.logged-in-only').hide()
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
    localStorage['list_id'] = list_id
  }else{
    title = localStorage['list_title']
    list = JSON.parse(localStorage['list_items'])
    list_id = localStorage['list_id']
    if(list.length){
      get_next()
    }
  }

  input_title.val(title)

  // Auth
  is_logged_in ? set_logged_in() : set_logged_out()

  if(list.length){
    $('#output .contents').addClass('visible')
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
    save_local()
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
    save_local()
    get_next()
  })

  btn_login.on('click', () => {
    $('.login-reg').text('Login')
    auth_mode = 'login'
    login_shade.addClass('visible')
  })

  login_shade.on('click', () => {
    login_shade.removeClass('visible')
  })

  login_shade.find('section').on('click', (e) => {
    e.stopPropagation()
  })

  btn_login_email.on('click', () => {
    btn_login_email.addClass('active')
    login_email.addClass('visible')
    $('#login-email').focus()
  })

  btn_register.on('click', () => {
    $('.login-reg').text('Register')
    auth_mode = 'register'
    login_shade.addClass('visible')
  })

  btn_signup.on('click', () => {
    $('input').prop('disabled', true)
    btn_signup.prop('disabled', true)
    $.ajax({
      url: "/" + auth_mode + "/",
      method: "post",
      data: {
        email: $('#login-email').val(),
        password: $('#login-password').val(),
        csrfmiddlewaretoken: csrf_token
      },
      success: (data) => {
        if(data.success){
          $('.form-errors').html("")
          is_logged_in = true
          set_logged_in()
          login_shade.removeClass('visible')
        }else{
          ['email', 'password', 'all'].map((type) => {
            $('#login-' + type + '-errors').html(data.errors[type].reduce((a,b) => {
              return a + "<br>" + b
            }, ""))
          })
        }
      },
      error: () => {
        console.error('registration error')
      },
      complete: () => {
        $('input').prop('disabled', false)
        btn_signup.prop('disabled', false)
      }
    })
  })

})
