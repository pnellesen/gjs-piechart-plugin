export default (editor, opt = {}) => {
  const c = opt;
  const dc = editor.DomComponents;
  const defaultType = dc.getType('default');
  const defaultModel = defaultType.model;
  const piechartType = 'piechart';
  const chartData = c.optChartData || [{"name":"defaultName","label":"No data provided","value":0}];
  const colorDataObj = {}
  const sectionDataObj = {}
  chartData.map(item => {
    colorDataObj['color' + item.name]= item.color;
    sectionDataObj['data' + item.name] = item.data;
  });

  const traitColorData = chartData.map((item) => {
    return ({
      name:`${'color' + item.name}`, label:item.label, changeProp: 1, type: 'color',
    })
  })
  const traitValData = chartData.map((item) => {
    return ({
      name:`${'data' + item.name}`, label:item.label, changeProp: 1, type: 'number'
    })
  })
  dc.addType(piechartType, {
    model: defaultModel.extend({
      defaults: {
        ...defaultModel.prototype.defaults,
        strData: JSON.stringify(chartData),// to pass to the javascript function, HAS to be a string to be interpolated correctly per GrapesJS docs
        'custom-name': c.labelBurger,
        draggable: true,
        droppable: true,
        copyable: true,
        removable: true,
        resizable: true,
        ...colorDataObj,
        ...sectionDataObj,
        traits: [
          ...traitColorData,
          ...traitValData
        ],
        script: function () {
          var ctx = document.getElementById("newPieChart").getContext("2d");
          var chartData = JSON.parse('{[ strData ]}');
          console.log("chartData? ", chartData);
          var newPieChart = new Chart(ctx, {
          type: 'pie',
          data: {
              labels: chartData.map(item => item.label),
              datasets: [{
                  backgroundColor: chartData.map(item => item.color),
                  data: chartData.map(item => item.data)
              }]
              }
          });

        },
      },
    }, {
      isComponent(el) {
        if(el.getAttribute &&
          el.getAttribute('data-gjs-type') == piechartType) {
          return {type: piechartType};
        }
      },
    }),
    view: defaultType.view.extend({
      init() {
        console.log("inside view. model? ", this.model)
      }
    }),
  });

  
}

