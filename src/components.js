export default (editor, opt = {}) => {
  const c = opt;
  const dc = editor.DomComponents;
  const defaultType = dc.getType('default');
  const defaultModel = defaultType.model;
  const piechartType = 'piechart';

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
        script: function () {
          var ctx = document.getElementById("newPieChart").getContext("2d");
          console.log("ctx: ", ctx);
          var newPieChart = new Chart(ctx, {
          type: 'pie',
          data: {
              labels: ["M", "T", "W", "T", "F", "S", "S"],
              datasets: [{
                  backgroundColor: [
                  "#f56954",
                  "#00a65a",
                  "#f39c12",
                  "#00c0ef",
                  "#3c8dbc",
                  "#ca195a",
                  "#d2d6de"
                  ],
                  data: [12, 19, 3, 17, 28, 24, 7]
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
    view: defaultType.view,
  });

  console.log("componentsjs loaded: ", dc)
}
