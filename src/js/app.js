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
                Site.form_handle_input(form);
                Site.form_track_progress(form);

                if (Buttons.length > 0) {

                    Buttons.forEach(function (button) {
                        button.addEventListener('click', event => {
                            Site.form_handle_input(form, event);
                            Site.form_track_progress(form, event);
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

    form_handle_input: (form, event) => {

        const Questions = Site.form_collect_questions(form);

        // Actions
        Questions.forEach(function (question) {
            Site.form_test_inputs(question, form);
        });

    },

    form_track_progress: (form, event) => {

        const Questions = Site.form_collect_questions(form);
        const totalAmountOfQuestions = Questions.length - 1;

        let currentStoredQuestion = localStorage.getItem('currentQuestion');

        // Reset active state
        if (!event) {
            if (!currentStoredQuestion) {
                localStorage.setItem('currentQuestion', 0);
                set_active_class(0);
            } else {
                set_active_class(currentStoredQuestion);
            }
        } else {

            // Write currentQuestion
            let currentQuestionValue = parseInt(localStorage.getItem('currentQuestion'));
            let currentQuestion = Questions[currentQuestionValue];

            switch (event.target.dataset.action) {
                case 'next':

                    if (Site.form_test_inputs(currentQuestion) == 'valid') {

                        console.log(currentQuestionValue);

                        if (currentQuestionValue < totalAmountOfQuestions) {
                            currentQuestion.classList.remove('is-active');
                            localStorage.setItem('currentQuestion', parseInt(currentQuestionValue) + 1);
                            Site.form_track_progress(form);
                        }

                        // Hide when last question shows
                        if (currentQuestionValue == totalAmountOfQuestions - 1) {
                            event.target.style.display = "none";
                        }

                    } else {
                        alert('Invalid input, please check');
                    }

                    break;
                case 'prev':

                    if (currentQuestionValue > 0) {
                        localStorage.setItem('currentQuestion', parseInt(currentQuestionValue) - 1);
                        Site.form_track_progress(form);
                    }

                    break;
                case 'submit':
                    console.log(event);
                    break;
                default:
                    break;
            }

        }

        function set_active_class(index) {
            Questions[index].classList.add('is-active');
        }

    },

    form_collect_results: (form) => {

    },

}

Site.init();