// Providers & Singletons
var helper = {
    service: function () {
        return new dataService();
    },
    errorHandler: function (err) {
        helper.notify().error(err.statusText, err.status);
        console.error(err);
    },
    notify: function () {
        return new notifyComponent();
    },
    confirm: function () {
        return new confirmComponent();
    }
};
var chartHelper = {
    chartOptions: {
        chart: {},
        //tooltip: {
        //    backgroundColor: null,
        //    borderWidth: 0,
        //    shadow: false,
        //    useHTML: true,
        //    style: { padding: 0 }
        //},
        credits: {
            enabled: false
        },
        title: {
            text: ''
        },
        xAxis: {
            //categories: chart.XAxis,
            //labels: {
            //    rotation: 270,
            //    y: 40
            //},
            //tickmarkPlacement: 'on'
        },
        yAxis: {
            title: {
                text: null
            }
        },
        plotOptions: {
            series: {
                marker: {
                    enabled: false
                }
            }
        }
        //series: seriesArray
    },
    setChartDefaultOptions: function () {
        Highcharts.setOptions({
            chart: {
                style: {
                    fontFamily: '"open sans", "Helvetica Neue", Helvetica, Arial, sans-serif'
                }
            },
            colors: ['#1ab394', '#d1dade', '#1a7bb9', '#f8ac59', '#21b9bb', '#ed5565']
        });
    },
    mapChartSeries: function (series, yData) {
        //var seriesNames = series.split(',');
        var seriesNames = "serie1,serie2,serie3,serie4".split(',');
        var seriesArray = new Array();
        for (var i = 0; i < yData.length; i++) {
            seriesArray.push({
                "name": seriesNames[i],
                "data": yData[i]
            });
        }
        return seriesArray;
    }
};

// Controller
$(function () {

    var widgets;
    var service = new dataService();

    service.widgetSpecs()
        .then(function (data) {
            widgets = new widgetComponent(data, $('#widgetsContainer'));
            widgets.renderWidgets();
            widgets.drawWidgetsGrid();
            widgets.fillWidgetsContent();
        }, helper.errorHandler);

    service.customerCount()
        .then(function (data) {
            $('#customerCount').text(data);
        }, helper.errorHandler);
    service.productCount()
        .then(function (data) {
            $('#productCount').text(data);
        }, helper.errorHandler);
    service.orderCount()
        .then(function (data) {
            $('#orderCount').text(data);
        }, helper.errorHandler);

    service.productDDL()
        .then(function (data) {
            $.each(data, function (k, item) {
                $('#productDDL').append($('<option>').attr('value', item.id).text(item.title));
            });
            $('#productDDL').chosen({
                width: "100%"
            });
        }, helper.errorHandler);
    service.categoryDDL()
        .then(function (data) {
            $.each(data, function (k, item) {
                $('#categoryDDL').append($('<option>').attr('value', item.id).text(item.title));
            });
            $('#categoryDDL').chosen({
                width: "100%"
            });
        }, helper.errorHandler);
    service.timeZoneDDL()
        .then(function (data) {
            $.each(data, function (k, item) {
                $('#timeZoneDDL').append($('<option>').attr('value', item.id).text(item.title));
            });
            $('#timeZoneDDL').chosen({
                width: "100%"
            });
        }, helper.errorHandler);
    service.processorDDL()
        .then(function (data) {
            $.each(data, function (k, item) {
                $('#processorDDL').append($('<option>').attr('value', item.id).text(item.title));
            });
            $('#processorDDL').chosen({
                width: "100%"
            });
        }, helper.errorHandler);

    $('.chosenDDL').chosen({
        width: "100%"
    });

    $('.i-checks input').iCheck({
        checkboxClass: 'icheckbox_square-green',
        radioClass: 'iradio_square-green'
    });

    $('input[type=radio][name=widgetType]').on('ifChanged', function () {
        $('#widgetTypeIcon').removeClass();
        if (this.value == 'grid')
            $('#widgetTypeIcon').addClass('fa fa-table modal-icon');
        if (this.value == 'column')
            $('#widgetTypeIcon').addClass('fa fa-bar-chart-o modal-icon');
        if (this.value == 'line')
            $('#widgetTypeIcon').addClass('fa fa-line-chart modal-icon');
        if (this.value == 'area')
            $('#widgetTypeIcon').addClass('fa fa-area-chart modal-icon');
        if (this.value == 'pie')
            $('#widgetTypeIcon').addClass('fa fa-pie-chart modal-icon');
    });

    $('#addWidgetBtn').on('click', function () {
        widgets.addWidget();
    });

    $('#widgetSpecsFRM').validate({
        //focusCleanup: true,
        rules: {
            chartTitle: {
                required: true,
            }
        },
        messages: {
            chartTitle: {
                required: "Please enter report title",
            }
        },
        submitHandler: function (form) {
            widgets.saveWidget();
            return false;
        }
    });

    //$('#widgetSpecsFRM [type="reset"]').on('click', function () {
    //    widgets.resetWidget();
    //});

});

