import { state, loadSaved } from './state.js';
import { bindEvents } from './events.js';

loadSaved(state);
bindEvents(state);
