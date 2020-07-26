const wiz = new Wiz('wizard', {
    layout: {
        stepsContent: 0.9
    }
}).addStep({}).addStep({});
wiz.getStep(0).addElement('WizText', {
    name: 'username',
    textContent: 'Username:',
    className: 'username',
    width: 6
}).addElement('WizButton', {
    name: 'test',
    textContent: 'TEST',
    width: 3
});