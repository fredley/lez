const input_button = $("#btn-input")
const input_field = $("#input-value")
const input_title = $("#input-title")

const btn_yes = $("#btn-yes")
const btn_notnow = $("#btn-notnow")
const btn_no = $("#btn-no")
const btn_login = $(".btn-login")
const btn_register = $("#register")
const btn_login_email = $("#btn-login-email")
const btn_signup = $("#btn-signup")
const btn_reset = $("#btn-reset")

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

const url_pattern = /^(http|https):\/\/[^ "<>]+$/

const is_url = (s) => {
  return url_pattern.test(s)
}

window.gauth_login = () => {
  is_logged_in = true
}

const gauth_cleanup = (should_get=true) => {
  setTimeout(() => {$('#login-shade section').show()}, 500)
  login_shade.removeClass('visible')
  set_logged_in()
  should_get && get_lists()
}

const get_csrf_token = () => {
    let cookieValue = null
    const name = 'csrftoken'
    if (document.cookie && document.cookie != '') {
         document.cookie.split(';').map((cookie) => {
            cookie = cookie.trim()
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
            }
         })
    }
    return cookieValue
}

const show_splash = () => {
  $('#output > div').removeClass('visible')
  $('#output .splash').addClass('visible')
}

const show_cover = () => {
  $('#output > div').removeClass('visible')
  $('#output .cover').addClass('visible')
}

const get_next = () => {
  let suggestions = shuffle(list.filter((v) => {
    return suggested.indexOf(v.value) < 0
  }))
  if(!suggestions.length){
    $('#output > div').removeClass('visible')
    if(list.length){
      $('#output .no-suggestions').addClass('visible')
    }else{
      $('#output .no-items').addClass('visible')
    }
    return
  }
  suggestion = suggestions[0]
  if(is_url(suggestion.value)){
    $('#suggestion').html('<a target="_blank" href="' + suggestion.value + '">' + suggestion.value.split('//')[1] + '</a> <i class="fa fa-external-link"></i>')
  }else{
    $('#suggestion').text(suggestion.value)
  }
  $('#output > div').removeClass('visible')
  $('#output .suggest').addClass('visible')
}

const save_local = () => {
  localStorage['last_update'] = new Date().valueOf()
  localStorage['list_items'] = JSON.stringify(list)
  list_id && (localStorage['list_id'] = list_id)
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
  lists = lists.map((l) => {
    if(l.id == list_id){
      l.title = new_title
    }
    return l
  })
  title = new_title
}

let input_message_timer = null

const enter_value = () => {
  const value = input_field.val()

  if(value === ""){
    $('.input-messages').addClass('visible error').text("Be a bit more creative than that!")
    clearInterval(input_message_timer)
    input_message_timer = setTimeout(() => {
      $('.input-messages').removeClass('visible error')
    }, 2000)
    return
  }
  if(list.map((l) => { return l.value }).indexOf(value) >= 0){
    $('.input-messages').addClass('visible error').text("You already added that!")
    clearInterval(input_message_timer)
    input_message_timer = setTimeout(() => {
      $('.input-messages').removeClass('visible error')
    }, 2000)
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
        list.push({value: value, id: data.id})
        save_local()
        if(list.length === 1){
          show_cover()
        }
      },
    })
  }else{
    list.push({value: value, id: 0})
    save_local()
    if(list.length === 1){
      show_cover()
    }
  }
  $('.input-messages').removeClass('error').addClass('visible').text("Added " + value + " to " + title)
  clearInterval(input_message_timer)
  input_message_timer = setTimeout(() => {
    $('.input-messages').removeClass('visible')
  }, 2000)
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

const get_list = (id, cb=null) => {
  $.ajax({
    url: "api/lists/" + id + "/",
    method: "get",
    success: (data) => {
      list_id = id
      list = data.values
      title = data.title
      input_title.val(title)
      if(list.length){
        show_cover()
      }else{
        $('#output > div').removeClass('visible')
      }
      save_local()
      cb && cb()
    }
  })
}

