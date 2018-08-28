export default (editor, config = {}) => {
  const bm = editor.BlockManager;
  // ...

  console.log("blocks.js - BlockManager - getAll before: ", bm.getAll());


 bm.add('piechart', {
  label: 'Pie Chart',
  content: '<div class="chart-container" style="position: relative;height:350px;width:500px;"><canvas data-gjs-type="piechart"></canvas></div>',
  category: 'Extra'
 })


}
