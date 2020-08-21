function validateUsername(value) {
    if (value === '' || !value.match(/^\w*$/)) {
        return `Error: username cannot contain spaces or symbols other than '_'`;
    }
    return true;
}

function validatePassword(value) {
    if (value === '' || !value.match(/^\S*$/)) {
       return `Error: username cannot contain spaces or symbols other than '_'`;
    }
    return true;
}

// Wiz implementation
const wiz = new Wiz('wizard', {
    layout: {
        stepsContent: 0.9
    },
    stepsDisplay: {
        position: 'bottom'
    }
}).addStep({
    header: 'WizText Test'
}).addStep({
    header: 'Form Test',
    onStepNext: (e, step) => {
        console.log(step.getAllInputValues());
        return true;
    }
})
    .addStep({header: 'fdsfdsfsdfsdfsdfdfdfdfdffd'});
wiz.getStep(0).addElement('WizInput', {
        name: 'textToAdd',
        textContent: 'Enter text here to add below',
        className: 'text-input',
        width: 9,
        height: '50px',
        validator: (value) => {
            if (value !== '' && value.match(/^[a-zA-Z]*$/)) {
                return true;
            } else {
                return 'Error: Input invalid.';
            }
        }
    })
    .addElement('WizButton', {
        name: 'addText',
        textContent: 'ADD',
        width: 3,
        height: '50px',
        on: {
            'click': (e, element) => {
                const textInput = element.getStep().getElement('textToAdd');
                if (!textInput.hasError) {
                    element.getStep().addElement('WizText', {
                        textContent: textInput.value,
                        width: 12,
                        height: '50px'
                    });
                }
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
    validator: validateUsername
}).addElement('WizInput', {
    name: 'password',
    textContent: 'Password',
    className: 'text-input',
    width: 12,
    height: '50px',
    validator: validatePassword
}).addElement('WizText', {
    name: 'description',
    textContent: 'Clicking FINISH will log the values in the input fields to the console, if they are valid.',
    width: 12,
    height: '50px'
}).getElement('password').getComponent().type = 'password';