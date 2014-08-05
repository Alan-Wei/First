/// <reference path="cms.js" />
/// <reference path="vendor/jquery/jquery-1.11.0.js" />


//move jquery object to screen center
//html is optional parameter.
$.prototype.moveCenter = function (html) {
    var $this = $(this);
    if (html) {
        $this.html(html);
    }
    var docW = $(window).width();
    var docH = $(window).height();
    var eleW = $this.outerWidth();
    var eleH = $this.outerHeight();

    var top = (docH - eleH) / 2;
    top = top >= 0 ? top : 0;
    var left = (docW - eleW) / 2;
    left = left >= 0 ? left : 0;
    $this.css({ position: 'fixed', 'left': left + 'px', 'top': top + 'px' });

    return this;
};

function convertHtmlGridTableToJsonArray(tbObj) {
    $(tbObj).find(".rgMasterTable>tbody .rgRow").each(function () {
        var json = {};
        $(this).children("td").each(function () {
            var column = $(this).data('column');
            json[column] = $(this).val();

        })
        var jsonArray = new Array()
        jsonArray.push(json)
        return jsonArray;
    })
}

$.cms = {
    isDebug:true
};
$.cms.popUp = function ($content, userOpt, $curtain) {
    var options = {
        $curtain: $('<div class="curtain"></div>'),
        hideEvent: 'click.hide',
        appendTo: 'body',
        preCurtainIn: function (opt) { },     //pre curtain fadein 
        afterCurtainIn: function (opt) { },    //between curtain faded in and content pre fadein
        afterContentIn: function (opt) { },     //contant faded in
        hideCheck: function (curtain, content, opt) { return true; },     //
        afterCurtainHide: function (opt) { },    //curtain hided
        removeCurtain: true,
        closeBtn: '.curtain-hide'
    };
    if ($.isPlainObject(userOpt)) {
        $.extend(true, options, userOpt);
    }
    if ($('.curtain').length>=1 && options.removeCurtain == false) {
        options.$curtain = $('.curtain');
    } else {
    }
    options.$content = $($content);
    if ($curtain) {
        options.$curtain = $curtain;
    }


    options.$curtain
        .data('cmsOptions', options)
        .on(options.hideEvent, function (evt) {
            var $target = $(evt.target);
            if ($target.is(options.$curtain) || $target.is(options.closeBtn)) {
                var check = options.hideCheck(options.$curtain, options.$content, options);
                if (check === false) {
                    return;
                }
                options.$curtain.fadeOut(function () {
                    options.afterCurtainHide(options);
                    if (options.removeCurtain) {
                        options.$curtain.remove();
                    }
                });
            }
        })
        .find(options.closeBtn)
            .on('click', function () {
                console.log(options);
                options.$curtain.trigger(options.hideEvent);
            });
    if (options.appendTo) {
        options.$curtain.appendTo(options.appendTo);
    }

    options.preCurtainIn(options);

    options.$curtain.fadeIn(function () {
        options.afterCurtainIn(options);
        var bgIndex = parseInt(options.$curtain.css('z-index'));
        if (!isNaN(bgIndex)) {
            options.$content.css('z-index', (bgIndex + 1));
        }

        if (!options.$content.parent().is(options.$curtain)) {
            options.$content.appendTo(options.$curtain);
        }
        options.$curtain
            .find(options.closeBtn)
            .on('click.hide', function () {
                options.$curtain.trigger(options.hideEvent);
            });

        options.$content
            .moveCenter()
            .fadeIn(function () {
                options.afterContentIn(options);
            });
    });

    return options;
};
$.cms.hideCuratin = function (childElement) {
    var $curtains = $('.curtain');
    if (childElement) {
        $curtains = $(childElement).closest('.curtain');
    }
    $curtains.each(function (index, curtain) {
        var options = $(curtain).data('cmsOptions');
        var eventName = options.hideEvent;
        $(curtain).trigger(eventName);
    });
},
$.cms.collectInformation = function (userOpt) {
    var options = {
        formSelector: '.form1',
        inputSelector: 'input, select',
        dataName: 'column',
        preIteral: function (form, item) { },   //pre iteral collect information
        iteralfn: function (input, info, options) { },     //iteral function
        endIteral: function (form, item, options) { }    //end iteral
    };
    if ($.isPlainObject(userOpt)) {
        $.extend(options, userOpt);
    }
    var $form = $(options.formSelector);
    var item = {
        id: $form.data('identity'),
        mode: $form.data('mode')
    };
    options.preIteral($form, item);
    $form.find(options.inputSelector).each(function (index, input) {
        var $this = $(input);
        var colName = $this.data(options.dataName);
        //input
        var value = $this.val();
        //select element
        if ($this.is('select')) {
            item[colName + 'Txt'] = $this.find('option:selected').text();
        }
        //span element
        if ($this.is('span')) {
            value = $this.text();
        }

        if (colName) {
            if (value) {
                item[colName] = $.trim(value);
            } else {
                item[colName] = '';
            }
        }
        options.iteralfn($this, item, options);
    });
    options.endIteral($form, item, options);
    return item;
};
//iteralfn(td, info);
$.cms.collectRowInformation = function ($tr, userOpt) {
    var options = {
        cell: 'td',
        child: 'span',
        dataName: 'column',
        iteralfn: function (cell, item) { }
    };
    if ($.isPlainObject(userOpt)) {
        $.extend(options, userOpt);
    }

    var $tds = $tr.find(options.cell);
    var info = {};
    info.id = $.trim($tr.find('td:eq(0) span').data('identity'));
    $tds.each(function (index, ele) {
        var $span = $(this).find(options.child);
        if ($span && $span.length) {
            var colName = $span.data(options.dataName);
            var val = $span.text().trim();
            if (colName) {
                info[colName] = val;
            }
        }
        options.iteralfn(ele, info);
    });
    return info;
};
$.cms.updateRow = function (row, item, userOpt) {
    var options = {
        cell: 'td',
        iteralfn: function (cell, item, row) { }
    };
    if ($.isPlainObject(userOpt)) {
        $.extend(options, userOpt);
    }
    $(row).find(options.cell).each(function (index, cell) {
        var $span = $(cell).find('span');
        var colName = $span.data('column');
        var value = item[colName];
        $span.text(value);
        options.iteralfn(cell, item, row);
    });
};
$.cms.appendRow = function (item, userOpt) {
    var options = {
        container: '.rgMasterTable tbody',
        template: '#temp-new-row',
        preTemplate: function (container, item) { },    //pre create template
        afterTemplate: function (container, item, template) { },    //after create template
        endAppend: function (container, item, template) { }     //end append to container
    };
    if ($.isPlainObject(userOpt)) {
        $.extend(options, userOpt);
    }
    var $container = $(options.container);
    options.preTemplate($container, item);
    var template = $(options.template).tmpl(item);
    options.afterTemplate($container, item, template);
    $container.append(template);
    options.endAppend($container, item, template);
};


