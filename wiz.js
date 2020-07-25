/*
* Wiz Library - Alpha
* Felix Liu
* CSC309
*/
"use strict";
const Wiz = (function () {

    function Wiz(container, options) {
        options = options || {};
        this.container = container || null;
        this.stepsDisplay = null;
        this._steps = [];
        this.state = {
            numSteps: 0,
            currentStep: 0
        };
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
            if (this.getStep(options.id)) {
                const newStep = new Step(
                    this._createStepContainer(),
                    options,
                    this.state.numSteps,
                    this.onStepNext,
                    this.onStepBack
                );
                this._createNavButtons();
                this._steps.push(newStep);
                this.state.numSteps += 1;
            } else {
                throw new Error(`Wiz Step Error: Error creating step, step id ${options.id} already exists`)
            }
            return this;
        },

        insertStep: function (step, position) {
            // TODO: Complete
        },

        getStep: function (id) {
            if (id === undefined) {
                if (this.state.numSteps > 0) {
                    return this._steps[this.state.numSteps - 1]
                }
            } else if (id in this._steps) {
                return this._steps[id];
            }
            return null;
        },

        getSteps: function () {
            return this._steps;
        },

        /*hasFinalStep: function () {
            return this.steps.filter(step => step.isFinal === true).length > 0;
        },*/

        _initContainer: function (container) {
            if (typeof container === 'string') {
                this.container = document.querySelector(container);
            } else if (container instanceof Element && container.nodeName === 'DIV') {
                this.container = container;
            } else {
                throw new Error("Wiz Container Error: Container node or ID provided is invalid or not a DIV.");
            }
            this.container.classList.add('wiz');
        },

        _createStepContainer: function () {
            const stepContainer = document.createElement('DIV');
            stepContainer.classList.add('wiz-step');
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

        _createNavButtons: function () {
            return true;
        },

        _initLayout: function (layout) {
            layout = layout || {};
            layout.stepsContent = +layout.stepsContent || 0;
            layout.stepsDisplay = +layout.stepsDisplay || 0;
            layout.stepsNav = +layout.stepsNav || 0;
            if (layout.stepsContent === 0 && 0 < layout.stepsDisplay && layout.stepsDisplay < 1) {
                layout.stepsContent = 1 - layout.stepsDisplay;
            } else if (0 < layout.stepsContent && layout.stepsContent < 1 && layout.stepsDisplay === 0) {
                layout.stepsDisplay = 1 - layout.stepsContent;
            } else {
                console.error('Wiz Option Error: Invalid Layout (layout fields must add to 1).');
                // Set defaults;
                layout.stepContent = 0.8;
                layout.stepsDisplay = 0.2;
            }
            this.layout = layout;
        },

        _initStepsDisplay: function (config) {
            config = config || {isHidden: true, type: 'stepper', position: 'bottom'};
            config.type = config.type || 'stepper';
            config.position = config.position || 'bottom';

            if (config.type !== 'stepper' || config.type !== 'tabs') {
                console.error('Wiz Option Error: Invalid display (type).');
                this.stepsDisplayConfig = {
                    isHidden: true,
                    type: null,
                    position: null,
                }
                return;
            }
            this._initDisplayContainer(config);
        },

        _initDisplayContainer: function (config) {
            this.stepsDisplay = document.createElement('DIV');
            this.stepsDisplay.classList.add('wiz-display')
            if (config.isHidden) {
                this.stepsDisplay.classList.add('hidden');
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
                        isHidden: true,
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
        this.handleNextStep = handleNextStep;
        this.handleBackStep = handleBackStep;
        this._elements = {};

        this._initOptions(options);
        this._initContainer(container);
        this._initEventHandlers();
    }

    Step.prototype = {

        addElement: function (element, options) {
            let newWizElement = null;
            if (options.name === undefined) {
                throw new Error('Wiz Element Error: Error adding element, missing name.');
            }
            if (options.name in this.getElements()) {
                throw new Error(`Wiz Element Error: Error adding element, name ${options.name} already exists`)
            }

            // Use predefined Wiz elements
            if (typeof element === 'string') {
                switch (element) {
                    case 'WizSwitch':
                        newWizElement = new WizSwitch(this, options);
                        break;
                    default:
                        throw new Error('Wiz Element Error: Error adding element, predefined element does not exist.')
                }
            } else if (element instanceof Element) {
                newWizElement = new WizElement(element, this, options);
            } else {
                throw new Error('Wiz Element Error: Error adding element, element provided is invalid.')
            }
            this.getElement('container').appendChild(newWizElement.getComponent());
            this._elements[newWizElement.name] = newWizElement;
        },

        on: function (event, handler) {
            if (!handler) {
                handler = () => true;
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
            return this;
        },

        _initContainer: function (container) {
            this.addElement(container, {
                name: 'container',
                noSize: true
            })
            // Set container css grid properties
            const containerElem = this.getElement('container');
            containerElem.style.gridTemplateColumns = 'repeat(this.numColumns, 1fr)';
            containerElem.style.gridRowGap = this.rowGap;
            containerElem.style.gridColumnGap = this.columnGap;
        },

        _initOptions: function (options) {
            const {
                header = null,
                isHidden = false,
                isOptional = false,
                template = null,
                numColumns = 12,
                rowGap = '10px',
                columnGap = '10px',
                hideNavButtons = false,
                preventBack = false,
                onStepNext = null,
                onStepBack = null,
                onStepNextPrevented = null,
                onStepBackPrevented = null
            } = options;
            if (numColumns < 0) {
                console.error('Wiz Step Error: Number of columns must be a positive integer.')
                this.numColumns = 12;
            } else {
                this.numColumns = numColumns;
            }
            this.header = header;
            this.isHidden = isHidden;
            this.isOptional = isOptional;
            this.template = template;
            this.hideNavButtons = hideNavButtons;
            this.preventBack = preventBack;
            this.onStepNext = onStepNext;
            this.onStepBack = onStepBack;
            this.onStepNextPrevented = onStepNextPrevented;
            this.onStepBackPrevented = onStepBackPrevented;
            this.rowGap = rowGap;
            this.columnGap = columnGap;
            if (this.template) {
                this._initTemplateOptions(options.template);
            }
        },

        _initEventHandlers: function () {
            this.on('onStepNextPrevented', this.onStepNextPrevented);
            this.on('onStepBackPrevented', this.onStepBackPrevented);
            this.on('onStepNext', this.onStepNext);
            this.on('onStepBack', this.onStepBack);
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

        getElement: function (name) {
            if (name in this._elements) {
                return this._elements[name];
            }
            return null;
        },

        getElements: function () {
            return this._elements;
        },

        setClass: function (elementName, className) {
            const element = this.getElement(elementName);
            if (element) {
                element.setClass(className);
            } else {
                console.error('Wiz Style Error: Error setting css class, element not found.');
            }
            return this;
        },

        setStyle: function (elementName, style) {
            const element = this.getElement(elementName);
            if (element) {
                element.setStyle(style);
            } else {
                console.error('Wiz Style Error: Error setting css style, element not found.');
            }
            return this;
        },
    }

    function WizSwitch(step, options) {
        if (!options.onChange) {
            options.onChange = () => true;
        }
        this.onChange = options.onChange;
        const element = document.createElement('INPUT')
        element.setAttribute('type', 'checkbox');
        element.addEventListener('click', (event) => this.onChange(event, this));
        WizElement.call(this, element, step, options);
    }

    WizSwitch.prototype = WizElement;

    function WizElement(component, step, options) {
        this._step = step;
        this._initOptions(options);
        this._initComponent(component);
    }

    WizElement.prototype = {
        _initOptions: function (options) {
            options = options || {};
            const {
                name,
                isHidden = false,
                className = null,
                width = '1',
                height = '100px',
                noSize = false
            } = options;
            if (name in this._step.getElements()) {
                throw new Error(`Wiz Element Error: Element with name ${name} already exists.`)
            }
            if (!noSize) {
                const numColumns = this._step.numColumns;
                if (isNaN(width) || width < 0 || numColumns < width) {
                    console.error(`Wiz Element Error: Width must be an integer between 1 and ${numColumns}`);
                    this.width = 1;
                } else {
                    this.width = parseInt(width);
                }
                this.height = height;
            }
            this.name = name;
            this._isHidden = isHidden;
            this.className = className;
        },

        _initComponent: function (element) {
            this._component = element;
            this.setStyle(`height:${this.height}; grid-column-end:span ${this.width}`);
            if (this.isHidden ) {
                this.hide();
            }
            if (this.className) {
                this.setClass(this.className);
            }
        },

        getComponent: function () {
            return this._component;
        },

        isHidden: function () {
            return this._isHidden;
        },

        hide: function () {
            this._isHidden = true;
            this._component.style.display = 'none';
            return this;
        },

        show: function () {
            this._isHidden = false;
            this._component.style.display = null;
            return this;
        },

        setStyle: function (style) {
            this._component.setAttribute('style', style);
            return this;
        },

        setClass: function (className) {
            this._component.classList.add(className);
            return this;
        },

        getStep: function() {
            return this._step;
        }
    }

    return Wiz;
})();