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
let lists = []
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

const get_csrf_token = () => {
    let cookieValue = null
    const name = 'csrftoken'
    if (document.cookie && document.cookie != '') {
         document.cookie.split(';').map((cookie) => {
            cookie = jQuery.trim(cookie)
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
            }
         })
    }
    return cookieValue;
}

const get_next = () => {
  let suggestions = shuffle(list.filter((v) => {
    return suggested.indexOf(v.value) < 0
  }))
  if(!suggestions.length){
    $('#output > div').removeClass('visible')
    if(list.length){
      $('#output .no-suggestions').addClass('visible')
      // todo reset suggested
    }else{
      $('#output .no-items').addClass('visible')
    }
    return
  }
  suggestion = suggestions[0]
  $('#suggestion').text(suggestion.value)
  $('#output > div').removeClass('visible')
  $('#output .contents').addClass('visible')
}

const save_local = () => {
  localStorage['last_update'] = new Date().valueOf()
  localStorage['list_items'] = JSON.stringify(list)
}

const save_title = () => {
  input_title.removeClass('editing')
  let new_title = input_title.val()
  if(!new_title){
    input_title.val(title)
    return
  }
  if(new_title === title) return
  $.ajax({
    url: "api/lists/" + list_id + "/modify/",
    method: "post",
    data: {
      csrfmiddlewaretoken: get_csrf_token(),
      title: new_title
    }
  })
  title = new_title
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
        value: value,
        csrfmiddlewaretoken: get_csrf_token()
      },
      success: (data) => {
        console.log(data)
        list.push({value: value, id: data.id})
        save_local()
        if(list.length === 1){
          get_next()
        }
      },
    })
  }else{
    list.push({value: value, id: 0})
    save_local()
    if(list.length === 1){
      get_next()
    }
  }

  input_field.val('')
}

const remove_item = () => {
  if(is_logged_in){
    $.ajax({
      url: "api/lists/" + list_id + "/" + suggestion.id + "/remove/",
      method: "post",
      data:{
        csrfmiddlewaretoken: get_csrf_token()
      },
      success: (data) => {
        console.log(data)
        list = list.filter((v) => {
          return v.value !== suggestion.value
        })
        save_local()
        get_next()
      },
    })
  }else{
    list = list.filter((v) => {
      return v.value !== suggestion.value
    })
    save_local()
    get_next()
  }
}

const get_lists = (cb) => {
  $.ajax({
    url: "api/lists/",
    method: "get",
    success: (data) => {
      lists = data.lists
      cb && cb()
    }
  })
}

const get_list = (id) => {
  $.ajax({
    url: "api/lists/" + id + "/",
    method: "get",
    success: (data) => {
      console.log(data)
      list_id = id
      list = data.values
      title = data.title
      input_title.val(title)
      get_next()
    }
  })
}

const set_logged_in = () => {
  $('.logged-out-only').hide()
  $('.logged-in-only').show()
}

const set_logged_out = () => {
  $('.logged-out-only').show()
  $('.logged-in-only').hide()
}

const init = () => {

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
    if(list.length && !is_logged_in){
      get_next()
      $('#output .contents').addClass('visible')
    }
  }

  input_title.val(title)

  // Auth
  is_logged_in ? set_logged_in() : set_logged_out()

  if(is_logged_in){
    get_lists(() => {
      console.log(lists)
      console.log(lists.sort((a,b) => {
        return new Date(a.modified) - new Date(b.modified)
      }))
      list_id = lists.sort((a,b) => {
        return new Date(a.modified) - new Date(b.modified)
      })[0].id
      get_list(list_id)
    })
  }

}

$(document).ready(() => {

  init()

  input_title.on("focus", () => {
    input_title.addClass('editing')
  }).on("blur", () => {
    save_title()
  }).on("keypress", (e) => {
    ((e.charCode || e.keyCode) === 13) && input_title.blur()
  })

  input_field.on("keypress", (e) => {
    ((e.charCode || e.keyCode) === 13) && enter_value()
  })

  input_button.on("click", () => {
    enter_value()
  })

  btn_yes.on("click", () => {
    remove_item()
  })

  btn_notnow.on("click", () => {
    suggested.push(suggestion.value)
    get_next()
  })

  btn_no.on("click", () => {
    remove_item()
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

  $('#login-password').on('keypress', (e) => {
    ((e.charCode || e.keyCode) === 13) && btn_signup.click()
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
        csrfmiddlewaretoken: get_csrf_token()
      },
      success: (data) => {
        console.log(data)
        if(data.success){
          $('.form-errors').html("")
          is_logged_in = true
          set_logged_in()
          if(auth_mode === 'register'){
            console.log("Pushing up")
            // push up local values, if any to new list
            $.ajax({
              url: "api/lists/add/",
              method: "post",
              data: {
                title: title,
                items: JSON.stringify(list),
                csrfmiddlewaretoken: get_csrf_token()
              },
              success: (data) => {
                list_id = data.id
                get_lists()
              }
            })
          }else{
            // if there is a list id, get that list, otherwise get most recent server list
            if(list_id){
              get_list(list_id)
            }else{
              if(list.length){
                console.log("uh oh")
                //todo
              }else{
                console.log(data.lists)
                console.log(data.lists.sort((a,b) => { return new Date(a.modified) - new Date(b.modified) })[0].id)
                get_list(data.lists.sort((a,b) => { return new Date(a.modified) - new Date(b.modified) })[0].id)
              }
            }
          }

          login_shade.removeClass('visible')
        }else{
          ['email', 'password', 'all'].map((type) => {
            data.errors[type] && $('#login-' + type + '-errors').html(data.errors[type].reduce((a,b) => {
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

  $('#logout').on('click', () => {
    Object.keys(localStorage).map((k) => {
      delete localStorage[k]
    })
    $('#output contents').removeClass('visible')
    input_field.val('')
  })

  $('#btn-gauth').on('click', () => {
    $('#login-shade section').fadeOut()
    const w = window.open(glogin, 'name', 'height=600,width=450')
    if (window.focus) {
      w.focus()
    }
    const checker = setInterval(() => {
      if(!w || w.closed){
        console.log("Logged in!")
        console.log(is_logged_in)
        clearInterval(checker)
        if(is_logged_in){
        setTimeout(() => {$('#login-shade section').show()}, 500)
        login_shade.removeClass('visible')
        if(is_logged_in){
          if(list_id){
            get_list(list_id)
          }else{
            get_lists(() => {
              if(!lists.length){
                console.log("New account")
                $.ajax({
                  url: "api/lists/add/",
                  method: "post",
                  data: {
                    title: title,
                    items: JSON.stringify(list),
                    csrfmiddlewaretoken: get_csrf_token()
                  },
                  success: (data) => {
                    list_id = data.id
                    get_lists()
                  }
                })
              }else{
                list_id = lists.sort((a,b) => {
                  return new Date(a.modified) - new Date(b.modified)
                })[0].id
                get_list(list_id)
              }
            })
          }
        }else{
          $('#login-shade section').fadeIn()
        }

        }
      }
    }, 200)
  })

})
