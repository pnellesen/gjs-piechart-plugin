export default (editor, opt = {}) => {
  const c = opt;
  const dc = editor.DomComponents;
  const defaultType = dc.getType('default');
  const defaultModel = defaultType.model;
  const piechartType = 'piechart';
  const chartData = c.optChartData || [{"name":"defaultName","label":"No data provided","value":0}];

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
          ...traitValData //deconstruct value data
        ],
        // end trait/settings setup
        strColorData: JSON.stringify(traitColorData),
        strData: JSON.stringify(chartData),// to pass to the javascript function, HAS to be a string to be interpolated correctly per GrapesJS docs
        script: function () {
          var ctx = document.getElementById("newPieChart").getContext("2d");
          var chartData = JSON.parse('{[ strData ]}');
          var strColorData = JSON.parse('{[ strColorData ]}');

          // THIS ALSO WORKS IF WE CREATE STRINGS OF EACH INDIVIDUAL ELEMENT (i.e. string1='{[ colornameM ]}').
          // HAVE NOT BEEN ABLE TO DYNAMICALLY GENERATE FROM strColorData array.
          var myString = "{[ colornameM ]}"
          var strColorNames = [myString,'{[ colornameT ]}','{[ colornameW ]}','{[ colornameTh ]}','{[ colornameF ]}','{[ colornameSa ]}','{[ colornameSu ]}']

          console.log("traitColorData? ", strColorData);
          var newPieChart = new Chart(ctx, {
          type: 'pie',
          data: {
              labels: chartData.map(item => item.label),
              datasets: [{
                  //backgroundColor: chartData.map(item => item.color),
                  backgroundColor: strColorNames,
                  data: chartData.map(item => item.data)
              }]
              }
          });
          function updatePieChart() {
            console.log("update pie chart")
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
        //this.listenTo(this.model, 'change:startfrom change:endText', this.updateScript);
        this.listenTo(this.model, colorChangeStr, this.updateScript);
        console.log("inside view. model? ", this.model);
        console.log("inside view - colorDataObj string? ", colorChangeStr);
      }
    }),
  });


}

