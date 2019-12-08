let rand = (a, b)=> Math.random() * (b - a + 1) | 0 + a

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
let groups = ['Grains', 'Fruits', 'Vegetables', 'Meats', 'Dairy', 'Fats/ Oils', 'Sweets']
let dietdata = [...new Array(30)].map((_, i)=> [...new Array(7)].map(_=> rand(0, 400)))

let opts = {
  type: 'line',
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

let updateChart = day=>{
  if(day){
    $('#diet .time').text('Day ' + day)
    if(dchart.config.type == 'line'){
      dchart.destroy()
      opts.type = 'radar'
      opts.options = {
        aspectRatio: 4 / 3,
        scale: {
          ticks: {
            min: 0,
            max: 400
          }
        }
      }
      dchart = new Chart(dietc.getContext('2d'), opts)
    }
    dchart.data.labels = groups
    dchart.data.datasets[0].data = dietdata[day - 1]
  } else {
    $('#diet .time').text('the month')
    if(dchart.config.type == 'radar'){
      dchart.destroy()
      opts.type = 'line'
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
    dchart.data.labels = days
    dchart.data.datasets[0].data = dietdata.map(sum)
  }

  dchart.reset()
  dchart.update()
}

$(_=>{
  M.AutoInit()

  dchart = new Chart(dietc.getContext('2d'), opts)
  updateChart(0)

  $('#dtimes a').click(e=>{
    updateChart($(e.target).parent().index())
  })

  $('body').removeClass('fade')
})