// Components
var widgetComponent = function (widgetsSpecs, wrapper) {

    // fields
    var component = this;

    // properties
    component.widgets = widgetsSpecs;

    // methods
    component.renderWidgets = function () {
        $.each(this.widgets, function (key, item) {
            wrapper.append(component.createWidget(key, item.Col_Position, item.Row_Position, item.Width, item.Height, item.ChartTitle, item.ChartType));
        });
    }
    component.createWidget = function (id, col, row, width, height, title, type) {
        return $('<div>').attr('data-widget-id', id).attr('class', 'grid-stack-item').attr('data-chart-type', type)
            .attr('data-gs-x', col).attr('data-gs-y', row).attr('data-gs-width', width).attr('data-gs-height', height)
            .append($('<div>').attr('class', 'ibox grid-stack-item-content')
                .append($('<div>').attr('class', 'ibox-title')
                    .append($('<h5>').text(title))
                    .append($('<div>').attr('class', 'ibox-tools')
                        .append($('<a>')
                            .append($('<i>').attr('class', 'fa fa-wrench'))
                            .on('click', function () {
                                component.editWidget(id);
                            }))
                        .append($('<a>').css('color', '#ed5565')
                            .append($('<i>').attr('class', 'fa fa-trash-o'))
                            .on('click', function () {
                                helper.confirm().alert("You will not be able to recover this widget!", function () {
                                    component.removeWidget(id);
                                });
                            }))))
                .append($('<div>').attr('class', 'ibox-content')
                    .append($('<div>').attr('class', 'sk-spinner sk-spinner-three-bounce')
                        .append($('<div>').attr('class', 'sk-bounce1'))
                        .append($('<div>').attr('class', 'sk-bounce2'))
                        .append($('<div>').attr('class', 'sk-bounce3')))));
    }
    component.editWidget = function (id) {
        component.resetWidget();
        $("#widgetSpecs").attr('data-mode', 'edit').attr('data-widget-id', id);
        var widget = component.widgets[id];
        $('#chartTitleTXT').val(widget.ChartTitle);
        $('input[name=widgetType][value=' + widget.ChartType + ']').iCheck('check');
        //$('#reportDDL').val(widget.Report).trigger("chosen:updated");
        //$('#dateFilterDDL').val(widget.DateFilter).trigger("chosen:updated");
        //$('#productDDL').val(widget.fProductId).trigger("chosen:updated");
        //$('#categoryDDL').val(widget.fProductCategory).trigger("chosen:updated");
        //$('#timeZoneDDL').val(widget.fTimeZoneId).trigger("chosen:updated");
        //$('#processorDDL').val(widget.fProcessors).trigger("chosen:updated");
        $("#widgetSpecs").modal();
    }
    component.addWidget = function () {
        component.resetWidget();
        $("#widgetSpecs").modal();
    }
    component.saveWidget = function () {
        var id = $("#widgetSpecs").attr('data-widget-id');
        var mode = $("#widgetSpecs").attr('data-mode');
        var chartTitle = $('#chartTitleTXT').val();
        var chartType = $('.checked input[name=widgetType]').val();

        var widgetSpecs = {
            chartTitle: chartTitle,
            chartType: chartType
        };

        var progress = new progressBarComponent($("#widgetSpecs .progress"));

        if (mode == 'add') {
            helper.service().addWidget(chartTitle, chartType, progress.interval)
                .then(function (data) {
                    progress.finish();
                    helper.notify().success('Widget added successfully');
                    $("#widgetSpecs").modal('hide');

                    component.widgets[data.Id] = data;
                    var el = component.createWidget(data.Id, data.Col_Position, data.Row_Position, data.Width, data.Height, data.ChartTitle, data.ChartType);
                    wrapper.data('gridstack').addWidget(el, 0, 0, 4, 1);
                    component.getWidgetContent(data.Id, $("div[data-widget-id='" + data.Id + "'] .ibox-content", wrapper));
                }, helper.errorHandler);
        }
        if (mode == 'edit') {
            component.widgets[id].ChartTitle = chartTitle;
            component.widgets[id].ChartType = chartType;

            helper.service().updateWidget(id, chartTitle, chartType, progress.interval)
                .then(function (data) {
                    progress.finish();
                    helper.notify().success('Widget updated successfully');
                    $("#widgetSpecs").modal('hide');

                    component.widgets[data.id] = data;
                    $(".ibox-title h5", "div[data-widget-id='" + id + "']").text(chartTitle);
                    $("div[data-widget-id='" + id + "']").attr('data-chart-type', chartType);
                    component.getWidgetContent(id, $("div[data-widget-id='" + id + "'] .ibox-content", wrapper));
                }, helper.errorHandler);
        }
    }
    component.resetWidget = function () {
        $('#widgetSpecsFRM').validate().resetForm();
        $('#widgetSpecsFRM input').removeClass('error');
        $("#widgetSpecs .progress-bar").width('0%');
        $("#widgetSpecs .progress-bar").addClass('progress-bar-striped').addClass('active');
        $("#widgetSpecs").attr('data-mode', 'add').attr('data-widget-id', '');
        var chartTitle = $('#chartTitleTXT').val('');
        var chartType = $('input[name=widgetType][value=grid]').iCheck('check');
    }
    component.removeWidget = function (id) {
        var el = $("div[data-widget-id='" + id + "']", wrapper);
        wrapper.data('gridstack').removeWidget(el);
        helper.service().removeWidget(id).then(function (data) {}, helper.errorHandler);
    }
    component.drawWidgetsGrid = function () {
        wrapper.gridstack({
            width: 12,
            cellHeight: '300px',
            //alwaysShowResizeHandle: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            resizable: {
                handles: 'e, se, s, sw, w'
            }
        }).on('change', function (event, items) {
            var positions = [];
            var report = new reportComponent();

            $.each(items, function (index, item) {
                report.redrawReport($('.ibox-content', item.el));
                positions.push(new widgetPositionModel(item.el.attr('data-widget-id'), item.x, item.y, item.width, item.height));
            });

            component.updateWidgetsGrid(positions);
        });
    }
    component.updateWidgetsGrid = function (widgetsPosition) {
        helper.service().updateWidgetsGrid(widgetsPosition).then(function (data) {
            helper.notify().success('Widget Grid position data updated successfully');
        }, helper.errorHandler);
    }
    component.fillWidgetsContent = function () {
        $.each(component.widgets, function (key, item) {
            var el = $("div[data-widget-id='" + key + "'] .ibox-content", wrapper);
            component.getWidgetContent(key, el);
        });
    }
    component.getWidgetContent = function (id, contentWrapper) {
        helper.service().widgetData(id)
            .then(function (data) {
                var report = new reportComponent();
                report.renderReport(contentWrapper, component.widgets[id], data.xAxis, data.yAxis);
            }, helper.errorHandler);
    }
}
var reportComponent = function () {

    var component = this;

    component.renderReport = function (chartWrapper, widget, xData, yData) {
        var chartType = chartWrapper.parents('.grid-stack-item').attr('data-chart-type');

        switch (chartType) {
            case 'column':
                var chart = new columnChartComponent(chartWrapper, widget, xData, yData);
                chart.render();
                break;
            case 'line':
                var chart = new lineChartComponent(chartWrapper, widget, xData, yData);
                chart.render();
                break;
            case 'area':
                var chart = new areaChartComponent(chartWrapper, widget, xData, yData);
                chart.render();
                break;
            case 'pie':
                var chart = new pieChartComponent(chartWrapper, widget, xData, yData);
                chart.render();
                break;
                //case 'scatter':
                //    var chart = new scatterChartComponent(chartWrapper, widget, xData, yData);
                //    chart.render();
                //    break;
            case 'grid':
                var table = new dataTableComponent(chartWrapper, widget, xData, yData);
                table.render();
                break;
            default:
                break;
        }
    }
    component.redrawReport = function (chartWrapper) {
        var chartType = chartWrapper.parents('.grid-stack-item').attr('data-chart-type');

        if (chartType == 'column' || chartType == 'area' || chartType == 'line' || chartType == 'pie')
            if (chartWrapper.highcharts() != undefined)
                chartWrapper.highcharts().reflow();
    }
}
var columnChartComponent = function (chartWrapper, widget, xData, yData) {

    var component = this;

    component.chartWrapper = chartWrapper;
    component.widget = widget;
    component.xData = xData;
    component.yData = yData;

    component.render = function () {
        var options = $.extend(true, {}, chartHelper.chartOptions);
        options.chart.type = 'column';
        options.xAxis.categories = component.xData;
        options.series = chartHelper.mapChartSeries(component.widget.YName, component.yData);

        chartHelper.setChartDefaultOptions();

        chartWrapper.highcharts(options);
    }
}
var lineChartComponent = function (chartWrapper, widget, xData, yData) {

    var component = this;

    component.chartWrapper = chartWrapper;
    component.widget = widget;
    component.xData = xData;
    component.yData = yData;

    component.render = function () {
        var options = $.extend(true, {}, chartHelper.chartOptions);
        options.chart.type = 'spline';
        options.xAxis.categories = component.xData;
        options.series = chartHelper.mapChartSeries(component.widget.YName, component.yData);

        chartHelper.setChartDefaultOptions();

        chartWrapper.highcharts(options);
    }
}
var areaChartComponent = function (chartWrapper, widget, xData, yData) {

    var component = this;

    component.chartWrapper = chartWrapper;
    component.widget = widget;
    component.xData = xData;
    component.yData = yData;

    component.render = function () {
        var options = $.extend(true, {}, chartHelper.chartOptions);
        options.chart.type = 'areaspline';
        options.xAxis.categories = component.xData;
        options.series = chartHelper.mapChartSeries(component.widget.YName, component.yData);

        chartHelper.setChartDefaultOptions();

        chartWrapper.highcharts(options);
    }
}
var pieChartComponent = function (chartWrapper, widget, xData, yData) {

    var component = this;

    component.chartWrapper = chartWrapper;
    component.widget = widget;
    component.xData = xData;
    component.yData = yData;

    component.render = function () {
        var options = $.extend(true, {}, chartHelper.chartOptions);
        options.chart.type = 'pie';
        options.xAxis.categories = component.xData;
        options.series = chartHelper.mapChartSeries(component.widget.YName, component.yData);

        chartHelper.setChartDefaultOptions();

        chartWrapper.highcharts(options);
    }
}
var dataTableComponent = function (chartWrapper, widget, columns, rows) {

    var component = this;

    component.chartWrapper = chartWrapper;
    component.widget = widget;
    component.columns = columns;
    component.rows = rows;

    component.render = function () {
        $(component.chartWrapper).empty();
        var responsive = $('<div>').attr('class', 'table-responsive').appendTo(component.chartWrapper);
        var table = $('<table>').attr('class', 'table table-bordered table-striped table-hover dt-responsive').appendTo(responsive);
        $(table).footable({
            useParentWidth: true,
            columns: component.mapColumns(),
            rows: component.mapRows()
        });
    }
    component.mapColumns = function () {
        var columns = component.columns.map(function (item, index) {
            return {
                'name': item,
                'title': item,
                'breakpoints': component.getColumnBreakpoints(index)
            };
        });
        return columns;
    }
    component.getColumnBreakpoints = function (index) {
        var breakpoints = '';

        if (index >= 0 && index < 2) // 0,1
            breakpoints = '';
        if (index >= 2 && index < 4) // 2,3
            breakpoints = 'xs';
        if (index >= 4 && index < 8) // 4,5,6,7
            breakpoints = 'xs sm';
        if (index >= 8 && index < 12) // 8,9,10,11
            breakpoints = 'xs sm md';
        if (index >= 12) // 12 ....
            breakpoints = 'xs sm md lg';

        return breakpoints;
    }
    component.mapRows = function () {
        var rows = [];
        component.rows.forEach(function (row) {
            var r = {};
            component.columns.forEach(function (column, index) {
                r[column] = row[index];
            });
            rows.push(r);
        });
        return rows;
    }
}
var notifyComponent = function () {

    var component = this;
    var toastrOption = {
        //"timeOut": "0",
        //"extendedTImeout": "0"
    };

    component.success = function (message, title) {
        if (title != null && title != undefined)
            toastr.success(message, title, toastrOption);
        else
            toastr.success(message);
    }
    component.info = function (message, title) {
        if (title != null && title != undefined)
            toastr.info(message, title, toastrOption);
        else
            toastr.info(message);
    }
    component.warn = function (message, title) {
        if (title != null && title != undefined)
            toastr.warning(message, title, toastrOption);
        else
            toastr.warning(message);
    }
    component.error = function (message, title) {
        if (title != null && title != undefined)
            toastr.error(message, title, toastrOption);
        else
            toastr.error(message);
    }
}
var confirmComponent = function () {

    var component = this;
    var sweatAlertOptions = {
        title: "Are you sure?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, delete it!",
        closeOnConfirm: true
    };

    component.alert = function (text, callback) {
        sweatAlertOptions.text = text;
        swal(sweatAlertOptions, callback);
    }
}
var progressBarComponent = function (wrapper) {

    var component = this;

    component.interval = function () {
        var percentage = (wrapper.width() - $('.progress-bar', wrapper).width()) / 20;
        $('.progress-bar', wrapper).width($('.progress-bar', wrapper).width() + percentage);
    }
    component.finish = function () {
        $('.progress-bar', wrapper).width('100%').removeClass('progress-bar-striped').removeClass('active');
    }
}

