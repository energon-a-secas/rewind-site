import { getPlaceholderName } from './utils.js';
import { calculate } from './scoring.js';
import { initEvents } from './events.js';

document.getElementById('candidate-name').placeholder = getPlaceholderName();
initEvents();
calculate();
