

//#region Validation
$.fn.validThis = function (form) {
    var options = $(form).data('options');
    var $ele = $(this);
    var eleVal = $ele.val();

    var getErrorTip = function (errorType) {
        var tip = '';
        if (options.errorTip) {
            if (options.errorTip.special && $.isPlainObject(options.errorTip.special)) {
                var relatedError = options.errorTip.special[$ele.attr(options.nameAtt)];
                if (relatedError && $.isPlainObject(relatedError)) {
                    tip = relatedError[errorType];
                }
            }
        } else {
            tip = 'no tip';
        }
        if (!tip) tip = options.errorTip[errorType];
        if (!tip) tip = 'tip error';
        return tip;
    };

    //valid
    var errorSummary = {
        isValid: function () {
            if (this.invalid.length > 0) {
                return false;
            } else {
                return true;
            }
        },
        invalid: [],
        tip: []
    };
    if ($.isPlainObject(options.errorTip)) {

        //valid required
        if ($ele.prop('required') && !eleVal) {
            //errorTipMsg.push(getErrorTip('required'));
            errorSummary.invalid.push('required');
        }

        //valid match
        var matchAtt = $ele.attr(options.matchAtt);
        if (matchAtt) {
            var matchSlc = String.format('[{0}={1}]', options.nameAtt, matchAtt);
            var $matchedEle = $(form).find(matchSlc);
            if ($matchedEle.val() != $ele.val()) {
                errorSummary.invalid.push('match');
            }
        }

        //valid min value
        var minVal = $ele.attr('min');
        if (minVal) {
            if (isNaN(minVal) || isNaN(eleVal) || parseFloat(eleVal) < parseFloat(minVal)) {
                errorSummary.invalid.push('min');
            }
        }

        //valid max value
        var maxVal = $ele.attr('max');
        if (maxVal) {
            if (isNaN(maxVal) || isNaN(eleVal) || parseFloat(eleVal) > parseFloat(maxVal)) {
                errorSummary.invalid.push('max');
            }
        }

        //valid regexp
        var reg = new RegExp($ele.attr(options.regAtt));
        if (!reg.test(eleVal)) {
            //errorTipMsg.push(getErrorTip('reg'));
            errorSummary.invalid.push('reg');
        }

        //initial error tip
        $.each(errorSummary.invalid, function (index, type) {
            var tip = getErrorTip(type).replace('{0}', $ele.attr(options.nameAtt));
            errorSummary.tip.push(tip);
        });

        //error tip
        if (!errorSummary.isValid()) {
            errorSummary.tip.unshift($ele.attr(options.errorAtt));
        }

        $ele.attr('title', errorSummary.tip[0]);
    } else { }


    if (errorSummary.isValid()) {
        $ele.removeClass(options.errorClass);
        if ($.type(options.passClass) == 'string') $ele.addClass(options.passClass)
        //if ($.type(options.passClass) == 'boolean') $ele unuse add class any class
    } else {
        $ele.removeClass(options.passClass).addClass(options.errorClass);
    }

    return {
        ele: $ele,
        valid: errorSummary.isValid(),
        error: errorSummary
    };
};

$.fn.aValid = function (userOpt) {
    var $form = $(this);
    var options = {
        initValid: true,        //valid or not when first load (but bind event)
        reStart: false,         //restart valid(it means rebind event)
        passClass: 'right',     //valid pass class name(if false , will not add class when valid success)
        errorClass: 'error',    //invalid class name
        errorTip: {
            required: '{0} required',
            min: '{0} not match min length',
            max: '{0}, not match max length',
            reg: 'format invalid',
            match: 'not matched {0}',
            special: {
                //{'nameAtt':{required:'', min:'', max:'', reg:''}}
            }
        },
        regAtt: 'data-reg',
        matchAtt: 'data-match',  //this value must be the matched element's nameAtt
        errorAtt: 'data-error-msg',
        nameAtt: 'name',
        selector: 'input',
        events: ['keyup', 'blur']
    };
    var validTime = function (t) {
        if (t && !isNaN(t)) {
            $form.attr('valid-time');
            return t;
        }

        var time = $form.attr('valid-time');
        if (isNaN(time)) {
            $form.attr('valid-time', '1');
            return 0;
        } else {
            $form.attr('valid-time', parseInt(time) + 1);
            return parseInt(time);
        }
    };
    var vTime = validTime();
    if (userOpt && userOpt.reStart) {
        vTime = validTime(0);
        userOptreStart = false;
    }
    if (vTime) {
        //extend stored options
        var storedOpt = $form.data('options');
        if (storedOpt && $.isPlainObject(storedOpt)) {
            $.extend(true, options, storedOpt);
        }
    }
    if (userOpt && $.isPlainObject(userOpt)) $.extend(true, options, userOpt);
    $form.data('options', options);

    var $inputs = $form.find(options.selector);
    //bind event
    if (vTime == 0) {
        $inputs.each(function (index, ele) {
            var $ele = $(ele);
            $.each(options.events, function (index, evtName) {
                //remove event.valid events
                $ele.unbind(evtName + '.valid');

                //bind event.valid evnets
                $ele.bind(evtName + '.valid', function () {
                    $ele.validThis($form);
                });
            });
        });
    }

    var validResult = {
        valid: true,
        errorTips: [],
        summary: []
    };
    //valid
    if (vTime || options.initValid) {
        $inputs.each(function (index, ele) {
            var singleValid = $(ele).validThis($form);
            if (!singleValid.valid) {
                validResult.summary.push(singleValid);
                validResult.errorTips.push(singleValid.error.tip[0]);
                validResult.valid = false;
            }
        });
    };

    return validResult;
};
//#endregion
