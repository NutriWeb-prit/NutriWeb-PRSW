(function() {
    'use strict';

    const CONFIG = {
        autoProtectForms: true,
        autoProtectButtons: true,
        timeoutMs: 15000,
        debug: true
    };

    function log(...args) {
        if (CONFIG.debug) {
            console.log('[PreventDoubleSubmit]', ...args);
        }
    }

    function getSubmitButton(form) {
        return form.querySelector('button[type="submit"], input[type="submit"]');
    }

    function disableButton(button) {
        if (!button || button.disabled) return;

        log('Desabilitando botão:', button);

        button.setAttribute('data-was-disabled', button.disabled);
        button.disabled = true;

        return button;
    }

    function enableButton(button) {
        if (!button) return;

        log('Habilitando botão:', button);

        const wasDisabled = button.getAttribute('data-was-disabled') === 'true';
        
        if (!wasDisabled) {
            button.disabled = false;
        }
        
        button.removeAttribute('data-was-disabled');
    }

    function protectForm(form) {
        if (form.hasAttribute('data-protected')) return;
        form.setAttribute('data-protected', 'true');

        log('Protegendo formulário:', form);

        form.addEventListener('submit', function(e) {
            const submitButton = getSubmitButton(form);
            
            if (form.hasAttribute('data-submitting')) {
                log('Formulário já está sendo enviado, bloqueando');
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            
            form.setAttribute('data-submitting', 'true');
            log('Formulário marcado como enviando');
            
            if (submitButton) {
                disableButton(submitButton);
            }

            const timeout = parseInt(form.getAttribute('data-timeout')) || CONFIG.timeoutMs;
            if (timeout > 0) {
                setTimeout(() => {
                    log('Timeout atingido, re-habilitando formulário');
                    form.removeAttribute('data-submitting');
                    if (submitButton) {
                        enableButton(submitButton);
                    }
                }, timeout);
            }
        });

        form.addEventListener('error', function() {
            log('Erro detectado, re-habilitando formulário');
            form.removeAttribute('data-submitting');
            const submitButton = getSubmitButton(form);
            if (submitButton) {
                enableButton(submitButton);
            }
        });
    }

    function protectButton(button) {
        if (button.hasAttribute('data-protected')) return;
        button.setAttribute('data-protected', 'true');

        log('Protegendo botão:', button);

        button.addEventListener('click', function(e) {
            if (button.disabled || button.hasAttribute('data-btn-submitting')) {
                log('Botão já está desabilitado, bloqueando');
                e.preventDefault();
                e.stopPropagation();
                return false;
            }

            const timeout = parseInt(button.getAttribute('data-timeout')) || CONFIG.timeoutMs;
            
            button.setAttribute('data-btn-submitting', 'true');
            disableButton(button);

            if (timeout > 0) {
                setTimeout(() => {
                    log('Timeout do botão atingido, re-habilitando');
                    button.removeAttribute('data-btn-submitting');
                    enableButton(button);
                }, timeout);
            }
        });
    }

    function init() {
        log('Inicializando proteção contra duplo envio');

        if (CONFIG.autoProtectForms) {
            document.querySelectorAll('form').forEach(protectForm);
        }

        if (CONFIG.autoProtectButtons) {
            document.querySelectorAll('[data-prevent-double="true"]').forEach(protectButton);
        }

        if (typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { 
                            if (node.tagName === 'FORM' && CONFIG.autoProtectForms) {
                                protectForm(node);
                            }
                            if (node.hasAttribute && node.hasAttribute('data-prevent-double') && CONFIG.autoProtectButtons) {
                                protectButton(node);
                            }
                            if (CONFIG.autoProtectForms) {
                                node.querySelectorAll && node.querySelectorAll('form').forEach(protectForm);
                            }
                            if (CONFIG.autoProtectButtons) {
                                node.querySelectorAll && node.querySelectorAll('[data-prevent-double="true"]').forEach(protectButton);
                            }
                        }
                    });
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.PreventDoubleSubmit = {
        protectForm: protectForm,
        protectButton: protectButton,
        enableButton: enableButton,
        disableButton: disableButton,
        config: CONFIG
    };

})();