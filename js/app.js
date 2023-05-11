// Select city dropdown 
const ilSelect = document.querySelector('#il');
const ilceSelect = document.querySelector('#ilce');
const mahalleSelect = document.querySelector('#mahalle');

// Pie chart containers 
const chart1 = document.querySelector('#chart1'); 
const chart2 = document.querySelector('#chart2');
const chart3 = document.querySelector('#chart3');

fetch(`files/cities.json`)
    .then(res => res.json())
    .then(data => {
        populateSelect('il', data);
    });

getResults = (data, ilce, mahalle) => {
    if (ilce == null && mahalle == null) {
        drawChartOnKeys(data["2018_CB"]['stats'], 1);
        drawChartOnKeys(data["2018_Meclis"]['stats'], 2);
        drawChartOnKeys(data["2019_Belediye"]['stats'], 3);
        // draw results on il
    } else if (ilce != null && mahalle == null) {
        drawChartOnKeys(data["2018_CB"]['ilceler'][ilce]['stats'], 1);
        drawChartOnKeys(data["2018_Meclis"]['ilceler'][ilce]['stats'], 2);
        drawChartOnKeys(data["2019_Belediye"]['ilceler'][ilce]['stats'], 3);
        // draw results on ilce
    } else {
        drawChartOnKeys(data["2018_CB"]['ilceler'][ilce]['mahalleler'][mahalle]['stats'], 1);
        drawChartOnKeys(data["2018_Meclis"]['ilceler'][ilce]['mahalleler'][mahalle]['stats'], 2);
        drawChartOnKeys(data["2019_Belediye"]['ilceler'][ilce]['mahalleler'][mahalle]['stats'], 3);
        // draw results on mahalle
    }
}
let chart_g;
drawChartOnKeys = (dict, id) => {
    // Format the data for C3.js
    delete dict['parti6_ALDIGI_OY'];

    document.querySelector(`#table${id} #secmen-sayi`).innerText = dict['secmen_sayisi'].toLocaleString();
    document.querySelector(`#table${id} #gecerli-oy`).innerText = dict['gecerli_oy'].toLocaleString();

    let secmen_sayisi = dict['secmen_sayisi'];
    let kullanilan_oy = dict['kullanilan_oy'];
    let gecerli_oy = dict['gecerli_oy'];
    delete dict['secmen_sayisi'];
    delete dict['kullanilan_oy'];
    delete dict['gecerli_oy'];

    var columns = Object.entries(dict).map(([candidate, num_of_votes]) => [candidate, num_of_votes]).sort((a, b) => b[1] - a[1]);

    document.querySelector(`#results${id} #key-1`).innerText = columns[0][0].toLocaleString();
    document.querySelector(`#results${id} #val-1`).innerText = columns[0][1].toLocaleString();
    document.querySelector(`#results${id} #key-2`).innerText = columns[1][0].toLocaleString();
    document.querySelector(`#results${id} #val-2`).innerText = columns[1][1].toLocaleString();
    document.querySelector(`#results${id} #key-3`).innerText = columns[2][0].toLocaleString();
    document.querySelector(`#results${id} #val-3`).innerText = columns[2][1].toLocaleString();

    dict['secmen_sayisi'] = secmen_sayisi;
    dict['kullanilan_oy'] = kullanilan_oy;
    dict['gecerli_oy'] = gecerli_oy;
    console.log(columns)


    // Generate the pie chart
    var chart = c3.generate({
      bindto: `#chart${id}`, // Assuming an HTML element with id
      size: {
        width: 500,
      },
      data: {
        columns: columns,
        type: 'pie',
        colors: {
          'RECEP TAYYİP ERDOĞAN': '#e49444',
          'MUHARREM İNCE': '#d1615d',
          'MERAL AKŞENER': '#2dadf7',
          'TEMEL KARAMOLLAOĞLU': '#99ffcc',
          'SELAHATTİN DEMİRTAŞ': '#B07AA1',
          'DOĞU PERİNÇEK': '#b8b0ac',
          'AK PARTİ': '#e49444',
          'CHP': '#d1615d',
          'HDP': '#B07AA1',
          'İYİ PARTİ': '#2dadf7',
          'MHP': '#1170aa',
          'SAADET': '#99ffcc',
          'MİLLET İTTİFAKI': '#c0615d',
          'BAĞIMSIZ TOPLAM OY': '#000000',
          'VATAN PARTİSİ': '#b8b0ac',
          'HÜDA PAR': '#6a9f58',
          'CUMHUR İTTİFAKI': '#e49433',
          'DP': '#ff7f0f',
          'BBP': '#2ba02b',
          'TKP': '#c0d6e9',
          'BTP': '#9880a1',
          'DSP': '#987fa1',
        },
        color: function (color, d) {
          // d will be 'id' when called for legends
          return d.id && d.id === 'data3' ? d3.rgb(color).darker(d.value / 150) : color;
        },
      },
      tooltip: {
        format: {
          value: function(value, ratio, id) {
            var format = d3.format(','); // format value with comma separator
            var percentage = d3.format('.1%')(ratio); // calculate percentage
            return format(value) + ' (' + percentage + ')'; // combine value and percentage
          }
        }
      },
      legend: {
        position: 'right'
      }
    });
    chart_g = chart;
}

drawCharts = (data, key) => {
    drawChartOnKeys(data["2018-CB"], '#chart1');
    drawChartOnKeys(data["2018-Meclis"], '#chart2');
    drawChartOnKeys(data["2019-Belediye"], '#chart3');
}
function showSpinner() {
  const spinner = document.createElement('div');
  spinner.className = 'spinner';
  spinner.innerHTML = '<div></div>';
  document.body.appendChild(spinner);
  return spinner;
}

function hideSpinner(spinner) {
  document.body.removeChild(spinner);
}

// On change, load data and draw charts
ilSelect.addEventListener('change', () => {
  const il = ilSelect.value;
  let spinner = showSpinner();
  fetch(`files/${il}.json`)
    .then(res => res.json())
    .then(data => {
        localStorage.setItem('cityData', JSON.stringify(data));
        getResults(data, null, null);
        populateSelect('ilce', Object.keys(data["2018_CB"]["ilceler"]));
        populateSelect('mahalle', []);
    })
    .catch(error => console.error('Error fetching data:', error))
    .finally(() => {hideSpinner(spinner)});
});

ilceSelect.addEventListener('change', () => {
    var jsonData = JSON.parse(localStorage.getItem('cityData'));
    if (ilceSelect.value == '***') {
      getResults(jsonData, null, null);
      populateSelect('mahalle', []);
    } else {
      getResults(jsonData, ilceSelect.value, null);
      populateSelect('mahalle', Object.keys(jsonData["2018_CB"]["ilceler"][ilceSelect.value]["mahalleler"]));
    }
    getResults(jsonData, ilceSelect.value, null);
});

mahalleSelect.addEventListener('change', () => {
  var jsonData = JSON.parse(localStorage.getItem('cityData'));
  if (mahalleSelect.value == '***') {
    getResults(jsonData, ilceSelect.value, null);
  } else {
    getResults(jsonData, ilceSelect.value, mahalleSelect.value);
  }
});


function populateSelect(selectId, options) {
  var select = document.getElementById(selectId);
  select.options.length = 1;
  options.forEach(function(option) {
    var opt = document.createElement('option');
    opt.value = option;
    opt.innerText = option;
    select.appendChild(opt);
  });
}
