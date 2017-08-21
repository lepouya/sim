import saveGame from './data/defaultGame';
import React from 'react';
import ReactDOM from 'react-dom';
import ResourceManager from './model/ResourceManager';
import Game from './components/Game';

window.onload = event => ReactDOM.render(
  <Game resourceManager={new ResourceManager().load(saveGame)} />,
  document.getElementById('root'));