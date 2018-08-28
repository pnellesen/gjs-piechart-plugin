export default (editor, opt = {}) => {
  const c = opt;
  const dc = editor.DomComponents;
  const defaultType = dc.getType('default');
  const defaultModel = defaultType.model;
  const piechartType = 'piechart';
  const chartData = c.optChartData || [{"name":"defaultName","label":"No data","data":1,"color":"#ccc"}];

  //Setup the attributes and data for traits
  const colorDataObj = {}
  const sectionDataObj = {}
  chartData.map(item => {
    colorDataObj['color' + item.name]= item.color;
    sectionDataObj['data' + item.name] = item.data;
  });
  const traitColorData = chartData.map((item) => {
    return ({name:`${'color' + item.name}`, label:item.label, changeProp: 1, type: 'color'})
  })
  const traitValData = chartData.map((item) => {
    return ({name:`${'data' + item.name}`, label:item.label, changeProp: 1, type: 'number'})
  })
  // End trait/settings data setup
  dc.addType(piechartType, {
    model: defaultModel.extend({
      defaults: {
        ...defaultModel.prototype.defaults,
        'custom-name': c.labelBurger,
        draggable: true,
        droppable: true,
        copyable: true,
        removable: true,
        resizable: true,

        // stuff for trait/settings manager
        ...colorDataObj,
        ...sectionDataObj,

        traits: [
          ...traitColorData,// deconstruct color data
          ...traitValData, //deconstruct value data
        ],
        // end trait/settings setup

        // set up variables for javascript function, per GrapesJS docs
        strColorData: Object.keys(colorDataObj).map(item => colorDataObj[item]),
        strValData: Object.keys(sectionDataObj).map(item => sectionDataObj[item]),
        strLabelData: Object.keys(chartData).map(item => chartData[item].label),
        script: function () {
          var chartEl = this;
          var ctx = document.getElementById("newPieChart").getContext("2d");
          var strColorData = '{[ strColorData ]}'.split(",");
          var strValData = '{[ strValData ]}'.split(",")
          var strLabelData = '{[ strLabelData ]}'.split(",")

          if (!chartEl.newPieChart) {
            console.log("Initialize piechart")
            var newPieChart = new Chart(ctx, {
              type: 'pie',
              data: {
                  labels: strLabelData,
                  datasets: [{
                      backgroundColor: strColorData,
                      data: strValData
                  }]
                  }
              });
              chartEl.newPieChart = newPieChart;
          } else {
            console.log("We have pieChart: do update")
            chartEl.newPieChart.data.datasets = [{
              backgroundColor: strColorData,
              data: strValData
            }];
            chartEl.newPieChart.update({duration: 0});
          }
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
        var colorChangeStr = Object.keys(colorDataObj).map(item => 'change:' + item).join(" ");
        var valChangeStr = Object.keys(sectionDataObj).map(item => 'change:' + item).join(" ");
        this.listenTo(this.model, colorChangeStr, function() {return this.updateChart('color')});
        this.listenTo(this.model, valChangeStr, function() {return this.updateChart('data')});
      },
      updateChart(changeType) {
        if (changeType === 'color') {
          var newColorData = traitColorData.map(item => this.model.attributes[item.name])
          this.model.attributes['strColorData'] = newColorData;
        } else {
          var newValData = traitValData.map(item => this.model.attributes[item.name])
          this.model.attributes['strValData'] = newValData;
        }
        this.updateScript();
      }
    }),
  });


}

