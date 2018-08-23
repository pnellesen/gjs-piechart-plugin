import grapesjs from 'grapesjs';
import loadComponents from './components';
import loadBlocks from './blocks';

export default grapesjs.plugins.add('gjs-ignite-piechart', (editor, opts = {}) => {
  const options = { ...{
    // default options
  },  ...opts };

  // Add blocks
  loadBlocks(editor, options);

  // Add components
  loadComponents(editor, options);



  // TODO Remove
  editor.on('load', () => editor.addComponents(`<div style="margin:100px; padding:25px;">Content loaded from the plugin</div>`, { at: 0 }))
});
