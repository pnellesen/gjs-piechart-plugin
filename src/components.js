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
  const piepieceDataObj = {}
  chartData.map(item => {
    colorDataObj['color' + item.name]= item.color;
    sectionDataObj['data' + item.name] = item.data;
    piepieceDataObj['piepiece' + item.name] = {label: item.name, color: item.color, val: item.data};
  });

  const traitColorData = chartData.map((item) => {
    return ({name:`${'color' + item.name}`, label:item.label, changeProp: 1, type: 'color'})
  })
  const traitValData = chartData.map((item) => {
    return ({name:`${'data' + item.name}`, label:item.label, changeProp: 1, type: 'number'})
  })

  const traitPiepieceData = chartData.map((item) => {
    return ({name:`${'piepiece' + item.name}`, label:item.label, changeProp: 1, type: 'piepiece', data: {label: item.label, color: item.color, colorName: 'color' + item.name, val: item.data, valName: 'data' + item.name}})
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
        //...piepieceDataObj,
        traits: [
          //{type: 'piepiece', label: 'Pie Piece', data: {label: 'M', color: '#cccccc', val: '12'}},
          ...traitPiepieceData,
          //...traitColorData,// deconstruct color data
          //...traitValData, //deconstruct value data
        ],
        // end trait/settings setup

        // set up variables for javascript function, per GrapesJS docs
        strColorData: Object.keys(colorDataObj).map(item => colorDataObj[item]),
        strValData: Object.keys(sectionDataObj).map(item => sectionDataObj[item]),
        strLabelData: Object.keys(chartData).map(item => chartData[item].label),
        //strPiepieceData: Object.keys(piepieceDataObj).map(item => item),
        script: function () {
          var chartEl = this;
          var ctx = chartEl.getContext("2d");
          var strColorData = '{[ strColorData ]}'.split(",");
          var strValData = '{[ strValData ]}'.split(",")
          var strLabelData = '{[ strLabelData ]}'.split(",")
          var strPiePieceData = '{[ strPiepieceData ]}'.split(",")
          console.log("strPiePieceData: ", strPiePieceData)
          if (!chartEl.newPieChart) {
            //console.log("Initialize piechart. chartEl?: ", chartEl)
            var newPieChart = new Chart(ctx, {
              responsive: true,
              maintainAspectRatio: true,
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
            //console.log("We have pieChart: do update")
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
        //var colorChangeStr = Object.keys(colorDataObj).map(item => 'change:' + item).join(" ");
        //var valChangeStr = Object.keys(sectionDataObj).map(item => 'change:' + item).join(" ");

        //this.listenTo(this.model, colorChangeStr, function() {return this.updateChart('color')});
        //this.listenTo(this.model, valChangeStr, function() {return this.updateChart('data')});

      },
      updateChart(changeType) {
        console.log("updateChart: ", changeType)
        if (changeType === 'color') {
          var newColorData = traitColorData.map(item => this.model.attributes[item.name])
          this.model.attributes['strColorData'] = newColorData;
        } else if (changeType === 'data') {
          var newValData = traitValData.map(item => this.model.attributes[item.name])
          this.model.attributes['strValData'] = newValData;
        }
        this.updateScript();
      }
    }),
  });
 
  // Start new trait definition
  editor.TraitManager.addType('piepiece', {
    events:{
      //'keyup': 'onChange',  // trigger parent onChange method on keyup
    },
    inputHtml: `
        <div><span>Label: </span><span><input type="text" class="piePieceLabel" value=""></span></div>
        <div><span>Color: </span><span><input type="text" class="piePieceColorVal" value=""><input type="color" class="piePieceColorPicker" value=""></span></div>
        <div><span>Value: </span><span><input type="number" class="piePieceNumber" value=""></span></div>
    `,
    /**
    * Returns the input element
    * @return {HTMLElement}
    */
    getInputEl: function() {
      console.log("pie piece - this? ", this);
      if (!this.inputEl) {
        var input = document.createElement('div');
        var thisModel = this.model;
        var thisTarget = this.target;
        input.innerHTML = this.inputHtml,
        this.inputEl = input;
        this.pickerEl = input.querySelector(".piePieceColorPicker");
        this.pickerEl.id = "ppcp" + this.cid;
        this.labelEl = input.querySelector(".piePieceLabel")
        this.labelEl.id = "pplbl" + this.cid;
        this.valEl = input.querySelector(".piePieceNumber")
        this.valEl.id = "ppn" + this.cid
        this.pickerEl.value = thisModel.attributes.data.color
        this.labelEl.value = thisModel.attributes.data.label
        this.valEl.value = thisModel.attributes.data.val
        this.pickerEl.onchange = function() {
            colorChange(this.value)
        }
        this.valEl.onchange = function() {
          valueChange(this.value)
        }
        var currentData = thisModel.attributes.data;
        function colorChange(newColor) {
          var newData = {...currentData, color: newColor}
          thisModel.set('value', newData);
        }
        function valueChange(newVal) {
          var newData = {...currentData, val: newVal}
          thisModel.set('value', newData);
          thisTarget.attributes[thisModel.attributes.data.valName] = newVal

          //thisTarget.setAttributes({ id: thisModel.attributes.data.valName, 'data-key': newVal });

          console.log("valueChange - target view? ", thisTarget.view.updateChart('data'))
          console.log("valueChange - strValData? ", thisTarget.attributes[thisModel.attributes.data.valName])
        }
      }
      return this.inputEl;
    },

    /**
     * Triggered when the value of the model is changed
     */
    onValueChange: function () {
      //this.target.set('content', this.model.get('value'));
      console.log("pie piece data changed: ", this.model.get('value'), " - target? ", this.target)
    }
  });
  // end new trait def

}

