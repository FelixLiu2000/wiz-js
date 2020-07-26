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
        addStep: function (options, index) {
            if (index) {
                if (index < 0 || this.state.numSteps < index) {
                    throw new Error('Wiz Step Error: Error inserting step, step index invalid.');
                }
            }

            if (options.isFinal && this.hasFinalStep()) {
                throw new Error(`Wiz Step Error: Error adding step, step with isFinal already exists`);
            }
            const stepContainer = document.createElement('DIV');
            const newStep = new Step(
                options,
                index ? index : this.state.numSteps,
                stepContainer,
                this.onStepNext.bind(this),
                this.onStepBack.bind(this)
            );
            if (index === undefined || index === this.state.numSteps) {
                this._steps.push(newStep);
            } else {
                this._steps.splice(index, 0, newStep);
                // Update steps with new ids after insertion
                this._steps.slice(index + 1, this.state.numSteps).map((step) => {step.id++;})
            }
            // Prepare first step for rendering
            if (this.state.numSteps === 0) {
                this._attachStepContainer(stepContainer);
            }
            this.state.numSteps++;
            return this;
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

        hasFinalStep: function () {
            return this._steps.filter(step => step.isFinal === true).length > 0;
        },

        onStepNext: function () {
            // Last step
            if (this.state.currentStep + 1 === this.state.numSteps) {
                this.onSubmit();
            } else {
                this._renderStep(this.state.currentStep + 1);
                this.state.currentStep++;
            }
        },

        onStepBack: function () {
            if (this.state.currentStep > 0) {
                this._renderStep(this.state.currentStep - 1);
                this.state.currentStep--;
            }
        },

        onSubmit: function () {
            // TODO: Complete
            return null;
        },

        _renderStep: function (id) {
            try {
                const currentStep = this.getStep(this.state.currentStep);
                const newStep = this.getStep(id);
                this.container.removeChild(currentStep.getElement('container').getComponent());
                this._attachStepContainer(newStep.getElement('container').getComponent());
            } catch {
                throw new Error(`Wiz Step Error: Error rendering step ${id}.`);
            }
        },

        _initContainer: function (container) {
            if (typeof container === 'string') {
                this.container = document.querySelector(`#${container}`);
                if (!this.container) {
                    throw new Error("Wiz Container Error: Container with id ${container} does not exist.");
                }
            } else if (container instanceof Element && container.nodeName === 'DIV') {
                this.container = container;
            } else {
                throw new Error("Wiz Container Error: Container node is invalid or not a DIV.");
            }
            this.container.classList.add('wiz');
        },

        _attachStepContainer: function (stepContainer) {
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
            return stepContainer;
        },

        _initLayout: function (layout) {
            layout = layout || {};
            layout.stepsContent = +layout.stepsContent || 0;
            layout.stepsDisplay = +layout.stepsDisplay || 0;
            let useDefault = false;

            if (layout.stepsContent === 0 && layout.stepsDisplay === 0) {
                useDefault = true;
            } else if (0 <= layout.stepsContent && 0 <= layout.stepsDisplay) {
                // Set optional parameters
                if (layout.stepsContent === 0) {
                    layout.stepsContent = 1.0 - layout.stepsDisplay;
                } else if (layout.stepsDisplay === 0) {
                    layout.stepsDisplay = 1.0 - layout.stepsContent;
                }
                // Ensure layout parameters add to 1
                if (layout.stepsContent + layout.stepsDisplay !== 1.0) {
                    console.error('Wiz Option Error: Layout must add to 1.');
                    useDefault = true;
                }
            } else {
                console.error('Wiz Option Error: Invalid Layout.');
                useDefault = true;
            }

            if (useDefault) {
                layout.stepsContent = 0.8;
                layout.stepsDisplay = 0.2;
            }
            this.layout = layout;
        },

        _initStepsDisplay: function (config) {
            config = config || {isHidden: true, type: 'stepper', position: 'bottom'};
            config.type = config.type || 'stepper';
            config.position = config.position || 'bottom';

            if (config.type !== 'stepper' && config.type !== 'tabs') {
                console.error('Wiz Option Error: Invalid display type.');
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
            this.container.appendChild(this.stepsDisplay);
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
        this._initNavButtons();
    }

    Step.prototype = {

        addElement: function (element, options, parent) {
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
                    case 'WizButton':
                        newWizElement = new WizButton(this, options);
                        break;
                    case 'WizText':
                        newWizElement = new WizText(this, options);
                        break;
                    default:
                        throw new Error('Wiz Element Error: Error adding element, predefined element does not exist.')
                }
            } else if (element instanceof Element) {
                newWizElement = new WizElement(element, this, options);
            } else {
                throw new Error('Wiz Element Error: Error adding element, element provided is invalid.')
            }

            // Add element as child of specified parent elements
            if (parent === undefined && newWizElement.name !== 'content' && newWizElement.name !== 'container') {
                this.getElement('content').getComponent().appendChild(newWizElement.getComponent());
            } else if (newWizElement.name !== 'container') {
                try {
                    this.getElement(parent).getComponent().appendChild(newWizElement.getComponent())
                } catch (e) {
                    if (!this.getElement(parent)) {
                        throw new Error(`Wiz Element Error: Error adding element, parent ${parent} does not exist.`);
                    }
                    throw new Error(`Wiz Element Error: Error adding element to parent ${parent}`);
                }
            }
            // Add the new element to elements object
            this._elements[newWizElement.name] = newWizElement;
            return this;
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
                    console.error('Wiz Event Error: Event ${event} is unspecified.');
            }
            return this;
        },

        _initContainer: function (container) {
            const contentContainer = document.createElement('DIV');
            container.appendChild(contentContainer);
            this.addElement(container, {
                name: 'container',
                className: 'wiz-step',
                noSize: true
            }).addElement(contentContainer, {
                name: 'content',
                className: 'wiz-content',
                noSize: true
            }, 'container');
            // Set container css grid properties
            const component = this.getElement('content').getComponent();
            component.style.gridTemplateColumns = `repeat(${this.numColumns}, 1fr)`;
            component.style.gridRowGap = this.rowGap;
            component.style.gridColumnGap = this.columnGap;
        },

        _initOptions: function (options) {
            const {
                header = null,
                isHidden = false,
                isOptional = false,
                isFinal = false,
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
            this.isFinal = isFinal;
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

        _initNavButtons: function () {
            const navContainer = document.createElement('DIV');
            this.addElement(navContainer, {
                name: 'navContainer',
                noSize: true,
                isHidden: this.hideNavButtons,
                className: 'wiz-nav'
            }, 'container').addElement('WizButton', {
                name: 'stepBack',
                noSize: true,
                isHidden: this.preventBack,
                textContent: 'BACK',
                onChange: (e) => {
                    e.preventDefault();
                    this.onStepBack(e);
                },
                className: 'wiz-button--secondary'
            }, 'navContainer').addElement('WizButton', {
                name: 'stepNext',
                noSize: true,
                isHidden: this.preventBack,
                textContent: this.isFinal ? 'FINISH' : 'NEXT',
                onChange: (e) => {
                    e.preventDefault();
                    this.onStepNext(e);
                },
                className: 'wiz-button--primary'
            }, 'navContainer');
            // TODO: Allow user to specify button text
            const stepBack = this.getElement('stepBack');
            const stepNext = this.getElement('stepNext');
            stepBack.setClass('wiz-nav__step-back');
            stepNext.setClass('wiz-nav__step-next');
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

    function WizElement(component, step, options) {
        // TODO: Add event listener method for WizElement, generalize WizSwitch & WizButton
        this._step = step;
        this._initOptions(options);
        this._initComponent(component);
    }

    WizElement.prototype = {
        _initOptions: function (options) {
            options = options || {};
            const {
                name = this._step.getElements().length,
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
                    this.width = '1';
                } else {
                    this.width = width;
                }
                this.height = height;
            }
            this.name = name;
            this._isHidden = isHidden;
            this.className = className;
            this.noSize = noSize;
        },

        _initComponent: function (element) {
            this._component = element;
            if (!this.noSize) {
                this.setStyle(`height:${this.height}; grid-column-end:span ${this.width}`);
            }
            if (this.isHidden()) {
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

        getStep: function () {
            return this._step;
        }
    }

    function WizButton(step, options) {
        if (!options.onChange) {
            options.onChange = () => true;
        }
        this.onChange = options.onChange;
        const element = document.createElement('BUTTON')
        element.addEventListener('click', (event) => this.onChange(event, this));
        element.textContent = options.textContent;
        WizElement.call(this, element, step, options);
    }

    WizButton.prototype = WizElement.prototype;

    function WizText(step, options) {
        const element = document.createElement('DIV')
        const text = document.createTextNode(options.textContent);
        element.appendChild(text);
        WizElement.call(this, element, step, options);
    }

    WizText.prototype = WizElement.prototype;

    return Wiz;
})();
