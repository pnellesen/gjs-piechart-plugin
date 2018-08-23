export default (editor, config = {}) => {
  const bm = editor.BlockManager;
  // ...

  console.log("blocks.js - BlockManager - getAll before: ", bm.getAll());
 

 bm.add('piechart', {
  label: 'Pie Chart',
  content: `<div class="chart" style="width:500px;height:800px;border:1px solid #000">
      <h2>Pie chart here</h2>
      <canvas data-gjs-type="piechart"  id="newPieChart" height="250" width="400"></canvas>
  </div>`,
  category: 'Extra'
 }) 

 
}
