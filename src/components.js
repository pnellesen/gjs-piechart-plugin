export default (editor, opt = {}) => {
  const c = opt;
  const dc = editor.DomComponents;
  const defaultType = dc.getType('default');
  const defaultModel = defaultType.model;
  const piechartType = 'piechart';
  const chartData = c.optChartData || [{"name":"defaultName","label":"No data","data":1,"color":"#ccc"}];
  const chartDataUrl = c.optChartDataUrl || null;
  const defaultChartJSUrl = c.defaultChartJSUrl || '';
  //Setup the attributes and data for traits
  const colorDataObj = {}
  const sectionDataObj = {}
  chartData.map(item => {
    colorDataObj['color' + item.name]= item.color;
    sectionDataObj['data' + item.name] = item.data;
  });



  /* Keep these if we want to go back and use GrapesJS built-in color/number pickers

  const traitColorData = chartData.map((item) => {
    return ({name:`${'color' + item.name}`, label:item.label, changeProp: 1, type: 'color'})
  })
  const traitValData = chartData.map((item) => {
    return ({name:`${'data' + item.name}`, label:item.label, changeProp: 1, type: 'number'})
  })
  */

  const traitPiepieceData = chartData.map((item) => {
    return ({name:`${'piepiece' + item.name}`, label:item.label, changeProp: 0, type: 'piepiece', data: {label: item.label, color: item.color, colorName: 'color' + item.name, val: item.data, valName: 'data' + item.name}, value:item.color})
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
          {name: 'pichartData', label:"All Data", type:'text', value: JSON.stringify(chartData)},
          ...traitPiepieceData,
          //...traitColorData,// deconstruct color data, insert picker into trait manager
          //...traitValData, //deconstruct value data, insert picker into trait manager
        ],
        // end trait/settings setup

        // set up variables for javascript function, per GrapesJS docs
        strChartJSUrl: defaultChartJSUrl,
        strColorData: Object.keys(colorDataObj).map(item => colorDataObj[item]).join("-"),
        strValData: Object.keys(sectionDataObj).map(item => sectionDataObj[item]),
        strLabelData: Object.keys(chartData).map(item => chartData[item].label),

        script: function () {
          var chartEl = this;
          var ctx = chartEl.getContext("2d");
          var strColorData = '{[ strColorData ]}'.split("-");
          var strValData = '{[ strValData ]}'.split(",")
          var strLabelData = '{[ strLabelData ]}'.split(",")

          if (typeof Chart == 'undefined') {
            /**
             *  If the ChartJS file hasn't already been loaded via the canvas.scripts object in index.html,
             *  add it to the canvas asynchronously using default url defined in index.js file,
             *  then initialize the pieChart
             */
              loadChartScript('{[ strChartJSUrl ]}', initPieChart);
          } else if (!chartEl.newPieChart) {
            /**
             * If ChartJS has been loaded, but we haven't yet created the Chart object,
             * initialize it with default parameters
             */
            initPieChart()
          } else {
            // We have a Chart object, so we just need to update it
            updatePieChart()
          }

          function loadChartScript(url, callback) {
            console.log("loading chart script from default url: " + url)
            var script = document.createElement('script');
            script.src = url;
            script.type="text/javascript"
            script.onreadystatechange = callback;
            script.onload = callback;
            document.body.appendChild(script);
          }

          function initPieChart() {
            console.log("Initializing pie chart")
            chartEl.newPieChart = new Chart(ctx, {
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
          }
          function updatePieChart() {
            console.log("Update piechart")
            chartEl.newPieChart.data.datasets = [{
              backgroundColor: strColorData,
              data: strValData
            }];
            chartEl.newPieChart.update({duration: 300});
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
          var newColorData = chartData.map(item => this.model.attributes['color' + item.name]).join("-")
          this.model.attributes['strColorData'] = newColorData;
        } else if (changeType === 'data') {
          var newValData = chartData.map(item => this.model.attributes['data' + item.name])
          this.model.attributes['strValData'] = newValData;
        }
        this.updateScript();
      }
    }),
  });

  // Start new piepiece trait here. May want to put into a separate file

  editor.TraitManager.addType('piepiece', {
    events:{
      //'keyup': 'onChange',  // trigger parent onChange method on keyup
    },
   inputHtml: `
        <div style="margin:10px;margin-bottom:0">Label: <input type="text" class="piePieceLabel" value="" style="border:1px solid #9e9e9e;"></div>
        <div style="margin:10px"><div>Color: </div><div style="white-space:nowrap"><input type="text" class="piePieceColorVal" style="border:1px solid #9e9e9e; width:70%"><div class="piePieceColorPicker" style="width: 20px;height: 20px;top: 6px;left: 5px;cursor: pointer;position: relative;display: inline-block;" data-colorp-c></div></div></div>
        <div style="margin:10px;"><div>Value: </div><div><input type="number" class="piePieceNumber" value="" style="border:1px solid #9e9e9e"></div></div>
    `,
    /**
    * Returns the input element
    * @return {HTMLElement}
    */
    getInputEl: function() {
      if (!this.inputEl) {
        var input = document.createElement('div');
        var thisModel = this.model;
        var thisTarget = this.target;

        // Setup our jQuery spectrum colorpicker using the already existing implementation in grapesJs
        var that = this
        var thisColorPicker = function() {
          return editor.TraitManager.getType('color').prototype.getInputEl.apply(that, arguments);
        }

        input.innerHTML = this.inputHtml,
        this.inputEl = input;
        var pickerEl = input.querySelector(".piePieceColorPicker");
        pickerEl.id = "ppcp" + this.cid;

        pickerEl.appendChild(thisColorPicker());// add the jQuery spectrum color picker to our trait editor

        var pickerTextField = input.querySelector(".piePieceColorVal")
        pickerTextField.id = "ptv" + this.cid
        var labelEl = input.querySelector(".piePieceLabel")
        labelEl.id = "pplbl" + this.cid;
        var valEl = input.querySelector(".piePieceNumber")
        valEl.id = "ppn" + this.cid
        pickerEl.value = thisTarget.attributes[thisModel.attributes.data.colorName]
        pickerTextField.value = pickerEl.value
        labelEl.value = thisModel.attributes.data.label
        valEl.value = thisTarget.attributes[thisModel.attributes.data.valName]
        pickerEl.onchange = function() {
            colorChange(thisModel.get('value'))
        }
        pickerTextField.onkeyup = function(evt) {
          if (evt.key == 'Enter') colorChange(this.value)
        }
        pickerTextField.onblur = function() {
          thisModel.set('value',this.value);
          colorChange(thisModel.get('value'))
        }
        valEl.onchange = function() {
          valueChange(this.value)
        }
        function colorChange(newColor) {
          pickerEl.value = newColor;
          pickerTextField.value = newColor;
          thisTarget.attributes[thisModel.attributes.data.colorName] = newColor
          thisTarget.view.updateChart('color')
        }
        function valueChange(newVal) {
          thisTarget.attributes[thisModel.attributes.data.valName] = newVal
          thisTarget.view.updateChart('data')
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

