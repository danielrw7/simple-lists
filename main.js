function getSaved(key) {
  try {
    res = JSON.parse(localStorage.getItem('list-'+key))
    if (res.constructor !== Array) {
      return []
    }
    return res
  } catch (e) {
    return []
  }
}
function setSaved(key, data) {
  if (!data || data.constructor !== Array) {
    data = []
  }
  localStorage.setItem('list-'+key, JSON.stringify(data))
}

function link(text, click) {
  return $('<a>', {
    href: '#',
    css: {
      'margin-left': '5'
    },
    text: text,
    click: click
  })
}

function renderListLinks(sel = '#lists') {
  var lists = []
  for (let key in localStorage) {
    if (key.slice(0, 5) == 'list-' && localStorage.getItem(key) && localStorage.getItem(key) != "[]") {
      lists.push(key.slice(5))
    }
  }
  $(sel).empty()
  $(function() {
    lists.forEach(list => $(sel).append($('<li>').append(link(list, function() {
      location.hash = list
      return false
    }))))
  })
}

function list(key) {
  return {
    key: key,
    items: getSaved(key),
    save: setSaved.bind(this, key),
    add(item) {
      this.items.push(item)
      this.save(this.items)
    },
    move(i, newKey) {
      var newList = list(newKey)
      newList.add(this.items[i])
      this.items.splice(i, 1)
      this.save(this.items)
    },
    archive(i) {
      return this.move(i, "archive")
    },
    render(sel) {
      var $el = $(sel).empty()
      var _this = this
      this.items.forEach((item, i) => {
        var $item = $('<li>', {
          text: item,
          id: 'item-'+i
        })
        if (key != "archive") {
          $item.append(link('archive', function() {
            _this.archive(i)
            _this.render(sel)
            return false
          }))
        }
        $item.append(link('move', function() {
          var newKey = prompt('list key')
          if (newKey) {
            _this.move(i, newKey)
          }
          _this.render(sel)
          return false
        }))
        $el.append($item)
      })
      renderListLinks()
    },
  }
}


$(function() {
  var mainList

  $(window).on('hashchange', function() {
    mainList = list(location.hash.replace(/^\#/,'') || "main")
    $('[name=list]').val(mainList.key)
    $(mainList.render.bind(mainList, "#list"))
  }).trigger('hashchange')


  $('[name=list]').closest('form').submit(function() {
    // location.hash = $(this).find(':input').val()
    return false
  })
  $('[name=add]').closest('form').submit(function() {
    mainList.add($(this).find(':input').val())
    mainList.render('#list')
    $(this).find(':input').val('')
    return false
  })
})