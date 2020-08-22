// Wizard for first example
const example1 = new Wiz('example1', {
    stepsDisplay: {
        isHidden: true
    }
});
example1.addStep({
        onSubmit: (e, form) => {
            let result = ''
            for (const [key, value] of Object.entries(form.getAllInputValues())) {
                result = result.concat(`${key}: ${value}\n`);
            }
        }
    })
    .getStep()
    .addElement('WizInput', {
        variant: 'primary',
        name: 'firstName',
        textContent: 'First Name',
        width: 6,
        height: '50px'
    }).addElement('WizInput', {
        variant: 'primary',
        name: 'lastName',
        textContent: 'Last Name',
        width: 6,
        height: '50px'
    })
    .addElement('WizInput', {
        name: 'username',
        textContent: 'Username',
        width: 12,
        height: '50px',
        validator: (value) => {
            if (value === '' || !value.match(/^\w*$/)) {
                return `Error: username cannot contain spaces or symbols other than '_'`;
            }
            return true;
        }
    }).addElement('WizInput', {
    name: 'password',
    textContent: 'Password',
    width: 12,
    height: '50px',
    validator: (value) => {
        if (value === '' || !value.match(/^\S*$/)) {
            return `Error: username cannot contain spaces or symbols other than '_'`;
        }
        return true;
    },
    isPassword: true
});

const example2 = new Wiz('example2', {
    layout: {
        stepsContent: 0.85
    },
    stepsDisplay: {
        position: 'bottom'
    }
});
example2.addStep({
        header: "Welcome"
    })
    .addStep({
        header: "Register",
        onSubmit: (e, form) => {
            let result = ''
            for (const [key, value] of Object.entries(form.getAllInputValues())) {
                result = result.concat(`${key}: ${value}\n`);
            }
        }
    })
    .getStep(0)
    .addElement('WizText', {
        width: 12,
        textContent: 'WELCOME!',
        height: '100px',
        className: 'custom-text__header'
    })
    .addElement('WizText', {
        width: 12,
        textContent: 'Please register on the next step.',
        height: '100px',
        className: 'custom-text__subtitle'
    });
example2.getStep()
    .addElement('WizInput', {
        variant: 'primary',
        name: 'firstName',
        textContent: 'First Name',
        width: 6,
        height: '50px'
    }).addElement('WizInput', {
        variant: 'primary',
        name: 'lastName',
        textContent: 'Last Name',
        width: 6,
        height: '50px'
    })
    .addElement('WizInput', {
        name: 'username',
        textContent: 'Username',
        width: 12,
        height: '50px',
        validator: (value) => {
            if (value === '' || !value.match(/^\w*$/)) {
                return `Error: username cannot contain spaces or symbols other than '_'`;
            }
            return true;
        }
    }).addElement('WizInput', {
    name: 'password',
    textContent: 'Password',
    width: 12,
    height: '50px',
    validator: (value) => {
        if (value === '' || !value.match(/^\S*$/)) {
            return `Error: username cannot contain spaces or symbols other than '_'`;
        }
        return true;
    },
    isPassword: true
});
