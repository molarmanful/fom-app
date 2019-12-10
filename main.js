let rand = (a, b)=> Math.random() * (b - a + 1) | 0 + a
let trunc1 = x=> Math.trunc(x * 10) / 10

let sum = xs=> xs.reduce((x, y)=> x + y)
let avg = xs=> sum(xs) / xs.length
let stdev = xs=> avg(xs.map(x=> Math.abs(x - avg(xs)) ** 2)) ** .5
let diffs = xs=> xs.map((x, i)=> i && x - xs[i - 1]).slice(1)

let linreg = ys=>{
  let n = ys.length
  let sx = 0
  let sy = 0
  let sxy = 0
  let sxx = 0
  let syy = 0

  ys.map((y, x)=>{
    sx += x
    sy += y
    sxy += x * y
    sxx += x * x
    syy += y * y
  })

  let line = {}
  line.slope = (n * sxy - sx * sy) / (n * sxx - sx * sx)
  line.inter = (sy - line.slope * sx) / n
  line.r2 = ((n * sxy - sx * sy) / ((n * sxx - sx * sx) * (n * syy - sy * sy)) ** .5) ** 2

  return line
}

let days = [...new Array(30)].map((_, i)=> i + 1)
let now = 0
let groups = ['Grains', 'Fruits', 'Vegetables', 'Meats', 'Dairy', 'Fats/Oils', 'Sweets']
let rechigh = [600, 200, 500, 100, 335, 700, 150]
let reclow = [225, 115, 355, 0, 225, 400, 0]
let dietdata = [...new Array(30)].map((_, i)=> [...new Array(7)].map(_=> rand(0, 500)))

let opts = {
  type: 'bar',
  data: {
    labels: days,
    datasets: [{
      label: 'Caloric Intake',
      backgroundColor: 'rgba(238, 110, 115, .5)',
      lineTension: 0,
      data: dietdata.map(sum)
    }]
  },
  options: {
    aspectRatio: 4 / 3,
    scales: {
      yAxes: [{
        ticks: {
          min: 0,
          max: 3000
        }
      }],
    }
  }
}

let dchart

let indic = (color, icon, content)=>{
  $('.indics').append(`
    <li class="collection-item">
      <div class="row valign-wrapper ${color}-text">
        <div class="col s1"><i class="material-icons">${icon}</i></div>
        <div class="col s11">${content}</div>
      </div>
    </li>
  `)
}

let updateChart = day=>{
  now = day
  if(day){

    $('#diet .time').text('Day ' + day)
    if(dchart.config.type == 'bar'){
      dchart.destroy()
      opts.type = 'radar'
      opts.options = {
        aspectRatio: 4 / 3,
        scale: {
          ticks: {
            min: 0,
            max: 500
          }
        }
      }
      dchart = new Chart(dietc.getContext('2d'), opts)
    }

    let daydata = dietdata[day - 1]
    let daysum = sum(daydata)

    dchart.data.labels = groups
    dchart.data.datasets[0].data = daydata

    $('.total').text(daysum)

    $('.groups').text('')
    groups.map((x, i)=>{
      $('.groups').append(`
        <tr>
          <td>${x}</td>
          <td>${daydata[i]}</td>
          <td>${trunc1(daydata[i] / daysum * 100)}</td>
        </tr>
      `)
    })
    $('.indics').html('')
    daydata.map((x, i)=>{
      if(x > rechigh[i] * 1.1){
        indic('orange', 'warning', 'High intake of ' + groups[i])
      } else if(x < reclow[i] * .9){
        indic('grey', 'warning', 'Low intake of ' + groups[i])
      } else {
        indic('green', 'done', 'Good intake of ' + groups[i])
      }
    })

  } else {
    $('#diet .time').text('Month')

    if(dchart.config.type == 'radar'){
      dchart.destroy()
      opts.type = 'bar'
      opts.options = {
        aspectRatio: 4 / 3,
        scales: {
          yAxes: [{
            ticks: {
              min: 0,
              max: 3000
            }
          }],
        }
      }
      dchart = new Chart(dietc.getContext('2d'), opts)
    }

    let monsum = dietdata.map(sum)

    dchart.data.labels = days
    dchart.data.datasets[0].data = monsum

    $('.total').text(sum(monsum))

    $('.groups').text('')
    groups.map((x, i)=>{
      $('.groups').append(`
        <tr>
          <td>${x}</td>
          <td>${sum(dietdata.map(a=> a[i]))}</td>
          <td>${trunc1(sum(dietdata.map(a=> a[i])) / sum(monsum) * 100)}</td>
        </tr>
      `)
    })

    $('.indics').html('')
    let kcalon = monsum.filter(x=> x >= 2000 && x <= 2500).length
    let kcalhigh = monsum.filter(x=> x > 2500).length
    let kcallow = monsum.filter(x=> x < 2000).length
    indic(...(kcalon >= 20 ? ['green', 'done'] : ['orange', 'warning']), `${kcalon} / 30 days met caloric intake goals`)
    indic(...(kcalhigh < 10 ? ['green', 'done'] : ['orange', 'warning']), `${kcalhigh} / 30 days overshot caloric intake goals`)
    indic(...(kcallow < 10 ? ['green', 'done'] : ['orange', 'warning']), `${kcallow} / 30 days undershot caloric intake goals`)

  }

  dchart.update()
}

$(_=>{
  M.AutoInit()

  dchart = new Chart(dietc.getContext('2d'), opts)
  updateChart(0)

  $('#dtimes a').click(e=>{
    updateChart($(e.target).parent().index())
  })

  $('.prev').click(e=>{
    if(now){
      updateChart(now - 1)
    }
  })

  $('.next').click(e=>{
    if(now < 30){
      updateChart(now + 1)
    }
  })

  $('body').removeClass('fade')
})
