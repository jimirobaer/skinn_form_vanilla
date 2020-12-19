var Site = {

    init: () => {
        Form.init();
    },

}

var Form = (function () {

    var public = {};

    const Forms = document.querySelectorAll('.js-form form');
    const Buttons = document.querySelectorAll('[data-form-button]');
    const FormElements = ['input', 'textarea', 'select'];

    // Methods
    public.init = function () {

        if (Forms.length > 0) {
            Forms.forEach(function (form) {
                form_reset_inputs(form);
                form_validate_input(form);
                form_handle_input(form);

                if (Buttons.length > 0) {
                    Buttons.forEach(function (button) {
                        button.addEventListener('click', event => {
                            form_validate_input(form, event);
                            form_handle_input(form, event);
                        });
                    });
                }

            });

        }

    };

    // Private

    let form_collect_questions = (form) => {

        const Questions = form.querySelectorAll('.form__question');
        let formQuestionsArray = [];

        Questions.forEach(question => {
            formQuestionsArray.push(question);
        });

        return formQuestionsArray;

    }

    let form_collect_inputs = (form) => {

        let formInputsArray = [];

        form.querySelectorAll(FormElements).forEach(input => {
            formInputsArray.push(input);
        });

        return formInputsArray;

    }

    let form_test_inputs = (question) => {

        const Inputs = form_collect_inputs(question);
        let inputState = null;

        Inputs.forEach(input => {

            if (input.dataset.question == question.dataset.question) {

                // Check validity of every input
                if (input.value == '' || input.validity.valueMissing == true) {
                    inputState = 'invalid';
                    question.classList.add('is-invalid');

                } else {
                    inputState = 'valid';
                    question.classList.remove('is-invalid');
                }
            }

        });

        return inputState;

    };

    let form_reset_inputs = (form) => {
        form.reset();
        localStorage.setItem('currentQuestion', 0);
    };

    let form_validate_input = (form, event) => {

        const Questions = form_collect_questions(form);

        Questions.forEach(function (question) {
            form_test_inputs(question);
        });

    }

    let form_handle_input = (form, event) => {

        const Questions = form_collect_questions(form);
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
                form_handle_key_press(currentQuestion, form);
                // Set focus
                currentQuestion.querySelectorAll(FormElements)[0].focus();
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
                    submit_form(form, event);
                    break;
                default:
                    break;
            }

            /* Form Controls based on Keydown Event Input
             */
            if (event.keyCode) {

                if (event.keyCode == 13) {
                    if (next_question(event) == true) {
                        return true;
                    }
                }

                if ((currentQuestion.dataset.type) == 'radio') {

                    let radioInputs = form_collect_inputs(currentQuestion);

                    radioInputs.forEach(function (input) {

                        if (input.value == event.key) {
                            input.checked = true;
                        }

                        // Short timeout after enter option (like Typeform)
                        setTimeout(function () {
                            if (next_question(event) == true) {
                                return true;
                            }
                        }, 300);

                    });

                }

            }

        }

        function set_active_class(index) {
            Questions[index].classList.add('is-active');
        }

        function set_progress_meter(value) {
            let progressMeterEl = document.querySelector('.form__progress progress');
            progressMeterEl.value = value;
        }

        function next_question() {

            if (form_test_inputs(currentQuestion) == 'valid') {

                if (currentQuestionValue < totalAmountOfQuestions) {
                    currentQuestion.classList.remove('is-active');
                    localStorage.setItem('currentQuestion', parseInt(currentQuestionValue) + 1);
                    form_handle_input(form);
                }

                set_progress_meter(currentQuestionValue + 1);

            } else {
                alert('Invalid input, please check');
            }

            return true;

        }

        function prev_question() {

            if (currentQuestionValue > 0) {
                currentQuestion.classList.remove('is-active');
                localStorage.setItem('currentQuestion', parseInt(currentQuestionValue) - 1);
                form_handle_input(form);
            }

        }

        function submit_form(form, event) {

            event.preventDefault();

            if (currentQuestionValue == totalAmountOfQuestions) {
                const Inputs = form_collect_inputs(form);
                const SubmitEls = document.querySelectorAll('.form__results span[data-question]');

                form.style.display = "none";

                // Append data-question spans with values

                SubmitEls.forEach(el => {
                    let questionValue = form_get_value(form, el.dataset.question);
                    if (questionValue) {
                        el.innerHTML = questionValue;
                    }
                });

                set_progress_meter(totalAmountOfQuestions + 1);
                reset_buttons(true);

            }

        }

        function reset_buttons(hide = false) {

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

            if (hide == true) {
                btnNext.style.display = 'none';
                btnPrev.style.display = 'none';
                btnSubmit.style.display = 'none';
            }

        }

    }

    let form_handle_key_press = (question, form, event) => {

        const Inputs = form_collect_inputs(question);

        function read_keys(event) {

            if (event.isComposing || event.keyCode === 229) {
                return;
            }

            Inputs.forEach(input => {

                if (input.dataset.key) {
                    let inputKeys = input.dataset.key.split(',');
                    let keyCode = event.keyCode.toString();

                    // Handle inputs based on keys

                    if (inputKeys.includes('13')) {
                        if (form_handle_input(form, event) == true) {
                            this.removeEventListener('keydown', read_keys);
                        }
                    }

                    if (inputKeys.includes(keyCode) && !inputKeys.includes('13')) {
                        if (form_handle_input(form, event) == true) {
                            this.removeEventListener('keydown', read_keys);
                        }
                    }

                } else {
                    return false;
                }

            });

        }

        form.addEventListener('keydown', read_keys);

    };

    let form_get_value = (form, question, event) => {

        const Inputs = form_collect_inputs(form);

        if (question) {

            let inputValue = ''

            Inputs.forEach(input => {
                if (input.name == question) {
                    inputValue = input.value;
                }
            });

            return inputValue;

        }

    };

    return public;

})();

Site.init();