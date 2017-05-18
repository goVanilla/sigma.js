/**
 * Sigma.js Camera Class
 * ======================
 *
 * Class designed to store camera information & used to update it.
 */
import {EventEmitter} from 'events';

import * as easings from './easings';
import {assign} from './utils';

/**
 * Defaults.
 */
const ANIMATE_DEFAULTS = {
  duration: 150
};

/**
 * Camera class
 *
 * @constructor
 */
export default class Camera extends EventEmitter {
  constructor() {
    super();

    // Properties
    this.x = 0;
    this.y = 0;
    this.angle = 0;
    this.ratio = 1;

    // State
    this.nextFrame = null;
  }

  /**
   * Method used to retrieve the camera's current state.
   *
   * @return {object}
   */
  getState() {
    return {
      x: this.x,
      y: this.y,
      angle: this.angle,
      ratio: this.ratio
    };
  }

  /**
   * Method used to check whether the camera is currently being animated.
   *
   * @return {boolean}
   */
  isAnimated() {
    return !!this.nextFrame;
  }

  /**
   * Method used to set the camera's state.
   *
   * @param  {object} state - New state.
   * @return {Camera}
   */
  setState(state) {

    // TODO: validations
    // TODO: update by function

    if ('x' in state)
      this.x = state.x;

    if ('y' in state)
      this.y = state.y;

    if ('angle' in state)
      this.angle = state.angle;

    if ('ratio' in state)
      this.ratio = state.ratio;

    // Emitting
    this.emit('updated', this.getState());

    return this;
  }

  /**
   * Method used to animate the camera.
   *
   * @param  {object}   state      - State to reach eventually.
   * @param  {object}   options    - Options:
   * @param  {number}     duration - Duration of the animation.
   * @param  {function} callback   - Callback
   * @return {function}            - Return a function to cancel the animation.
   */
  animate(state, options, callback) {

    // TODO: validation

    options = assign({}, ANIMATE_DEFAULTS, options);

    // Canceling previous animation if needed
    if (this.nextFrame)
      cancelAnimationFrame(this.nextFrame);

    // State
    const start = Date.now(),
          initialState = this.getState();

    // Function performing the animation
    const fn = () => {
      const t = (Date.now() - start) / options.duration;

      // The animation is over:
      if (t >= 1) {
        this.nextFrame = null;
        this.setState(state);

        return;
      }

      const coefficient = easings.quadraticInOut(t);

      const newState = {};

      if ('x' in state)
        newState.x = initialState.x + (state.x - initialState.x) * coefficient;
      if ('y' in state)
        newState.y = initialState.y + (state.y - initialState.y) * coefficient;
      if ('angle' in state)
        newState.angle = initialState.angle + (state.angle - initialState.angle) * coefficient;
      if ('ratio' in state)
        newState.ratio = initialState.ratio + (state.ratio - initialState.ratio) * coefficient;

      this.setState(newState);

      this.nextFrame = requestAnimationFrame(fn);
    };

    this.nextFrame = requestAnimationFrame(fn);
  }

  /**
   * Shortcut method used to pan the camera.
   *
   * @param  {number}   x          - Delta x.
   * @param  {number}   y          - Delta y.
   * @param  {object}   options    - Options:
   * @param  {number}     duration - Duration of the animation.
   * @param  {function} callback   - Callback
   * @return {function}            - Return a function to cancel the animation.
   */
  pan(x, y, options, callback) {
    const targetX = this.x - x,
          targetY = this.y - y;

    return this.animate({x: targetX, y: targetY}, options, callback);
  }

  /**
   * Shortcut method used to zoom the camera.
   *
   * @param  {number}   factor     - Factor.
   * @param  {object}   options    - Options:
   * @param  {number}     duration - Duration of the animation.
   * @param  {function} callback   - Callback
   * @return {function}            - Return a function to cancel the animation.
   */
  zoom(factor, options, callback) {
    factor = factor || 1.5;

    const targetRatio = this.ratio / factor;

    return this.animate({ratio: targetRatio}, options, callback);
  }
}

// TODO: unzoom, reset