// Select city dropdown 
const ilSelect = document.querySelector('#il');

// Pie chart containers 
const chart1 = document.querySelector('#chart1'); 

fetch(`files/cities.json`)
    .then(res => res.json())
    .then(data => {
        populateSelect('il', data);
    });

getResults = (data, ilce, mahalle) => {
    if (ilce == null && mahalle == null) {
        drawChartOnKeys(data["2023-Meclis"]['stats'], 1);
        // draw results on il
    } else if (ilce != null && mahalle == null) {
        drawChartOnKeys(data["2023-Meclis"]['ilceler'][ilce]['stats'], 1);
        // draw results on ilce
    } else {
        drawChartOnKeys(data["2023-Meclis"]['ilceler'][ilce]['mahalleler'][mahalle]['stats'], 1);
        // draw results on mahalle
    }
}
let chart_g;
drawChartOnKeys = (dict, id) => {
    // Format the data for C3.js
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
          'AK PARTI': '#e49444',
          'CHP': '#d1615d',
          'YEŞİL SOL': '#B07AA1',
          'İYİ PARTI': '#2dadf7',
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
          'TİP': '#DD0000',
          'YENİDEN REFAH': '#AAffbb'
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
    drawChartOnKeys(data["2023-Meclis"], '#chart1');
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
        dhont(processDhont(data));
    })
    .catch(error => console.error('Error fetching data:', error))
    .finally(() => {hideSpinner(spinner)});
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

processDhont = (data) => {
    votes = data['2023-Meclis']['stats'];

    delete votes['secmen_sayisi'];
    delete votes['kullanilan_oy'];
    delete votes['gecerli_oy'];

    reps = data['2023-Meclis']['reps']['sayi'];
    return [votes, reps];
}


dhont = (args) => {
    [votes_source, limit] = args;
    rep_counts = new Proxy({}, {        // default dict
        get: (target, name) => name in target ? target[name] : 0
      })

    votes = Object.entries(votes_source).map(([candidate, num_of_votes]) => [candidate, num_of_votes]).sort((a, b) => b[1] - a[1]);

    while (limit > 0) {
        candidate = votes[0][0]
        rep_counts[candidate] += 1
        votes[0][1] = votes_source[candidate] / (rep_counts[candidate] + 1);
        let i = 0, j = 1;
        while (j < votes.length && votes[i][1] < votes[j][1]){ // swap to keep sorted
            temp = votes[j];
            votes[j] = votes[i];
            votes[i] = temp;
            i += 1;
            j += 1;
        }
        limit -= 1;

        console.log(limit, votes, rep_counts);
    }

    createTable(rep_counts, Object.fromEntries(votes));
}

function createTable(data, votes) {
    // Find the container div
    const existingTable = document.querySelector('#dhont-table');
    if (existingTable) {
      existingTable.remove();
    }
  
    const container = document.querySelector('#dhont-container');
  
    // Create a table element
    const table = document.createElement('table');
    table.className = 'bg-white rounded-lg shadow-md w-full p-6 text-center';
    table.id = "dhont-table"
    
    // Create a header row for the keys
    const headerRow = document.createElement('tr');
    table.appendChild(headerRow);
    const indexHeader = document.createElement('th');
    indexHeader.textContent = '';
    headerRow.appendChild(indexHeader);
    for (const key in data) {
      const header = document.createElement('th');
      header.textContent = key;
      headerRow.appendChild(header);
    }
    let header = document.createElement('th');
    header.textContent = "TOPLAM";
    header.className = "border-lb"
    headerRow.appendChild(header);
    console.log("data", data);

    let row = document.createElement('tr');
    table.appendChild(row);

    // Add index cell
    let descCell = document.createElement('td');
    descCell.textContent = "Toplam Vekil Sayısı";
    descCell.classList = "col-header"
    row.appendChild(descCell);

    let sum = 0;
    // Add value cells foreach key
    for (const key in data) {
        const value = data[key];
        const cell = document.createElement('td');
        cell.textContent = value.toLocaleString();
        row.appendChild(cell);
        sum += value;
    }
    let cell = document.createElement('td');
    cell.className = "border-lb"
    cell.textContent = sum.toLocaleString();
    row.appendChild(cell);


    row = document.createElement('tr');
    table.appendChild(row);

    // Add index cell
    descCell = document.createElement('td');
    descCell.textContent = "Artan Oy Sayısı";
    descCell.classList = "col-header"
    row.appendChild(descCell);

    sum = 0;
    console.log(votes);
    // Add value cells foreach key
    for (const key in data) {
        const value = Math.round(votes[key]);
        const cell = document.createElement('td');
        cell.textContent = value;
        row.appendChild(cell);
        sum += value;
    }
    cell = document.createElement('td');
    cell.className = "border-lb"
        cell.textContent = sum;
    row.appendChild(cell);


    // ADAY LİSTELERİYLE KULLANILACAK
    // Create a row for each index
    // let index = 1;
    // let count = (Object.values(data)[0]);
    // while (count > 0) {
    //   count--;
    //   const row = document.createElement('tr');
    //   table.appendChild(row);
  
    //   // Add index cell
    //   const indexCell = document.createElement('td');
    //   indexCell.textContent = index;
    //   row.appendChild(indexCell);
  
    //   // Add value cells foreach key
    // for (const key in data) {
    //     const value = data[key][index - 1];
    //     const cell = document.createElement('td');
    //     cell.textContent = value;
    //     row.appendChild(cell);
    //   }
  
    //   // Increment index
    //   index++;
    // }
  
    // Add table to container
    container.appendChild(table);
  }