/*
* Wiz Library - Alpha
* Felix Liu
* CSC309
*/
"use strict";
const Wiz = (function() {

    function Wiz(container, options) {
        options = options || {};
        this.container = container;
        this.stepsDisplay = null;
        this.steps = [];
        this.state = {
            numSteps: 0,
            currentStep: 0
        },
            this.layout = {};
        this.stepsConfig = {};
        this.stepsDisplayConfig = {};

        this._initContainer(container);
        this._initLayout(options.layout);
        this._initStepsDisplay(options.stepsDisplay);
        this._initStepsConfig(options.stepsConfig);
    }

    Wiz.prototype = {
        addStep: function (options) {
            // Create step background div
            const stepContainer = this._createStepContainer();
            const newStep = new Step(
                stepContainer,
                options,
                this.state.numSteps,
                this.onStepNext,
                this.onStepBack
            );
            this.steps.push(newStep);
            this.state.numSteps += 1;
        },

        insertStep: function (step, position) {
            // TODO: Complete
        },

        getStep: function (id) {
            if (id === undefined) {
                if (this.state.numSteps > 0) {
                    return this.steps[this.state.numSteps - 1]
                } else {
                    return null;
                }
            }
            try {
                return this.steps[id];
            } catch (e) {
                throw new Error(`Wiz Step Error: Provided step number '${id + 1}' invalid.`);
            }
        },

        /*hasFinalStep: function () {
            return this.steps.filter(step => step.isFinal === true).length > 0;
        },*/

        _initContainer: function (container) {
            if (container) {
                if (typeof container === 'string') {
                    this.container = document.querySelector(container);
                } else if (typeof container === 'HTMLElement' && container.tagName === 'DIV') {
                    this.container = container;
                } else {
                    throw new Error("Wiz Container Error: Container node or ID provided is invalid or not a DIV.");
                }
                this.container.classList.add('wiz-step__container');
            }
        },

        _createStepContainer: function () {
            const stepContainer = document.createElement('DIV');
            stepContainer.classList.add('step__container');
            switch (this.stepsDisplayConfig.position) {
                case 'bottom':
                case 'right':
                    this.container.insertBefore(stepContainer, this.stepsDisplay);
                    break;
                case 'top':
                case 'left':
                    this.container.appendChild(stepContainer);
                    break;
                default:
                    throw new Error("Wiz Display Error: Invalid position.")

            }
            this.container.appendChild(stepContainer);
            return stepContainer;
        },

        _initLayout: function (layout) {
            layout = layout || {};
            layout.stepContent = layout.stepContent || 0;
            layout.stepsDisplay = layout.stepsDisplay || 0;
            if (layout.stepContent === 0 && 0 < layout.stepsDisplay && layout.stepsDisplay < 1) {
                layout.stepContent = 1 - layout.stepsDisplay;
            } else if (0 < layout.stepContent && layout.stepContent < 1 && layout.stepsDisplay === 0) {
                layout.stepsDisplay = 1 - layout.stepContent;
            } else {
                console.error('Wiz Option Error: Invalid Layout (layout fields must add to 1).');
                // Set defaults;
                layout.stepContent = 0.8;
                layout.stepsDisplay = 0.2;
            }
            this.layout = layout;
        },

        _initStepsDisplay: function (config) {
            config = config || {hidden: true, type: 'stepper', position: 'bottom'};
            config.type = config.type || 'stepper';
            config.position = config.position || 'bottom';

            if (config.type !== 'stepper' || config.type !== 'tabs') {
                console.error('Wiz Option Error: Invalid display (type).');
                this.stepsDisplayConfig = {
                    hidden: true,
                    type: null,
                    position: null,
                }
                return;
            }
            this._initDisplayContainer(config);
        },

        _initDisplayContainer: function (config) {
            this.stepsDisplay = document.createElement('DIV');
            if (config.hidden) {
                this.stepsDisplay.setAttribute('style', 'display:none');
            }
            switch (config.position) {
                case 'top':
                // Fallthrough
                case 'bottom':
                    this.stepsDisplay.setAttribute('style',
                        `height:${this.layout.stepsDisplay}%`);
                    break;
                case 'left':
                    this.stepsDisplay.setAttribute('style',
                        `float:left;width:${this.layout.stepsDisplay}%`);
                    break;
                case 'right':
                    this.stepsDisplay.setAttribute('style',
                        `float:right;width:${this.layout.stepsDisplay}%`);
                    break;
                default:
                    console.error('Wiz Option Error: Invalid display (position).');
                    this.stepsDisplayConfig = {
                        hidden: true,
                        type: null,
                        position: null,
                    }
                    return;
            }
            this.stepsDisplayConfig = config;
        },

        _initStepsConfig: function (config) {
            config = config || {};
            if (config.isLinear === undefined) {
                config.isLinear = true;
            }
            if (config.hideNavButtons === undefined) {
                config.hideNavButtons = false;
            }
            if (config.preventBack === undefined) {
                config.preventBack = false;
            }
            this.stepsConfig = config;
        },

        onStepNext: function (config) {
            // TODO: Complete
        },

        onStepBack: function (config) {
            // TODO: Complete
        }
    }

    function Step(options, id, container, handleNextStep, handleBackStep) {
        this.id = id;
        this.container = container;
        const {
            header = null,
            isHidden = false,
            isOptional = false,
            template = null,
            hideNavButtons = false,
            preventBack = false,
            onStepNext,
            onStepBack,
            onStepNextPrevented,
            onStepBackPrevented
        } = options;
        this.header = header;
        this.isHidden = isHidden;
        this.isOptional = isOptional;
        this.template = template;
        this.hideNavButtons = hideNavButtons;
        this.preventBack = preventBack;
        this.handleNextStep = handleNextStep;
        this.handleBackStep = handleBackStep;
        this.elements = {'container': container}

        this._initEventHandlers({onStepNext, onStepBack, onStepNextPrevented, onStepBackPrevented});
        this._initTemplateOptions(template);
    }

    Step.prototype = {

        addElement: function (element, options) {
        },

        on: function (event, handler) {
            if (!handler) {
                handler = (event) => true;
            }
            switch (event) {
                case 'onStepNext':
                    this.onStepNext = (event) => {
                        if (handler(event)) {
                            this.handleNextStep();
                        } else {
                            this.onStepNextPrevented(event);
                        }
                    }
                    break;
                case 'onStepBack':
                    this.onStepBack = (event) => {
                        if (handler(event)) {
                            this.handleBackStep();
                        } else {
                            this.onStepBackPrevented(event);
                        }
                    }
                    break;
                case 'onStepNextPrevented':
                    this.onStepNextPrevented = (event) => {
                        handler(event);
                    }
                    break;
                case 'onStepBackPrevented':
                    this.onStepBackPrevented = (event) => {
                        handler(event);
                    }
                    break;
                default:
                    throw new Error("Wiz Event Error: Event does not exist.");
            }
        },

        _initEventHandlers: function (userHandlers) {
            this.on('onStepNext', userHandlers.onStepNext);
            this.on('onStepBack', userHandlers.onStepBack);
            this.on('onStepNextPrevented', userHandlers.onStepNextPrevented);
            this.on('onStepBackPrevented', userHandlers.onStepBackPrevented);
        },

        _initTemplateOptions: function (template) {
            this.template = template || null;
            switch (template) {
                case 'form':
                    this.hideNavButtons = false;
                    break;
                case 'walkthrough':
                    this.hideNavButtons = false;
                    this.preventBack = true;
                    break;
                case 'slideshow':
                    this.hideNavButtons = true;
                    break;
                default:
                    this.template = null;
                    console.error('Wiz Option Error: Invalid Template.');
                    break;
            }
        },

        setStyle: function (element, className) {
            try {
                this.elements[element].classList.add(className);
            } catch {
                console.error('Wiz Style Error: Invalid style or element provided.');
            }
        },

        getContainerWidth: function () {
            return this.container.offsetWidth;
        },

        getContainerHeight: function () {
            return this.container.offsetHeight;
        }
    }

    function StepInput(options) {

    }

    StepInput.prototype = StepElement;

    function StepButton(options) {

    }

    StepButton.Prototype = StepElement;

    function StepElement(element, options) {

    }
    return Wiz;
})();