$.cms.insertBind = function (insertOpt, curtainOpt) {
    var options = {
        mode: 'insert',
        insertBtn: '.item-insert',
        template: '#temp-item',
        preTemplate: function (info) { },   //pre create template
        prePopup: function (template, info, insertBtn) { },    //pre pop up
        prePopupCheck: function (template, info, insertBtn) { return true; },    //pre popup check(must return true/false, the main benefit is check data is right)
        endPopup: function (curatinOptions, info) { }       //end popup
    };

    if ($.isPlainObject(insertOpt)) {
        $.extend(options, insertOpt);
    }

    //validate options
    if ($.cms.isDebug) {
        if (!options.mode) {
            throw new Error('not specify mode');
        }
        if (!$(options.insertBtn).length) {
            throw new Error('cannot find insert button');
        }
        if (!$(options.template).length) {
            throw new Error('cannot find template');
        }
    }

    $('body').on('click', options.insertBtn, function () {
        var $btn = $(this);
        var info = {};
        info.mode = options.mode;
        options.preTemplate(info);
        var template = $(options.template).tmpl(info);  //get template
        options.prePopup(template, info, $btn);
        var check = options.prePopupCheck(template, info, $btn);
        if (check === false) {
            return false;
        }
        var curtainReturnOptions = $.cms.popUp(template, curtainOpt);      //popup
        options.endPopup(curtainReturnOptions, info);
        return false;
    });

    return false;
}
$.cms.updateBind = function (updateOpt, collectRowInfoOpt, curtainOpt) {
    var options = {
        mode: 'update',
        editBtn: '.item-edit',
        template: '#temp-item',
        preTemplate: function (row, info, updateBtn) { },
        prePopup: function (row, template, info, updateBtn) { },
        prePopupCheck: function (row, template, info, updateBtn) { return true; },
        endPopup: function (curtainOpt, row, template, info, updateBtn) { }
    };
    if ($.isPlainObject(updateOpt)) {
        $.extend(options, updateOpt);
    }

    $('body').on('click', options.editBtn, function () {
        var $btn = $(this);

        var $row = $btn.closest('tr');
        var info = $.cms.collectRowInformation($row, collectRowInfoOpt);   //collection information
        info.mode = options.mode;
        options.preTemplate($row, info, $btn);
        var template = $(options.template).tmpl(info);  //get template
        options.prePopup($row, template, info, $btn);
        var check = options.prePopupCheck($row, template, info, $btn);
        if (check === false) {
            return;
        }
        var curtainReturnOptions = $.cms.popUp(template, curtainOpt);      //popup
        curtainReturnOptions.$curtain.data('updatedRow', $row);
        curtainReturnOptions.$content.data('updatedRow', $row);
        options.endPopup(curtainReturnOptions, $row, template, info, $btn);
    });
};
$.cms.deleteBind = function (ajaxOpt, deleteOpt) {
    var options = {
        mode: 'delete',
        deleteBtn: '.item-delete',
        removeRow: true,
        removeRowParent: 'tr',
        preAjax: function (sendData, delteBtn, ajaxOpt) { },
        ajaxDataHandle: function (json, deleteBtn) { return $.param(json); },
        preAjaxCheck: function (sendData, delteBtn, ajaxOpt) { return true; },
        endAjax: function (promise, deleteBtn) { }
    };
    if ($.isPlainObject(deleteOpt)) {
        $.extend(options, deleteOpt);
    }

    $('body').on('click', options.deleteBtn, function () {
        var $btn = $(this);
        var sendData = { mode: options.mode, id: $btn.data('identity') };
        options.preAjax(sendData, $btn, ajaxOpt);
        ajaxOpt.data = options.ajaxDataHandle(sendData, $btn);
        var check = options.preAjaxCheck(sendData, $btn, ajaxOpt);
        if (check === false) {
            return;
        }
        var promise = $.ajax(ajaxOpt);
        options.endAjax(promise, $btn);

        if (options.removeRow) {
            promise.success(function () {
                $btn.slideUp(function () {
                    $(this).closest(options.removeRowParent).remove();
                })
            });
        }
    });
};
$.cms.submitBind = function (ajaxOpt, submitOpt, collectInfoOpt) {
    var options = {
        submitBtn: '.item-submit',
        preAjax: function (item, submitBtn, ajaxOpt) { },
        ajaxDataHandle: function (json) { return $.param(json); },
        preAjaxCheck: function (item, submitBtn, ajaxOpt, updatedRow) { return true; },
        endAjax: function (item, btn, promise, updatedRow) { }
    };
    if ($.isPlainObject(submitOpt)) {
        $.extend(options, submitOpt);
    }
    var defAjaxOpt = {
        type: 'POST'
    };
    if ($.isPlainObject(ajaxOpt)) {
        $.extend(defAjaxOpt, ajaxOpt);
    }

    $('body').on('click', options.submitBtn, function () {
        var $btn = $(this);
        var updatedRow = $(this).closest('.curtain').data('updatedRow');

        var item = $.cms.collectInformation(collectInfoOpt);
        options.preAjax(item, $btn, ajaxOpt);
        ajaxOpt.data = options.ajaxDataHandle(item);
        var check = options.preAjaxCheck(item, $btn, ajaxOpt, updatedRow);
        if (check === false) {
            return;
        }
        var promise = $.ajax(defAjaxOpt);
        options.endAjax(item, $btn, promise, updatedRow);
    });
};
