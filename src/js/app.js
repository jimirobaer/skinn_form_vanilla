var Site = {

    init: () => {
        Site.init_form();
    },

    init_form: () => {

        const Forms = document.querySelectorAll('.js-form form');
        const Buttons = document.querySelectorAll('[data-form-button]');

        if (Forms.length > 0) {

            Forms.forEach(function (form) {

                Site.form_reset_inputs(form);
                Site.form_validate_input(form);
                Site.form_handle_input(form);

                if (Buttons.length > 0) {

                    Buttons.forEach(function (button) {
                        button.addEventListener('click', event => {
                            Site.form_validate_input(form, event);
                            Site.form_handle_input(form, event);
                        });
                    });

                }

            });

        }

    },

    form_reset_inputs: (form) => {
        form.reset();
        localStorage.setItem('currentQuestion', 0);
    },

    form_collect_questions: (form) => {

        const Questions = form.querySelectorAll('.form__question');
        let formQuestions = [];

        Questions.forEach(question => {
            formQuestions.push(question);
        });

        return formQuestions;

    },

    form_collect_inputs: (form) => {

        const formElements = 'input, textarea, select';
        let formInputs = [];

        form.querySelectorAll(formElements).forEach(input => {
            formInputs.push(input);
        });

        return formInputs;

    },

    form_test_inputs: (question) => {

        const Inputs = Site.form_collect_inputs(question);
        let state = null;

        Inputs.forEach(input => {

            if (input.dataset.question == question.dataset.question) {

                // Check validity of every input
                if (input.value == '' || input.validity.valueMissing == true) {
                    state = 'invalid';
                    question.classList.add('is-invalid');

                } else {
                    state = 'valid';
                    question.classList.remove('is-invalid');
                }
            }

        });

        return state;

    },

    form_validate_input: (form, event) => {

        const Questions = Site.form_collect_questions(form);

        // Actions
        Questions.forEach(function (question) {
            Site.form_test_inputs(question, form);
        });

    },

    form_handle_input: (form, event) => {

        console.log(event);

        const Questions = Site.form_collect_questions(form);
        const totalAmountOfQuestions = Questions.length - 1;

        // Write currentQuestion
        let currentQuestionValue = parseInt(localStorage.getItem('currentQuestion'));
        let currentQuestion = Questions[currentQuestionValue];

        let currentQuestionStored = localStorage.getItem('currentQuestion');

        // Reset states
        if (!event) {

            reset_buttons();

            if (!currentQuestionStored) {
                // Executes on fresh reload
                localStorage.setItem('currentQuestion', 0);
                set_active_class(0);
            } else {
                // Executes when next question loads
                set_active_class(currentQuestionStored);
                Site.form_handle_key_press(currentQuestion, form);
                // Set focus
                currentQuestion.querySelectorAll('input, textarea')[0].focus();
            }

        } else {

            reset_buttons();
            
            /* Form Controls based on Event Input
             */
            switch (event.target.dataset.action) {
                case 'next':
                    next_question(event);
                    break;
                case 'prev':
                    prev_question(event);
                    break;
                case 'submit':
                    submit_form(event);
                    break;
                default:
                    break;
            }

            /* Form Controls based on Keydown Event Input
             */
            if (event.keyCode) {
                
                if (event.keyCode == 13) {
                    next_question();
                    return true;
                }

            }

        }

        function set_active_class(index) {
            Questions[index].classList.add('is-active');
        }

        function next_question() {

            if (Site.form_test_inputs(currentQuestion) == 'valid') {

                if (currentQuestionValue < totalAmountOfQuestions) {
                    currentQuestion.classList.remove('is-active');
                    localStorage.setItem('currentQuestion', parseInt(currentQuestionValue) + 1);
                    Site.form_handle_input(form);
                }

            } else {
                alert('Invalid input, please check');
            }

        }

        function prev_question() {
            if (currentQuestionValue > 0) {
                currentQuestion.classList.remove('is-active');
                localStorage.setItem('currentQuestion', parseInt(currentQuestionValue) - 1);
                Site.form_handle_input(form);
            }
        }

        function submit_form(event) {
            event.preventDefault();
        }

        function reset_buttons() {

            let btnNext = document.querySelector('[data-action=next]');
            let btnPrev = document.querySelector('[data-action=prev]');
            let btnSubmit = document.querySelector('[data-action=submit]');

            if (currentQuestionValue > 0) {
                btnPrev.style.display = 'inline';
            } else {
                btnPrev.style.display = 'none';
            }

            if (currentQuestionValue == totalAmountOfQuestions) {
                btnSubmit.style.display = 'inline';
                btnNext.style.display = 'none';
            } else {
                btnSubmit.style.display = 'none';
                btnNext.style.display = 'inline';
            }

        }

    },

    form_handle_key_press: (question, form) => {

        const Inputs = Site.form_collect_inputs(question);
        form.addEventListener('keydown', read_keys);

        function read_keys(event) {

            if (event.isComposing || event.keyCode === 229) {
                return;
            }

            Inputs.forEach(input => {

                if (input.dataset.key) {
                    let inputKeys = input.dataset.key.split(',');
                    let keyCode = event.keyCode.toString();

                    if (inputKeys.includes(keyCode)) {

                        if (Site.form_handle_input(form, event) == true) {
                            this.removeEventListener('keydown', read_keys);
                        }

                    };

                } else {
                    return false;
                }

            });

        }

        // Get keys


    },

    form_collect_results: (form) => {

    },

}

Site.init();