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
wiz.getStep(0).addElement('WizInput', {
    name: 'textToAdd',
    textContent: 'Enter text here',
    className: 'text-input',
    width: 9,
    height: '50px',
    onChange: (e, element) => {
        if (e.target.value !== '' && !e.target.value.match(/^[a-zA-Z ]*$/)) {
            element.setError(true, 'Error: text must only contain letters and spaces.');
        } else {
            element.setError(false);
        }
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
}).getElement('password').getComponent().type = 'password';