const show_list_list = () => {
  const ls = $('<ul>')
  lists.map((l) => {
    let check = (l.id == list_id) ? '<i class="fa fa-check"></i> ' : ''
    ls.append('<li data-id="' + l.id + '">' + check + l.title + '</li>')
  })
  ls.append('<li><i class="fa fa-plus"></i> Add New List</li>')
  $('.list-container').html(ls)
  $('.list-container li').on('click', function(){
    const id = $(this).attr('data-id')
    if(id){
      get_list(id)
      $('.shade').removeClass('visible')
    }else{
      $.ajax({
        url: "api/lists/add/",
        method: "post",
        data: {
          title: "New List",
          items: JSON.stringify([]),
          csrfmiddlewaretoken: get_csrf_token()
        },
        success: (data) => {
          list_id = data.id
          get_list(list_id, () => {
            $('#output > div').removeClass('visible')
            $('.shade').removeClass('visible')
            $('#input-title').focus()
          })
        }
      })
    }
  })
}

const set_logged_in = () => {
  $('body').addClass('logged-in')
}

const set_logged_out = () => {
  $('body').removeClass('logged-in')
}

const set_auth_mode = (mode) => {
  auth_mode = mode
  $('.login-reg').text(mode)
  $('.btn-select-login').removeClass('active')
  $('.btn-select-login[data-type=' + mode + ']').addClass('active')
}

const init = () => {

  // init LocalStorage
  if(!localStorage['last_update']){
    localStorage['last_update'] = new Date().valueOf()
    localStorage['list_title'] = title
    localStorage['list_items'] = JSON.stringify(list)
    list_id && (localStorage['list_id'] = list_id)
  }else{
    title = localStorage['list_title']
    list = JSON.parse(localStorage['list_items'])
    list_id = localStorage['list_id']
    if(list.length && !is_logged_in){
      show_cover()
    }else if(!is_logged_in){
      show_splash()
    }
  }

  is_logged_in || input_title.val(title)

  // Auth
  is_logged_in ? set_logged_in() : set_logged_out()

  if(is_logged_in){
    $("#input-auth-token").val(auth_token)
    if(list_id){
      get_list(list_id)
      get_lists()
    }else{
      get_lists(() => {
        list_id = lists.sort((a,b) => {
          return new Date(a.modified) - new Date(b.modified)
        })[0].id
        get_list(list_id)
      })
    }
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

  $('#btn-suggest').on('click', () => {
    get_next()
  })

  btn_reset.on("click", (e) => {
    e.preventDefault()
    suggested = []
    get_next()
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

  $('.btn-select-login').on('click', function(e){
    e.preventDefault()
    set_auth_mode($(this).attr('data-type'))
  })

  btn_login.on('click', () => {
    set_auth_mode('login')
    login_shade.addClass('visible')
  })

  $('.shade').on('click', (e) => {
    if(e.target.tagName.toLowerCase() === 'div'){
      $('.shade').removeClass('visible')
    }
  })

  $('#btn-donate').on('click', () => {
    $('#donate-shade').addClass('visible')
  })

  $('#btn-list-select').on('click', () => {
    show_list_list()
    $('#list-list').addClass('visible')
  })

  btn_login_email.on('click', () => {
    btn_login_email.addClass('active')
    login_email.addClass('visible')
    $('#login-email').focus()
  })

  btn_register.on('click', () => {
    set_auth_mode('register')
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
        if(data.success){
          $('.form-errors').html("")
          is_logged_in = true
          set_logged_in()
          auth_token = data.auth_token
          $("#input-auth-token").val(auth_token)
          if(auth_mode === 'register'){
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
                //push up as new list
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

  $('.btn-logout').on('click', () => {
    Object.keys(localStorage).map((k) => {
      delete localStorage[k]
    })
    $('#output contents').removeClass('visible')
    input_field.val('')
  })

  $('#btn-gauth').on('click', () => {
    $('#login-shade section').fadeOut()
    const w = window.open("/social/login/google-oauth2", 'name', 'height=600,width=450')
    if (window.focus) {
      w.focus()
    }
    const checker = setInterval(() => {
      if(!w || w.closed){
        clearInterval(checker)
        if(is_logged_in){
          if(list_id){
            get_list(list_id)
            gauth_cleanup()
          }else{
            get_lists(() => {
              if(!lists.length){
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
                    gauth_cleanup()
                  }
                })
              }else{
                list_id = lists.sort((a,b) => {
                  return new Date(a.modified) - new Date(b.modified)
                })[0].id
                get_list(list_id)
                gauth_cleanup(false)
              }
            })
          }
        }else{
          $('#login-shade section').fadeIn()
        }
      }
    }, 200)
  })

})
