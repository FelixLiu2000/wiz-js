/*
* Wiz Library - Alpha
* Felix Liu
* CSC309
*/
"use strict";
(function (global) {
    /** Default values used in place of user options **/
    const DEFAULTS = {
        WizButton: {
            options: {
                variant: 'primary'
            },
            variants: {
                primary: 'wiz-button--primary',
                secondary: 'wiz-button--secondary'
            },
            getComponent: (options) => {
                const element = document.createElement('BUTTON');
                element.textContent = options.textContent;
                return element;
            }
        },
        WizInput: {
            options: {
                validator: () => true,
                variant: 'primary',
                on: {
                    'input': (e, element) => {
                        try {
                            const validationResult = element.validator(e.target.value, element);
                            if (typeof validationResult === 'string') {
                                element.setError(true, validationResult);
                            } else if (validationResult === false) {
                                element.setError(true, '');
                            } else {
                                element.setError(false)
                                element.value = e.target.value;
                            }
                        } catch {
                            element.value = e.target.value;
                        }
                    }
                },
                isInput: true
            },
            variants: {
                primary: 'wiz-input--primary',
                secondary: 'wiz-input--secondary'
            },
            getComponent: (options) => {
                const element = document.createElement('INPUT');
                element.placeholder = options.textContent;
                return element;
            }
        },
        WizText: {
            options: {
                className: 'wiz-text'
            },
            getComponent: (options) => {
                options.textContent = options.textContent || '';
                let element = null;
                // Set text variant (h1-h6)
                if (options.variant && typeof options.variant === 'string' && options.variant.match(/^h[1-6]$/)) {
                    element = document.createElement(options.variant);
                } else {
                    element = document.createElement('DIV');
                }
                const text = document.createTextNode(options.textContent);
                element.appendChild(text);
                return element;
            }
        }
    }
    Object.freeze(DEFAULTS);

    /** Wiz core constructor that creates a new wizard **/
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
        this.hidden = false;

        this._initContainer.call(this, container, options);
        this._initLayout.call(this, options.layout);
        this._initStepsDisplay.call(this, options.stepsDisplay);
        this._initStepsConfig.call(this, options.stepsConfig);
    }

    Wiz.prototype = {
        addStep: function (options, index) {
            if (index) {
                if (index < 0 || this.state.numSteps < index) {
                    throw new Error('Wiz Step Error: Error inserting step, step index invalid.');
                }
            }
            const stepContainer = document.createElement('DIV');
            const newStep = new Step(
                options,
                index ? index : this.state.numSteps,
                stepContainer,
                this,
                this.onStepNext.bind(this),
                this.onStepBack.bind(this)
            );
            if (index === undefined || index === this.state.numSteps) {
                this._steps.push(newStep);
            } else {
                this._steps.splice(index, 0, newStep);
                // Update steps with new ids after insertion
                this._steps.slice(index + 1, this.state.numSteps).map((step) => {
                    step.id++;
                })
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

        isFinal: function () {
            return this.state.currentStep + 1 === this.state.numSteps;
        },

        onStepNext: function () {
            // Last step
            if (this.isFinal()) {
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
            if (this.isFinal()) {
                // TODO: Complete
                if (this.willHideOnSubmit) {
                    this.hide();
                }
                // Call on submit of final step
                this.getStep().onSubmit();
            }
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

        _initContainer: function (container, options) {
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
            this._initialDisplay = this.container.style.display;
            if (options.isHidden) {
                this.hide();
            }
            this.isHidden = options.isHidden || false;
            this.willHideOnSubmit = options.willHideOnSubmit || false;
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
            config = config || { isHidden: true, type: 'stepper', position: 'bottom' };
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
                        `height:${this.layout.stepsDisplay * 100}%`);
                    break;
                case 'left':
                    this.stepsDisplay.setAttribute('style',
                        `float:left;width:${this.layout.stepsDisplay * 100}%`);
                    break;
                case 'right':
                    this.stepsDisplay.setAttribute('style',
                        `float:right;width:${this.layout.stepsDisplay * 100}%`);
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
        },

        show: function () {
            if (this.isHidden) {
                this.container.style.display = this._initialDisplay;
            }
        },

        hide: function () {
            if (!this.isHidden) {
                this.container.style.display = 'none';
            }
        }
    }

    /** Wiz constructor that creates a new step **/
    function Step(options, id, container, wizard, handleNextStep, handleBackStep) {
        options = options || {};
        this.id = id
        this._wizard = wizard;
        this.handleNextStep = handleNextStep;
        this.handleBackStep = handleBackStep;
        this._elements = {};
        this.numElements = 0;
        this._elementErrors = {};

        this._initOptions.call(this, options);
        this._initContainer.call(this, container);
        this._initEventHandlers.call(this);
        this._initNavButtons.call(this);
        this.on.bind(this);
    }

    Step.prototype = {
        addElement: function (element, options, parent) {
            let newWizElement = null;
            if (options.name in this.getElements()) {
                throw new Error(`Wiz Element Error: Error adding element, name ${options.name} already exists`)
            }

            newWizElement = new WizElement(element, this, options);

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
            this.numElements++;
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
                template = null,
                numColumns = 12,
                rowGap = '10px',
                columnGap = '10px',
                hideNavButtons = false,
                preventBack = false,
                onStepNext = null,
                onStepBack = null,
                onStepNextPrevented = null,
                onSubmit = null
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
            this.onSubmit = onSubmit;
            this.rowGap = rowGap;
            this.columnGap = columnGap;

            if (this.template) {
                this._initTemplateOptions(options.template);
            }
        },

        _initEventHandlers: function () {
            this.on('stepNextPrevented', this.onStepNextPrevented);
            this.on('stepNext', this.onStepNext);
            this.on('stepBack', this.onStepBack);
            this.on('submit', this.onSubmit);
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
                }, 'container')
                .addElement('WizButton', {
                    name: 'stepBack',
                    noSize: true,
                    isHidden: this.preventBack,
                    textContent: 'BACK',
                    onChange: (e) => {
                        e.preventDefault();
                        this.onStepBack(e);
                    },
                    className: 'wiz-button--secondary'
                }, 'navContainer')
                .addElement('WizButton', {
                    name: 'stepNext',
                    noSize: true,
                    textContent: this.getWizard().isFinal() ? 'FINISH' : 'NEXT',
                    onChange: (e) => {
                        e.preventDefault();
                        // Refresh error highlights
                        this.refreshErrorHighlights();
                        if (this.hasError()) {
                            this.onStepNextPrevented(e);
                        } else {
                            this.onStepNext(e);
                        }
                    },
                    className: 'wiz-button--primary'
                }, 'navContainer');
            const stepBack = this.getElement('stepBack');
            const stepNext = this.getElement('stepNext');
            stepBack.addClass('wiz-nav__step-back');
            stepNext.addClass('wiz-nav__step-next');
        },

        on: function (event, handler) {
            if (!handler) {
                handler = () => true;
            }
            switch (event) {
                case 'stepNext':
                    this.onStepNext = (event) => {
                        if (handler(event, this)) {
                            this.handleNextStep();
                        } else {
                            this.onStepNextPrevented(event);
                        }
                    }
                    break;
                case 'stepBack':
                    this.onStepBack = (event) => {
                        if (handler(event, this)) {
                            this.handleBackStep();
                        }
                    }
                    break;
                case 'stepNextPrevented':
                    this.onStepNextPrevented = (event) => {
                        handler(event, this);
                    }
                    break;
                case 'submit':
                    this.onSubmit = (event) => {
                        handler(event, this);
                    }
                    break;
                default:
                    console.error('Wiz Event Error: Event ${event} is unspecified.');
                    break;
            }
            return this;
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

        refreshErrorHighlights: function () {
            this.hideErrorHighlights();
            this.showErrorHighlights();
        },

        showErrorHighlights: function () {
            const errors = this.getError();
            for (const elementName of Object.keys(errors)) {
                this.getElement(elementName).showError();
            }
        },

        hideErrorHighlights: function () {
            const errors = this.getError();
            for (const elementName of Object.keys(errors)) {
                this.getElement(elementName).hideError();
            }
        },

        getWizard: function () {
            return this._wizard;
        },

        getError: function (elementName) {
            if (elementName) {
                return this._elementErrors[elementName];
            } else {
                return this._elementErrors;
            }
        },

        addError: function (elementName) {
            this._elementErrors[elementName] = true;
            return this;
        },

        removeError: function (elementName) {
            if (this._elementErrors[elementName]) {
                delete this._elementErrors[elementName];
                this.getElement(elementName).hideError();
            }
            return this;
        },

        clearErrors: function () {
            this.hideErrorHighlights();
            this._elementErrors = {};
            return this;
        },

        hasError: function () {
            return Object.keys(this._elementErrors).length > 0;
        },

        getAllInputValues: function () {
            return this.getElements().reduce((result, currElem) => {
                if (currElem.isInput) {
                    result[currElem.name] = currElem.value;
                }
            }, {});
        }
    }

    /** Wiz element constructor that creates a new UI element **/
    function WizElement(component, step, options) {
        options = options || {};
        // Use predefined Wiz element
        if (typeof component === 'string') {
            this._initDefaults.call(this, component, options);
        } else {
            this._component = component;
        }
        this._step = step;
        this._initOptions.call(this, options);
        this._initEventHandlers.call(this, options.on);
    }

    WizElement.prototype = {
        _initDefaults: function (component, options) {
            if (!DEFAULTS[component]) {
                throw new Error('Wiz Element Error: Error adding element, predefined element does not exist.');
            }
            this._component = DEFAULTS[component].getComponent(options);
            const defaultOptions = DEFAULTS[component].options;
            // Set default options
            for (const [option, value] of Object.entries(defaultOptions)) {
                // Register default events
                if (option === 'on') {
                    // Add each event and handler pair to on event object
                    options.on = options.on || {};
                    for (const [event, handler] of Object.entries(value)) {
                        options.on[event] = handler;
                    }
                    // Set the variant
                } else if (option === 'variant') {
                    this.addClass(DEFAULTS[component].variants[value]);
                    // Set other default options that were not set by user
                } else if (!options[option]) {
                    options[option] = value;
                }
            }
        },

        _initOptions: function (options) {
            const {
                name = this._step.numElements.toString(),
                variant = null,
                isHidden = false,
                className = null,
                width = '1',
                height = '100px',
                noSize = false,
                isInput = false,
                validator = null
            } = options;
            if (name in this._step.getElements()) {
                throw new Error(`Wiz Element Error: Element with name ${name} already exists.`);
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
            this.hasError = false;
            this.isInput = isInput;

            if (!noSize) {
                this.setStyle(`height:${this.height}; grid-column-end:span ${this.width}`);
            }
            // For input fields only
            if (isInput) {
                this.value = null;
                this.validator = validator;
            }

            if (isHidden) {
                this.hide();
            }
            if (className) {
                this.addClass(className);
            }
        },

        _initEventHandlers: function (events) {
            events = events || {};
            for (const [event, handler] of Object.entries(events)) {
                if (event && handler) {
                    this.on(event, handler);
                }
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
            this._component.style.display = 'unset';
            return this;
        },

        setStyle: function (style) {
            this._component.setAttribute('style', style);
            return this;
        },

        addClass: function (className) {
            this._component.classList.add(className);
            return this;
        },

        removeClass: function (className) {
            this._component.classList.remove(className);
            return this;
        },

        getStep: function () {
            return this._step;
        },

        on: function (event, handler) {
            try {
                this._component.addEventListener(event, (e) => handler(e, this));
            } catch {
                console.error(`DOM event ${event} does not exist for component of type ${this._component.nodeName}`)
            }
            return this;
        },

        setError: function(isError, message) {
            console.log(isError, message);
            if (isError && !this.hasError) {
                this.hasError = true;
                this._component.setCustomValidity(message);
                this._step.addError(this.name);
            } else if (!isError && this.hasError) {
                this.hasError = false;
                this._component.setCustomValidity('');
                this._step.removeError();
            }
            this._component.reportValidity();
            console.log(this);
            return this;
        },

        showError: function() {
            if (this.hasError && !this._component.classList.contains('wiz-input--error')) {
                this.addClass('wiz-input--error');
            }
        },

        hideError: function() {
            if (!this.hasError && this._component.classList.contains('wiz-input--error')) {
                this.removeClass('wiz-input--error');
            }
        }
    }
    /*
        function WizButton(step, options) {
            if (options.onChange === undefined) {
                options.onChange = () => {};
            }
            if (!options.className) {
                options.className = 'wiz-button--primary';
            }

            this.onChange = (e) => {
                options.onChange(e, this);
            }
            const element = document.createElement('BUTTON');
            element.textContent = options.textContent;
            element.addEventListener('click', this.onChange);
            WizElement.call(this, element, step, options);

            this._validates = options.validates;
            this.validate = () => {
                this._validates.map((elem) => {
                    const wizElem = this._step.getElement(elem);
                    if (wizElem && !elem.hasError) {
                        return false;
                    }
                });
                return true;
            }
        }

        WizButton.prototype = WizElement.prototype;

        function WizText(step, options) {
            if (!options.className) {
                options.className = 'wiz-text';
            }
            const element = document.createElement('DIV')
            const text = document.createTextNode(options.textContent);
            element.appendChild(text);
            WizElement.call(this, element, step, options);
        }

        WizText.prototype = WizElement.prototype;

        function WizInput(step, options) {
            if (!options.className) {
                options.className = 'wiz-input';
            }
            if (options.onChange === undefined) {
                options.onChange = () => {};
            }

            const element = document.createElement('INPUT')
            element.value = '';
            this.value = element.value;
            this.onChange = (e) => {
                this.value = e.target.value;
                options.onChange(e, this);
            }
            element.addEventListener('input', this.onChange);
            element.placeholder = options.textContent;
            WizElement.call(this, element, step, options);

            this.setError = (isError, message) => {
                if (isError && this.hasError) {
                    this.hasError = false;
                    this._component.setCustomValidity(message);
                } else if (!isError && !this.hasError) {
                    this.hasError = true;
                    this._component.setCustomValidity('');
                }
                this._component.reportValidity();
            }
        }

        WizInput.prototype = WizElement.prototype;
    */
    global.Wiz = global.Wiz || Wiz;
})(window);
