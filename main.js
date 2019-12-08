let round1 = n=> Math.trunc(n * 10) / 10
let rand = (a, b)=> Math.random() * (b - a + 1) + a

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

let updateWeights = (chart, labels, data, wk)=>{

  if(wk){
    data = data.slice(wk * 7 - 7, wk * 7)
    labels = labels.slice(wk * 7 - 7, wk * 7)

    $('#weight .range').text('week ' + wk)
  } else {
    $('#weight .range').text('the month')
  }

  chart.data.labels = labels
  chart.data.datasets[0].data = data
  chart.options.scales.yAxes[0].ticks.min = 0 | Math.min(...data) - 10
  chart.options.scales.yAxes[0].ticks.max = 0 | Math.max(...data) + 10

  chart.update()

  let change = round1(data[data.length - 1] - data[0])
  let iwl = 65
  let iwu = 81
  let last = data[data.length - 1]
  $('#weight .summary').removeClass('green-text red-text orange-text')
  if(change > 0){
    $('#weight .summary').text('gained ' + Math.abs(change) + ' kg')
  } else {
    $('#weight .summary').text('lost ' + Math.abs(change) + ' kg')
  }
  if((last >= iwl && last <= iwu) || (last > iwu && change < -1) || (last < iwl && change > 1)){
    $('#weight .summary').addClass('green-text')
  } else if(Math.abs(change) < 1){
    $('#weight .summary').addClass('orange-text')
  } else {
    $('#weight .summary').addClass('red-text')
  }

  $('#weight .start').text(data[0])
  $('#weight .end').text(data[data.length - 1])

  let lr = linreg(data)
  console.log(lr)
  ad = avg(diffs(data))
  $('#weight .roc').text((ad >= 0 ? '+' : '') + round1(ad))

  $('#weight .netch').text((change >= 0 ? '+' : '') + change)

  let min = Math.min(...data)
  let max = Math.max(...data)
  $('#weight .min').text(min)
  $('#weight .max').text(max)
  $('#weight .avg').text(round1(avg(data)))

  $('#weight .wrecs').text('')
  if((max - data[0] > 1.5 && max - last > 1.5) || (min - data[0] < -1.5 && min - last < -1.5)){
    $('#weight .wrecs').append(`
      <li class="collection-item orange-text">
        <div class="row valign-wrapper">
          <div class="col s1">
            <i class="material-icons">timeline</i>
          </div>
          <div class="col s11">Try to keep your weight changes more consistent.</div>
        </div>
      </li>`)
  }
  if((last >= iwl && last <= iwu)){
    $('#weight .wrecs').append(`
      <li class="collection-item green-text">
        <div class="row valign-wrapper">
          <div class="col s1">
            <i class="material-icons">thumb_up</i>
          </div>
          <div class="col s11">You are within your goal weight range. Good work, and keep it up!</div>
        </div>
      </li>`)
  } else if((last > iwu && change < -1) || (last < iwl && change > 1)){
    $('#weight .wrecs').append(`
      <li class="collection-item green-text">
        <div class="row valign-wrapper">
          <div class="col s1">
            <i class="material-icons">thumb_up</i>
          </div>
          <div class="col s11">You are on track to reaching your goal weight range. Good work, and keep it up!</div>
        </div>
      </li>`)
  } else {
    $('#weight .wrecs').append(`
      <li class="collection-item orange-text">
        <div class="row valign-wrapper">
          <div class="col s1">
            <i class="material-icons">track_changes</i>
          </div>
          <div class="col s11">You are not at your goal weight range yet, but you can get there. Keep it up!</div>
        </div>
      </li>`)
  }
}

let start = 0 | rand(0, 6)
let days = [...new Array(30)].map((_, i)=> ['S', 'M', 'T', 'W', 'Th', 'F', 'Sa'][(start + i) % 7])
let weightstart = round1(rand(60, 130))
let weightdata = [...new Array(29)].reduce(x=> [...x, round1(x[x.length - 1] + rand(-2, 1))], [weightstart])

$(_=>{
  M.AutoInit()

  let weightctx = weightc.getContext('2d')
  let weightchart = new Chart(weightctx, {
    type: 'line',
    data: {
      labels: days,
      datasets: [{
        label: 'Weight (kg)',
        backgroundColor: 'rgba(238, 110, 115, .5)',
        data: weightdata
      }]
    },
    options: {
      aspectRatio: 4 / 3,
      legend: {
        display: false
      },
      scales: {
        yAxes: [{
          ticks: {
            min: Math.min(...weightdata) - 10,
            max: Math.max(...weightdata) + 10
          }
        }]
      }
    }
  })

  updateWeights(weightchart, days, weightdata)

  $('#wtimes a').click(e=>{
    updateWeights(weightchart, days, weightdata, $(e.target).parent().index())
  })

  $('body').removeClass('fade')
})
