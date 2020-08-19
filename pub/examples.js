function validateUsername(e, element) {
    if (e.target.value !== '' && !e.target.value.match(/^\w*$/)) {
        element.setError(true, `Error: username cannot contain spaces or symbols other than '_'`);
    } else {
        element.setError(false);
    }
}

function validatePassword(e, element) {
    if (e.target.value !== '' && !e.target.value.match(/^\S*$/)) {
        element.setError(true, `Error: username cannot contain spaces or symbols other than '_'`);
    } else {
        element.setError(false);
    }
}

// Wiz implementation
const wiz = new Wiz('wizard', {
    layout: {
        stepsContent: 0.9
    }
}).addStep({}).addStep({
    isFinal: true,
    onStepNext: (e, step) => {
        if (step.validateAllInputs()) {
            console.log(step.getAllInput());
            return true;
        }
        return false;
    }
});
wiz.getStep(0).addElement('Input', {
    name: 'textToAdd',
    textContent: 'Enter text here to add below',
    className: 'text-input',
    width: 9,
    height: '50px',
    validator: (value) => {
        return value !== '' && !value.match(/^[a-zA-Z ]*$/);
    }
}).addElement('WizButton', {
    name: 'addText',
    textContent: 'ADD',
    width: 3,
    height: '50px',
    validates: ['textToAdd'],
    onChange: (e, element) => {
        if (element.validate()) {
            element.getStep().addElement('WizText', {
                textContent: element.getStep().getElement('textToAdd').value,
                width: 12,
                height: '50px'
            })
        }
    }
});
wiz.getStep(1).addElement('WizInput', {
    name: 'firstName',
    textContent: 'First Name',
    className: 'text-input',
    width: 6,
    height: '50px'
}).addElement('WizInput', {
    name: 'lastName',
    textContent: 'Last Name',
    className: 'text-input',
    width: 6,
    height: '50px'
}).addElement('WizInput', {
    name: 'username',
    textContent: 'Username',
    className: 'text-input',
    width: 12,
    height: '50px',
    onChange: validateUsername
}).addElement('WizInput', {
    name: 'password',
    textContent: 'Password',
    className: 'text-input',
    width: 12,
    height: '50px',
    onChange: validatePassword
}).addElement('WizText', {
    name: 'description',
    textContent: 'Clicking FINISH will log the values in the input fields to the console, if they are valid.',
    width: 12,
    height: '50px'
}).getElement('password').getComponent().type = 'password';