// Models
var widgetPositionModel = function (id, x, y, width, height) {

    var model = this;

    model.id = id;
    model.x = x;
    model.y = y;
    model.width = width;
    model.height = height;
}

// Services
var dataService = function () {

    var service = this;

    var ticks = 100;

    service.productCount = function () {
        return $.when($.ajax('/Product/Count'));
    }
    service.customerCount = function () {
        return $.when($.ajax('/Customer/Count'));
    }
    service.orderCount = function () {
        return $.when($.ajax('/Order/Count'));
    }
    service.productDDL = function () {
        return $.when($.ajax('/Product/DropDownList'));
    }
    service.categoryDDL = function () {
        return $.when($.ajax('/Category/DropDownList'));
    }
    service.timeZoneDDL = function () {
        return $.when($.ajax('/Home/TimeZoneDropDownList'));
    }
    service.processorDDL = function () {
        return $.when($.ajax('/Processor/DropDownList'));
    }
    service.widgetSpecs = function () {
        return $.when($.ajax('/Home/Widgets'));
    }
    service.widgetData = function (id) {
        return $.when($.ajax('/Home/WidgetData/' + id));
    }
    service.updateWidgetsGrid = function (widgetsPosition) {
        return $.when($.ajax({
            url: '/Home/UpdateWidgetsGrid',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                widgetsPosition: widgetsPosition
            })
        }));
    }
    service.addWidget = function (chartTitle, chartType, progressCallback) {
        var ticker;
        return $.when(
            $.ajax({
                url: '/Home/AddWidget',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    chartTitle: chartTitle,
                    chartType: chartType
                }),
                beforeSend: function () {
                    if (progressCallback != null && progressCallback != undefined) {
                        ticker = setInterval(function () {
                            progressCallback();
                        }, ticks);
                    }
                }
            }).done(function (data) {
                if (ticker != null && ticker != undefined) {
                    clearInterval(ticker);
                }
            }));
    }
    service.updateWidget = function (id, chartTitle, chartType, progressCallback) {
        var ticker;
        return $.when($.ajax({
            url: '/Home/UpdateWidget',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                id: id,
                chartTitle: chartTitle,
                chartType: chartType
            }),
            beforeSend: function () {
                if (progressCallback != null && progressCallback != undefined) {
                    ticker = setInterval(function () {
                        progressCallback();
                    }, ticks);
                }
            }
        }).done(function (data) {
            if (ticker != null && ticker != undefined) {
                clearInterval(ticker);
            }
        }));
    }
    service.removeWidget = function (id, progressCallback) {
        var ticker;
        return $.when($.ajax({
            url: '/Home/RemoveWidget',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                widgetId: id
            }),
            beforeSend: function () {
                if (progressCallback != null && progressCallback != undefined) {
                    ticker = setInterval(function () {
                        progressCallback();
                    }, ticks);
                }
            }
        }).done(function (data) {
            if (ticker != null && ticker != undefined) {
                clearInterval(ticker);
            }
        }));
    }
}